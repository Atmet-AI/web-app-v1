import { forbidden, ok, serverError } from "@/lib/api/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isWorkflowScheduleDue, runWorkflowAgent } from "@/lib/agents/runner";
import {
  isGmailToTelegramPollingAgent,
  pollGmailToTelegramAutomation,
} from "@/lib/automations/gmail-telegram";

export const runtime = "nodejs";

function hasCronAccess(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = request.headers.get("authorization") ?? "";
  const headerSecret = request.headers.get("x-cron-secret") ?? "";
  return authorization === `Bearer ${secret}` || headerSecret === secret;
}

export async function POST(request: Request) {
  try {
    if (!hasCronAccess(request)) {
      return forbidden();
    }

    const admin = createSupabaseAdminClient();
    const { data: agents, error } = await admin
      .from("workflow_agents")
      .select("id, schedule, settings")
      .eq("runtime_state", "running")
      .is("deleted_at", null)
      .not("schedule", "is", null);

    if (error) {
      throw error;
    }

    const dueAgents: Array<Record<string, unknown> & { id: string; schedule: string }> = [];

    for (const agent of agents ?? []) {
      const agentId = typeof agent.id === "string" ? agent.id : "";
      const schedule = typeof agent.schedule === "string" ? agent.schedule : "";
      if (!agentId || !schedule) {
        continue;
      }

      const { data: latestRun, error: latestRunError } = await admin
        .from("workflow_runs")
        .select("created_at")
        .eq("agent_id", agentId)
        .eq("metadata->>trigger", "schedule")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestRunError) {
        throw latestRunError;
      }

      const latestRunAt =
        latestRun && typeof latestRun.created_at === "string"
          ? latestRun.created_at
          : null;

      if (isWorkflowScheduleDue(schedule, latestRunAt)) {
        dueAgents.push({ ...agent, id: agentId, schedule });
      }
    }

    const results = [];
    for (const agent of dueAgents) {
      try {
        if (isGmailToTelegramPollingAgent(agent)) {
          const result = await pollGmailToTelegramAutomation({
            admin,
            agent,
          });
          results.push({ agentId: agent.id, ...result });
        } else {
          const result = await runWorkflowAgent({
            admin,
            agentId: agent.id,
            startedBy: null,
            trigger: "schedule",
          });
          results.push({ agentId: agent.id, ok: true, runId: result.runId });
        }
      } catch (error) {
        results.push({
          agentId: agent.id,
          error: error instanceof Error ? error.message : "Scheduled run failed",
          ok: false,
        });
      }
    }

    return ok({
      checked: agents?.length ?? 0,
      due: dueAgents.length,
      results,
    });
  } catch (error) {
    return serverError(error);
  }
}

export const GET = POST;
