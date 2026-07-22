import { isRouteResponse } from "@/lib/api/auth";
import { requireChatPermission } from "@/lib/api/permissions";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";

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
      .from("chat_messages")
      .select("*, chat_mentions(*)")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return ok({ messages: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { chatId } = await context.params;
    const auth = await requireChatPermission(chatId, "chats.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const role = stringValue(body.role, "user");
    const content = stringValue(body.content);

    if (!content) {
      return badRequest("Message content is required");
    }

    const { data, error } = await auth.admin
      .from("chat_messages")
      .insert({
        chat_id: chatId,
        role: ["user", "assistant", "system", "tool"].includes(role) ? role : "user",
        content,
        metadata: body.metadata ?? {},
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await auth.admin.from("chats").update({ last_message_at: new Date().toISOString() }).eq("id", chatId);

    return created({ message: data });
  } catch (error) {
    return serverError(error);
  }
}
