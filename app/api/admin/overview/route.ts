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
      { data: feedbackMessages, error: feedbackError },
      { data: modelRuns, error: modelRunsError },
    ] = await Promise.all([
      dataClient.from("workspaces").select("*", { count: "exact", head: true }).is("deleted_at", null),
      dataClient.from("profiles").select("*", { count: "exact", head: true }),
      dataClient.from("waitlist_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      dataClient.from("usage_events").select("*").order("created_at", { ascending: false }).limit(200),
      dataClient
        .from("admin_audit_logs")
        .select("*, profiles:profiles!admin_audit_logs_actor_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(500),
      dataClient
        .from("session_logs")
        .select("*, profiles:profiles!session_logs_user_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(500),
      dataClient
        .from("chat_messages")
        .select("id, role, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      dataClient
        .from("ai_model_runs")
        .select("status, latency_ms, input_tokens, output_tokens, provider_key, model_key, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);

    if (
      workspaceError ||
      userError ||
      requestError ||
      usageError ||
      auditError ||
      sessionError ||
      feedbackError ||
      modelRunsError
    ) {
      throw (
        workspaceError ??
        userError ??
        requestError ??
        usageError ??
        auditError ??
        sessionError ??
        feedbackError ??
        modelRunsError
      );
    }

    const usageByResource = (usageEvents ?? []).reduce<Record<string, number>>((acc, event) => {
      const key = String(event.resource);
      acc[key] = (acc[key] ?? 0) + Number(event.quantity ?? 0);
      return acc;
    }, {});
    const aiFeedback = (feedbackMessages ?? []).reduce(
      (acc, message) => {
        const metadata =
          message.metadata &&
          typeof message.metadata === "object" &&
          !Array.isArray(message.metadata)
            ? (message.metadata as Record<string, unknown>)
            : {};
        const feedback = String(metadata.feedback ?? "");

        if (feedback !== "like" && feedback !== "dislike") {
          return acc;
        }

        acc.total += 1;
        if (message.role === "assistant") {
          acc.assistantTotal += 1;
        }
        if (feedback === "like") {
          acc.likes += 1;
          if (message.role === "assistant") {
            acc.assistantLikes += 1;
          }
        } else {
          acc.dislikes += 1;
          if (message.role === "assistant") {
            acc.assistantDislikes += 1;
          }
        }

        return acc;
      },
      {
        assistantDislikes: 0,
        assistantLikes: 0,
        assistantTotal: 0,
        dislikes: 0,
        likes: 0,
        total: 0,
      },
    );
    const completedModelRuns = (modelRuns ?? []).filter(
      (run) => run.status === "completed",
    );
    const failedModelRuns = (modelRuns ?? []).filter((run) => run.status === "failed");
    const measuredRuns = completedModelRuns.filter((run) =>
      Number.isFinite(Number(run.latency_ms)),
    );
    const avgLatencyMs =
      measuredRuns.length > 0
        ? Math.round(
            measuredRuns.reduce((sum, run) => sum + Number(run.latency_ms ?? 0), 0) /
              measuredRuns.length,
          )
        : 0;
    const assistantPositiveRate =
      aiFeedback.assistantTotal > 0
        ? Math.round((aiFeedback.assistantLikes / aiFeedback.assistantTotal) * 100)
        : 0;
    const successRate =
      (modelRuns?.length ?? 0) > 0
        ? Math.round((completedModelRuns.length / (modelRuns?.length ?? 1)) * 100)
        : 0;

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
      aiFeedback: {
        ...aiFeedback,
        assistantPositiveRate,
      },
      aiPerformance: {
        avgLatencyMs,
        completed: completedModelRuns.length,
        failed: failedModelRuns.length,
        runs: modelRuns?.length ?? 0,
        successRate,
      },
      auditLogs,
      sessionLogs,
    });
  } catch (error) {
    return serverError(error);
  }
}
