import { isRouteResponse } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
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

    await auth.admin
      .from("chats")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", chatId)
      .eq("user_id", auth.user.id);

    await recordActivityLog(auth.admin, {
      action: "chat.message.created",
      actorId: auth.user.id,
      metadata: {
        contentLength: content.length,
        messageId: data.id,
        role: data.role,
      },
      request,
      targetId: chatId,
      targetType: "chat",
    });

    return created({ message: data });
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
    const messageId = stringValue(body.messageId);
    const action = stringValue(body.action);

    if (!messageId) {
      return badRequest("Message id is required");
    }

    const { data: currentMessage, error: currentMessageError } = await auth.admin
      .from("chat_messages")
      .select("*")
      .eq("id", messageId)
      .eq("chat_id", chatId)
      .single();

    if (currentMessageError) {
      throw currentMessageError;
    }

    if (action === "edit") {
      const content = stringValue(body.content);
      if (!content) {
        return badRequest("Message content is required");
      }

      if (currentMessage.role !== "user") {
        return badRequest("Only user messages can be edited");
      }

      await auth.admin
        .from("chat_messages")
        .delete()
        .eq("chat_id", chatId)
        .gt("created_at", currentMessage.created_at);

      const metadata =
        currentMessage.metadata &&
        typeof currentMessage.metadata === "object" &&
        !Array.isArray(currentMessage.metadata)
          ? currentMessage.metadata
          : {};
      const { data, error } = await auth.admin
        .from("chat_messages")
        .update({
          content,
          metadata: {
            ...metadata,
            editedAt: new Date().toISOString(),
            previousContent: currentMessage.content,
          },
        })
        .eq("id", messageId)
        .eq("chat_id", chatId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      await recordActivityLog(auth.admin, {
        action: "chat.message.edited",
        actorId: auth.user.id,
        metadata: { messageId },
        request,
        targetId: chatId,
        targetType: "chat",
      });

      return ok({ message: data });
    }

    if (action === "feedback") {
      const feedback = stringValue(body.feedback);
      if (feedback !== "like" && feedback !== "dislike") {
        return badRequest("Feedback must be like or dislike");
      }

      const metadata =
        currentMessage.metadata &&
        typeof currentMessage.metadata === "object" &&
        !Array.isArray(currentMessage.metadata)
          ? currentMessage.metadata
          : {};
      const { data, error } = await auth.admin
        .from("chat_messages")
        .update({
          metadata: {
            ...metadata,
            feedback,
            feedbackAt: new Date().toISOString(),
            feedbackBy: auth.user.id,
          },
        })
        .eq("id", messageId)
        .eq("chat_id", chatId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      await recordActivityLog(auth.admin, {
        action: `chat.message.feedback.${feedback}`,
        actorId: auth.user.id,
        metadata: { messageId, role: currentMessage.role },
        request,
        targetId: messageId,
        targetType: "chat_message",
      });

      return ok({ message: data });
    }

    return badRequest("Unsupported message action");
  } catch (error) {
    return serverError(error);
  }
}
