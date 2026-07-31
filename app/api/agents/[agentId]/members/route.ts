import { isRouteResponse } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { requireAgentPermission } from "@/lib/api/permissions";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeAgentMemberRows(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = asRecord(item);
      const userId = stringValue(record.userId, stringValue(record.user_id));
      const role = stringValue(record.role, "viewer");

      if (!userId || !["editor", "runner", "viewer"].includes(role)) {
        return null;
      }

      return { role, user_id: userId };
    })
    .filter((item): item is { role: string; user_id: string } => Boolean(item));
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.admin
      .from("workflow_agent_members")
      .select("*, profiles:user_id(full_name, email, avatar_url)")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return ok({ members: data ?? [] });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const requestedMembers = normalizeAgentMemberRows(body.members);

    const { data: agent, error: agentError } = await auth.admin
      .from("workflow_agents")
      .select("workspace_id, created_by")
      .eq("id", agentId)
      .is("deleted_at", null)
      .single();

    if (agentError) {
      throw agentError;
    }

    const workspaceId = stringValue(agent.workspace_id);
    const ownerId = stringValue(agent.created_by);
    const memberIds = Array.from(
      new Set(
        requestedMembers
          .map((member) => member.user_id)
          .filter((userId) => userId && userId !== ownerId),
      ),
    );

    if (memberIds.length > 0) {
      const { data: workspaceMembers, error: workspaceMembersError } =
        await auth.admin
          .from("workspace_members")
          .select("user_id")
          .eq("workspace_id", workspaceId)
          .eq("status", "active")
          .in("user_id", memberIds);

      if (workspaceMembersError) {
        throw workspaceMembersError;
      }

      const activeMemberIds = new Set(
        (workspaceMembers ?? []).map((member) => stringValue(member.user_id)),
      );
      const invalidUserId = memberIds.find((userId) => !activeMemberIds.has(userId));

      if (invalidUserId) {
        return badRequest("Assigned users must be active members of this workspace.");
      }
    }

    const { error: deleteError } = await auth.admin
      .from("workflow_agent_members")
      .delete()
      .eq("agent_id", agentId)
      .neq("role", "owner");

    if (deleteError) {
      throw deleteError;
    }

    if (memberIds.length > 0) {
      const rows = memberIds.map((userId) => {
        const requestedMember = requestedMembers.find(
          (member) => member.user_id === userId,
        );

        return {
          agent_id: agentId,
          assigned_by: auth.user.id,
          role: requestedMember?.role ?? "viewer",
          user_id: userId,
        };
      });
      const { error: insertError } = await auth.admin
        .from("workflow_agent_members")
        .upsert(rows, { onConflict: "agent_id,user_id" });

      if (insertError) {
        throw insertError;
      }
    }

    await recordActivityLog(auth.admin, {
      action: "agent.members.updated",
      actorId: auth.user.id,
      metadata: {
        assignedUserIds: memberIds,
      },
      request,
      targetId: agentId,
      targetType: "agent",
      workspaceId,
    });

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
