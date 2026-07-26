import { isRouteResponse } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
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
      .eq("user_id", auth.user.id)
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
      .eq("user_id", auth.user.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await recordActivityLog(auth.admin, {
      action: "chat.updated",
      actorId: auth.user.id,
      metadata: {
        archived: data.archived,
        chatTitle: data.title,
        pinned: data.pinned,
      },
      request,
      targetId: chatId,
      targetType: "chat",
      workspaceId: data.workspace_id,
    });

    return ok({ chat: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { chatId } = await context.params;
    const auth = await requireChatPermission(chatId, "chats.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { error } = await auth.admin
      .from("chats")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", chatId)
      .eq("user_id", auth.user.id);

    if (error) {
      throw error;
    }

    await recordActivityLog(auth.admin, {
      action: "chat.deleted",
      actorId: auth.user.id,
      request,
      targetId: chatId,
      targetType: "chat",
    });

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
