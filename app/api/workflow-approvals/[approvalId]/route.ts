import type { SupabaseClient } from "@supabase/supabase-js";
import { isRouteResponse, requireUser } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { requireAgentPermission } from "@/lib/api/permissions";
import { runWorkflowAgent } from "@/lib/agents/runner";

type RouteContext = {
  params: Promise<{ approvalId: string }>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function getRunMetadata(admin: SupabaseClient, runId: string) {
  const { data } = await admin
    .from("workflow_runs")
    .select("metadata")
    .eq("id", runId)
    .maybeSingle();

  return asRecord(asRecord(data).metadata);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { approvalId } = await context.params;
    const userContext = await requireUser();

    if (isRouteResponse(userContext)) {
      return userContext;
    }

    const { data: approval, error: approvalError } = await userContext.admin
      .from("workflow_approvals")
      .select("*")
      .eq("id", approvalId)
      .single();

    if (approvalError) {
      throw approvalError;
    }

    const approvalRecord = asRecord(approval);
    const agentId = stringValue(approvalRecord.agent_id);
    const runId = stringValue(approvalRecord.run_id);
    const nodeId = stringValue(approvalRecord.node_id);
    const messageId = stringValue(approvalRecord.message_id);

    if (!agentId || !runId) {
      return badRequest("Approval is missing workflow context.");
    }

    const auth = await requireAgentPermission(agentId, "agents.manage");
    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const decision = stringValue(body.decision);
    if (!["approved", "auto_approved", "rejected"].includes(decision)) {
      return badRequest("Decision must be approved, auto_approved, or rejected.");
    }

    const currentStatus = stringValue(approvalRecord.status, "pending");
    if (currentStatus !== "pending") {
      return badRequest("Approval was already decided.");
    }

    const decidedAt = new Date().toISOString();
    const { data: updatedApproval, error: updateError } = await auth.admin
      .from("workflow_approvals")
      .update({
        auto_approved: decision === "auto_approved",
        decided_at: decidedAt,
        decided_by: auth.user.id,
        status: decision,
      })
      .eq("id", approvalId)
      .eq("status", "pending")
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    if (messageId) {
      const { data: message } = await auth.admin
        .from("chat_messages")
        .select("metadata")
        .eq("id", messageId)
        .maybeSingle();
      const metadata = asRecord(asRecord(message).metadata);

      await auth.admin
        .from("chat_messages")
        .update({
          metadata: {
            ...metadata,
            approvalDecidedAt: decidedAt,
            approvalDecision: decision,
            status: decision,
          },
        })
        .eq("id", messageId);
    }

    await auth.admin.from("workflow_run_events").insert({
      event_type:
        decision === "rejected" ? "approval_rejected" : "approval_approved",
      message:
        decision === "auto_approved"
          ? "Approval auto-approved from chat."
          : decision === "approved"
            ? "Approval granted from chat."
            : "Approval rejected from chat.",
      metadata: { approvalId, decision },
      node_id: nodeId || null,
      run_id: runId,
    });

    await recordActivityLog(auth.admin, {
      action: `workflow.approval.${decision}`,
      actorId: auth.user.id,
      metadata: { agentId, approvalId, nodeId, runId },
      request,
      targetId: approvalId,
      targetType: "workflow_approval",
      workspaceId: stringValue(approvalRecord.workspace_id),
    });

    if (decision === "rejected") {
      await auth.admin
        .from("workflow_runs")
        .update({
          completed_at: decidedAt,
          metadata: {
            ...(await getRunMetadata(auth.admin, runId)),
            rejectedApprovalId: approvalId,
          },
          status: "canceled",
        })
        .eq("id", runId);

      return ok({ approval: updatedApproval, resumed: false });
    }

    const result = await runWorkflowAgent({
      admin: auth.admin,
      agentId,
      approvedApprovalId: approvalId,
      resumeRunId: runId,
      startedBy: auth.user.id,
      trigger: "manual",
    });

    return ok({ approval: updatedApproval, result, resumed: true });
  } catch (error) {
    return serverError(error);
  }
}
