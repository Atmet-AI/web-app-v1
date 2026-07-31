import type { SupabaseClient } from "@supabase/supabase-js";
import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { deriveAppKeysFromChatMessages } from "@/lib/agents/app-keys";
import { createAgentVersionSnapshot } from "@/lib/agents/versions";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function hydrateMissingNodeAppKeys(
  admin: SupabaseClient,
  agents: unknown[],
) {
  const sourceChatIds = Array.from(
    new Set(
      agents.flatMap((agent) => {
        const workflowNodes = asRecord(agent).workflow_nodes;
        const nodes: unknown[] = Array.isArray(workflowNodes)
          ? workflowNodes
          : [];

        return nodes
          .filter((node: unknown) => {
            const record = asRecord(node);
            return (
              stringValue(record.source_chat_id) &&
              (!Array.isArray(record.app_keys) || record.app_keys.length === 0)
            );
          })
          .map((node: unknown) => stringValue(asRecord(node).source_chat_id));
      }),
    ),
  ).filter(Boolean);

  if (sourceChatIds.length === 0) {
    return agents;
  }

  const { data: chatMessages, error } = await admin
    .from("chat_messages")
    .select("chat_id, content, metadata")
    .in("chat_id", sourceChatIds)
    .order("created_at", { ascending: false })
    .limit(sourceChatIds.length * 200);

  if (error) {
    throw error;
  }

  const appKeysByChatId = new Map<string, string[]>();
  for (const chatId of sourceChatIds) {
    const messages = (chatMessages ?? []).filter(
      (message) => stringValue(message.chat_id) === chatId,
    );
    appKeysByChatId.set(chatId, deriveAppKeysFromChatMessages(messages));
  }

  return agents.map((agent) => {
    const agentRecord = asRecord(agent);
    const workflowNodes = Array.isArray(agentRecord.workflow_nodes)
      ? agentRecord.workflow_nodes
      : [];

    return {
      ...agentRecord,
      workflow_nodes: workflowNodes.map((node: unknown) => {
        const nodeRecord = asRecord(node);
        const sourceChatId = stringValue(nodeRecord.source_chat_id);
        const currentAppKeys = Array.isArray(nodeRecord.app_keys)
          ? nodeRecord.app_keys
          : [];

        if (currentAppKeys.length > 0 || !sourceChatId) {
          return nodeRecord;
        }

        return {
          ...nodeRecord,
          app_keys: appKeysByChatId.get(sourceChatId) ?? [],
        };
      }),
    };
  });
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const [
      { data, error },
      { data: agentMemberships, error: agentMembershipsError },
      { data: isSuperAdmin, error: superAdminError },
    ] = await Promise.all([
      auth.admin
        .from("workflow_agents")
        .select("*, workflow_nodes(*), workflow_edges(*)")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      auth.admin
        .from("workflow_agent_members")
        .select("agent_id")
        .eq("user_id", auth.user.id),
      auth.supabase.rpc("is_super_admin", { target_user_id: auth.user.id }),
    ]);

    if (error || agentMembershipsError || superAdminError) {
      throw error ?? agentMembershipsError ?? superAdminError;
    }

    const assignedAgentIds = new Set(
      (agentMemberships ?? [])
        .map((membership) => stringValue(membership.agent_id))
        .filter(Boolean),
    );
    const visibleAgents =
      isSuperAdmin === true
        ? (data ?? [])
        : (data ?? []).filter(
            (agent) =>
              stringValue(agent.created_by) === auth.user.id ||
              assignedAgentIds.has(stringValue(agent.id)),
          );

    const agents = await hydrateMissingNodeAppKeys(auth.admin, visibleAgents);

    return ok({ agents });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const name = stringValue(body.name);
    const schedule = stringValue(body.schedule);

    if (!name) {
      return badRequest("Agent name is required");
    }

    const [
      { count: currentAgentCount, error: countError },
      { data: usageControls, error: usageControlsError },
    ] = await Promise.all([
      auth.admin
        .from("workflow_agents")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null),
      auth.admin
        .from("workspace_usage_controls")
        .select("*")
        .or(`workspace_id.eq.${workspaceId},workspace_id.is.null`),
    ]);

    if (countError || usageControlsError) {
      throw countError ?? usageControlsError;
    }

    const workspaceControls =
      (usageControls ?? []).find((control) => control.workspace_id === workspaceId) ??
      {};
    const globalControls =
      (usageControls ?? []).find((control) => !control.workspace_id) ?? {};
    const enforceLimits =
      typeof workspaceControls.enforce_workspace_limits === "boolean"
        ? workspaceControls.enforce_workspace_limits
        : typeof globalControls.enforce_workspace_limits === "boolean"
          ? globalControls.enforce_workspace_limits
          : true;
    const agentLimit = Number(
      workspaceControls.agent_limit ?? globalControls.agent_limit ?? 25,
    );

    if (
      enforceLimits &&
      Number.isFinite(agentLimit) &&
      agentLimit > 0 &&
      (currentAgentCount ?? 0) >= agentLimit
    ) {
      return badRequest(`This workspace has reached its ${agentLimit} agent limit.`);
    }

    const { data, error } = await auth.admin
      .from("workflow_agents")
      .insert({
        workspace_id: workspaceId,
        name,
        status: stringValue(body.status, "draft"),
        runtime_state: stringValue(body.runtimeState, "paused"),
        gradient: stringValue(body.gradient) || null,
        tone: stringValue(body.tone) || null,
        schedule: schedule === "manual" ? null : schedule || null,
        settings: body.settings ?? {},
        created_by: auth.user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const { error: memberError } = await auth.admin
      .from("workflow_agent_members")
      .upsert(
        {
          agent_id: data.id,
          assigned_by: auth.user.id,
          role: "owner",
          user_id: auth.user.id,
        },
        { onConflict: "agent_id,user_id" },
      );

    if (memberError) {
      throw memberError;
    }

    await createAgentVersionSnapshot({
      admin: auth.admin,
      agentId: data.id,
      changeType: "agent.created",
      createdBy: auth.user.id,
      summary: "Agent created.",
    });

    await recordActivityLog(auth.admin, {
      action: "agent.created",
      actorId: auth.user.id,
      metadata: {
        agentName: data.name,
        runtimeState: data.runtime_state,
        schedule: data.schedule,
        status: data.status,
      },
      request,
      targetId: data.id,
      targetType: "agent",
      workspaceId,
    });

    return created({ agent: data });
  } catch (error) {
    return serverError(error);
  }
}
