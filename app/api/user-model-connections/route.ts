import { isRouteResponse, requireUser } from "@/lib/api/auth";
import {
  badRequest,
  ok,
  readJson,
  serverError,
  stringValue,
} from "@/lib/api/http";

function sanitizeConnection(row: Record<string, unknown>) {
  return {
    baseUrl: typeof row.base_url === "string" ? row.base_url : "",
    displayName:
      typeof row.display_name === "string" ? row.display_name : "Custom model",
    enabled: row.enabled === true,
    hasApiKey: typeof row.api_key_secret === "string" && row.api_key_secret.length > 0,
    id: typeof row.id === "string" ? row.id : "",
    modelId: typeof row.model_id === "string" ? row.model_id : "",
    providerKey: typeof row.provider_key === "string" ? row.provider_key : "custom",
  };
}

export async function GET() {
  try {
    const auth = await requireUser();
    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.admin
      .from("user_model_connections")
      .select("id, provider_key, display_name, model_id, base_url, api_key_secret, enabled")
      .eq("user_id", auth.user.id)
      .is("workspace_id", null)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ok({
      connections: (data ?? []).map((row) =>
        sanitizeConnection(row as Record<string, unknown>),
      ),
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const providerKey = stringValue(body.providerKey);
    const displayName = stringValue(
      body.displayName,
      providerKey === "local" ? "Local model" : "Custom API",
    );
    const modelId = stringValue(body.modelId);
    const baseUrl = stringValue(
      body.baseUrl,
      providerKey === "local" ? "http://localhost:11434/v1" : "",
    );
    const apiKey = stringValue(body.apiKey);

    if (providerKey !== "custom" && providerKey !== "local") {
      return badRequest("Only custom and local model connections are supported.");
    }

    if (!modelId) {
      return badRequest("Model ID is required.");
    }

    if (!baseUrl) {
      return badRequest("Base URL is required.");
    }

    const { data: existingRows, error: existingError } = await auth.admin
      .from("user_model_connections")
      .select("id, api_key_secret")
      .eq("user_id", auth.user.id)
      .eq("provider_key", providerKey)
      .is("workspace_id", null)
      .limit(1);

    if (existingError) {
      throw existingError;
    }

    const existing = (existingRows ?? [])[0] as
      | { api_key_secret?: string | null; id: string }
      | undefined;

    if (providerKey === "custom" && !apiKey && !existing?.api_key_secret) {
      return badRequest("API key is required for custom API models.");
    }

    const payload = {
      base_url: baseUrl,
      display_name: displayName || (providerKey === "local" ? "Local model" : "Custom API"),
      enabled: true,
      model_id: modelId,
      provider_key: providerKey,
      updated_at: new Date().toISOString(),
      user_id: auth.user.id,
      workspace_id: null,
      ...(apiKey ? { api_key_secret: apiKey } : {}),
    };

    const query = existing
      ? auth.admin
          .from("user_model_connections")
          .update(payload)
          .eq("id", existing.id)
          .select("id, provider_key, display_name, model_id, base_url, api_key_secret, enabled")
          .single()
      : auth.admin
          .from("user_model_connections")
          .insert(payload)
          .select("id, provider_key, display_name, model_id, base_url, api_key_secret, enabled")
          .single();

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return ok({ connection: sanitizeConnection(data as Record<string, unknown>) });
  } catch (error) {
    return serverError(error);
  }
}
