import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { ok, serverError } from "@/lib/api/http";

export async function GET() {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const [
      { count: workspaceCount, error: workspaceError },
      { count: userCount, error: userError },
      { count: requestCount, error: requestError },
      { data: usageEvents, error: usageError },
      { data: auditLogs, error: auditError },
      { data: sessionLogs, error: sessionError },
    ] = await Promise.all([
      auth.admin.from("workspaces").select("*", { count: "exact", head: true }).is("deleted_at", null),
      auth.admin.from("profiles").select("*", { count: "exact", head: true }),
      auth.admin.from("waitlist_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      auth.admin.from("usage_events").select("*").order("created_at", { ascending: false }).limit(200),
      auth.admin.from("admin_audit_logs").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(20),
      auth.admin.from("session_logs").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(20),
    ]);

    if (workspaceError || userError || requestError || usageError || auditError || sessionError) {
      throw workspaceError ?? userError ?? requestError ?? usageError ?? auditError ?? sessionError;
    }

    const usageByResource = (usageEvents ?? []).reduce<Record<string, number>>((acc, event) => {
      const key = String(event.resource);
      acc[key] = (acc[key] ?? 0) + Number(event.quantity ?? 0);
      return acc;
    }, {});

    return ok({
      kpis: {
        workspaces: workspaceCount ?? 0,
        users: userCount ?? 0,
        pendingRequests: requestCount ?? 0,
        events: usageEvents?.length ?? 0,
      },
      charts: {
        usageByResource,
      },
      auditLogs,
      sessionLogs,
    });
  } catch (error) {
    return serverError(error);
  }
}
