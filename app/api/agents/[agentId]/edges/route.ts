import { isRouteResponse } from "@/lib/api/auth";
import { requireAgentPermission } from "@/lib/api/permissions";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";

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
    const sourceNodeId = stringValue(body.sourceNodeId);
    const targetNodeId = stringValue(body.targetNodeId);

    if (!sourceNodeId || !targetNodeId) {
      return badRequest("Source and target nodes are required");
    }

    const { data, error } = await auth.admin
      .from("workflow_edges")
      .upsert(
        {
          agent_id: agentId,
          source_node_id: sourceNodeId,
          target_node_id: targetNodeId,
          label: stringValue(body.label) || null,
        },
        { onConflict: "agent_id,source_node_id,target_node_id" },
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return created({ edge: data });
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

    const id = new URL(request.url).searchParams.get("id");
    const { error } = await auth.admin.from("workflow_edges").delete().eq("id", id).eq("agent_id", agentId);

    if (error) {
      throw error;
    }

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
