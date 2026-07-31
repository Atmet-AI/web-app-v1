import { isRouteResponse, requireUser, requireWorkspacePermission } from "@/lib/api/auth";
import { notFound } from "@/lib/api/http";

export async function requireAgentPermission(agentId: string, permissionKey: string) {
  const userContext = await requireUser();

  if (isRouteResponse(userContext)) {
    return userContext;
  }

  const { data, error } = await userContext.admin
    .from("workflow_agents")
    .select("workspace_id, created_by")
    .eq("id", agentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const agent = data as Record<string, unknown> | null;
  const workspaceId = agent?.workspace_id as string | undefined;
  const ownerId = agent?.created_by as string | undefined;

  if (!workspaceId) {
    return notFound();
  }

  const { data: hasWorkspacePermission, error: workspacePermissionError } =
    await userContext.supabase.rpc("has_workspace_permission", {
      permission_key: permissionKey,
      target_user_id: userContext.user.id,
      target_workspace_id: workspaceId,
    });

  if (workspacePermissionError || hasWorkspacePermission !== true) {
    return notFound();
  }

  const { data: isSuperAdmin, error: superAdminError } =
    await userContext.supabase.rpc("is_super_admin", {
      target_user_id: userContext.user.id,
    });

  if (superAdminError) {
    throw superAdminError;
  }

  if (isSuperAdmin === true || ownerId === userContext.user.id) {
    return userContext;
  }

  if (permissionKey === "agents.manage") {
    return notFound();
  }

  const { data: member, error: memberError } = await userContext.admin
    .from("workflow_agent_members")
    .select("id")
    .eq("agent_id", agentId)
    .eq("user_id", userContext.user.id)
    .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  if (!member) {
    return notFound();
  }

  return userContext;
}

export async function requireChatPermission(chatId: string, permissionKey: string) {
  const userContext = await requireUser();

  if (isRouteResponse(userContext)) {
    return userContext;
  }

  const { data, error } = await userContext.admin
    .from("chats")
    .select("workspace_id, user_id")
    .eq("id", chatId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const chat = data as Record<string, unknown> | null;
  const workspaceId = chat?.workspace_id as string | undefined;
  const ownerId = chat?.user_id as string | undefined;

  if (!workspaceId || ownerId !== userContext.user.id) {
    return notFound();
  }

  return requireWorkspacePermission(workspaceId, permissionKey);
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
