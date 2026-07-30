import type { SupabaseClient } from "@supabase/supabase-js";
import { buildAtmetSystemPrompt } from "@/lib/ai/system";
import { normalizeModelConfig, runAtmetChat } from "@/lib/ai/providers";
import type { AtmetChatMessage } from "@/lib/ai/types";
import { getAppDocsForRequest } from "@/lib/apps-docs";
import { executeComposioProxy, getComposioUserConnection } from "@/lib/composio";

type WorkflowRunTrigger = "manual" | "node" | "schedule";

type WorkflowNodeRow = {
  app_keys?: string[] | null;
  config?: Record<string, unknown> | null;
  id: string;
  position_x?: number | string | null;
  position_y?: number | string | null;
  source_chat_id?: string | null;
  title: string;
};

type WorkflowEdgeRow = {
  source_node_id: string;
  target_node_id: string;
};

type WorkflowAgentRow = {
  created_by?: string | null;
  id: string;
  name: string;
  runtime_state?: string | null;
  schedule?: string | null;
  settings?: Record<string, unknown> | null;
  workspace_id: string;
  workflow_edges?: WorkflowEdgeRow[] | null;
  workflow_nodes?: WorkflowNodeRow[] | null;
};

type RunWorkflowAgentOptions = {
  admin: SupabaseClient;
  agentId: string;
  nodeId?: string;
  startedBy?: string | null;
  trigger?: WorkflowRunTrigger;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getNodeAppKeys(node: WorkflowNodeRow) {
  const keys = Array.isArray(node.app_keys) ? node.app_keys.filter(Boolean) : [];
  const content = [node.title, JSON.stringify(asRecord(node.config))].join("\n").toLowerCase();

  if (/\bgmail\b|\bemail\b|\bmail\b/.test(content)) {
    keys.push("gmail");
  }

  if (/\btelegram\b/.test(content)) {
    keys.push("telegram");
  }

  return uniqueStrings(keys);
}

function mapProviderMessage(row: unknown): AtmetChatMessage | null {
  const record = asRecord(row);
  const role = stringValue(record.role);
  const content = stringValue(record.content);

  if (!content || (role !== "assistant" && role !== "system" && role !== "user")) {
    return null;
  }

  return { content, role };
}

function buildRecentConversationContext(messages: AtmetChatMessage[]) {
  return messages
    .map((message) => {
      const content =
        typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content);
      return `${message.role}: ${content}`;
    })
    .join("\n\n");
}

function cleanEmailBody(value: string) {
  return value
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => !/^(gmail|outlook|email)$/i.test(line.trim()))
    .join("\n")
    .trim();
}

function extractEmailSendDetails(content: string, conversationContext?: string) {
  const combined = [conversationContext, content].filter(Boolean).join("\n");
  const emailMatches = Array.from(
    combined.matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi),
  ).map((match) => match[0]);
  const recipient = emailMatches[emailMatches.length - 1] ?? "";
  const subject =
    /(?:^|\n)\s*subject\s*[:\-]\s*([^\n]+)/i.exec(combined)?.[1]?.trim() ??
    /(?:^|\n)\s*title\s*[:\-]\s*([^\n]+)/i.exec(combined)?.[1]?.trim() ??
    "";
  const explicitBody =
    /(?:^|\n)\s*(?:message|body|email body|says?)\s*[:\-]\s*([\s\S]+)/i.exec(combined)?.[1] ??
    "";
  const fallbackBody = content
    .replace(/\bcan you\s+/i, "")
    .replace(/\bsend an email to\s+\S+/i, "")
    .replace(/\bvia\s+gmail\b/i, "")
    .replace(/\bgmail\b/i, "")
    .trim();
  const body = cleanEmailBody(explicitBody || fallbackBody);

  return {
    body,
    recipient,
    subject: subject || body.split(/\s+/).slice(0, 8).join(" ") || "Message from Atmet",
  };
}

function buildGmailRawEmail({
  body,
  recipient,
  subject,
}: {
  body: string;
  recipient: string;
  subject: string;
}) {
  const raw = [
    `To: ${recipient}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ].join("\r\n");

  return Buffer.from(raw).toString("base64url");
}

async function sendGmailMessage({
  connectedAccountId,
  content,
  conversationContext,
}: {
  connectedAccountId?: string;
  content: string;
  conversationContext?: string;
}) {
  const details = extractEmailSendDetails(content, conversationContext);

  if (!details.recipient || !details.body) {
    return null;
  }

  const body = { raw: buildGmailRawEmail(details) };
  const result = await executeComposioProxy({
    body,
    connectedAccountId,
    endpoint: "/gmail/v1/users/me/messages/send",
    method: "POST",
  }).catch(() =>
    executeComposioProxy({
      body,
      connectedAccountId,
      endpoint: "/users/me/messages/send",
      method: "POST",
    }),
  );

  return {
    ...details,
    result,
  };
}

function isWorkflowGeneratedMessage(row: unknown) {
  const metadata = asRecord(asRecord(row).metadata);
  return stringValue(metadata.kind).startsWith("workflow_node_");
}

function sortNodesByPosition(nodes: WorkflowNodeRow[]) {
  return [...nodes].sort((a, b) => {
    const xDiff = numberValue(a.position_x) - numberValue(b.position_x);
    return xDiff || numberValue(a.position_y) - numberValue(b.position_y);
  });
}

function getWorkflowExecutionOrder(
  nodes: WorkflowNodeRow[],
  edges: WorkflowEdgeRow[],
) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const sortedNodes = sortNodesByPosition(nodes);
  const byId = new Map(sortedNodes.map((node) => [node.id, node]));
  const incomingCount = new Map(sortedNodes.map((node) => [node.id, 0]));
  const outgoing = new Map<string, string[]>();

  for (const edge of edges) {
    if (!nodeIds.has(edge.source_node_id) || !nodeIds.has(edge.target_node_id)) {
      continue;
    }

    incomingCount.set(
      edge.target_node_id,
      (incomingCount.get(edge.target_node_id) ?? 0) + 1,
    );
    outgoing.set(edge.source_node_id, [
      ...(outgoing.get(edge.source_node_id) ?? []),
      edge.target_node_id,
    ]);
  }

  const queue = sortedNodes
    .filter((node) => (incomingCount.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
  const orderedIds: string[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId) {
      continue;
    }

    orderedIds.push(nodeId);
    for (const targetId of outgoing.get(nodeId) ?? []) {
      const nextIncomingCount = (incomingCount.get(targetId) ?? 0) - 1;
      incomingCount.set(targetId, nextIncomingCount);
      if (nextIncomingCount === 0) {
        queue.push(targetId);
      }
    }
  }

  if (orderedIds.length !== sortedNodes.length) {
    return sortedNodes;
  }

  return orderedIds
    .map((nodeId) => byId.get(nodeId))
    .filter((node): node is WorkflowNodeRow => Boolean(node));
}

async function addRunEvent({
  admin,
  message,
  metadata = {},
  nodeId,
  runId,
  type,
}: {
  admin: SupabaseClient;
  message: string;
  metadata?: Record<string, unknown>;
  nodeId?: string | null;
  runId: string;
  type: string;
}) {
  await admin.from("workflow_run_events").insert({
    event_type: type,
    message,
    metadata,
    node_id: nodeId ?? null,
    run_id: runId,
  });
}

function buildNodePrompt({
  agent,
  appDocsContext,
  node,
  previousOutputs,
  trigger,
}: {
  agent: WorkflowAgentRow;
  appDocsContext?: string;
  node: WorkflowNodeRow;
  previousOutputs: Array<{ nodeTitle: string; output: string }>;
  trigger: WorkflowRunTrigger;
}) {
  const config = asRecord(node.config);
  const instruction = stringValue(config.instruction) || stringValue(config.prompt);
  const appKeys = Array.isArray(node.app_keys) ? node.app_keys.filter(Boolean) : [];
  const previousContext = previousOutputs.length
    ? previousOutputs
        .map(
          (item, index) =>
            `Previous node ${index + 1}: ${item.nodeTitle}\n${item.output}`,
        )
        .join("\n\n")
    : "No previous node output.";

  return [
    `Run workflow agent "${agent.name}" for node "${node.title}".`,
    `Trigger: ${trigger}.`,
    appKeys.length ? `Connected app context for this node: ${appKeys.join(", ")}.` : "",
    appDocsContext ? `Connected app docs:\n${appDocsContext}` : "",
    instruction ? `Node instruction:\n${instruction}` : "",
    "Use the linked chat history and previous node outputs. Produce the concrete result for this node only.",
    "If this node should hand work to the next node, end with a short handoff summary.",
    `Previous node outputs:\n${previousContext}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function buildNodeAppDocsContext(node: WorkflowNodeRow) {
  const appKeys = Array.isArray(node.app_keys) ? node.app_keys.filter(Boolean) : [];

  if (appKeys.length === 0) {
    return "";
  }

  const config = asRecord(node.config);
  const content = [
    node.title,
    stringValue(config.instruction),
    stringValue(config.prompt),
    JSON.stringify(config),
  ].join("\n");
  const docs = await Promise.all(
    appKeys.slice(0, 6).map(async (appKey) => {
      const doc = await getAppDocsForRequest({
        appKey,
        content,
        maxTools: 12,
        maxTriggers: 8,
      });

      return doc ? `### ${appKey}\n${doc.context}` : "";
    }),
  );

  return docs.filter(Boolean).join("\n\n");
}

async function loadLastRealUserMessage(admin: SupabaseClient, chatId: string) {
  const { data, error } = await admin
    .from("chat_messages")
    .select("id, role, content, created_at, metadata")
    .eq("chat_id", chatId)
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []).find((message) => !isWorkflowGeneratedMessage(message)) ?? null;
}

async function loadChatHistoryThroughMessage({
  admin,
  chatId,
  messageCreatedAt,
}: {
  admin: SupabaseClient;
  chatId: string;
  messageCreatedAt: string;
}) {
  const { data, error } = await admin
    .from("chat_messages")
    .select("role, content, created_at, metadata")
    .eq("chat_id", chatId)
    .lte("created_at", messageCreatedAt)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return [...(data ?? [])]
    .reverse()
    .filter((message) => !isWorkflowGeneratedMessage(message))
    .map(mapProviderMessage)
    .filter((message): message is AtmetChatMessage => Boolean(message));
}

async function getWorkflowUserId({
  admin,
  agent,
  chatId,
  startedBy,
}: {
  admin: SupabaseClient;
  agent: WorkflowAgentRow;
  chatId: string;
  startedBy?: string | null;
}) {
  if (startedBy) {
    return startedBy;
  }

  const { data: chat, error } = await admin
    .from("chats")
    .select("user_id")
    .eq("id", chatId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return stringValue(asRecord(chat).user_id) || stringValue(agent.created_by);
}

function getConnectionUserStatus(connection: Record<string, unknown>, userId: string) {
  const settings = asRecord(connection.settings);
  const users = asRecord(settings.users);
  return stringValue(asRecord(users[userId]).status).toLowerCase();
}

async function runNodeConnectedAppActions({
  admin,
  agent,
  chatId,
  content,
  conversationContext,
  node,
  startedBy,
}: {
  admin: SupabaseClient;
  agent: WorkflowAgentRow;
  chatId: string;
  content: string;
  conversationContext: string;
  node: WorkflowNodeRow;
  startedBy?: string | null;
}) {
  const appKeys = getNodeAppKeys(node);
  const metadata: Record<string, unknown>[] = [];
  const contextItems: string[] = [];

  if (!appKeys.includes("gmail")) {
    return { context: "", metadata };
  }

  const userId = await getWorkflowUserId({ admin, agent, chatId, startedBy });
  if (!userId) {
    metadata.push({ appKey: "gmail", status: "missing_user" });
    return { context: "", metadata };
  }

  const { data: connection, error } = await admin
    .from("workspace_connectors")
    .select("app_key, settings")
    .eq("workspace_id", agent.workspace_id)
    .eq("app_key", "gmail")
    .maybeSingle();

  if (error) {
    throw error;
  }

  const connectionRecord = asRecord(connection);
  if (!connection || getConnectionUserStatus(connectionRecord, userId) !== "connected") {
    metadata.push({ appKey: "gmail", status: "not_connected" });
    contextItems.push("### Gmail\nGmail is linked to this node, but the user has not connected Gmail yet.");
    return { context: contextItems.join("\n\n"), metadata };
  }

  const connectedAccountId = stringValue(
    asRecord(getComposioUserConnection(connectionRecord.settings, userId)).connectedAccountId,
  );

  try {
    const gmailResult = await sendGmailMessage({
      connectedAccountId,
      content,
      conversationContext,
    });

    if (!gmailResult) {
      metadata.push({ appKey: "gmail", status: "missing_email_fields" });
      return { context: "", metadata };
    }

    metadata.push({
      appKey: "gmail",
      status: "used",
      toolSlug: "gmail_proxy_send_message",
    });
    contextItems.push(
      [
        "### Gmail",
        "Tool: Gmail proxy /gmail/v1/users/me/messages/send",
        "Result:",
        JSON.stringify(
          {
            body: gmailResult.body,
            recipient: gmailResult.recipient,
            subject: gmailResult.subject,
          },
          null,
          2,
        ),
      ].join("\n"),
    );
  } catch (error) {
    metadata.push({
      appKey: "gmail",
      error: error instanceof Error ? error.message : "Gmail send failed",
      status: "failed",
    });
  }

  return { context: contextItems.join("\n\n"), metadata };
}

export async function runWorkflowAgent({
  admin,
  agentId,
  nodeId,
  startedBy = null,
  trigger = "manual",
}: RunWorkflowAgentOptions) {
  const { data: agentData, error: agentError } = await admin
    .from("workflow_agents")
    .select("*, workflow_nodes(*), workflow_edges(*)")
    .eq("id", agentId)
    .is("deleted_at", null)
    .single();

  if (agentError) {
    throw agentError;
  }

  const agent = agentData as WorkflowAgentRow;
  const allNodes = Array.isArray(agent.workflow_nodes) ? agent.workflow_nodes : [];
  const edges = Array.isArray(agent.workflow_edges) ? agent.workflow_edges : [];
  const orderedNodes = nodeId
    ? allNodes.filter((node) => node.id === nodeId)
    : getWorkflowExecutionOrder(allNodes, edges);

  const { data: run, error: runError } = await admin
    .from("workflow_runs")
    .insert({
      agent_id: agentId,
      metadata: {
        nodeCount: orderedNodes.length,
        nodeId: nodeId ?? null,
        trigger,
      },
      started_at: new Date().toISOString(),
      started_by: startedBy,
      status: "running",
    })
    .select("*")
    .single();

  if (runError) {
    throw runError;
  }

  const runId = stringValue(asRecord(run).id);
  const completedOutputs: Array<{ nodeTitle: string; output: string }> = [];

  await admin
    .from("workflow_agents")
    .update({ runtime_state: "running" })
    .eq("id", agentId);
  await addRunEvent({
    admin,
    message: `Started ${trigger} run for ${orderedNodes.length} node(s).`,
    runId,
    type: "run_started",
  });

  if (orderedNodes.length === 0) {
    await addRunEvent({
      admin,
      message: "No nodes are available to run.",
      runId,
      type: "run_failed",
    });
    await admin
      .from("workflow_runs")
      .update({ completed_at: new Date().toISOString(), status: "failed" })
      .eq("id", runId);
    return { run: { ...asRecord(run), status: "failed" }, runId };
  }

  const [{ data: workspace }, { data: brain }, { data: modelRow }] =
    await Promise.all([
      admin.from("workspaces").select("name, slug").eq("id", agent.workspace_id).maybeSingle(),
      admin
        .from("workspace_brain")
        .select("personalization, business_details, output_style")
        .eq("workspace_id", agent.workspace_id)
        .maybeSingle(),
      admin
        .from("ai_models")
        .select("*")
        .eq("key", stringValue(asRecord(agent.settings).modelKey, "atmet"))
        .maybeSingle(),
    ]);
  const model = normalizeModelConfig(modelRow, "atmet");
  const baseSystemPrompt = buildAtmetSystemPrompt({ brain, workspace });

  try {
    for (const node of orderedNodes) {
      if (!node.source_chat_id) {
        await addRunEvent({
          admin,
          message: `Skipped "${node.title}" because it has no linked chat.`,
          nodeId: node.id,
          runId,
          type: "node_skipped",
        });
        continue;
      }

      await admin
        .from("workflow_nodes")
        .update({ runtime_state: "running", status: "running" })
        .eq("id", node.id);
      await addRunEvent({
        admin,
        message: `Running "${node.title}".`,
        metadata: { chatId: node.source_chat_id },
        nodeId: node.id,
        runId,
        type: "node_started",
      });

      const appDocsContext = await buildNodeAppDocsContext(node);
      const prompt = buildNodePrompt({
        agent,
        appDocsContext,
        node,
        previousOutputs: completedOutputs,
        trigger,
      });
      const lastUserMessage = await loadLastRealUserMessage(admin, node.source_chat_id);

      if (!lastUserMessage) {
        await addRunEvent({
          admin,
          message: `Skipped "${node.title}" because the linked chat has no user message to rerun.`,
          metadata: { chatId: node.source_chat_id },
          nodeId: node.id,
          runId,
          type: "node_skipped",
        });
        await admin
          .from("workflow_nodes")
          .update({ runtime_state: "paused", status: "ready" })
          .eq("id", node.id);
        continue;
      }

      const history = await loadChatHistoryThroughMessage({
        admin,
        chatId: node.source_chat_id,
        messageCreatedAt: stringValue(asRecord(lastUserMessage).created_at),
      });
      const lastUserContent = stringValue(asRecord(lastUserMessage).content);
      const connectedAppAction = await runNodeConnectedAppActions({
        admin,
        agent,
        chatId: node.source_chat_id,
        content: lastUserContent,
        conversationContext: buildRecentConversationContext(history),
        node,
        startedBy,
      });
      const result = await runAtmetChat({
        messages: [
          {
            content: prompt,
            role: "system",
          },
          ...(connectedAppAction.context
            ? [
                {
                  content: connectedAppAction.context,
                  role: "system" as const,
                },
              ]
            : []),
          ...history,
        ],
        model,
        systemPrompt: [
          baseSystemPrompt,
          "You are executing a workflow node by rerunning the linked chat from its latest real user message. Be direct, complete the node work, and keep a concise handoff for downstream nodes.",
        ].join("\n\n"),
      });
      const nodeStatus = result.configured ? "ready" : "failed";

      const { data: assistantMessage, error: assistantMessageError } = await admin
        .from("chat_messages")
        .insert({
          chat_id: node.source_chat_id,
          content: result.content,
          metadata: {
            agentId,
            kind: "workflow_node_output",
            modelKey: model.key,
            nodeId: node.id,
            providerKey: result.providerKey,
            runId,
            sourceMessageId: stringValue(asRecord(lastUserMessage).id),
            connectedAppContext: connectedAppAction.metadata,
            trigger,
          },
          role: "assistant",
        })
        .select("*")
        .single();

      if (assistantMessageError) {
        throw assistantMessageError;
      }

      await Promise.all([
        admin
          .from("workflow_nodes")
          .update({ runtime_state: "paused", status: nodeStatus })
          .eq("id", node.id),
        admin
          .from("chats")
          .update({
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", node.source_chat_id),
        admin.from("ai_model_runs").insert({
          chat_id: node.source_chat_id,
          error: result.error ?? null,
          input_tokens: result.inputTokens ?? null,
          message_id: stringValue(asRecord(assistantMessage).id) || null,
          model_id: result.modelId,
          model_key: model.key,
          output_tokens: result.outputTokens ?? null,
          provider_key: result.providerKey,
          status: result.configured ? "completed" : "not_configured",
          user_id: startedBy,
          workspace_id: agent.workspace_id,
        }),
      ]);

      if (!result.configured) {
        throw new Error(result.error || "Workflow model is not configured.");
      }

      completedOutputs.push({
        nodeTitle: node.title,
        output: result.content,
      });
      await addRunEvent({
        admin,
        message: `Completed "${node.title}".`,
        metadata: {
          chatId: node.source_chat_id,
          messageId: stringValue(asRecord(assistantMessage).id),
        },
        nodeId: node.id,
        runId,
        type: "node_completed",
      });
    }

    await Promise.all([
      admin
        .from("workflow_runs")
        .update({
          completed_at: new Date().toISOString(),
          metadata: {
            completedNodeCount: completedOutputs.length,
            nodeCount: orderedNodes.length,
            nodeId: nodeId ?? null,
            trigger,
          },
          status: "completed",
        })
        .eq("id", runId),
      admin.from("usage_events").insert({
        metadata: { agentId, runId, trigger },
        quantity: 1,
        resource: "workflow_runs",
        user_id: startedBy,
        workspace_id: agent.workspace_id,
      }),
    ]);
    await addRunEvent({
      admin,
      message: `Completed ${completedOutputs.length} node(s).`,
      runId,
      type: "run_completed",
    });

    return { completedNodeCount: completedOutputs.length, run, runId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Workflow run failed.";
    await admin
      .from("workflow_nodes")
      .update({ runtime_state: "paused", status: "failed" })
      .in(
        "id",
        orderedNodes.map((node) => node.id),
      );
    await admin
      .from("workflow_runs")
      .update({
        completed_at: new Date().toISOString(),
        metadata: {
          completedNodeCount: completedOutputs.length,
          error: message,
          nodeCount: orderedNodes.length,
          nodeId: nodeId ?? null,
          trigger,
        },
        status: "failed",
      })
      .eq("id", runId);
    await addRunEvent({
      admin,
      message,
      runId,
      type: "run_failed",
    });
    throw error;
  }
}

export function isWorkflowScheduleDue(schedule: string, latestRunAt?: string | null) {
  const normalized = schedule.trim().toLowerCase();
  if (!normalized || normalized === "manual" || normalized === "off") {
    return false;
  }

  if (!latestRunAt) {
    return true;
  }

  const lastRunMs = Date.parse(latestRunAt);
  if (!Number.isFinite(lastRunMs)) {
    return true;
  }

  const elapsedMs = Date.now() - lastRunMs;
  const match = /every\s+(\d{1,3})\s*(minute|minutes|hour|hours|day|days)/.exec(
    normalized,
  );

  if (match) {
    const count = Number.parseInt(match[1], 10);
    const unit = match[2];
    const multiplier = unit.startsWith("minute")
      ? 60_000
      : unit.startsWith("hour")
        ? 3_600_000
        : 86_400_000;
    return elapsedMs >= count * multiplier;
  }

  if (normalized.includes("hourly")) {
    return elapsedMs >= 3_600_000;
  }

  if (normalized.includes("weekly")) {
    return elapsedMs >= 7 * 86_400_000;
  }

  if (normalized.includes("daily") || normalized.includes("weekday")) {
    return elapsedMs >= 86_400_000;
  }

  return false;
}
