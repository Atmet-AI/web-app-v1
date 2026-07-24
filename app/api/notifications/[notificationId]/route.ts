import { isRouteResponse, requireUser } from "@/lib/api/auth";
import {
  badRequest,
  notFound,
  ok,
  readJson,
  serverError,
  stringValue,
} from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ notificationId: string }>;
};

type AuthContext = Exclude<Awaited<ReturnType<typeof requireUser>>, Response>;

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function nameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "User";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ") || "User";
}

async function loadNotifications(auth: AuthContext) {
  const { data, error } = await auth.admin
    .from("notifications")
    .select("*")
    .eq("user_id", auth.user.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function notifyInviter({
  actionStatus,
  auth,
  invite,
}: {
  actionStatus: "accepted" | "rejected";
  auth: AuthContext;
  invite: Record<string, unknown>;
}) {
  const inviterId = stringValue(invite.invited_by);
  const workspaceId = stringValue(invite.workspace_id);
  const inviteId = stringValue(invite.id);

  if (!inviterId) {
    return;
  }

  const [{ data: workspace }, { data: actorProfile }] = await Promise.all([
    auth.admin.from("workspaces").select("name").eq("id", workspaceId).maybeSingle(),
    auth.admin.from("profiles").select("full_name, email").eq("id", auth.user.id).maybeSingle(),
  ]);
  const actorName = stringValue(actorProfile?.full_name, nameFromEmail(auth.user.email ?? ""));
  const workspaceName = stringValue(workspace?.name, "Atmet Workspace");
  const title = actionStatus === "accepted" ? "Invite accepted" : "Invite declined";
  const body =
    actionStatus === "accepted"
      ? `${actorName} accepted the invite to ${workspaceName}.`
      : `${actorName} declined the invite to ${workspaceName}.`;
  const type =
    actionStatus === "accepted" ? "workspace_invite_accepted" : "workspace_invite_rejected";
  const now = new Date().toISOString();
  const metadata = {
    invitedEmail: stringValue(invite.email),
    workspaceName,
  };

  const { data: updated, error: updateError } = await auth.admin
    .from("notifications")
    .update({
      action_status: actionStatus,
      body,
      metadata,
      status: "unread",
      title,
      type,
      updated_at: now,
    })
    .eq("invite_id", inviteId)
    .eq("user_id", inviterId)
    .eq("type", "workspace_invite_sent")
    .select("id");

  if (updateError) {
    throw updateError;
  }

  if (updated && updated.length > 0) {
    return;
  }

  const { error: insertError } = await auth.admin.from("notifications").insert({
    action_status: actionStatus,
    actor_id: auth.user.id,
    body,
    invite_id: inviteId,
    metadata,
    status: "unread",
    title,
    type,
    user_id: inviterId,
    workspace_id: workspaceId || null,
  });

  if (insertError) {
    throw insertError;
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { notificationId } = await context.params;
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const action = stringValue(body.action, "read");
    const now = new Date().toISOString();
    const { data: notification, error: notificationError } = await auth.admin
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (notificationError) {
      throw notificationError;
    }

    if (!notification) {
      return notFound("Notification was not found");
    }

    if (action === "read") {
      await auth.admin
        .from("notifications")
        .update({ read_at: now, status: "read" })
        .eq("id", notificationId)
        .eq("user_id", auth.user.id);

      return ok({ notifications: await loadNotifications(auth) });
    }

    if (action !== "accept" && action !== "reject") {
      return badRequest("Unsupported notification action");
    }

    const notificationRecord = toRecord(notification);
    const inviteId = stringValue(notificationRecord.invite_id);
    if (stringValue(notificationRecord.type) !== "workspace_invite" || !inviteId) {
      return badRequest("This notification cannot be accepted or rejected");
    }

    const { data: invite, error: inviteError } = await auth.admin
      .from("workspace_invites")
      .select("id, workspace_id, email, role, invited_by, accepted_at, expires_at")
      .eq("id", inviteId)
      .maybeSingle();

    if (inviteError) {
      throw inviteError;
    }

    if (!invite) {
      return badRequest("Invite was not found");
    }

    const inviteRecord = toRecord(invite);
    const invitedEmail = stringValue(inviteRecord.email).toLowerCase();
    const userEmail = (auth.user.email ?? "").toLowerCase();
    if (invitedEmail !== userEmail) {
      return badRequest("This invite belongs to another email address");
    }

    const actionStatus = action === "accept" ? "accepted" : "rejected";

    if (action === "accept" && !inviteRecord.accepted_at) {
      const { error: membershipError } = await auth.admin
        .from("workspace_members")
        .upsert({
          invited_by: stringValue(inviteRecord.invited_by) || null,
          joined_at: now,
          role: stringValue(inviteRecord.role, "member"),
          status: "active",
          updated_at: now,
          user_id: auth.user.id,
          workspace_id: stringValue(inviteRecord.workspace_id),
        });

      if (membershipError) {
        throw membershipError;
      }

      const { error: inviteUpdateError } = await auth.admin
        .from("workspace_invites")
        .update({
          accepted_at: now,
          accepted_by: auth.user.id,
        })
        .eq("id", inviteId);

      if (inviteUpdateError) {
        throw inviteUpdateError;
      }
    }

    if (action === "reject" && !inviteRecord.accepted_at) {
      const { error: inviteUpdateError } = await auth.admin
        .from("workspace_invites")
        .update({ expires_at: now })
        .eq("id", inviteId);

      if (inviteUpdateError) {
        throw inviteUpdateError;
      }
    }

    const { error: currentNotificationError } = await auth.admin
      .from("notifications")
      .update({
        action_status: actionStatus,
        read_at: now,
        status: "read",
      })
      .eq("id", notificationId)
      .eq("user_id", auth.user.id);

    if (currentNotificationError) {
      throw currentNotificationError;
    }

    await notifyInviter({ actionStatus, auth, invite: inviteRecord });

    return ok({ notifications: await loadNotifications(auth) });
  } catch (error) {
    return serverError(error);
  }
}
