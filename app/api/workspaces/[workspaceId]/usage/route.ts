import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { ok, readJson, serverError } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

type PeriodKey = "month" | "quarter" | "week";
type ScopeKey = "my" | "workspace";

function getPeriodStart(period: string) {
  const now = new Date();
  const key = ["month", "quarter", "week"].includes(period)
    ? (period as PeriodKey)
    : "month";

  if (key === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (key === "quarter") {
    return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  }

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getScope(value: string | null): ScopeKey {
  return value === "workspace" ? "workspace" : "my";
}

function getAttachmentStats(messages: Array<Record<string, unknown>>) {
  return messages.reduce<{ files: number; storageBytes: number }>(
    (acc, message) => {
      const metadata =
        message.metadata && typeof message.metadata === "object"
          ? (message.metadata as Record<string, unknown>)
          : {};
      const attachments = Array.isArray(metadata.attachments)
        ? metadata.attachments
        : [];

      for (const attachment of attachments) {
        if (!attachment || typeof attachment !== "object") {
          continue;
        }

        const record = attachment as Record<string, unknown>;
        acc.files += 1;
        acc.storageBytes += Number(record.size ?? 0);
      }

      return acc;
    },
    { files: 0, storageBytes: 0 },
  );
}

function getTokenTotal(runs: Array<Record<string, unknown>>) {
  return runs.reduce(
    (sum, run) =>
      sum + Number(run.input_tokens ?? 0) + Number(run.output_tokens ?? 0),
    0,
  );
}

function getStorageGb(bytes: number) {
  return Math.round((bytes / 1024 / 1024 / 1024) * 100) / 100;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const searchParams = new URL(request.url).searchParams;
    const scope = getScope(searchParams.get("scope"));
    const since = getPeriodStart(searchParams.get("period") ?? "month");
    const sinceIso = since.toISOString();
    const currentUserOnly = scope === "my";

    const [
      { data: chats, error: chatsError },
      { data: agents, error: agentsError },
      { data: runs, error: runsError },
      { data: limits, error: limitsError },
      { data: members, error: membersError },
      { data: controls, error: controlsError },
    ] = await Promise.all([
      auth.admin
        .from("chats")
        .select("id, user_id, created_at")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null),
      auth.admin
        .from("workflow_agents")
        .select("id, created_by, created_at")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .gte("created_at", sinceIso),
      auth.admin
        .from("ai_model_runs")
        .select("user_id, input_tokens, output_tokens, created_at")
        .eq("workspace_id", workspaceId)
        .gte("created_at", sinceIso),
      auth.admin
        .from("user_usage_limits")
        .select("*")
        .eq("workspace_id", workspaceId),
      auth.admin
        .from("workspace_members")
        .select("user_id, role, status, profiles:profiles!workspace_members_user_id_fkey(full_name, email, avatar_url)")
        .eq("workspace_id", workspaceId),
      auth.admin
        .from("workspace_usage_controls")
        .select("*")
        .or(`workspace_id.eq.${workspaceId},workspace_id.is.null`),
    ]);

    if (
      chatsError ||
      agentsError ||
      runsError ||
      limitsError ||
      membersError ||
      controlsError
    ) {
      throw (
        chatsError ??
        agentsError ??
        runsError ??
        limitsError ??
        membersError ??
        controlsError
      );
    }

    const scopedChats = (chats ?? []).filter(
      (chat) =>
        (!currentUserOnly || chat.user_id === auth.user.id) &&
        new Date(String(chat.created_at ?? 0)).getTime() >= since.getTime(),
    );
    const scopedFileChats = (chats ?? []).filter(
      (chat) => !currentUserOnly || chat.user_id === auth.user.id,
    );
    const scopedAgents = (agents ?? []).filter(
      (agent) => !currentUserOnly || agent.created_by === auth.user.id,
    );
    const scopedRuns = (runs ?? []).filter(
      (run) => !currentUserOnly || run.user_id === auth.user.id,
    );
    const chatOwnerById = new Map(
      (chats ?? [])
        .map(
          (chat) =>
            [String(chat.id ?? ""), String(chat.user_id ?? "")] as const,
        )
        .filter(([chatId]) => Boolean(chatId)),
    );
    const chatIds = scopedFileChats
      .map((chat) => String(chat.id ?? ""))
      .filter(Boolean);

    let messages: Array<Record<string, unknown>> = [];
    if (chatIds.length > 0) {
      const { data, error } = await auth.admin
        .from("chat_messages")
        .select("metadata, chat_id, created_at")
        .in("chat_id", chatIds)
        .gte("created_at", sinceIso);

      if (error) {
        throw error;
      }

      messages = (data ?? []) as Array<Record<string, unknown>>;
    }

    const attachmentStats = getAttachmentStats(messages);
    const attachmentStatsByUserId = new Map<
      string,
      { files: number; storageBytes: number }
    >();
    for (const message of messages) {
      const chatId = String(message.chat_id ?? "");
      const userId = chatOwnerById.get(chatId) ?? "";
      if (!userId) {
        continue;
      }

      const stats = getAttachmentStats([message]);
      const current = attachmentStatsByUserId.get(userId) ?? {
        files: 0,
        storageBytes: 0,
      };
      attachmentStatsByUserId.set(userId, {
        files: current.files + stats.files,
        storageBytes: current.storageBytes + stats.storageBytes,
      });
    }
    const limitsByUserId = new Map(
      (limits ?? []).map((limit) => [String(limit.user_id), limit]),
    );
    const tokenRunsByUserId = new Map<string, number>();

    for (const run of runs ?? []) {
      const userId = String(run.user_id ?? "");
      if (!userId) {
        continue;
      }

      tokenRunsByUserId.set(
        userId,
        (tokenRunsByUserId.get(userId) ?? 0) +
          Number(run.input_tokens ?? 0) +
          Number(run.output_tokens ?? 0),
      );
    }

    const userLimits = (members ?? []).map((member) => {
      const userId = String(member.user_id ?? "");
      const limit = limitsByUserId.get(userId) ?? {};

      return {
        ...limit,
        files_used: attachmentStatsByUserId.get(userId)?.files ?? 0,
        monthly_token_cap: Number(limit.monthly_token_cap ?? 0),
        profiles: member.profiles,
        role: member.role,
        status: member.status,
        storage_gb: getStorageGb(
          attachmentStatsByUserId.get(userId)?.storageBytes ?? 0,
        ),
        tokens_used: tokenRunsByUserId.get(userId) ?? 0,
        user_id: userId,
        workspace_id: workspaceId,
      };
    });

    const tokens = getTokenTotal(scopedRuns as Array<Record<string, unknown>>);
    const workspaceControls =
      (controls ?? []).find((control) => control.workspace_id === workspaceId) ??
      {};
    const globalControls =
      (controls ?? []).find((control) => !control.workspace_id) ?? {};
    const tokenLimit = Number(
      workspaceControls.monthly_token_limit ??
        globalControls.monthly_token_limit ??
        50000,
    );
    const totals = {
      automation_runs: scopedAgents.length,
      chats: scopedChats.length,
      files: attachmentStats.files,
      storage_gb: getStorageGb(attachmentStats.storageBytes),
      storage_limit_gb: Number(
        workspaceControls.storage_limit_gb ??
          globalControls.storage_limit_gb ??
          25,
      ),
      agent_limit: Number(
        workspaceControls.agent_limit ?? globalControls.agent_limit ?? 25,
      ),
      token_limit: Number.isFinite(tokenLimit) ? tokenLimit : 50000,
      tokens,
    };

    return ok({
      events: [],
      totals,
      userLimits,
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "usage.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const userId = typeof body.userId === "string" ? body.userId : "";
    const monthlyTokenCap =
      body.monthlyTokenCap === null || body.monthlyTokenCap === ""
        ? null
        : Math.max(0, Number.parseInt(String(body.monthlyTokenCap), 10) || 0);

    const { data, error } = await auth.admin
      .from("user_usage_limits")
      .upsert({
        monthly_token_cap: monthlyTokenCap,
        user_id: userId,
        workspace_id: workspaceId,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ limit: data });
  } catch (error) {
    return serverError(error);
  }
}
