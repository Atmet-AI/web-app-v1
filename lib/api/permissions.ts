import { isRouteResponse, requireUser, requireWorkspacePermission } from "@/lib/api/auth";
import { notFound } from "@/lib/api/http";

export async function requireAgentPermission(agentId: string, permissionKey: string) {
  const workspaceContext = await requireWorkspacePermissionForRelatedRecord(
    "workflow_agents",
    agentId,
    "workspace_id",
    permissionKey,
  );

  return workspaceContext;
}

export async function requireChatPermission(chatId: string, permissionKey: string) {
  return requireWorkspacePermissionForRelatedRecord("chats", chatId, "workspace_id", permissionKey);
}

async function requireWorkspacePermissionForRelatedRecord(
  table: string,
  id: string,
  workspaceColumn: string,
  permissionKey: string,
) {
  const userContext = await requireUser();

  if (isRouteResponse(userContext)) {
    return userContext;
  }

  const { data, error } = await userContext.admin
    .from(table)
    .select(workspaceColumn)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const relatedRecord = data as Record<string, unknown> | null;
  const workspaceId = relatedRecord?.[workspaceColumn] as string | undefined;

  if (!workspaceId) {
    return notFound();
  }

  return requireWorkspacePermission(workspaceId, permissionKey);
}
