import { isRouteResponse } from "@/lib/api/auth";
import { ok, serverError } from "@/lib/api/http";
import { requireAgentPermission } from "@/lib/api/permissions";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const [
      { data: runs, error: runsError },
      { data: versions, error: versionsError },
      { data: approvals, error: approvalsError },
    ] = await Promise.all([
      auth.supabase
        .from("workflow_runs")
        .select("*, workflow_run_events(*)")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(20),
      auth.supabase
        .from("workflow_agent_versions")
        .select("*")
        .eq("agent_id", agentId)
        .order("version_number", { ascending: false })
        .limit(20),
      auth.supabase
        .from("workflow_approvals")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (runsError || versionsError || approvalsError) {
      throw runsError ?? versionsError ?? approvalsError;
    }

    return ok({
      approvals: approvals ?? [],
      runs: (runs ?? []).map((run) => ({
        ...run,
        workflow_run_events: Array.isArray(run.workflow_run_events)
          ? [...run.workflow_run_events].sort((a, b) =>
              String(a.created_at).localeCompare(String(b.created_at)),
            )
          : [],
      })),
      versions: versions ?? [],
    });
  } catch (error) {
    return serverError(error);
  }
}
