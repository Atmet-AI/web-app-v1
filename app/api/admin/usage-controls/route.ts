import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";

export async function GET() {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.supabase
      .from("workspace_usage_controls")
      .select("*, workspaces(name, slug)")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ok({ controls: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const workspaceId = stringValue(body.workspaceId);
    const { data, error } = await auth.supabase
      .from("workspace_usage_controls")
      .upsert({
        workspace_id: workspaceId || null,
        enforce_workspace_limits: body.enforceWorkspaceLimits,
        monthly_run_limit: body.monthlyRunLimit,
        connector_limit: body.connectorLimit,
        require_write_approvals: body.requireWriteApprovals,
        usage_alert_threshold: body.usageAlertThreshold,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ controls: data });
  } catch (error) {
    return serverError(error);
  }
}
