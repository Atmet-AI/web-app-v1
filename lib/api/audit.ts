import type { SupabaseClient, User } from "@supabase/supabase-js";

type AuditClient = SupabaseClient;

type AuditMetadata = Record<string, unknown>;

type RecordActivityOptions = {
  action: string;
  actorId?: string | null;
  metadata?: AuditMetadata;
  request?: Request;
  targetId?: string | null;
  targetType?: string | null;
  workspaceId?: string | null;
};

type RecordSessionOptions = {
  event: string;
  metadata?: AuditMetadata;
  request?: Request;
  user?: Pick<User, "id" | "email"> | null;
  userId?: string | null;
  workspaceId?: string | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ipAddressFromRequest(request?: Request) {
  const forwardedFor = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request?.headers.get("x-real-ip") || null;
}

function requestMetadata(request?: Request): AuditMetadata {
  if (!request) {
    return {};
  }

  return {
    ipAddress: ipAddressFromRequest(request),
    method: request.method,
    path: new URL(request.url).pathname,
    userAgent: request.headers.get("user-agent"),
  };
}

function uuidOrNull(value?: string | null) {
  return value && uuidPattern.test(value) ? value : null;
}

export async function recordActivityLog(
  admin: AuditClient,
  {
    action,
    actorId,
    metadata,
    request,
    targetId,
    targetType,
    workspaceId,
  }: RecordActivityOptions,
) {
  const enrichedMetadata = {
    ...requestMetadata(request),
    ...(metadata ?? {}),
  };

  const { error } = await admin.from("admin_audit_logs").insert({
    action,
    actor_id: uuidOrNull(actorId),
    metadata: enrichedMetadata,
    target_id: uuidOrNull(targetId),
    target_type: targetType ?? null,
    workspace_id: uuidOrNull(workspaceId),
  });

  if (error) {
    console.warn("Failed to record admin activity log", error);
  }
}

export async function recordSessionLog(
  admin: AuditClient,
  { event, metadata, request, user, userId, workspaceId }: RecordSessionOptions,
) {
  const ipAddress = ipAddressFromRequest(request);
  const enrichedMetadata = {
    ...(metadata ?? {}),
    email: user?.email ?? metadata?.email ?? null,
    path: request ? new URL(request.url).pathname : null,
  };

  const { error } = await admin.from("session_logs").insert({
    event,
    ip_address: ipAddress,
    metadata: enrichedMetadata,
    user_agent: request?.headers.get("user-agent") ?? null,
    user_id: uuidOrNull(userId ?? user?.id),
    workspace_id: uuidOrNull(workspaceId),
  });

  if (error) {
    console.warn("Failed to record session log", error);
  }
}
