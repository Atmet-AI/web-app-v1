import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { jsonObject, ok, readJson, serverError } from "@/lib/api/http";

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
      .from("workspace_settings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    if (error) {
      throw error;
    }

    return ok({ settings: data });
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

    const patch = jsonObject(await readJson(request));
    const { data, error } = await auth.supabase
      .from("workspace_settings")
      .upsert({ ...patch, workspace_id: workspaceId })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ settings: data });
  } catch (error) {
    return serverError(error);
  }
}
