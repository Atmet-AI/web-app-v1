import { isRouteResponse } from "@/lib/api/auth";
import { requireChatPermission } from "@/lib/api/permissions";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ chatId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { chatId } = await context.params;
    const auth = await requireChatPermission(chatId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.supabase
      .from("chats")
      .select("*, chat_messages(*), chat_mentions(*)")
      .eq("id", chatId)
      .single();

    if (error) {
      throw error;
    }

    return ok({ chat: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { chatId } = await context.params;
    const auth = await requireChatPermission(chatId, "chats.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const { data, error } = await auth.admin
      .from("chats")
      .update({
        title: stringValue(body.title) || undefined,
        pinned: typeof body.pinned === "boolean" ? body.pinned : undefined,
        archived: typeof body.archived === "boolean" ? body.archived : undefined,
      })
      .eq("id", chatId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ chat: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { chatId } = await context.params;
    const auth = await requireChatPermission(chatId, "chats.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { error } = await auth.admin
      .from("chats")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", chatId);

    if (error) {
      throw error;
    }

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
