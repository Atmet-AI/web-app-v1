import { buildAtmetSystemPrompt } from "@/lib/ai/system";
import { normalizeModelConfig, runAtmetChat } from "@/lib/ai/providers";
import type { AtmetChatMessage } from "@/lib/ai/types";
import { isRouteResponse } from "@/lib/api/auth";
import {
  badRequest,
  jsonObject,
  notFound,
  ok,
  readJson,
  serverError,
  stringValue,
} from "@/lib/api/http";
import { requireChatPermission } from "@/lib/api/permissions";
import {
  executeComposioToolWithText,
  getFallbackComposioTools,
  getComposioToolkitSlug,
  getComposioUserId,
  getComposioUserConnection,
  listComposioTools,
} from "@/lib/composio";
import { connectorCatalog } from "@/lib/connectors/catalog";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mapProviderMessage(row: unknown): AtmetChatMessage | null {
  const record = asRecord(row);
  const role = stringValue(record.role);
  const content = stringValue(record.content);

  if (!content || (role !== "assistant" && role !== "user")) {
    return null;
  }

  return { content, role };
}

function userConnectionIdFromModelKey(modelKey: string) {
  return modelKey.startsWith("user-connection:")
    ? modelKey.slice("user-connection:".length)
    : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];
}

function getChatMessageMentions(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((item) => {
          const record = asRecord(item);
          const kind = stringValue(record.kind);
          const name = stringValue(record.name);

          if (!name || (kind !== "apps" && kind !== "skills")) {
            return null;
          }

          return {
            key: stringValue(record.key),
            kind,
            logo: stringValue(record.logo),
            name,
          };
        })
        .filter((item): item is {
          key: string;
          kind: "apps" | "skills";
          logo: string;
          name: string;
        } => Boolean(item))
    : [];
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function uniqueToolsBySlug<T extends { slug?: string }>(tools: T[]) {
  const seen = new Set<string>();
  return tools.filter((tool) => {
    const slug = stringValue(tool.slug);
    if (!slug || seen.has(slug)) {
      return false;
    }

    seen.add(slug);
    return true;
  });
}

function truncateJson(value: unknown, maxLength = 6000) {
  const text =
    typeof value === "string"
      ? value
      : JSON.stringify(value, null, 2) ?? String(value);

  return text.length > maxLength ? `${text.slice(0, maxLength)}\n...[truncated]` : text;
}

function getMentionedAppKeys(content: string) {
  const normalizedContent = content.toLowerCase();
  return connectorCatalog
    .filter((connector) => {
      const name = connector.name.toLowerCase();
      const key = connector.key.toLowerCase();
      return (
        normalizedContent.includes(`@${key}`) ||
        normalizedContent.includes(key) ||
        normalizedContent.includes(name)
      );
    })
    .map((connector) => connector.key);
}

function getConnectionUserStatus(connection: Record<string, unknown>, userId: string) {
  const settings = jsonObject(connection.settings);
  const users = jsonObject(settings.users);
  const userConnection = jsonObject(users[userId]);
  return stringValue(userConnection.status).toLowerCase();
}

function getToolSearchQuery(appKey: string, content: string) {
  if (appKey === "gmail" || appKey === "email" || appKey === "outlook") {
    const normalized = content.toLowerCase();
    const provider = appKey === "outlook" ? "outlook" : "gmail";
    if (/\bsend\b/.test(normalized)) {
      return `send email ${provider} recipient subject body`;
    }

    if (/\bdraft\b/.test(normalized)) {
      return `create email draft ${provider} recipient subject body`;
    }

    if (/\breply\b/.test(normalized)) {
      return `reply to email thread ${provider}`;
    }

    if (/\bforward\b/.test(normalized)) {
      return `forward email message ${provider}`;
    }

    return "fetch emails list inbox latest received message";
  }

  if (appKey === "calendar") {
    return "list events read calendar";
  }

  if (appKey === "google-sheets") {
    return "read spreadsheet rows values";
  }

  return content || "search list read get";
}

function getIntentComposioTools(appKey: string, content: string) {
  const normalized = content.toLowerCase();

  if (appKey === "gmail" || appKey === "email") {
    if (/\bsend\b/.test(normalized)) {
      return [
        { slug: "GMAIL_SEND_EMAIL", version: "latest" },
        { slug: "GMAIL_CREATE_EMAIL_DRAFT", version: "latest" },
      ];
    }

    if (/\bdraft\b/.test(normalized)) {
      return [
        { slug: "GMAIL_CREATE_EMAIL_DRAFT", version: "latest" },
        { slug: "GMAIL_SEND_EMAIL", version: "latest" },
      ];
    }

    if (/\breply\b/.test(normalized)) {
      return [
        { slug: "GMAIL_REPLY_TO_THREAD", version: "latest" },
        { slug: "GMAIL_SEND_EMAIL", version: "latest" },
      ];
    }

    if (/\bforward\b/.test(normalized)) {
      return [{ slug: "GMAIL_FORWARD_EMAIL", version: "latest" }];
    }

    return [
      { slug: "GMAIL_FETCH_EMAILS", version: "latest" },
      { slug: "GMAIL_LIST_MESSAGES", version: "latest" },
      { slug: "GMAIL_LIST_THREADS", version: "latest" },
    ];
  }

  if (appKey === "outlook") {
    if (/\bsend\b/.test(normalized)) {
      return [
        { slug: "OUTLOOK_SEND_EMAIL", version: "latest" },
        { slug: "OUTLOOK_CREATE_DRAFT", version: "latest" },
      ];
    }

    if (/\bdraft\b/.test(normalized)) {
      return [
        { slug: "OUTLOOK_CREATE_DRAFT", version: "latest" },
        { slug: "OUTLOOK_SEND_EMAIL", version: "latest" },
      ];
    }

    if (/\breply\b/.test(normalized)) {
      return [
        { slug: "OUTLOOK_REPLY_EMAIL", version: "latest" },
        { slug: "OUTLOOK_SEND_EMAIL", version: "latest" },
      ];
    }

    return [
      { slug: "OUTLOOK_QUERY_EMAILS", version: "latest" },
      { slug: "OUTLOOK_SEARCH_MESSAGES", version: "latest" },
      { slug: "OUTLOOK_GET_MESSAGE", version: "latest" },
    ];
  }

  return [];
}

function buildToolPrompt({
  appKey,
  content,
}: {
  appKey: string;
  content: string;
}) {
  const base = [
    "Connected app request for Atmet AI.",
    "Use the connected app only for the user's explicit request. Do not perform unrelated actions.",
    `User request: ${content}`,
  ];

  if (appKey === "gmail" || appKey === "email") {
    return [
      ...base,
      "Use the authenticated Gmail account. user_id is me.",
      "If the user asks to read/check emails, fetch the relevant inbox email data with sender, subject, date, snippet, and body/content when available.",
      "If the user asks to send, use the send email action. Do not draft instead unless sending fails.",
      "If the user asks for a random email body, write a short harmless friendly message yourself.",
      "If the user asks to draft/reply/forward, use that matching Gmail action and return the result.",
    ].join("\n");
  }

  if (appKey === "outlook") {
    return [
      ...base,
      "Use the authenticated Microsoft Outlook account.",
      "If the user asks to read/check email, fetch the relevant Outlook email data with sender, subject, date, snippet, and body/content when available.",
      "If the user asks to send, use the send email action. Do not draft instead unless sending fails.",
      "If the user asks for a random email body, write a short harmless friendly message yourself.",
      "If the user asks to draft/reply/forward, use that matching Outlook action and return the result.",
    ].join("\n");
  }

  return [
    ...base,
    "Return the result needed to answer the user.",
  ].join("\n");
}

async function loadConnectedAppToolContext({
  appKeys,
  content,
  connections,
  userId,
  workspaceId,
}: {
  appKeys: string[];
  content: string;
  connections: Record<string, unknown>[];
  userId: string;
  workspaceId: string;
}) {
  const contextItems: string[] = [];
  const metadata: Record<string, unknown>[] = [];
  const connectionsByAppKey = new Map(
    connections.map((connection) => [stringValue(connection.app_key), connection]),
  );

  for (const appKey of appKeys.slice(0, 3)) {
    const connection = connectionsByAppKey.get(appKey);
    const connector = connectorCatalog.find((item) => item.key === appKey);
    const toolkitSlug = getComposioToolkitSlug(appKey);

    if (!connector || !toolkitSlug) {
      continue;
    }

    const status = connection ? getConnectionUserStatus(connection, userId) : "";
    if (status !== "connected") {
      contextItems.push(
        `### ${connector.name}\nThis app was mentioned, but this user has not connected it yet.`,
      );
      metadata.push({ appKey, status: "not_connected" });
      continue;
    }

    if (!connection) {
      continue;
    }

    const userConnection = getComposioUserConnection(connection.settings, userId);
    const connectedAccountId = stringValue(userConnection.connectedAccountId);
    const composioUserId = getComposioUserId(workspaceId, userId);

    try {
      const searchedTools = await listComposioTools({
        query: getToolSearchQuery(appKey, content),
        toolkitSlug,
      });
      const tools = uniqueToolsBySlug([
        ...getIntentComposioTools(appKey, content),
        ...searchedTools,
        ...getFallbackComposioTools(toolkitSlug),
      ]);

      if (tools.length === 0) {
        contextItems.push(
          `### ${connector.name}\nAtmet found the connected app, but Composio did not return a matching tool for this request.`,
        );
        metadata.push({ appKey, status: "no_matching_tool" });
        continue;
      }

      let lastToolError = "";
      let toolWasUsed = false;

      for (const tool of tools.slice(0, 8)) {
        const toolSlug = stringValue(tool.slug);
        if (!toolSlug) {
          continue;
        }

        try {
          const result = await executeComposioToolWithText({
            connectedAccountId,
            text: buildToolPrompt({ appKey, content }),
            toolSlug,
            userId: composioUserId,
            version: stringValue(tool.version, "latest"),
          });

          contextItems.push(
            [
              `### ${connector.name}`,
              `Tool: ${toolSlug}`,
              "Result:",
              truncateJson(result),
            ].join("\n"),
          );
          metadata.push({
            appKey,
            status: "used",
            toolSlug,
          });
          toolWasUsed = true;
          break;
        } catch (toolError) {
          lastToolError =
            toolError instanceof Error
              ? toolError.message
              : "Could not read app context";
        }
      }

      if (!toolWasUsed) {
        throw new Error(lastToolError || "Could not read app context");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not read app context";
      contextItems.push(`### ${connector.name}\nCould not read app context: ${message}`);
      metadata.push({ appKey, error: message, status: "error" });
    }
  }

  return {
    context:
      contextItems.length > 0
        ? [
            "Connected App Tool Results",
            "Use these results to answer the user. Only claim an app action happened when the result explicitly shows it.",
            ...contextItems,
          ].join("\n\n")
        : "",
    metadata,
  };
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const chatId = stringValue(body.chatId);
    const workspaceId = stringValue(body.workspaceId);
    const modelKey = stringValue(body.modelKey, "atmet") || "atmet";
    const content = stringValue(body.content);
    const selectedAppKeys = stringArray(body.appKeys);
    const mentions = getChatMessageMentions(body.mentions);

    if (!chatId || !workspaceId || !content) {
      return badRequest("Missing chat, workspace, or message content.");
    }

    const auth = await requireChatPermission(chatId, "chats.manage");
    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data: chat, error: chatError } = await auth.admin
      .from("chats")
      .select("id, workspace_id, title, user_id")
      .eq("id", chatId)
      .eq("user_id", auth.user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (chatError) {
      throw chatError;
    }

    const chatRecord = asRecord(chat);
    if (!chatRecord.id) {
      return notFound("Chat not found.");
    }

    if (chatRecord.workspace_id !== workspaceId) {
      return badRequest("Chat does not belong to this workspace.");
    }

    const userConnectionId = userConnectionIdFromModelKey(modelKey);
    const modelQuery = userConnectionId
      ? auth.admin
          .from("user_model_connections")
          .select("id, provider_key, display_name, model_id, base_url, api_key_secret")
          .eq("id", userConnectionId)
          .eq("user_id", auth.user.id)
          .eq("enabled", true)
          .maybeSingle()
      : auth.admin
          .from("ai_models")
          .select("key, provider_key, display_name, model_id, settings")
          .eq("key", modelKey)
          .eq("enabled", true)
          .maybeSingle();

    const [
      workspaceResult,
      brainResult,
      recentMessagesResult,
      modelResult,
      connectionsResult,
    ] =
      await Promise.all([
        auth.admin
          .from("workspaces")
          .select("id, name, slug")
          .eq("id", workspaceId)
          .maybeSingle(),
        auth.admin
          .from("workspace_brain")
          .select("personalization, business_details, output_style")
          .eq("workspace_id", workspaceId)
          .maybeSingle(),
        auth.admin
          .from("chat_messages")
          .select("id, role, content, created_at")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: false })
          .limit(20),
        modelQuery,
        auth.admin
          .from("workspace_connectors")
          .select("app_key, status, settings")
          .eq("workspace_id", workspaceId),
      ]);

    if (workspaceResult.error) {
      throw workspaceResult.error;
    }

    if (brainResult.error && brainResult.error.code !== "PGRST116") {
      throw brainResult.error;
    }

    if (recentMessagesResult.error) {
      throw recentMessagesResult.error;
    }

    if (modelResult.error) {
      throw modelResult.error;
    }

    if (connectionsResult.error) {
      throw connectionsResult.error;
    }

    if (!modelResult.data) {
      return badRequest("Model is not configured.");
    }

    const providerMessages = (recentMessagesResult.data ?? [])
      .slice()
      .reverse()
      .map(mapProviderMessage)
      .filter((message): message is AtmetChatMessage => Boolean(message));

    const { data: userMessage, error: userMessageError } = await auth.admin
      .from("chat_messages")
      .insert({
        chat_id: chatId,
        content,
        metadata: { mentions, modelKey },
        role: "user",
      })
      .select("id, role, content, created_at")
      .single();

    if (userMessageError) {
      throw userMessageError;
    }

    const model = normalizeModelConfig(
      userConnectionId
        ? { ...modelResult.data, key: modelKey, settings: {} }
        : modelResult.data,
      modelKey,
    );
    const connectionRows = (connectionsResult.data ?? []).map(asRecord);
    const appKeysForContext = uniqueStrings([
      ...selectedAppKeys,
      ...getMentionedAppKeys(content),
    ]);
    const appContext = await loadConnectedAppToolContext({
      appKeys: appKeysForContext,
      connections: connectionRows,
      content,
      userId: auth.user.id,
      workspaceId,
    });
    const startedAt = Date.now();
    const aiResult = await runAtmetChat({
      messages: [
        ...(appContext.context
          ? [{ content: appContext.context, role: "system" as const }]
          : []),
        ...providerMessages,
        { content, role: "user" },
      ],
      model,
      systemPrompt: buildAtmetSystemPrompt({
        brain: brainResult.data,
        workspace: workspaceResult.data,
      }),
    });

    const status = aiResult.configured
      ? aiResult.error
        ? "failed"
        : "completed"
      : "not_configured";

    const { data: assistantMessage, error: assistantMessageError } =
      await auth.admin
        .from("chat_messages")
        .insert({
          chat_id: chatId,
          content: aiResult.content,
          metadata: {
            configured: aiResult.configured,
            error: aiResult.error ?? null,
            connectedAppContext: appContext.metadata,
            modelId: aiResult.modelId,
            modelKey: model.key,
            providerKey: aiResult.providerKey,
          },
          role: "assistant",
        })
        .select("id, role, content, created_at")
        .single();

    if (assistantMessageError) {
      throw assistantMessageError;
    }

    await auth.admin
      .from("chats")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", chatId)
      .eq("user_id", auth.user.id);

    await auth.admin.from("ai_model_runs").insert({
      chat_id: chatId,
      error: aiResult.error ?? null,
      input_tokens: aiResult.inputTokens ?? null,
      latency_ms: Date.now() - startedAt,
      message_id: asRecord(assistantMessage).id,
      model_id: aiResult.modelId,
      model_key: model.key,
      output_tokens: aiResult.outputTokens ?? null,
      provider_key: aiResult.providerKey,
      status,
      user_id: auth.user.id,
      workspace_id: workspaceId,
    });

    return ok({
      assistantMessage,
      model: {
        configured: aiResult.configured,
        displayName: model.displayName,
        key: model.key,
        modelId: aiResult.modelId,
        providerKey: aiResult.providerKey,
      },
      userMessage,
    });
  } catch (error) {
    return serverError(error);
  }
}
