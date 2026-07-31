import { isRouteResponse } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { requireAgentPermission, requireChatPermission } from "@/lib/api/permissions";
import { created, ok, readJson, serverError, stringValue, numberValue } from "@/lib/api/http";
import { deriveAppKeysFromChatMessages } from "@/lib/agents/app-keys";
import { createAgentVersionSnapshot } from "@/lib/agents/versions";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const sourceChatId = stringValue(body.sourceChatId);
    let appKeys = Array.isArray(body.appKeys)
      ? body.appKeys.map((item) => stringValue(item)).filter(Boolean)
      : [];
    if (sourceChatId) {
      const chatAuth = await requireChatPermission(sourceChatId, "chats.manage");
      if (isRouteResponse(chatAuth)) {
        return chatAuth;
      }

      if (appKeys.length === 0) {
        const { data: chatMessages, error: chatMessagesError } = await auth.admin
          .from("chat_messages")
          .select("content, metadata")
          .eq("chat_id", sourceChatId)
          .order("created_at", { ascending: false })
          .limit(200);

        if (chatMessagesError) {
          throw chatMessagesError;
        }

        appKeys = deriveAppKeysFromChatMessages(chatMessages ?? []);
      }
    }

    const { data, error } = await auth.admin
      .from("workflow_nodes")
      .insert({
        agent_id: agentId,
        title: stringValue(body.title, "Empty chat"),
        runtime_state: stringValue(body.runtimeState, "paused"),
        status: stringValue(body.status, "ready"),
        source_chat_id: sourceChatId || null,
        app_keys: appKeys,
        position_x: numberValue(body.x, 120),
        position_y: numberValue(body.y, 120),
        config: body.config ?? {},
        highlighted_until: body.highlighted ? new Date(Date.now() + 7000).toISOString() : null,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await createAgentVersionSnapshot({
      admin: auth.admin,
      agentId,
      changeType: "node.created",
      createdBy: auth.user.id,
      summary: `Created node "${data.title}".`,
    });

    await recordActivityLog(auth.admin, {
      action: "agent.node.created",
      actorId: auth.user.id,
      metadata: {
        appKeys: data.app_keys,
        nodeTitle: data.title,
        position: { x: data.position_x, y: data.position_y },
        sourceChatId: data.source_chat_id,
      },
      request,
      targetId: data.id,
      targetType: "workflow_node",
    });

    return created({ node: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const id = stringValue(body.id);
    const { data, error } = await auth.admin
      .from("workflow_nodes")
      .update({
        title: stringValue(body.title) || undefined,
        runtime_state: stringValue(body.runtimeState) || undefined,
        status: stringValue(body.status) || undefined,
        position_x: typeof body.x === "number" ? body.x : undefined,
        position_y: typeof body.y === "number" ? body.y : undefined,
        app_keys: Array.isArray(body.appKeys) ? body.appKeys : undefined,
        config: body.config ?? undefined,
      })
      .eq("id", id)
      .eq("agent_id", agentId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await createAgentVersionSnapshot({
      admin: auth.admin,
      agentId,
      changeType: "node.updated",
      createdBy: auth.user.id,
      summary: `Updated node "${data.title}".`,
    });

    await recordActivityLog(auth.admin, {
      action: "agent.node.updated",
      actorId: auth.user.id,
      metadata: {
        appKeys: data.app_keys,
        nodeTitle: data.title,
        position: { x: data.position_x, y: data.position_y },
        runtimeState: data.runtime_state,
        status: data.status,
      },
      request,
      targetId: id,
      targetType: "workflow_node",
    });

    return ok({ node: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const auth = await requireAgentPermission(agentId, "agents.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get("id");
    const sourceChatId = searchParams.get("sourceChatId");
    let query = auth.admin.from("workflow_nodes").delete().eq("agent_id", agentId);

    if (sourceChatId) {
      query = query.eq("source_chat_id", sourceChatId);
    } else {
      query = query.eq("id", id);
    }

    const { error } = await query;

    if (error) {
      throw error;
    }

    await createAgentVersionSnapshot({
      admin: auth.admin,
      agentId,
      changeType: "node.deleted",
      createdBy: auth.user.id,
      summary: "Deleted a workflow node.",
    });

    await recordActivityLog(auth.admin, {
      action: "agent.node.deleted",
      actorId: auth.user.id,
      metadata: {
        agentId,
        sourceChatId,
      },
      request,
      targetId: id,
      targetType: "workflow_node",
    });

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
