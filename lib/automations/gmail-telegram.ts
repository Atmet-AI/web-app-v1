import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { JsonRecord } from "@/lib/api/http";
import { jsonObject, stringValue } from "@/lib/api/http";
import {
  ensureComposioWebhookSubscription,
  executeComposioToolWithArguments,
  executeComposioProxy,
  getComposioUserConnection,
  getComposioUserId,
  upsertComposioTriggerInstance,
} from "@/lib/composio";

const automationType = "gmail_to_telegram";
const gmailTriggerSlug = "GMAIL_NEW_GMAIL_MESSAGE";
const telegramToolSlug = "TELEGRAM_SEND_MESSAGE";

type ConnectorRow = Record<string, unknown>;

type ProvisionGmailTelegramAutomationOptions = {
  admin: SupabaseClient;
  chatId: string;
  connections: ConnectorRow[];
  content: string;
  request: Request;
  userId: string;
  workspaceId: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function findDeepString(value: unknown, keys: string[]): string {
  const stack = [value];
  const normalizedKeys = keys.map((key) => key.toLowerCase());

  while (stack.length > 0) {
    const current = stack.shift();
    const record = asRecord(current);

    for (const [key, item] of Object.entries(record)) {
      if (normalizedKeys.includes(key.toLowerCase())) {
        const direct = stringValue(item);
        if (direct) {
          return direct;
        }

        const nestedValue =
          stringValue(asRecord(item).email) ||
          stringValue(asRecord(item).address) ||
          stringValue(asRecord(item).name);
        if (nestedValue) {
          return nestedValue;
        }
      }

      if (item && typeof item === "object") {
        stack.push(item);
      }
    }
  }

  return "";
}

function findDeepNumberString(value: unknown, keys: string[]) {
  const result = findDeepString(value, keys);
  if (result) {
    return result;
  }

  const stack = [value];
  const normalizedKeys = keys.map((key) => key.toLowerCase());

  while (stack.length > 0) {
    const current = stack.shift();
    const record = asRecord(current);
    for (const [key, item] of Object.entries(record)) {
      if (normalizedKeys.includes(key.toLowerCase()) && typeof item === "number") {
        return String(item);
      }

      if (item && typeof item === "object") {
        stack.push(item);
      }
    }
  }

  return "";
}

function getConnectionUserStatus(connection: ConnectorRow, userId: string) {
  const settings = jsonObject(connection.settings);
  const users = jsonObject(settings.users);
  return stringValue(jsonObject(users[userId]).status).toLowerCase();
}

function getConnectedAccountId(connection: ConnectorRow | undefined, userId: string) {
  if (!connection || getConnectionUserStatus(connection, userId) !== "connected") {
    return "";
  }

  return stringValue(getComposioUserConnection(connection.settings, userId).connectedAccountId);
}

function getAppConnection(connections: ConnectorRow[], appKey: string) {
  return connections.find((connection) => stringValue(connection.app_key) === appKey);
}

export function getTelegramChatIdFromText(content: string) {
  return (
    /\b(?:chat\s*)?id\s*(?:is|:|-)?\s*(-?\d{5,})\b/i.exec(content)?.[1] ??
    /\b(-\d{5,})\b/.exec(content)?.[1] ??
    ""
  );
}

export function isGmailToTelegramAutomationRequest({
  appKeys,
  content,
}: {
  appKeys: string[];
  content: string;
}) {
  const normalized = content.toLowerCase();
  const hasApps = appKeys.includes("gmail") && appKeys.includes("telegram");
  const asksForAutomation =
    /\b(whenever|when|every time|each time|new email|email received|gmail.*telegram|telegram.*gmail|notify|notification|send.*telegram)\b/.test(
      normalized,
    );

  return hasApps && asksForAutomation;
}

function getPublicAppUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (configured?.startsWith("https://")) {
    return configured;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim().replace(/\/+$/, "");
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "";
  const forwardedHost = request.headers.get("x-forwarded-host") ?? "";
  if (forwardedProto === "https" && forwardedHost) {
    return `https://${forwardedHost}`;
  }

  if (configured) {
    return configured;
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function getWebhookUrl(request: Request) {
  return `${getPublicAppUrl(request)}/api/composio/webhook`;
}

function getTriggerId(value: unknown) {
  const record = asRecord(value);
  return (
    stringValue(record.trigger_id) ||
    stringValue(record.triggerId) ||
    stringValue(record.id) ||
    stringValue(asRecord(record.deprecated).uuid)
  );
}

function getWebhookSubscriptionId(value: unknown) {
  const record = asRecord(value);
  return stringValue(record.id) || stringValue(record.nano_id) || stringValue(record.nanoId);
}

function buildAutomationName() {
  return "Gmail to Telegram notification";
}

function getGmailMessageIds(value: unknown) {
  const data = asRecord(asRecord(value).data);
  const payload = asRecord(data.payload);
  const messages: unknown[] = Array.isArray(data.messages)
    ? data.messages
    : Array.isArray(payload.messages)
      ? payload.messages
      : [];

  return messages
    .map((message) => stringValue(asRecord(message).id))
    .filter(Boolean);
}

async function listRecentGmailMessageIds(connectedAccountId: string) {
  const result = await executeComposioProxy({
    connectedAccountId,
    endpoint: "/users/me/messages",
    parameters: [
      { in: "query", name: "maxResults", value: "10" },
      { in: "query", name: "q", value: "in:inbox" },
    ],
  }).catch(() =>
    executeComposioProxy({
      connectedAccountId,
      endpoint: "/gmail/v1/users/me/messages",
      parameters: [
        { in: "query", name: "maxResults", value: "10" },
        { in: "query", name: "q", value: "in:inbox" },
      ],
    }),
  );

  return getGmailMessageIds(result);
}

async function fetchGmailMessage(connectedAccountId: string, messageId: string) {
  return executeComposioProxy({
    connectedAccountId,
    endpoint: `/users/me/messages/${encodeURIComponent(messageId)}`,
    parameters: [
      { in: "query", name: "format", value: "full" },
      { in: "query", name: "metadataHeaders", value: "From" },
      { in: "query", name: "metadataHeaders", value: "Subject" },
      { in: "query", name: "metadataHeaders", value: "Date" },
    ],
  }).catch(() =>
    executeComposioProxy({
      connectedAccountId,
      endpoint: `/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}`,
      parameters: [
        { in: "query", name: "format", value: "full" },
        { in: "query", name: "metadataHeaders", value: "From" },
        { in: "query", name: "metadataHeaders", value: "Subject" },
        { in: "query", name: "metadataHeaders", value: "Date" },
      ],
    }),
  );
}

async function sendTelegramMessage({
  connectedAccountId,
  text,
  telegramChatId,
}: {
  connectedAccountId: string;
  telegramChatId: string;
  text: string;
}) {
  const result = await executeComposioToolWithArguments({
    arguments: {
      chat_id: telegramChatId,
      text,
    },
    connectedAccountId,
    toolSlug: telegramToolSlug,
    version: "latest",
  });
  const resultRecord = asRecord(result);
  if (
    resultRecord.successful === false ||
    (resultRecord.error !== null && resultRecord.error !== undefined)
  ) {
    throw new Error(
      stringValue(resultRecord.error, "Telegram send returned an unsuccessful result."),
    );
  }

  return result;
}

async function insertAutomationRun({
  admin,
  agentId,
  metadata,
  startedBy = null,
  status = "completed",
}: {
  admin: SupabaseClient;
  agentId: string;
  metadata: JsonRecord;
  startedBy?: string | null;
  status?: "completed" | "failed" | "running";
}) {
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("workflow_runs")
    .insert({
      agent_id: agentId,
      completed_at: status === "running" ? null : now,
      metadata,
      started_at: now,
      started_by: startedBy,
      status,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return asRecord(data);
}

export async function provisionGmailToTelegramAutomation({
  admin,
  chatId,
  connections,
  content,
  request,
  userId,
  workspaceId,
}: ProvisionGmailTelegramAutomationOptions) {
  const telegramChatId = getTelegramChatIdFromText(content);
  if (!telegramChatId) {
    return {
      activated: false,
      message:
        "I can create this automation, but I need the numeric Telegram chat ID first.",
    };
  }

  const gmailConnectedAccountId = getConnectedAccountId(
    getAppConnection(connections, "gmail"),
    userId,
  );
  const telegramConnectedAccountId = getConnectedAccountId(
    getAppConnection(connections, "telegram"),
    userId,
  );

  if (!gmailConnectedAccountId || !telegramConnectedAccountId) {
    return {
      activated: false,
      message:
        "I found the automation request, but Gmail and Telegram must both be connected for this user before I can activate it.",
    };
  }

  const webhookUrl = getWebhookUrl(request);
  let webhookSubscription: JsonRecord | null = null;
  let triggerResult: JsonRecord | null = null;
  let triggerId = "";
  let mode: "polling" | "webhook" = "webhook";
  let baselineMessageIds: string[] = [];
  let baselineInitialized = true;

  if (webhookUrl.startsWith("https://")) {
    try {
      webhookSubscription = await ensureComposioWebhookSubscription(webhookUrl);
      triggerResult = await upsertComposioTriggerInstance({
        connectedAccountId: gmailConnectedAccountId,
        triggerSlug: gmailTriggerSlug,
        userId: getComposioUserId(workspaceId, userId),
      });
      triggerId = getTriggerId(triggerResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Webhook setup failed";
      if (!/https/i.test(message)) {
        throw error;
      }

      mode = "polling";
      baselineMessageIds = await listRecentGmailMessageIds(gmailConnectedAccountId).catch(
        () => {
          baselineInitialized = false;
          return [];
        },
      );
    }
  } else {
    mode = "polling";
    baselineMessageIds = await listRecentGmailMessageIds(gmailConnectedAccountId).catch(
      () => {
        baselineInitialized = false;
        return [];
      },
    );
  }

  const settings = {
    automation: {
      createdFromChatId: chatId,
      gmailConnectedAccountId,
      baselineInitialized,
      lastProcessedMessageIds: baselineMessageIds,
      mode,
      telegramChatId,
      telegramConnectedAccountId,
      telegramToolSlug,
      triggerId,
      triggerResult,
      triggerSlug: gmailTriggerSlug,
      type: automationType,
      webhookSubscriptionId: getWebhookSubscriptionId(webhookSubscription),
      webhookUrl: mode === "webhook" ? webhookUrl : null,
    },
    modelKey: "atmet",
  };

  const { data: existingAgents, error: existingAgentsError } = await admin
    .from("workflow_agents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("runtime_state", "running")
    .eq("status", "active")
    .eq("settings->automation->>type", automationType)
    .eq("settings->automation->>gmailConnectedAccountId", gmailConnectedAccountId)
    .eq("settings->automation->>telegramConnectedAccountId", telegramConnectedAccountId)
    .eq("settings->automation->>telegramChatId", telegramChatId)
    .is("deleted_at", null)
    .limit(1);

  if (existingAgentsError) {
    throw existingAgentsError;
  }

  const existingAgent = asArray(existingAgents).map(asRecord)[0];
  if (existingAgent?.id) {
    return {
      activated: true,
      agent: existingAgent,
      message: [
        `This Gmail to Telegram automation is already active.`,
        "",
        `- Trigger: \`${gmailTriggerSlug}\``,
        `- Action: \`${telegramToolSlug}\``,
        `- Telegram chat: \`${telegramChatId}\``,
        triggerId ? `- Composio trigger: \`${triggerId}\`` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }

  const { data: agent, error: agentError } = await admin
    .from("workflow_agents")
    .insert({
      created_by: userId,
      gradient: "from-red-300/20 via-stone-100/10 to-sky-300/10",
      name: buildAutomationName(),
      runtime_state: "running",
      schedule: mode === "polling" ? "every 1 minute" : null,
      settings,
      status: "active",
      tone: "Direct, operational notifications.",
      workspace_id: workspaceId,
    })
    .select("*")
    .single();

  if (agentError) {
    throw agentError;
  }

  const agentId = stringValue(asRecord(agent).id);
  const { data: nodes, error: nodesError } = await admin
    .from("workflow_nodes")
    .insert([
      {
        agent_id: agentId,
        app_keys: ["gmail"],
        config: {
          triggerSlug: gmailTriggerSlug,
          type: "trigger",
        },
        position_x: 120,
        position_y: 140,
        runtime_state: "paused",
        source_chat_id: chatId,
        status: "ready",
        title: "New Gmail message received",
      },
      {
        agent_id: agentId,
        app_keys: ["telegram"],
        config: {
          chatId: telegramChatId,
          messageTemplate: "Sender, subject, and received time",
          toolSlug: telegramToolSlug,
          type: "action",
        },
        position_x: 420,
        position_y: 140,
        runtime_state: "paused",
        source_chat_id: chatId,
        status: "ready",
        title: "Send Telegram notification",
      },
    ])
    .select("*");

  if (nodesError) {
    throw nodesError;
  }

  const nodeRows = asArray(nodes).map(asRecord);
  const triggerNodeId = stringValue(nodeRows[0]?.id);
  const actionNodeId = stringValue(nodeRows[1]?.id);

  if (triggerNodeId && actionNodeId) {
    await admin.from("workflow_edges").insert({
      agent_id: agentId,
      label: "New email",
      source_node_id: triggerNodeId,
      target_node_id: actionNodeId,
    });
  }

  const activationRun = await insertAutomationRun({
    admin,
    agentId,
    metadata: { kind: "automation_activation", mode, trigger: "chat" },
    startedBy: userId,
  });

  await admin.from("workflow_run_events").insert({
    event_type: "automation_activated",
    message: `Activated ${gmailTriggerSlug} -> ${telegramToolSlug} (${mode}).`,
    metadata: {
      mode,
      telegramChatId,
      triggerId,
      webhookUrl,
    },
    run_id: stringValue(activationRun.id),
  });

  return {
    activated: true,
    agent,
    message: [
      `Activated **${buildAutomationName()}**.`,
      "",
      `- Trigger: \`${gmailTriggerSlug}\``,
      `- Action: \`${telegramToolSlug}\``,
      `- Telegram chat: \`${telegramChatId}\``,
      `- Mode: \`${mode === "webhook" ? "Composio webhook" : "polling every 1 minute"}\``,
      triggerId ? `- Composio trigger: \`${triggerId}\`` : "",
      mode === "polling"
        ? `- Note: local HTTP cannot receive Composio webhooks, so Atmet will poll Gmail through the scheduled runner.`
        : "",
      mode === "polling" && !baselineInitialized
        ? `- First poll will establish the Gmail baseline before sending notifications.`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function verifyComposioWebhookRequest({
  body,
  headers,
}: {
  body: string;
  headers: Headers;
}) {
  const secret = process.env.COMPOSIO_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return { ok: true, skipped: true };
  }

  const webhookId = headers.get("webhook-id") ?? "";
  const webhookTimestamp = headers.get("webhook-timestamp") ?? "";
  const signature = headers.get("webhook-signature") ?? "";

  if (!webhookId || !webhookTimestamp || !signature) {
    return { ok: false, skipped: false };
  }

  const timestampMs = Number.parseInt(webhookTimestamp, 10) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 300_000) {
    return { ok: false, skipped: false };
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${webhookId}.${webhookTimestamp}.${body}`)
    .digest("base64");
  const received = signature.split(",")[1] ?? signature;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return { ok: false, skipped: false };
  }

  return {
    ok: crypto.timingSafeEqual(expectedBuffer, receivedBuffer),
    skipped: false,
  };
}

export function getComposioTriggerSlug(payload: unknown) {
  return (
    findDeepString(payload, ["trigger_slug", "triggerSlug"]) ||
    stringValue(asRecord(asRecord(payload).metadata).trigger_slug)
  );
}

export function getComposioTriggerId(payload: unknown) {
  return findDeepString(payload, ["trigger_id", "triggerId", "trigger_instance_id"]);
}

export function buildTelegramMessageFromGmailPayload(payload: unknown) {
  const data = asRecord(asRecord(payload).data);
  const eventPayload = data.payload ?? data;
  const subject = findDeepString(eventPayload, ["subject"]) || "(no subject)";
  const from =
    findDeepString(eventPayload, ["from", "sender", "sender_email", "from_email"]) ||
    "Unknown sender";
  const received =
    findDeepString(eventPayload, ["date", "received_at", "receivedAt", "internalDate"]) ||
    findDeepNumberString(eventPayload, ["timestamp", "internalDate"]) ||
    new Date().toISOString();

  return [
    "New Gmail message received",
    `From: ${from}`,
    `Subject: ${subject}`,
    `Received: ${received}`,
  ].join("\n");
}

export async function handleGmailToTelegramWebhook({
  admin,
  payload,
}: {
  admin: SupabaseClient;
  payload: JsonRecord;
}) {
  const triggerSlug = getComposioTriggerSlug(payload);
  const triggerId = getComposioTriggerId(payload);

  if (triggerSlug && triggerSlug !== gmailTriggerSlug) {
    return { handled: false, reason: "different_trigger" };
  }

  let query = admin
    .from("workflow_agents")
    .select("*")
    .eq("runtime_state", "running")
    .eq("status", "active")
    .eq("settings->automation->>type", automationType)
    .is("deleted_at", null);

  if (triggerId) {
    query = query.eq("settings->automation->>triggerId", triggerId);
  } else if (triggerSlug) {
    query = query.eq("settings->automation->>triggerSlug", triggerSlug);
  }

  const { data: agents, error } = await query;

  if (error) {
    throw error;
  }

  const results = [];
  for (const agent of agents ?? []) {
    const agentRecord = asRecord(agent);
    const automation = asRecord(asRecord(agentRecord.settings).automation);
    const telegramConnectedAccountId = stringValue(
      automation.telegramConnectedAccountId,
    );
    const telegramChatId = stringValue(automation.telegramChatId);

    if (!telegramConnectedAccountId || !telegramChatId) {
      results.push({ agentId: agentRecord.id, ok: false, reason: "missing_telegram_config" });
      continue;
    }

    const startedAt = new Date().toISOString();
    const { data: run, error: runError } = await admin
      .from("workflow_runs")
      .insert({
        agent_id: agentRecord.id,
        metadata: {
          trigger: "composio",
          triggerId,
          triggerSlug,
        },
        started_at: startedAt,
        started_by: null,
        status: "running",
      })
      .select("*")
      .single();

    if (runError) {
      throw runError;
    }

    const runId = stringValue(asRecord(run).id);

    try {
      const message = buildTelegramMessageFromGmailPayload(payload);
      const result = await sendTelegramMessage({
        connectedAccountId: telegramConnectedAccountId,
        telegramChatId,
        text: message,
      });

      await Promise.all([
        admin.from("workflow_run_events").insert({
          event_type: "telegram_notification_sent",
          message: "Sent Telegram notification for Gmail trigger.",
          metadata: { result, telegramChatId, triggerId, triggerSlug },
          run_id: runId,
        }),
        admin
          .from("workflow_runs")
          .update({
            completed_at: new Date().toISOString(),
            metadata: {
              telegramChatId,
              trigger: "composio",
              triggerId,
              triggerSlug,
            },
            status: "completed",
          })
          .eq("id", runId),
      ]);

      results.push({ agentId: agentRecord.id, ok: true, runId });
    } catch (sendError) {
      const message =
        sendError instanceof Error ? sendError.message : "Telegram send failed";
      await Promise.all([
        admin.from("workflow_run_events").insert({
          event_type: "telegram_notification_failed",
          message,
          metadata: { telegramChatId, triggerId, triggerSlug },
          run_id: runId,
        }),
        admin
          .from("workflow_runs")
          .update({
            completed_at: new Date().toISOString(),
            metadata: { error: message, trigger: "composio", triggerId, triggerSlug },
            status: "failed",
          })
          .eq("id", runId),
      ]);
      results.push({ agentId: agentRecord.id, error: message, ok: false, runId });
    }
  }

  return { handled: results.length > 0, results };
}

export function isGmailToTelegramPollingAgent(agent: unknown) {
  const record = asRecord(agent);
  const automation = asRecord(asRecord(record.settings).automation);
  return (
    stringValue(automation.type) === automationType &&
    stringValue(automation.mode) === "polling"
  );
}

export async function pollGmailToTelegramAutomation({
  admin,
  agent,
}: {
  admin: SupabaseClient;
  agent: JsonRecord;
}) {
  const automation = asRecord(asRecord(agent.settings).automation);
  const gmailConnectedAccountId = stringValue(automation.gmailConnectedAccountId);
  const telegramConnectedAccountId = stringValue(automation.telegramConnectedAccountId);
  const telegramChatId = stringValue(automation.telegramChatId);
  const baselineInitialized = automation.baselineInitialized !== false;
  const previousIds = new Set(
    asArray(automation.lastProcessedMessageIds).map((id) => stringValue(id)).filter(Boolean),
  );

  if (!gmailConnectedAccountId || !telegramConnectedAccountId || !telegramChatId) {
    throw new Error("Polling automation is missing Gmail or Telegram connection settings.");
  }

  const recentIds = await listRecentGmailMessageIds(gmailConnectedAccountId);
  if (!baselineInitialized) {
    const nextSettings = {
      ...asRecord(agent.settings),
      automation: {
        ...automation,
        baselineInitialized: true,
        lastPolledAt: new Date().toISOString(),
        lastProcessedMessageIds: recentIds,
      },
    };

    const run = await insertAutomationRun({
      admin,
      agentId: stringValue(agent.id),
      metadata: {
        mode: "polling",
        newMessageCount: 0,
        trigger: "schedule",
      },
      status: "running",
    });
    const runId = stringValue(run.id);

    await Promise.all([
      admin
        .from("workflow_agents")
        .update({ settings: nextSettings })
        .eq("id", stringValue(agent.id)),
      admin.from("workflow_run_events").insert({
        event_type: "gmail_poll_baselined",
        message: "Established Gmail polling baseline.",
        metadata: { baselineMessageCount: recentIds.length, telegramChatId },
        run_id: runId,
      }),
      admin
        .from("workflow_runs")
        .update({
          completed_at: new Date().toISOString(),
          metadata: {
            mode: "polling",
            sentCount: 0,
            trigger: "schedule",
          },
          status: "completed",
        })
        .eq("id", runId),
    ]);

    return { ok: true, runId, sentCount: 0 };
  }

  const newIds = recentIds.filter((id) => !previousIds.has(id)).reverse();
  const run = await insertAutomationRun({
    admin,
    agentId: stringValue(agent.id),
    metadata: {
      mode: "polling",
      newMessageCount: newIds.length,
      trigger: "schedule",
    },
    status: "running",
  });
  const runId = stringValue(run.id);
  const sent = [];

  try {
    for (const messageId of newIds) {
      const messagePayload = await fetchGmailMessage(gmailConnectedAccountId, messageId);
      const text = buildTelegramMessageFromGmailPayload({
        data: asRecord(messagePayload).data ?? messagePayload,
      });
      const result = await sendTelegramMessage({
        connectedAccountId: telegramConnectedAccountId,
        telegramChatId,
        text,
      });
      sent.push({ messageId, result });
    }

    const nextSettings = {
      ...asRecord(agent.settings),
      automation: {
        ...automation,
        lastPolledAt: new Date().toISOString(),
        lastProcessedMessageIds: recentIds,
      },
    };

    await Promise.all([
      admin
        .from("workflow_agents")
        .update({ settings: nextSettings })
        .eq("id", stringValue(agent.id)),
      admin.from("workflow_run_events").insert({
        event_type: "gmail_poll_completed",
        message:
          sent.length > 0
            ? `Sent ${sent.length} Telegram notification(s).`
            : "No new Gmail messages found.",
        metadata: { sent, telegramChatId },
        run_id: runId,
      }),
      admin
        .from("workflow_runs")
        .update({
          completed_at: new Date().toISOString(),
          metadata: {
            mode: "polling",
            sentCount: sent.length,
            trigger: "schedule",
          },
          status: "completed",
        })
        .eq("id", runId),
    ]);

    return { ok: true, runId, sentCount: sent.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gmail polling failed";
    await Promise.all([
      admin.from("workflow_run_events").insert({
        event_type: "gmail_poll_failed",
        message,
        metadata: { telegramChatId },
        run_id: runId,
      }),
      admin
        .from("workflow_runs")
        .update({
          completed_at: new Date().toISOString(),
          metadata: { error: message, mode: "polling", trigger: "schedule" },
          status: "failed",
        })
        .eq("id", runId),
    ]);
    throw error;
  }
}
