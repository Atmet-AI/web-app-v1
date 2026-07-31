import { isRouteResponse } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { requireAgentPermission } from "@/lib/api/permissions";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { createAgentVersionSnapshot } from "@/lib/agents/versions";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.supabase
      .from("workflow_agents")
      .select("*, workflow_nodes(*), workflow_edges(*)")
      .eq("id", agentId)
      .single();

    if (error) {
      throw error;
    }

    return ok({ agent: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const schedule = stringValue(body.schedule);
    const { data, error } = await auth.admin
      .from("workflow_agents")
      .update({
        name: stringValue(body.name) || undefined,
        status: stringValue(body.status) || undefined,
        runtime_state: stringValue(body.runtimeState) || undefined,
        tone: stringValue(body.tone) || undefined,
        schedule:
          body.schedule === null || schedule === "manual"
            ? null
            : schedule || undefined,
        settings: body.settings ?? undefined,
      })
      .eq("id", agentId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await createAgentVersionSnapshot({
      admin: auth.admin,
      agentId,
      changeType: "agent.updated",
      createdBy: auth.user.id,
      summary: "Agent settings updated.",
    });

    await recordActivityLog(auth.admin, {
      action: "agent.updated",
      actorId: auth.user.id,
      metadata: {
        agentName: data.name,
        runtimeState: data.runtime_state,
        schedule: data.schedule,
        status: data.status,
      },
      request,
      targetId: agentId,
      targetType: "agent",
      workspaceId: data.workspace_id,
    });

    return ok({ agent: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { error } = await auth.admin
      .from("workflow_agents")
      .update({ deleted_at: new Date().toISOString(), status: "archived" })
      .eq("id", agentId);

    if (error) {
      throw error;
    }

    await createAgentVersionSnapshot({
      admin: auth.admin,
      agentId,
      changeType: "agent.deleted",
      createdBy: auth.user.id,
      summary: "Agent archived.",
    });

    await recordActivityLog(auth.admin, {
      action: "agent.deleted",
      actorId: auth.user.id,
      request,
      targetId: agentId,
      targetType: "agent",
    });

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
