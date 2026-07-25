import type { JsonRecord } from "@/lib/api/http";

const composioBaseUrl = "https://backend.composio.dev/api/v3.1";

export const composioConnectorToolkits = {
  calendar: "googlecalendar",
  chatgpt: "openai",
  claude: "anthropic_administrator",
  drive: "googledrive",
  email: "gmail",
  github: "github",
  gmail: "gmail",
  "google-sheets": "googlesheets",
  instagram: "instagram",
  outlook: "outlook",
  slack: "slack",
  telegram: "telegram",
} as const satisfies Record<string, string>;

type ComposioApiError = {
  error?: {
    errors?: string[];
    message?: string;
    suggested_fix?: string;
  };
};

type ComposioConnectedAccount = JsonRecord & {
  auth_config?: { id?: string };
  id?: string;
  status?: string;
  toolkit?: { slug?: string };
  updated_at?: string;
  user_id?: string;
};

type ComposioAuthConfig = JsonRecord & {
  id?: string;
  is_composio_managed?: boolean;
  status?: string;
  toolkit?: { slug?: string };
};

type ComposioTool = JsonRecord & {
  description?: string;
  human_description?: string;
  name?: string;
  slug?: string;
  toolkit?: { slug?: string };
  version?: string;
};

const fallbackComposioTools = {
  gmail: ["GMAIL_FETCH_EMAILS", "GMAIL_LIST_MESSAGES", "GMAIL_LIST_THREADS"],
  googlecalendar: ["GOOGLECALENDAR_FIND_EVENT", "GOOGLECALENDAR_LIST_EVENTS"],
  googledrive: ["GOOGLEDRIVE_FIND_FILE", "GOOGLEDRIVE_GET_FILE"],
  googlesheets: ["GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW", "GOOGLESHEETS_GET_SPREADSHEET_INFO"],
  github: ["GITHUB_GET_ISSUE", "GITHUB_GET_PULL_REQUEST", "GITHUB_SEARCH_REPOSITORIES"],
  outlook: ["OUTLOOK_QUERY_EMAILS", "OUTLOOK_SEARCH_MESSAGES", "OUTLOOK_GET_MESSAGE"],
  slack: ["SLACK_SEARCH_MESSAGES", "SLACK_LIST_CHANNELS"],
} as const satisfies Record<string, readonly string[]>;

function getComposioApiKey() {
  return process.env.COMPOSIO_API_KEY?.trim() ?? "";
}

function normalizeEnvKey(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

function getEnvAuthConfigId(appKey: string, toolkitSlug: string) {
  const candidateNames = [
    `COMPOSIO_AUTH_CONFIG_${normalizeEnvKey(appKey)}`,
    `COMPOSIO_AUTH_CONFIG_${normalizeEnvKey(toolkitSlug)}`,
    `COMPOSIO_${normalizeEnvKey(appKey)}_AUTH_CONFIG_ID`,
    `COMPOSIO_${normalizeEnvKey(toolkitSlug)}_AUTH_CONFIG_ID`,
  ];

  for (const name of candidateNames) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

export function getComposioUserId(workspaceId: string, userId: string) {
  return `atmet:${workspaceId}:${userId}`;
}

function getConnectLinkAlias({
  appKey,
  userId,
  workspaceId,
}: {
  appKey: string;
  userId: string;
  workspaceId: string;
}) {
  const attemptId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return [
    "atmet",
    workspaceId.slice(0, 8),
    userId.slice(0, 8),
    appKey.replace(/[^a-z0-9]+/gi, "-").toLowerCase(),
    Date.now().toString(36),
    attemptId,
  ].join("-");
}

async function composioRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiKey = getComposioApiKey();
  if (!apiKey) {
    throw new Error("COMPOSIO_API_KEY is not configured.");
  }

  const response = await fetch(`${composioBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...init.headers,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ComposioApiError;

  if (!response.ok) {
    const message =
      payload.error?.message ||
      payload.error?.suggested_fix ||
      payload.error?.errors?.[0] ||
      `Composio request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function getComposioErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Composio request failed";
}

export function getComposioToolkitSlug(appKey: string) {
  return composioConnectorToolkits[
    appKey as keyof typeof composioConnectorToolkits
  ];
}

export function isComposioConfigured() {
  return Boolean(getComposioApiKey());
}

export function getComposioConnectionSettings(settings: unknown) {
  return settings && typeof settings === "object" && !Array.isArray(settings)
    ? (settings as JsonRecord)
    : {};
}

export function getComposioUserConnection(settings: unknown, userId: string) {
  const users = getComposioConnectionSettings(
    getComposioConnectionSettings(settings).users,
  );
  return getComposioConnectionSettings(users[userId]);
}

export function getConnectedComposioUserIds(settings: unknown) {
  const users = getComposioConnectionSettings(
    getComposioConnectionSettings(settings).users,
  );

  return Object.entries(users)
    .filter(([, value]) => {
      const record = getComposioConnectionSettings(value);
      return String(record.status ?? "").toLowerCase() === "connected";
    })
    .map(([userId]) => userId);
}

export async function getComposioAuthConfigId({
  appKey,
  toolkitSlug,
}: {
  appKey: string;
  toolkitSlug: string;
}) {
  const envAuthConfigId = getEnvAuthConfigId(appKey, toolkitSlug);
  if (envAuthConfigId) {
    return envAuthConfigId;
  }

  const params = new URLSearchParams({
    limit: "100",
    show_disabled: "true",
    toolkit_slug: toolkitSlug,
  });
  const payload = await composioRequest<{ items?: ComposioAuthConfig[] }>(
    `/auth_configs?${params.toString()}`,
  );
  const configs = Array.isArray(payload.items) ? payload.items : [];
  const enabledConfigs = configs.filter(
    (config) => String(config.status ?? "").toUpperCase() === "ENABLED",
  );
  const selectedConfig =
    enabledConfigs.find((config) => config.is_composio_managed) ??
    enabledConfigs[0] ??
    configs[0];

  if (!selectedConfig?.id) {
    throw new Error(
      `No Composio auth config found for ${toolkitSlug}. Create one in Composio or set COMPOSIO_AUTH_CONFIG_${normalizeEnvKey(appKey)}.`,
    );
  }

  return selectedConfig.id;
}

export async function createComposioConnectLink({
  appKey,
  authConfigId,
  callbackUrl,
  toolkitSlug,
  userId,
  workspaceId,
}: {
  appKey: string;
  authConfigId: string;
  callbackUrl: string;
  toolkitSlug: string;
  userId: string;
  workspaceId: string;
}) {
  const composioUserId = getComposioUserId(workspaceId, userId);
  const alias = getConnectLinkAlias({ appKey, userId, workspaceId });

  return composioRequest<{
    connected_account_id?: string;
    expires_at?: string;
    link_token?: string;
    redirect_url?: string;
  }>("/connected_accounts/link", {
    body: JSON.stringify({
      alias,
      auth_config_id: authConfigId,
      callback_url: callbackUrl,
      user_id: composioUserId,
    }),
    method: "POST",
  }).catch((error) => {
    throw new Error(
      `${getComposioErrorMessage(error)} (${toolkitSlug} connect link)`,
    );
  });
}

export async function listCurrentUserComposioAccounts({
  toolkitSlug,
  userId,
  workspaceId,
}: {
  toolkitSlug: string;
  userId: string;
  workspaceId: string;
}) {
  const params = new URLSearchParams({
    account_type: "ALL",
    limit: "100",
    order_direction: "desc",
    toolkit_slugs: toolkitSlug,
    user_ids: getComposioUserId(workspaceId, userId),
  });
  const payload = await composioRequest<{ items?: ComposioConnectedAccount[] }>(
    `/connected_accounts?${params.toString()}`,
  );

  return Array.isArray(payload.items) ? payload.items : [];
}

export function selectBestComposioAccount(accounts: ComposioConnectedAccount[]) {
  const active = accounts.find(
    (account) => String(account.status ?? "").toUpperCase() === "ACTIVE",
  );

  return active ?? accounts[0] ?? null;
}

function scoreComposioTool(tool: ComposioTool) {
  const text = [
    tool.slug,
    tool.name,
    tool.description,
    tool.human_description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const signals = [
    ["search", 8],
    ["send", 8],
    ["create", 7],
    ["list", 7],
    ["read", 7],
    ["update", 7],
    ["get", 6],
    ["fetch", 5],
    ["find", 5],
    ["draft", 5],
    ["post", 5],
    ["message", 3],
    ["email", 3],
    ["event", 3],
    ["file", 2],
    ["sheet", 2],
  ] as const;

  return signals.reduce(
    (score, [word, weight]) => score + (text.includes(word) ? weight : 0),
    0,
  );
}

export async function listComposioTools({
  query,
  toolkitSlug,
}: {
  query: string;
  toolkitSlug: string;
}) {
  if (!isComposioConfigured()) {
    return [];
  }

  const params = new URLSearchParams({
    include_deprecated: "false",
    limit: "25",
    query,
    toolkit_slug: toolkitSlug,
    toolkit_versions: "latest",
  });
  const payload = await composioRequest<{ items?: ComposioTool[] }>(
    `/tools?${params.toString()}`,
  );
  const tools = Array.isArray(payload.items) ? payload.items : [];

  return tools
    .filter((tool) => tool.slug)
    .sort((a, b) => scoreComposioTool(b) - scoreComposioTool(a));
}

export function getFallbackComposioTools(toolkitSlug: string) {
  const slugs =
    fallbackComposioTools[
      toolkitSlug as keyof typeof fallbackComposioTools
    ] ?? [];

  return slugs.map((slug) => ({ slug, version: "latest" }) satisfies ComposioTool);
}

export async function executeComposioToolWithText({
  connectedAccountId,
  text,
  toolSlug,
  userId,
  version,
}: {
  connectedAccountId?: string;
  text: string;
  toolSlug: string;
  userId: string;
  version?: string;
}) {
  return composioRequest<JsonRecord>(
    `/tools/execute/${encodeURIComponent(toolSlug)}`,
    {
      body: JSON.stringify({
        ...(connectedAccountId ? { connected_account_id: connectedAccountId } : {}),
        text,
        user_id: userId,
        ...(version ? { version } : { version: "latest" }),
      }),
      method: "POST",
    },
  );
}

export async function deleteComposioConnectedAccount(accountId: string) {
  if (!accountId || !isComposioConfigured()) {
    return;
  }

  await composioRequest(`/connected_accounts/${accountId}?revoke_on_delete=true`, {
    method: "DELETE",
  });
}
