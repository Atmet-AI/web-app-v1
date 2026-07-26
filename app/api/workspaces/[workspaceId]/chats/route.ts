import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { created, ok, readJson, serverError, stringValue } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.supabase
      .from("chats")
      .select("*, chat_messages(id, role, content, created_at)")
      .eq("workspace_id", workspaceId)
      .eq("user_id", auth.user.id)
      .is("deleted_at", null)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ok({ chats: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "chats.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const { data, error } = await auth.admin
      .from("chats")
      .insert({
        workspace_id: workspaceId,
        user_id: auth.user.id,
        title: stringValue(body.title, "New chat"),
        source: stringValue(body.source, "chat"),
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await recordActivityLog(auth.admin, {
      action: "chat.created",
      actorId: auth.user.id,
      metadata: {
        chatTitle: data.title,
        source: data.source,
      },
      request,
      targetId: data.id,
      targetType: "chat",
      workspaceId,
    });

    return created({ chat: data });
  } catch (error) {
    return serverError(error);
  }
}
