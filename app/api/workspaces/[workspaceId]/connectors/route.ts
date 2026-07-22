import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";

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

    const [{ data: apps, error: appsError }, { data: connections, error: connectionsError }] =
      await Promise.all([
        auth.supabase.from("app_catalog").select("*").eq("enabled", true).order("name"),
        auth.supabase.from("workspace_connectors").select("*").eq("workspace_id", workspaceId),
      ]);

    if (appsError || connectionsError) {
      throw appsError ?? connectionsError;
    }

    return ok({ apps, connections });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "connectors.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const appKey = stringValue(body.appKey);
    const action = stringValue(body.action, "connect");

    if (!appKey) {
      return badRequest("App key is required");
    }

    const payload: Record<string, unknown> =
      action === "disconnect"
        ? {
            workspace_id: workspaceId,
            app_key: appKey,
            status: "disconnected",
            disconnected_at: new Date().toISOString(),
          }
        : {
            workspace_id: workspaceId,
            app_key: appKey,
            status: "connected",
            connected_by: auth.user.id,
            profile_name: stringValue(body.profileName) || null,
            description: stringValue(body.description) || null,
            settings: body.settings ?? {},
            connected_at: new Date().toISOString(),
            disconnected_at: null,
          };

    const { data, error } = await auth.admin
      .from("workspace_connectors")
      .upsert(payload, { onConflict: "workspace_id,app_key" })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ connection: data });
  } catch (error) {
    return serverError(error);
  }
}
