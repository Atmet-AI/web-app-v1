import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { workspaceId } = await context.params;
    const { data, error } = await auth.admin
      .from("workspaces")
      .select("*, workspace_settings(*), workspace_subscriptions(*), workspace_members(*, profiles(*)), workspace_usage_controls(*)")
      .eq("id", workspaceId)
      .single();

    if (error) {
      throw error;
    }

    return ok({ workspace: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { workspaceId } = await context.params;
    const body = await readJson(request);
    const { data, error } = await auth.admin
      .from("workspaces")
      .update({
        name: stringValue(body.name) || undefined,
        status: stringValue(body.status) || undefined,
        category: stringValue(body.category) || undefined,
      })
      .eq("id", workspaceId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ workspace: data });
  } catch (error) {
    return serverError(error);
  }
}
