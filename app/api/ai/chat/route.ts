import { buildAtmetSystemPrompt } from "@/lib/ai/system";
import { normalizeModelConfig, runAtmetChat } from "@/lib/ai/providers";
import type { AtmetChatMessage } from "@/lib/ai/types";
import {
  buildAttachmentContext,
  parseChatAttachments,
  serializeAttachmentMetadata,
  type ParsedChatAttachment,
} from "@/lib/ai/attachments";
import { isRouteResponse } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
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
import { isAutoChatTitle, summarizeChatTitle } from "@/lib/chats/title";
import {
  executeComposioProxy,
  executeComposioToolWithText,
  getFallbackComposioTools,
  getComposioToolkitSlug,
  getComposioUserId,
  getComposioUserConnection,
  listComposioTools,
  listComposioToolkitTools,
} from "@/lib/composio";
import { getAppDocsForRequest } from "@/lib/apps-docs";
import {
  isGmailToTelegramAutomationRequest,
  provisionGmailToTelegramAutomation,
} from "@/lib/automations/gmail-telegram";
import { connectorCatalog } from "@/lib/connectors/catalog";

export const runtime = "nodejs";

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

function buildUserContentWithAttachments(
  content: string,
  attachments: ParsedChatAttachment[],
): AtmetChatMessage["content"] {
  const images = attachments
    .map((attachment) => attachment.image)
    .filter((image): image is NonNullable<typeof image> => Boolean(image))
    .slice(0, 4);

  if (images.length === 0) {
    return content;
  }

  return [
    { text: content, type: "text" },
    ...images.map((image) => ({
      data: image.data,
      mediaType: image.mediaType,
      type: "image" as const,
    })),
  ];
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

function getRecentMessageAppKeys(rows: unknown[]) {
  const appKeys: string[] = [];

  for (const row of rows) {
    const record = asRecord(row);
    const metadata = asRecord(record.metadata);
    const mentions = getChatMessageMentions(metadata.mentions);
    appKeys.push(
      ...mentions
        .filter((mention) => mention.kind === "apps")
        .map((mention) => mention.key || mention.name),
    );

    const connectedAppContext = Array.isArray(metadata.connectedAppContext)
      ? metadata.connectedAppContext
      : [];
    for (const item of connectedAppContext) {
      appKeys.push(stringValue(asRecord(item).appKey));
    }
  }

  return appKeys;
}

function normalizeConnectorAppKey(value: string) {
  const normalized = value.trim().toLowerCase();
  const connector = connectorCatalog.find(
    (item) =>
      item.key.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized,
  );

  return connector?.key ?? normalized;
}

function buildRecentConversationContext(messages: AtmetChatMessage[]) {
  return messages
    .slice(-8)
    .map((message) => {
      const content =
        typeof message.content === "string" ? message.content : "[attachment]";
      return `${message.role}: ${truncateJson(content, 1800)}`;
    })
    .join("\n\n");
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map(normalizeConnectorAppKey).filter(Boolean)));
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

function getDeepRecord(value: unknown, key: string): Record<string, unknown> {
  const record = asRecord(value);
  return asRecord(record[key]);
}

function getDeepArray(value: unknown, key: string): unknown[] {
  const record = asRecord(value);
  return Array.isArray(record[key]) ? record[key] : [];
}

function getToolResultError(value: unknown) {
  const record = asRecord(value);
  const error = asRecord(record.error);
  const data = asRecord(record.data);
  const dataError = asRecord(data.error);
  const nestedError = asRecord(getDeepRecord(record, "result").error);

  return (
    stringValue(error.message) ||
    stringValue(error.suggested_fix) ||
    stringValue(dataError.message) ||
    stringValue(dataError.suggested_fix) ||
    stringValue(nestedError.message) ||
    stringValue(record.error) ||
    ""
  );
}

function isSuccessfulToolResult(value: unknown) {
  const record = asRecord(value);
  const data = asRecord(record.data);
  const result = asRecord(record.result);
  const successful =
    typeof record.successful === "boolean"
      ? record.successful
      : typeof record.success === "boolean"
        ? record.success
        : typeof data.successful === "boolean"
          ? data.successful
          : typeof result.successful === "boolean"
            ? result.successful
            : undefined;

  if (successful === false) {
    return false;
  }

  return !getToolResultError(value);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasStandaloneAppLabel(content: string, label: string) {
  const pattern = new RegExp(
    `(^|\\s|@)${escapeRegExp(label)}(?=$|\\s|[,;:!?\\)\\]])`,
    "i",
  );

  return pattern.test(content);
}

function getMentionedAppKeys(content: string) {
  return connectorCatalog
    .filter((connector) => {
      const name = connector.name.toLowerCase();
      const key = connector.key.toLowerCase();
      return (
        hasStandaloneAppLabel(content, key) ||
        hasStandaloneAppLabel(content, name)
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
  if (appKey === "github") {
    const normalized = content.toLowerCase();
    if (/\b(push|commit|commits|last push|latest push)\b/.test(normalized)) {
      return "authenticated user repositories latest pushed repository commits";
    }

    if (/\b(repo|repository|repositories)\b/.test(normalized)) {
      return "list repositories authenticated user";
    }

    return "github authenticated user repositories activity commits";
  }

  if (appKey === "gmail" || appKey === "email" || appKey === "outlook") {
    const normalized = content.toLowerCase();
    const provider = appKey === "outlook" ? "outlook" : "gmail";
    if (hasEmailSendIntent(normalized)) {
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

  if (appKey === "github") {
    if (/\b(push|commit|commits|last push|latest push)\b/.test(normalized)) {
      return [
        {
          slug: "GITHUB_LIST_REPOSITORIES_FOR_THE_AUTHENTICATED_USER",
          version: "latest",
        },
        { slug: "GITHUB_GET_VIEWER_GRAPHQL", version: "latest" },
        { slug: "GITHUB_LIST_REPOSITORIES", version: "latest" },
      ];
    }

    return [
      {
        slug: "GITHUB_LIST_REPOSITORIES_FOR_THE_AUTHENTICATED_USER",
        version: "latest",
      },
      { slug: "GITHUB_GET_VIEWER_GRAPHQL", version: "latest" },
    ];
  }

  if (appKey === "gmail" || appKey === "email") {
    if (hasEmailSendIntent(normalized)) {
      return [{ slug: "GMAIL_SEND_EMAIL", version: "latest" }];
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
    if (hasEmailSendIntent(normalized)) {
      return [{ slug: "OUTLOOK_SEND_EMAIL", version: "latest" }];
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

function getRepoFullName(repo: unknown) {
  const record = asRecord(repo);
  const owner = asRecord(record.owner);
  return (
    stringValue(record.full_name) ||
    [stringValue(owner.login), stringValue(record.name)].filter(Boolean).join("/")
  );
}

function getProxyData(value: unknown) {
  const record = asRecord(value);
  return record.data ?? record;
}

function hasEmailSendIntent(content: string) {
  return (
    /\b(send|sned|snead|sent)\b/i.test(content) ||
    /\b(?:email|mail)\s+(?:to|for)\b/i.test(content)
  );
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
    /(?:^|\n)\s*(?:message|body|email body)\s*[:\-]\s*([\s\S]+)/i.exec(combined)?.[1] ??
    "";
  const body = cleanEmailBody(explicitBody);

  return {
    body,
    recipient,
    subject,
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

  if (!details.recipient || !details.subject || !details.body) {
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

function getRequestedEmailLimit(content: string) {
  const normalized = content.toLowerCase();
  const explicitCount =
    /\b(?:last|latest|recent|first|top|show|get|read|see|check)\s+(\d{1,3})\b/i.exec(
      content,
    )?.[1] ?? /\b(\d{1,3})\s+(?:emails?|messages?|threads?)\b/i.exec(content)?.[1];
  const parsedCount = explicitCount ? Number.parseInt(explicitCount, 10) : NaN;

  if (Number.isFinite(parsedCount) && parsedCount > 0) {
    return Math.min(parsedCount, 100);
  }

  if (/\blast\s+(?:email|message)\b/.test(normalized)) {
    return 1;
  }

  return /\b(emails|messages|threads|inbox|unread|recent|latest)\b/.test(normalized)
    ? 10
    : 5;
}

function getGmailSearchQuery(content: string) {
  const normalized = content.toLowerCase();
  const queryParts: string[] = [];
  const fromMatch = /\bfrom[:\s]+([^\s,;]+)/i.exec(content);
  const toMatch = /\bto[:\s]+([^\s,;]+)/i.exec(content);
  const subjectMatch = /\bsubject[:\s]+(["']?)([^"'\n]+)\1/i.exec(content);

  if (/\b(sent|sent mail|i sent)\b/.test(normalized)) {
    queryParts.push("in:sent");
  } else if (/\b(draft|drafts)\b/.test(normalized)) {
    queryParts.push("in:drafts");
  } else if (/\b(spam|junk)\b/.test(normalized)) {
    queryParts.push("in:spam");
  } else if (/\btrash\b/.test(normalized)) {
    queryParts.push("in:trash");
  } else if (!/\ball mail\b/.test(normalized)) {
    queryParts.push("in:inbox");
  }

  if (/\bunread\b/.test(normalized)) {
    queryParts.push("is:unread");
  }

  if (/\bstarred\b/.test(normalized)) {
    queryParts.push("is:starred");
  }

  if (/\battachment|attachments|has file\b/.test(normalized)) {
    queryParts.push("has:attachment");
  }

  if (fromMatch?.[1]) {
    queryParts.push(`from:${fromMatch[1]}`);
  }

  if (toMatch?.[1]) {
    queryParts.push(`to:${toMatch[1]}`);
  }

  if (subjectMatch?.[2]) {
    queryParts.push(`subject:${subjectMatch[2].trim()}`);
  }

  return queryParts.join(" ");
}

function shouldUseGmailReader(content: string) {
  const normalized = content.toLowerCase();

  if (/\b(send|draft|reply|forward|archive|delete|trash|label|mark as|move)\b/.test(normalized)) {
    return false;
  }

  return /\b(email|emails|gmail|inbox|message|messages|thread|threads|unread|received|latest|recent|last|from:|subject:|attachment)\b/.test(
    normalized,
  );
}

function shouldUseOutlookReader(content: string) {
  const normalized = content.toLowerCase();

  if (/\b(send|draft|reply|forward|archive|delete|trash|move|mark as)\b/.test(normalized)) {
    return false;
  }

  return /\b(email|emails|outlook|inbox|mail|message|messages|thread|threads|unread|received|latest|recent|last|from:|subject:|attachment)\b/.test(
    normalized,
  );
}

function decodeGmailBody(value: string) {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(normalized, "base64").toString("utf8");
  } catch {
    return "";
  }
}

function getGmailHeaders(message: unknown) {
  const payload = asRecord(asRecord(message).payload);
  const headers = Array.isArray(payload.headers) ? payload.headers : [];
  const output: Record<string, string> = {};

  for (const header of headers) {
    const record = asRecord(header);
    const name = stringValue(record.name);
    const value = stringValue(record.value);
    if (name && value && ["From", "To", "Subject", "Date"].includes(name)) {
      output[name.toLowerCase()] = value;
    }
  }

  return output;
}

function extractGmailBodyPart(part: unknown): string {
  const record = asRecord(part);
  const body = asRecord(record.body);
  const mimeType = stringValue(record.mimeType);
  const data = stringValue(body.data);

  if (data && (mimeType === "text/plain" || mimeType === "text/html")) {
    return decodeGmailBody(data).replace(/<[^>]+>/g, " ");
  }

  const parts = Array.isArray(record.parts) ? record.parts : [];
  return parts.map(extractGmailBodyPart).filter(Boolean).join("\n");
}

function summarizeGmailMessage(message: unknown) {
  const record = asRecord(message);
  const headers = getGmailHeaders(message);
  const body = extractGmailBodyPart(record.payload).replace(/\s+/g, " ").trim();

  return {
    body: body ? truncateJson(body, 1600) : "",
    date: headers.date ?? "",
    from: headers.from ?? "",
    id: stringValue(record.id),
    labels: Array.isArray(record.labelIds) ? record.labelIds : [],
    snippet: stringValue(record.snippet),
    subject: headers.subject ?? "",
    threadId: stringValue(record.threadId),
    to: headers.to ?? "",
  };
}

function getOutlookFolderEndpoint(content: string) {
  const normalized = content.toLowerCase();

  if (/\b(sent|sent mail|i sent)\b/.test(normalized)) {
    return "/me/mailFolders/sentitems/messages";
  }

  if (/\b(draft|drafts)\b/.test(normalized)) {
    return "/me/mailFolders/drafts/messages";
  }

  if (/\b(spam|junk)\b/.test(normalized)) {
    return "/me/mailFolders/junkemail/messages";
  }

  if (/\btrash|deleted\b/.test(normalized)) {
    return "/me/mailFolders/deleteditems/messages";
  }

  if (/\ball mail|all messages|mailbox\b/.test(normalized)) {
    return "/me/messages";
  }

  return "/me/mailFolders/inbox/messages";
}

function getOutlookSearchText(content: string) {
  const subjectMatch = /\bsubject[:\s]+(["']?)([^"'\n]+)\1/i.exec(content);
  const fromMatch = /\bfrom[:\s]+([^\s,;]+)/i.exec(content);
  const toMatch = /\bto[:\s]+([^\s,;]+)/i.exec(content);

  return [subjectMatch?.[2], fromMatch?.[1], toMatch?.[1]]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
}

function getOutlookFilters(content: string) {
  const normalized = content.toLowerCase();
  const filters: string[] = [];

  if (/\bunread\b/.test(normalized)) {
    filters.push("isRead eq false");
  }

  if (/\battachment|attachments|has file\b/.test(normalized)) {
    filters.push("hasAttachments eq true");
  }

  return filters.join(" and ");
}

function summarizeOutlookMessage(message: unknown) {
  const record = asRecord(message);
  const from = asRecord(asRecord(record.from).emailAddress);
  const sender = asRecord(asRecord(record.sender).emailAddress);
  const toRecipients = Array.isArray(record.toRecipients)
    ? record.toRecipients
        .map((recipient) => {
          const email = asRecord(asRecord(recipient).emailAddress);
          return stringValue(email.address) || stringValue(email.name);
        })
        .filter(Boolean)
    : [];
  const body = stringValue(asRecord(record.body).content)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    body: body ? truncateJson(body, 1600) : "",
    date: stringValue(record.receivedDateTime) || stringValue(record.sentDateTime),
    from: stringValue(from.address) || stringValue(from.name),
    hasAttachments: Boolean(record.hasAttachments),
    id: stringValue(record.id),
    isRead: typeof record.isRead === "boolean" ? record.isRead : null,
    sender: stringValue(sender.address) || stringValue(sender.name),
    subject: stringValue(record.subject),
    to: toRecipients,
    webLink: stringValue(record.webLink),
  };
}

async function loadOutlookMessagesContext({
  connectedAccountId,
  content,
}: {
  connectedAccountId?: string;
  content: string;
}) {
  const limit = getRequestedEmailLimit(content);
  const searchText = getOutlookSearchText(content);
  const filter = getOutlookFilters(content);
  const endpoint = searchText ? "/me/messages" : getOutlookFolderEndpoint(content);
  const parameters = [
    { in: "query" as const, name: "$top", value: String(limit) },
    {
      in: "query" as const,
      name: "$select",
      value:
        "id,subject,from,sender,toRecipients,receivedDateTime,sentDateTime,bodyPreview,body,hasAttachments,isRead,webLink",
    },
    ...(searchText
      ? [{ in: "query" as const, name: "$search", value: `"${searchText}"` }]
      : [
          { in: "query" as const, name: "$orderby", value: "receivedDateTime desc" },
          ...(filter ? [{ in: "query" as const, name: "$filter", value: filter }] : []),
        ]),
    ...(searchText
      ? [{ in: "header" as const, name: "ConsistencyLevel", value: "eventual" }]
      : []),
  ];
  const result = await executeComposioProxy({
    connectedAccountId,
    endpoint,
    parameters,
  }).catch(() =>
    executeComposioProxy({
      connectedAccountId,
      endpoint: `/v1.0${endpoint}`,
      parameters,
    }),
  );
  const data = getProxyData(result);
  const messages: unknown[] = Array.isArray(asRecord(data).value)
    ? (asRecord(data).value as unknown[])
    : Array.isArray(asRecord(data).messages)
      ? (asRecord(data).messages as unknown[])
      : getDeepArray(result, "value");

  return {
    endpoint,
    filter,
    limit,
    messages: messages.slice(0, limit).map(summarizeOutlookMessage),
    searchText,
  };
}

async function loadGmailMessagesContext({
  connectedAccountId,
  content,
}: {
  connectedAccountId?: string;
  content: string;
}) {
  const limit = getRequestedEmailLimit(content);
  const query = getGmailSearchQuery(content);
  const executeGmailProxy = async (endpoint: string) =>
    executeComposioProxy({
      connectedAccountId,
      endpoint,
      parameters: [
        { in: "query", name: "maxResults", value: String(limit) },
        ...(query ? [{ in: "query" as const, name: "q", value: query }] : []),
      ],
    });
  const listResult = await executeGmailProxy("/users/me/messages").catch(() =>
    executeGmailProxy("/gmail/v1/users/me/messages"),
  );
  const listData = getProxyData(listResult);
  const messages: unknown[] = Array.isArray(asRecord(listData).messages)
    ? (asRecord(listData).messages as unknown[])
    : getDeepArray(listResult, "messages");

  if (messages.length === 0) {
    return {
      limit,
      messages: [],
      query,
    };
  }

  const detailedMessages = await Promise.all(
    messages.slice(0, limit).map(async (message) => {
      const id = stringValue(asRecord(message).id);
      if (!id) {
        return null;
      }

      const detailParameters = [
        { in: "query" as const, name: "format", value: "full" },
        { in: "query" as const, name: "metadataHeaders", value: "From" },
        { in: "query" as const, name: "metadataHeaders", value: "To" },
        { in: "query" as const, name: "metadataHeaders", value: "Subject" },
        { in: "query" as const, name: "metadataHeaders", value: "Date" },
      ];
      const detail = await executeComposioProxy({
        connectedAccountId,
        endpoint: `/users/me/messages/${encodeURIComponent(id)}`,
        parameters: detailParameters,
      }).catch(() =>
        executeComposioProxy({
          connectedAccountId,
          endpoint: `/gmail/v1/users/me/messages/${encodeURIComponent(id)}`,
          parameters: detailParameters,
        }),
      );

      return summarizeGmailMessage(getProxyData(detail));
    }),
  );

  return {
    limit,
    messages: detailedMessages.filter(Boolean),
    query,
  };
}

async function loadGitHubLatestPushContext({
  connectedAccountId,
}: {
  connectedAccountId?: string;
}) {
  const repoList = await executeComposioProxy({
    connectedAccountId,
    endpoint: "/user/repos",
    parameters: [
      { in: "query", name: "sort", value: "pushed" },
      { in: "query", name: "direction", value: "desc" },
      { in: "query", name: "per_page", value: "5" },
      { in: "header", name: "Accept", value: "application/vnd.github+json" },
    ],
  });
  const repoData = getProxyData(repoList);
  const repositories = Array.isArray(repoData)
    ? repoData
    : getDeepArray(repoList, "data");
  const latestRepo = repositories[0];
  const latestRepoFullName = getRepoFullName(latestRepo);

  if (!latestRepoFullName) {
    throw new Error("GitHub returned no accessible repositories for this account.");
  }

  const commits = await executeComposioProxy({
    connectedAccountId,
    endpoint: `/repos/${latestRepoFullName}/commits`,
    parameters: [
      { in: "query", name: "per_page", value: "1" },
      { in: "header", name: "Accept", value: "application/vnd.github+json" },
    ],
  });

  return {
    commits: getProxyData(commits),
    latestRepository: latestRepo,
    repositories,
  };
}

function buildToolPrompt({
  appDocsContext,
  appKey,
  conversationContext,
  content,
}: {
  appDocsContext?: string;
  appKey: string;
  conversationContext?: string;
  content: string;
}) {
  const base = [
    "Connected app request for Atmet AI.",
    "Use the connected app only for the user's explicit request. Do not perform unrelated actions.",
    `User request: ${content}`,
    conversationContext ? `Recent conversation context:\n${conversationContext}` : "",
    appDocsContext ? `App docs from public/Apps-docs:\n${appDocsContext}` : "",
    "Resolve the latest user message together with the recent conversation. If Atmet asked for missing subject/body/recipient and the user now provides it, continue the original app action.",
    "Use any action exposed by the connected Composio toolkit when it matches the request and the connected account has permission.",
    "Do not downgrade write requests to read-only or drafts when a send/create/update/delete/post action is available and the user explicitly asked for it.",
  ];

  if (appKey === "gmail" || appKey === "email") {
    return [
      ...base,
      "Use the authenticated Gmail account. user_id is me.",
      "Use the Gmail action that best matches the request, including read, search, list, thread, draft, send, reply, forward, labels, archive, trash, unread/read, or other Gmail actions exposed by Composio.",
      "Honor counts and filters in the request, such as last 5, last 100, unread, sent, from, to, subject, attachments, and threads.",
      "If the user asks to send, use the send email action. Do not draft instead unless the user explicitly asks for a draft or sending fails.",
      "If the user asks for a random email body, write a short harmless friendly message yourself and send it when send access is available.",
    ].join("\n");
  }

  if (appKey === "outlook") {
    return [
      ...base,
      "Use the authenticated Microsoft Outlook account.",
      "Use the Outlook action that best matches the request, including read, search, list, folders, threads, draft, send, reply, forward, move, delete, read/unread, or other Outlook actions exposed by Composio.",
      "Honor counts and filters in the request, such as last 5, last 100, unread, sent, drafts, from, to, subject, attachments, and threads.",
      "If the user asks to send, use the send email action. Do not draft instead unless the user explicitly asks for a draft or sending fails.",
      "If the user asks for a random email body, write a short harmless friendly message yourself.",
    ].join("\n");
  }

  if (appKey === "github") {
    return [
      ...base,
      "Use the authenticated GitHub account.",
      "If the user asks about their latest push and does not provide a repository, inspect repositories accessible to the authenticated account sorted by latest push, then inspect the latest commit for the newest pushed repository.",
      "If repository access is denied, return the exact permission/scope problem.",
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
  conversationContext,
  userId,
  workspaceId,
}: {
  appKeys: string[];
  content: string;
  connections: Record<string, unknown>[];
  conversationContext?: string;
  userId: string;
  workspaceId: string;
}) {
  const contextItems: string[] = [];
  const metadata: Record<string, unknown>[] = [];
  const connectionsByAppKey = new Map(
    connections.map((connection) => [stringValue(connection.app_key), connection]),
  );

  for (const appKey of appKeys.slice(0, 6)) {
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
    const intentContent = [conversationContext, content].filter(Boolean).join("\n");
    const directToolErrors: string[] = [];
    const appDocs = await getAppDocsForRequest({
      appKey,
      content: intentContent,
    });

    try {
      contextItems.push(
        `### ${connector.name} Connection\n${connector.name} is connected for this user via Composio.`,
      );
      metadata.push({ appKey, status: "connected" });

      if (appDocs?.context) {
        contextItems.push(`### ${connector.name} Docs\n${appDocs.context}`);
        metadata.push({
          appKey,
          docsFile: appDocs.fileName,
          documentedTools: appDocs.toolSlugs,
          documentedTriggers: appDocs.triggerSlugs,
          status: "docs_loaded",
        });
      }

      if (
        (appKey === "gmail" || appKey === "email") &&
        hasEmailSendIntent(intentContent)
      ) {
        try {
          const result = await sendGmailMessage({
            connectedAccountId,
            content,
            conversationContext,
          });

          if (result) {
            contextItems.push(
              [
                `### ${connector.name}`,
                "Tool: Gmail proxy /gmail/v1/users/me/messages/send",
                "Result:",
                truncateJson(result),
              ].join("\n"),
            );
            metadata.push({
              appKey,
              status: "used",
              toolSlug: "gmail_proxy_send_message",
            });
            continue;
          }
        } catch (gmailSendError) {
          metadata.push({
            appKey,
            error:
              gmailSendError instanceof Error
                ? gmailSendError.message
                : "Gmail send failed",
            status: "send_proxy_fallback",
          });
        }
      }

      if (
        (appKey === "gmail" || appKey === "email") &&
        shouldUseGmailReader(intentContent)
      ) {
        try {
          const result = await loadGmailMessagesContext({
            connectedAccountId,
            content: intentContent,
          });

          contextItems.push(
            [
              `### ${connector.name}`,
              `Tool: Gmail proxy /users/me/messages (limit ${result.limit})`,
              result.query ? `Query: ${result.query}` : "Query: default inbox",
              "Result:",
              truncateJson(result, 20000),
            ].join("\n"),
          );
          metadata.push({
            appKey,
            status: "used",
            toolSlug: "gmail_proxy_messages",
          });
          continue;
        } catch (gmailProxyError) {
          const errorMessage =
            gmailProxyError instanceof Error
              ? gmailProxyError.message
              : "Gmail proxy lookup failed";
          directToolErrors.push(`Gmail direct proxy read failed: ${errorMessage}`);
          metadata.push({
            appKey,
            error: errorMessage,
            status: "proxy_fallback",
          });
        }
      }

      if (appKey === "outlook" && shouldUseOutlookReader(intentContent)) {
        try {
          const result = await loadOutlookMessagesContext({
            connectedAccountId,
            content: intentContent,
          });

          contextItems.push(
            [
              `### ${connector.name}`,
              `Tool: Outlook proxy ${result.endpoint} (limit ${result.limit})`,
              result.searchText ? `Search: ${result.searchText}` : "",
              result.filter ? `Filter: ${result.filter}` : "",
              "Result:",
              truncateJson(result, 20000),
            ]
              .filter(Boolean)
              .join("\n"),
          );
          metadata.push({
            appKey,
            status: "used",
            toolSlug: "outlook_proxy_messages",
          });
          continue;
        } catch (outlookProxyError) {
          const errorMessage =
            outlookProxyError instanceof Error
              ? outlookProxyError.message
              : "Outlook proxy lookup failed";
          directToolErrors.push(`Outlook direct proxy read failed: ${errorMessage}`);
          metadata.push({
            appKey,
            error: errorMessage,
            status: "proxy_fallback",
          });
        }
      }

      if (
        appKey === "github" &&
        /\b(push|commit|commits|last push|latest push)\b/i.test(intentContent)
      ) {
        try {
          const result = await loadGitHubLatestPushContext({
            connectedAccountId,
          });

          contextItems.push(
            [
              `### ${connector.name}`,
              "Tool: GitHub proxy /user/repos + latest commit",
              "Result:",
              truncateJson(result),
            ].join("\n"),
          );
          metadata.push({
            appKey,
            status: "used",
            toolSlug: "github_proxy_latest_push",
          });
          continue;
        } catch (githubProxyError) {
          metadata.push({
            appKey,
            error:
              githubProxyError instanceof Error
                ? githubProxyError.message
                : "GitHub proxy lookup failed",
            status: "proxy_fallback",
          });
        }
      }

      const [searchedTools, allToolkitTools] = await Promise.all([
        listComposioTools({
          query: getToolSearchQuery(appKey, intentContent),
          toolkitSlug,
        }),
        listComposioToolkitTools(toolkitSlug),
      ]);
      const intentTools = getIntentComposioTools(appKey, intentContent);
      const documentedTools =
        appDocs?.toolSlugs.map((slug) => ({ slug, version: "latest" })) ?? [];
      const allTools = uniqueToolsBySlug([
        ...intentTools,
        ...documentedTools,
        ...allToolkitTools,
        ...searchedTools,
        ...getFallbackComposioTools(toolkitSlug),
      ]);
      const tools =
        (appKey === "gmail" || appKey === "email" || appKey === "outlook") &&
        hasEmailSendIntent(intentContent)
          ? allTools.filter((tool) => stringValue(tool.slug).includes("_SEND"))
          : allTools;

      if (tools.length === 0) {
        contextItems.push(
          `### ${connector.name}\nAtmet found the connected app, but Composio did not return a matching tool for this request.`,
        );
        metadata.push({ appKey, status: "no_matching_tool" });
        continue;
      }

      let lastToolError = "";
      let toolWasUsed = false;

      const maxToolAttempts = tools.length;

      for (const tool of tools.slice(0, maxToolAttempts)) {
        const toolSlug = stringValue(tool.slug);
        if (!toolSlug) {
          continue;
        }

        try {
          const result = await executeComposioToolWithText({
            connectedAccountId,
            text: buildToolPrompt({
              appDocsContext: appDocs?.context,
              appKey,
              content,
              conversationContext,
            }),
            toolSlug,
            userId: composioUserId,
            version: stringValue(tool.version, "latest"),
          });

          if (!isSuccessfulToolResult(result)) {
            lastToolError =
              getToolResultError(result) ||
              `${toolSlug} returned an unsuccessful result`;
            continue;
          }

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
        throw new Error(
          [...directToolErrors, lastToolError || "Could not read app context"]
            .filter(Boolean)
            .join("\n"),
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not read app context";
      contextItems.push(
        [
          `### ${connector.name}`,
          `Could not read app context: ${message}`,
          "Do not infer missing OAuth scopes or partial access unless the error above explicitly says that. Report this exact tool error and ask the user to reconnect only if the error says authorization, scope, or account access is missing.",
        ].join("\n"),
      );
      metadata.push({ appKey, error: message, status: "error" });
    }
  }

  return {
    context:
      contextItems.length > 0
        ? [
            "Connected App Tool Results",
            "Use these results to answer the user. Only claim an app action happened when the result explicitly shows it.",
            "For connected apps, do not invent permission limitations. If a tool failed, state the exact error shown below. Only say the user lacks read/send/admin access when the tool error explicitly names that missing access.",
            "If an app section says the app is connected, do not say it needs to be enabled or connected. For workflow requests, distinguish connected app access from actual trigger/automation registration.",
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
    let modelKey = stringValue(body.modelKey, "atmet") || "atmet";
    let content = stringValue(body.content);
    const regenerateMessageId = stringValue(body.regenerateMessageId);
    const selectedAppKeys = stringArray(body.appKeys);
    let mentions = getChatMessageMentions(body.mentions);
    const parsedAttachments = await parseChatAttachments(body.attachments);
    const attachmentMetadata = serializeAttachmentMetadata(parsedAttachments);
    const attachmentContext = buildAttachmentContext(parsedAttachments);

    if (!chatId || !workspaceId || (!content && !regenerateMessageId)) {
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

    let regeneratedUserMessage: Record<string, unknown> | null = null;
    if (regenerateMessageId) {
      const { data: currentMessage, error: currentMessageError } = await auth.admin
        .from("chat_messages")
        .select("id, role, content, created_at, metadata")
        .eq("id", regenerateMessageId)
        .eq("chat_id", chatId)
        .single();

      if (currentMessageError) {
        throw currentMessageError;
      }

      const currentMessageRecord = asRecord(currentMessage);
      if (currentMessageRecord.role !== "user") {
        return badRequest("Only user messages can be regenerated.");
      }

      content = stringValue(currentMessageRecord.content);
      const currentMetadata = asRecord(currentMessageRecord.metadata);
      mentions = getChatMessageMentions(currentMetadata.mentions);
      modelKey = stringValue(currentMetadata.modelKey, modelKey) || modelKey;
      regeneratedUserMessage = currentMessageRecord;

      await auth.admin
        .from("chat_messages")
        .delete()
        .eq("chat_id", chatId)
        .gt("created_at", stringValue(currentMessageRecord.created_at));
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
        (regeneratedUserMessage
          ? auth.admin
              .from("chat_messages")
              .select("id, role, content, created_at, metadata")
              .eq("chat_id", chatId)
              .lt("created_at", stringValue(regeneratedUserMessage.created_at))
          : auth.admin
              .from("chat_messages")
              .select("id, role, content, created_at, metadata")
              .eq("chat_id", chatId))
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

    let userMessage: Record<string, unknown> | null = regeneratedUserMessage;
    if (!userMessage) {
      const { data: insertedUserMessage, error: userMessageError } = await auth.admin
        .from("chat_messages")
        .insert({
          chat_id: chatId,
          content,
          metadata: { attachments: attachmentMetadata, mentions, modelKey },
          role: "user",
        })
        .select("id, role, content, created_at, metadata")
        .single();

      if (userMessageError) {
        throw userMessageError;
      }

      userMessage = asRecord(insertedUserMessage);
    }

    const model = normalizeModelConfig(
      userConnectionId
        ? { ...modelResult.data, key: modelKey, settings: {} }
        : modelResult.data,
      modelKey,
    );
    const connectionRows = (connectionsResult.data ?? []).map(asRecord);
    const recentMessageRows = recentMessagesResult.data ?? [];
    const recentConversationContext = buildRecentConversationContext(providerMessages);
    const appKeysForContext = uniqueStrings([
      ...selectedAppKeys,
      ...getMentionedAppKeys(content),
      ...getRecentMessageAppKeys(recentMessageRows),
    ]);
    const intentContent = [recentConversationContext, content].filter(Boolean).join("\n");

    if (
      isGmailToTelegramAutomationRequest({
        appKeys: appKeysForContext,
        content: intentContent,
      })
    ) {
      const automationResult = await provisionGmailToTelegramAutomation({
        admin: auth.admin,
        chatId,
        connections: connectionRows,
        content: intentContent,
        request,
        userId: auth.user.id,
        workspaceId,
      });
      const { data: assistantMessage, error: assistantMessageError } =
        await auth.admin
          .from("chat_messages")
          .insert({
            chat_id: chatId,
            content: automationResult.message,
            metadata: {
              automationActivated: automationResult.activated,
              connectedAppContext: [
                {
                  appKey: "gmail",
                  status: automationResult.activated ? "trigger_registered" : "required",
                },
                {
                  appKey: "telegram",
                  status: automationResult.activated ? "action_registered" : "required",
                },
              ],
              modelKey: model.key,
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

      await recordActivityLog(auth.admin, {
        action: automationResult.activated
          ? "automation.gmail_telegram.activated"
          : "automation.gmail_telegram.pending",
        actorId: auth.user.id,
        metadata: {
          appKeys: appKeysForContext,
          chatTitle: stringValue(chatRecord.title),
        },
        request,
        targetId: chatId,
        targetType: "chat",
        workspaceId,
      });

      return ok({
        assistantMessage,
        chatTitle: stringValue(chatRecord.title),
        model: {
          configured: true,
          displayName: model.displayName,
          key: model.key,
          modelId: model.modelId,
          providerKey: model.providerKey,
        },
        userMessage,
      });
    }

    const appContext = await loadConnectedAppToolContext({
      appKeys: appKeysForContext,
      connections: connectionRows,
      content,
      conversationContext: recentConversationContext,
      userId: auth.user.id,
      workspaceId,
    });
    const startedAt = Date.now();
    const aiResult = await runAtmetChat({
      messages: [
        ...(appContext.context
          ? [{ content: appContext.context, role: "system" as const }]
          : []),
        ...(attachmentContext
          ? [{ content: attachmentContext, role: "system" as const }]
          : []),
        ...providerMessages,
        {
          content: buildUserContentWithAttachments(content, parsedAttachments),
          role: "user",
        },
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

    const nextChatTitle = isAutoChatTitle(stringValue(chatRecord.title), content)
      ? summarizeChatTitle(content)
      : "";

    const chatUpdate: Record<string, unknown> = {
      last_message_at: new Date().toISOString(),
    };

    if (nextChatTitle) {
      chatUpdate.title = nextChatTitle;
    }

    await auth.admin
      .from("chats")
      .update(chatUpdate)
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

    await recordActivityLog(auth.admin, {
      action: `ai.chat.${status}`,
      actorId: auth.user.id,
      metadata: {
        appKeys: appKeysForContext,
        attachmentCount: parsedAttachments.length,
        chatTitle: nextChatTitle || stringValue(chatRecord.title),
        connectedAppContext: appContext.metadata,
        model: model.displayName,
        modelKey: model.key,
        providerKey: aiResult.providerKey,
        status,
      },
      request,
      targetId: chatId,
      targetType: "chat",
      workspaceId,
    });

    return ok({
      assistantMessage,
      chatTitle: nextChatTitle || stringValue(chatRecord.title),
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
