export type AtmetChatMessage = {
  content: string;
  role: "assistant" | "system" | "user";
};

export type AtmetWorkspace = {
  name?: string | null;
  slug?: string | null;
};

export type AtmetWorkspaceBrain = {
  business_details?: string | null;
  output_style?: string | null;
  personalization?: string | null;
};

export type AtmetModelConfig = {
  apiKeySecret?: string | null;
  baseUrl?: string | null;
  displayName: string;
  key: string;
  modelId: string;
  providerKey: string;
  settings?: Record<string, unknown>;
};

export type AtmetModelResult = {
  configured: boolean;
  content: string;
  error?: string;
  inputTokens?: number;
  modelId: string;
  outputTokens?: number;
  providerKey: string;
};
