import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";

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

    const [
      { data: brain, error: brainError },
      { data: graphNodes, error: nodesError },
      { data: graphEdges, error: edgesError },
    ] = await Promise.all([
      auth.supabase.from("workspace_brain").select("*").eq("workspace_id", workspaceId).single(),
      auth.supabase.from("knowledge_graph_nodes").select("*").eq("workspace_id", workspaceId),
      auth.supabase.from("knowledge_graph_edges").select("*").eq("workspace_id", workspaceId),
    ]);

    if (brainError || nodesError || edgesError) {
      throw brainError ?? nodesError ?? edgesError;
    }

    return ok({ brain, graphNodes, graphEdges });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.update");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const { data, error } = await auth.admin
      .from("workspace_brain")
      .upsert({
        workspace_id: workspaceId,
        personalization: stringValue(body.personalization) || null,
        business_details: stringValue(body.businessDetails) || null,
        output_style: stringValue(body.outputStyle) || null,
        knowledge_graph_status: stringValue(body.knowledgeGraphStatus, "empty"),
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ brain: data });
  } catch (error) {
    return serverError(error);
  }
}
