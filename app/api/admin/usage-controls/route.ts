import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";

function numberOrDefault(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

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
    const values = {
      agent_limit: numberOrDefault(body.agentLimit, 25),
      connector_limit: numberOrDefault(body.connectorLimit, 10),
      enforce_workspace_limits: body.enforceWorkspaceLimits !== false,
      monthly_run_limit: numberOrDefault(body.monthlyRunLimit, 12000),
      monthly_token_limit: numberOrDefault(body.monthlyTokenLimit, 50000),
      require_write_approvals: body.requireWriteApprovals !== false,
      storage_limit_gb: numberOrDefault(body.storageLimitGb, 25),
      usage_alert_threshold: numberOrDefault(body.usageAlertThreshold, 80),
      workspace_id: workspaceId || null,
    };

    let result;

    if (workspaceId) {
      result = await auth.supabase
        .from("workspace_usage_controls")
        .upsert(values, { onConflict: "workspace_id" })
        .select("*")
        .single();
    } else {
      const { data: existingGlobal, error: existingGlobalError } =
        await auth.supabase
          .from("workspace_usage_controls")
          .select("id")
          .is("workspace_id", null)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

      if (existingGlobalError) {
        throw existingGlobalError;
      }

      result = existingGlobal?.id
        ? await auth.supabase
            .from("workspace_usage_controls")
            .update(values)
            .eq("id", existingGlobal.id)
            .select("*")
            .single()
        : await auth.supabase
            .from("workspace_usage_controls")
            .insert(values)
            .select("*")
            .single();
    }

    const { data, error } = result;

    if (error) {
      throw error;
    }

    await recordActivityLog(auth.admin, {
      action: "admin.usage_controls.updated",
      actorId: auth.user.id,
      metadata: {
        agentLimit: data.agent_limit,
        connectorLimit: data.connector_limit,
        monthlyTokenLimit: data.monthly_token_limit,
        monthlyRunLimit: data.monthly_run_limit,
        requireWriteApprovals: data.require_write_approvals,
        storageLimitGb: data.storage_limit_gb,
        usageAlertThreshold: data.usage_alert_threshold,
      },
      request,
      targetId: data.id,
      targetType: "workspace_usage_controls",
      workspaceId: data.workspace_id,
    });

    return ok({ controls: data });
  } catch (error) {
    return serverError(error);
  }
}
