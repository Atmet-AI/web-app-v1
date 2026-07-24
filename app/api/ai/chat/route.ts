import { buildAtmetSystemPrompt } from "@/lib/ai/system";
import { normalizeModelConfig, runAtmetChat } from "@/lib/ai/providers";
import type { AtmetChatMessage } from "@/lib/ai/types";
import { isRouteResponse } from "@/lib/api/auth";
import {
  badRequest,
  notFound,
  ok,
  readJson,
  serverError,
  stringValue,
} from "@/lib/api/http";
import { requireChatPermission } from "@/lib/api/permissions";

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

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const chatId = stringValue(body.chatId);
    const workspaceId = stringValue(body.workspaceId);
    const modelKey = stringValue(body.modelKey, "atmet") || "atmet";
    const content = stringValue(body.content);

    if (!chatId || !workspaceId || !content) {
      return badRequest("Missing chat, workspace, or message content.");
    }

    const auth = await requireChatPermission(chatId, "chats.manage");
    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data: chat, error: chatError } = await auth.admin
      .from("chats")
      .select("id, workspace_id, title")
      .eq("id", chatId)
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

    const [workspaceResult, brainResult, recentMessagesResult, modelResult] =
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
        metadata: { modelKey },
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
    const startedAt = Date.now();
    const aiResult = await runAtmetChat({
      messages: [...providerMessages, { content, role: "user" }],
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
      .eq("id", chatId);

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
