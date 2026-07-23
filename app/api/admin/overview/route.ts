import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { ok, serverError } from "@/lib/api/http";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const dataClient = hasSupabaseServiceRoleKey() ? auth.admin : auth.supabase;

    const [
      { count: workspaceCount, error: workspaceError },
      { count: userCount, error: userError },
      { count: requestCount, error: requestError },
      { data: usageEvents, error: usageError },
      { data: auditLogs, error: auditError },
      { data: sessionLogs, error: sessionError },
    ] = await Promise.all([
      dataClient.from("workspaces").select("*", { count: "exact", head: true }).is("deleted_at", null),
      dataClient.from("profiles").select("*", { count: "exact", head: true }),
      dataClient.from("waitlist_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      dataClient.from("usage_events").select("*").order("created_at", { ascending: false }).limit(200),
      dataClient
        .from("admin_audit_logs")
        .select("*, profiles:profiles!admin_audit_logs_actor_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(20),
      dataClient
        .from("session_logs")
        .select("*, profiles:profiles!session_logs_user_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(20),
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
