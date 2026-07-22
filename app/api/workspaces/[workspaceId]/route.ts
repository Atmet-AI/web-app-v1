import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { jsonObject, ok, readJson, serverError, stringValue } from "@/lib/api/http";

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
      .from("workspaces")
      .select("*, workspace_settings(*), workspace_subscriptions(*), workspace_members(*, profiles(*))")
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
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.update");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const patch = jsonObject(body.workspace);

    const { data, error } = await auth.admin
      .from("workspaces")
      .update({
        name: stringValue(patch.name) || undefined,
        slug: stringValue(patch.slug) || undefined,
        avatar_url: stringValue(patch.avatarUrl) || undefined,
        category: stringValue(patch.category) || undefined,
        status: stringValue(patch.status) || undefined,
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

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.delete");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { error } = await auth.admin
      .from("workspaces")
      .update({ status: "deleted", deleted_at: new Date().toISOString() })
      .eq("id", workspaceId);

    if (error) {
      throw error;
    }

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
