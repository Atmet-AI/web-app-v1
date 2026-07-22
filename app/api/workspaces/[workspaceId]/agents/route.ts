import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";

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
      .from("workflow_agents")
      .select("*, workflow_nodes(*), workflow_edges(*)")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ok({ agents: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const name = stringValue(body.name);

    if (!name) {
      return badRequest("Agent name is required");
    }

    const { data, error } = await auth.admin
      .from("workflow_agents")
      .insert({
        workspace_id: workspaceId,
        name,
        status: stringValue(body.status, "draft"),
        runtime_state: stringValue(body.runtimeState, "paused"),
        gradient: stringValue(body.gradient) || null,
        tone: stringValue(body.tone) || null,
        schedule: stringValue(body.schedule) || null,
        settings: body.settings ?? {},
        created_by: auth.user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return created({ agent: data });
  } catch (error) {
    return serverError(error);
  }
}
