import { isRouteResponse } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { requireAgentPermission } from "@/lib/api/permissions";
import { created, readJson, serverError, stringValue } from "@/lib/api/http";
import { runWorkflowAgent } from "@/lib/agents/runner";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const nodeId = stringValue(body.nodeId) || undefined;
    const result = await runWorkflowAgent({
      admin: auth.admin,
      agentId,
      nodeId,
      startedBy: auth.user.id,
      trigger: nodeId ? "node" : "manual",
    });

    await recordActivityLog(auth.admin, {
      action: "agent.run.started",
      actorId: auth.user.id,
      metadata: {
        nodeId,
        runId: result.runId,
        trigger: nodeId ? "node" : "manual",
      },
      request,
      targetId: agentId,
      targetType: "agent",
    });

    return created(result);
  } catch (error) {
    return serverError(error);
  }
}
