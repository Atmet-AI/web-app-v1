import { isRouteResponse } from "@/lib/api/auth";
import { requireAgentPermission } from "@/lib/api/permissions";
import { created, serverError } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.admin
      .from("workflow_runs")
      .insert({
        agent_id: agentId,
        status: "running",
        started_by: auth.user.id,
        started_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await auth.admin.from("workflow_agents").update({ runtime_state: "running" }).eq("id", agentId);

    return created({ run: data });
  } catch (error) {
    return serverError(error);
  }
}
