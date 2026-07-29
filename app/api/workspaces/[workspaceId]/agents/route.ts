import type { SupabaseClient } from "@supabase/supabase-js";
import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { deriveAppKeysFromChatMessages } from "@/lib/agents/app-keys";

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

    const { data, error } = await auth.supabase
      .from("workflow_agents")
      .select("*, workflow_nodes(*), workflow_edges(*)")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const agents = await hydrateMissingNodeAppKeys(auth.admin, data ?? []);

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

    if (!name) {
      return badRequest("Agent name is required");
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
        schedule: stringValue(body.schedule) || null,
        settings: body.settings ?? {},
        created_by: auth.user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

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
