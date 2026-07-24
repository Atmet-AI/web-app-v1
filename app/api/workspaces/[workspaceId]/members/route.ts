import crypto from "node:crypto";
import {
  isRouteResponse,
  requireWorkspacePermission,
  type ApiAuthContext,
} from "@/lib/api/auth";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { hasTransactionalMailConfig, sendTransactionalMail } from "@/lib/mail/smtp";
import { workspaceInviteEmail } from "@/lib/mail/templates";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isAlreadyRegisteredError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("already") || message.includes("registered");
}

function getInvitePath(signupUrl: string) {
  try {
    const parsedSignupUrl = new URL(signupUrl);
    return `${parsedSignupUrl.pathname}${parsedSignupUrl.search}`;
  } catch {
    return signupUrl.startsWith("/") ? signupUrl : "/signup";
  }
}

function getAppConfirmLink({
  signupUrl,
  tokenHash,
  type,
}: {
  signupUrl: string;
  tokenHash: string;
  type: string;
}) {
  const origin = new URL(signupUrl).origin;
  const confirmUrl = new URL("/auth/confirm", origin);

  confirmUrl.searchParams.set("token_hash", tokenHash);
  confirmUrl.searchParams.set("type", type);
  confirmUrl.searchParams.set("next", getInvitePath(signupUrl));

  return confirmUrl.toString();
}

async function createInviteNotifications({
  auth,
  email,
  invite,
  workspaceId,
}: {
  auth: ApiAuthContext;
  email: string;
  invite: Record<string, unknown>;
  workspaceId: string;
}) {
  const [{ data: workspace }, { data: inviterProfile }, { data: inviteeProfile }] =
    await Promise.all([
      auth.admin.from("workspaces").select("name").eq("id", workspaceId).maybeSingle(),
      auth.admin.from("profiles").select("full_name, email").eq("id", auth.user.id).maybeSingle(),
      auth.admin.from("profiles").select("id").eq("email", email).maybeSingle(),
    ]);
  const workspaceName = stringValue(workspace?.name, "Atmet Workspace");
  const inviterName = stringValue(
    inviterProfile?.full_name,
    stringValue(inviterProfile?.email, "A workspace admin"),
  );
  const inviteId = stringValue(invite.id);
  const notifications = [
    {
      action_status: "pending",
      actor_id: auth.user.id,
      body: `${email} has not accepted ${workspaceName} yet.`,
      invite_id: inviteId,
      metadata: {
        invitedEmail: email,
        inviterName,
        workspaceName,
      },
      status: "unread",
      title: "Invite sent",
      type: "workspace_invite_sent",
      user_id: auth.user.id,
      workspace_id: workspaceId,
    },
  ];

  const inviteeId = stringValue(inviteeProfile?.id);
  if (inviteeId && inviteeId !== auth.user.id) {
    notifications.push({
      action_status: "pending",
      actor_id: auth.user.id,
      body: `${inviterName} invited you to ${workspaceName}.`,
      invite_id: inviteId,
      metadata: {
        invitedEmail: email,
        inviterName,
        workspaceName,
      },
      status: "unread",
      title: "Workspace invite",
      type: "workspace_invite",
      user_id: inviteeId,
      workspace_id: workspaceId,
    });
  }

  const { data, error } = await auth.admin
    .from("notifications")
    .insert(notifications)
    .select("*");

  if (error) {
    console.error("Could not create invite notifications", error);
    return [];
  }

  return data ?? [];
}

async function generateWorkspaceInviteActionLink({
  auth,
  email,
  signupUrl,
  workspaceId,
  workspaceInviteId,
}: {
  auth: ApiAuthContext;
  email: string;
  signupUrl: string;
  workspaceId: string;
  workspaceInviteId: string;
}) {
  const inviteResult = await auth.admin.auth.admin.generateLink({
    email,
    options: {
      data: {
        invited_by: auth.user.id,
        workspace_id: workspaceId,
        workspace_invite_id: workspaceInviteId,
      },
      redirectTo: signupUrl,
    },
    type: "invite",
  });

  if (!inviteResult.error) {
    const properties = inviteResult.data.properties;
    return properties?.hashed_token
      ? getAppConfirmLink({
          signupUrl,
          tokenHash: properties.hashed_token,
          type: properties.verification_type ?? "invite",
        })
      : properties?.action_link ?? "";
  }

  if (!isAlreadyRegisteredError(inviteResult.error)) {
    throw inviteResult.error;
  }

  const magicLinkResult = await auth.admin.auth.admin.generateLink({
    email,
    options: {
      redirectTo: signupUrl,
    },
    type: "magiclink",
  });

  if (magicLinkResult.error) {
    throw magicLinkResult.error;
  }

  const properties = magicLinkResult.data.properties;
  return properties?.hashed_token
    ? getAppConfirmLink({
        signupUrl,
        tokenHash: properties.hashed_token,
        type: properties.verification_type ?? "magiclink",
      })
    : properties?.action_link ?? "";
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const rows = (data ?? []).map((member) => toRecord(member));
    const userIds = rows
      .map((member) => member.user_id)
      .filter((userId): userId is string => typeof userId === "string");
    const { data: profileRows } = await auth.admin
      .from("profiles")
      .select("*")
      .in("id", userIds);
    const profilesById = new Map(
      (profileRows ?? []).map((profile) => [String(profile.id), toRecord(profile)]),
    );
    const members = rows.map((member) => {
      const userId = typeof member.user_id === "string" ? member.user_id : "";
      const storedProfile = profilesById.get(userId) ?? {};

      return {
        ...member,
        profiles: {
          ...storedProfile,
          avatar_url: storedProfile.avatar_url ?? null,
          email: storedProfile.email ?? "",
          full_name: storedProfile.full_name ?? "",
          last_seen_at:
            storedProfile.last_seen_at ??
            (userId === auth.user.id ? auth.user.last_sign_in_at : null) ??
            null,
        },
      };
    });

    return ok({ members });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "members.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const email = stringValue(body.email).toLowerCase();
    const role = stringValue(body.role, "member");

    if (!email) {
      return badRequest("Email is required");
    }

    const rawToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const requestOrigin = new URL(request.url).origin;
    const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;
    const origin =
      configuredOrigin && !configuredOrigin.includes("localhost")
        ? configuredOrigin
        : requestOrigin;
    const signupUrl = `${origin}/signup?invite=${rawToken}&type=invite`;

    const { data, error } = await auth.admin
      .from("workspace_invites")
      .insert({
        workspace_id: workspaceId,
        email,
        role: ["admin", "member", "viewer"].includes(role) ? role : "member",
        token_hash: tokenHash,
        invited_by: auth.user.id,
      })
      .select("id, workspace_id, email, role, expires_at, created_at")
      .single();

    if (error) {
      throw error;
    }

    if (hasTransactionalMailConfig()) {
      const [
        { data: workspace },
        { data: inviterProfile },
      ] = await Promise.all([
        auth.admin.from("workspaces").select("name").eq("id", workspaceId).maybeSingle(),
        auth.admin.from("profiles").select("full_name, email").eq("id", auth.user.id).maybeSingle(),
      ]);
      const actionLink = await generateWorkspaceInviteActionLink({
        auth,
        email,
        signupUrl,
        workspaceId,
        workspaceInviteId: data.id,
      });

      if (!actionLink) {
        await auth.admin.from("workspace_invites").delete().eq("id", data.id);
        throw new Error("Supabase did not generate an invite link.");
      }

      await sendTransactionalMail({
        html: workspaceInviteEmail({
          actionLink,
          inviterName: stringValue(inviterProfile?.full_name, stringValue(inviterProfile?.email)),
          role: data.role,
          workspaceName: stringValue(workspace?.name, "Atmet Workspace"),
        }),
        subject: "You were invited to Atmet",
        text: [
          `${stringValue(inviterProfile?.full_name, "A workspace admin")} invited you to ${stringValue(workspace?.name, "an Atmet workspace")}.`,
          "",
          "Accept the invite and finish setup:",
          actionLink,
        ].join("\n"),
        to: email,
      });
      const notifications = await createInviteNotifications({
        auth,
        email,
        invite: data,
        workspaceId,
      });

      return created({
        invite: data,
        notifications,
        signupUrl,
      });
    }

    const { error: inviteError } = await auth.admin.auth.admin.inviteUserByEmail(email, {
      data: {
        workspace_id: workspaceId,
        workspace_invite_id: data.id,
        invited_by: auth.user.id,
      },
      redirectTo: signupUrl,
    });

    if (inviteError) {
      const existingUserError = isAlreadyRegisteredError(inviteError);

      if (!existingUserError) {
        await auth.admin.from("workspace_invites").delete().eq("id", data.id);
        throw inviteError;
      }

      const { error: magicLinkError } = await auth.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: signupUrl,
          shouldCreateUser: false,
        },
      });

      if (magicLinkError) {
        await auth.admin.from("workspace_invites").delete().eq("id", data.id);
        throw magicLinkError;
      }
    }

    const notifications = await createInviteNotifications({
      auth,
      email,
      invite: data,
      workspaceId,
    });

    return created({
      invite: data,
      notifications,
      signupUrl,
    });
  } catch (error) {
    return serverError(error);
  }
}
