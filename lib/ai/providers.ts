import type {
  AtmetChatMessage,
  AtmetModelConfig,
  AtmetModelResult,
} from "@/lib/ai/types";

type ProviderRequest = {
  messages: AtmetChatMessage[];
  model: AtmetModelConfig;
  systemPrompt: string;
};

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringFromSetting(
  settings: Record<string, unknown> | undefined,
  key: string,
) {
  const value = settings?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function joinBaseUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

function missingProviderResult(
  model: AtmetModelConfig,
  providerKey: string,
  modelId: string,
  envKey: string,
): AtmetModelResult {
  return {
    configured: false,
    content: `Atmet AI layer is ready, but ${model.displayName} is missing ${envKey}. Add it in Vercel or .env.local and try again.`,
    error: `Missing ${envKey}`,
    modelId,
    providerKey,
  };
}

function missingUserModelResult(
  model: AtmetModelConfig,
  providerKey: string,
  modelId: string,
  missing: string,
): AtmetModelResult {
  return {
    configured: false,
    content: `Atmet AI layer is ready, but ${model.displayName} needs ${missing}. Add it from Settings > General > Model access and try again.`,
    error: `Missing ${missing}`,
    modelId,
    providerKey,
  };
}

export function normalizeModelConfig(
  row?: unknown,
  fallbackKey = "atmet",
): AtmetModelConfig {
  const record = asRecord(row);
  const settings = asRecord(record.settings);

  return {
    apiKeySecret:
      typeof record.api_key_secret === "string" ? record.api_key_secret : null,
    baseUrl: typeof record.base_url === "string" ? record.base_url : null,
    displayName:
      typeof record.display_name === "string" ? record.display_name : "Atmet",
    key: typeof record.key === "string" ? record.key : fallbackKey,
    modelId:
      typeof record.model_id === "string" ? record.model_id : "gpt-5.6-terra",
    providerKey:
      typeof record.provider_key === "string" ? record.provider_key : "atmet",
    settings,
  };
}

export async function runAtmetChat({
  messages,
  model,
  systemPrompt,
}: ProviderRequest): Promise<AtmetModelResult> {
  let providerKey = model.providerKey;
  let modelId = model.modelId;
  let baseUrl = model.baseUrl ?? "";
  let apiKey = "";
  let envKey = "";

  if (providerKey === "atmet") {
    providerKey =
      env(stringFromSetting(model.settings, "providerEnvKey")) ||
      env("ATMET_MODEL_PROVIDER") ||
      "openai";
    modelId =
      env(stringFromSetting(model.settings, "envModelKey")) ||
      env("ATMET_MODEL_ID") ||
      modelId;
    apiKey = env("ATMET_MODEL_API_KEY");
    envKey = "ATMET_MODEL_API_KEY";
  }

  if (providerKey === "openai") {
    apiKey ||= env("OPENAI_API_KEY");
    envKey ||= "OPENAI_API_KEY";
    baseUrl ||= "https://api.openai.com/v1";
    if (!apiKey) {
      return missingProviderResult(model, providerKey, modelId, envKey);
    }
    return runOpenAiCompatible({
      apiKey,
      baseUrl,
      messages,
      model,
      modelId,
      providerKey,
      systemPrompt,
    });
  }

  if (providerKey === "anthropic") {
    apiKey ||= env("ANTHROPIC_API_KEY");
    envKey ||= "ANTHROPIC_API_KEY";
    baseUrl ||= "https://api.anthropic.com/v1";
    if (!apiKey) {
      return missingProviderResult(model, providerKey, modelId, envKey);
    }
    return runAnthropic({
      apiKey,
      baseUrl,
      messages,
      model,
      modelId,
      providerKey,
      systemPrompt,
    });
  }

  if (providerKey === "google") {
    apiKey ||= env("GOOGLE_GENERATIVE_AI_API_KEY");
    envKey ||= "GOOGLE_GENERATIVE_AI_API_KEY";
    baseUrl ||= "https://generativelanguage.googleapis.com/v1beta";
    if (!apiKey) {
      return missingProviderResult(model, providerKey, modelId, envKey);
    }
    return runGoogle({
      apiKey,
      baseUrl,
      messages,
      model,
      modelId,
      providerKey,
      systemPrompt,
    });
  }

  if (providerKey === "local" || providerKey === "custom") {
    apiKey ||= model.apiKeySecret ?? "";
    apiKey ||= env(providerKey === "local" ? "LOCAL_MODEL_API_KEY" : "CUSTOM_MODEL_API_KEY");
    envKey ||= providerKey === "local" ? "LOCAL_MODEL_API_KEY" : "CUSTOM_MODEL_API_KEY";
    baseUrl ||= providerKey === "local" ? "http://localhost:11434/v1" : "";
    const configured = providerKey === "local" ? Boolean(baseUrl) : Boolean(apiKey && baseUrl);
    if (!configured) {
      return missingUserModelResult(
        model,
        providerKey,
        modelId,
        providerKey === "local" ? "a base URL" : "an API key and base URL",
      );
    }
    return runOpenAiCompatible({
      apiKey,
      baseUrl,
      messages,
      model,
      modelId,
      providerKey,
      systemPrompt,
    });
  }

  return {
    configured: false,
    content: `Atmet does not know how to run provider "${providerKey}" yet.`,
    error: `Unsupported provider ${providerKey}`,
    modelId,
    providerKey,
  };
}

async function runOpenAiCompatible({
  apiKey,
  baseUrl,
  messages,
  model,
  modelId,
  providerKey,
  systemPrompt,
}: ProviderRequest & {
  apiKey: string;
  baseUrl: string;
  modelId: string;
  providerKey: string;
}) {
  const response = await fetch(joinBaseUrl(baseUrl, "/chat/completions"), {
    body: JSON.stringify({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      model: modelId,
    }),
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    method: "POST",
  });

  const payload = asRecord(await response.json().catch(() => ({})));
  if (!response.ok) {
    const error = extractProviderError(payload, response.statusText);
    return {
      configured: true,
      content: `Atmet could not complete the request: ${error}`,
      error,
      modelId,
      providerKey,
    };
  }

  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const firstChoice = asRecord(choices[0]);
  const message = asRecord(firstChoice.message);
  const usage = asRecord(payload.usage);

  return {
    configured: true,
    content:
      typeof message.content === "string"
        ? message.content
        : "Atmet finished, but the provider returned an empty response.",
    inputTokens:
      typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : undefined,
    modelId,
    outputTokens:
      typeof usage.completion_tokens === "number"
        ? usage.completion_tokens
        : undefined,
    providerKey,
  };
}

async function runAnthropic({
  apiKey,
  baseUrl,
  messages,
  modelId,
  providerKey,
  systemPrompt,
}: ProviderRequest & {
  apiKey: string;
  baseUrl: string;
  modelId: string;
  providerKey: string;
}) {
  const response = await fetch(joinBaseUrl(baseUrl, "/messages"), {
    body: JSON.stringify({
      max_tokens: 1200,
      messages: messages.map((message) => ({
        content: message.content,
        role: message.role === "assistant" ? "assistant" : "user",
      })),
      model: modelId,
      system: systemPrompt,
    }),
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
    method: "POST",
  });

  const payload = asRecord(await response.json().catch(() => ({})));
  if (!response.ok) {
    const error = extractProviderError(payload, response.statusText);
    return {
      configured: true,
      content: `Atmet could not complete the request: ${error}`,
      error,
      modelId,
      providerKey,
    };
  }

  const content = Array.isArray(payload.content)
    ? payload.content
        .map((part) => {
          const record = asRecord(part);
          return typeof record.text === "string" ? record.text : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";
  const usage = asRecord(payload.usage);

  return {
    configured: true,
    content: content || "Atmet finished, but the provider returned an empty response.",
    inputTokens:
      typeof usage.input_tokens === "number" ? usage.input_tokens : undefined,
    modelId,
    outputTokens:
      typeof usage.output_tokens === "number" ? usage.output_tokens : undefined,
    providerKey,
  };
}

async function runGoogle({
  apiKey,
  baseUrl,
  messages,
  modelId,
  providerKey,
  systemPrompt,
}: ProviderRequest & {
  apiKey: string;
  baseUrl: string;
  modelId: string;
  providerKey: string;
}) {
  const response = await fetch(
    `${joinBaseUrl(baseUrl, `/models/${modelId}:generateContent`)}?key=${apiKey}`,
    {
      body: JSON.stringify({
        contents: messages.map((message) => ({
          parts: [{ text: message.content }],
          role: message.role === "assistant" ? "model" : "user",
        })),
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );

  const payload = asRecord(await response.json().catch(() => ({})));
  if (!response.ok) {
    const error = extractProviderError(payload, response.statusText);
    return {
      configured: true,
      content: `Atmet could not complete the request: ${error}`,
      error,
      modelId,
      providerKey,
    };
  }

  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const firstCandidate = asRecord(candidates[0]);
  const contentRecord = asRecord(firstCandidate.content);
  const parts = Array.isArray(contentRecord.parts) ? contentRecord.parts : [];
  const text = parts
    .map((part) => {
      const record = asRecord(part);
      return typeof record.text === "string" ? record.text : "";
    })
    .filter(Boolean)
    .join("\n");

  return {
    configured: true,
    content: text || "Atmet finished, but the provider returned an empty response.",
    modelId,
    providerKey,
  };
}

function extractProviderError(payload: Record<string, unknown>, fallback: string) {
  const error = asRecord(payload.error);
  return (
    (typeof error.message === "string" && error.message) ||
    (typeof payload.message === "string" && payload.message) ||
    fallback ||
    "Provider error"
  );
}
