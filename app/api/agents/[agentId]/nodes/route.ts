import { isRouteResponse } from "@/lib/api/auth";
import { requireAgentPermission } from "@/lib/api/permissions";
import { created, ok, readJson, serverError, stringValue, numberValue } from "@/lib/api/http";

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
    const { data, error } = await auth.admin
      .from("workflow_nodes")
      .insert({
        agent_id: agentId,
        title: stringValue(body.title, "Empty chat"),
        runtime_state: stringValue(body.runtimeState, "paused"),
        status: stringValue(body.status, "ready"),
        source_chat_id: stringValue(body.sourceChatId) || null,
        app_keys: Array.isArray(body.appKeys) ? body.appKeys : [],
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

    const id = new URL(request.url).searchParams.get("id");
    const { error } = await auth.admin.from("workflow_nodes").delete().eq("id", id).eq("agent_id", agentId);

    if (error) {
      throw error;
    }

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
