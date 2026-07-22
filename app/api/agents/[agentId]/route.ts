import { isRouteResponse } from "@/lib/api/auth";
import { requireAgentPermission } from "@/lib/api/permissions";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";

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
    const { data, error } = await auth.admin
      .from("workflow_agents")
      .update({
        name: stringValue(body.name) || undefined,
        status: stringValue(body.status) || undefined,
        runtime_state: stringValue(body.runtimeState) || undefined,
        tone: stringValue(body.tone) || undefined,
        schedule: stringValue(body.schedule) || undefined,
        settings: body.settings ?? undefined,
      })
      .eq("id", agentId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ agent: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
