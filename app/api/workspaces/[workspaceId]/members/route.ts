import crypto from "node:crypto";
import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
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

    const { error: inviteError } = await auth.admin.auth.admin.inviteUserByEmail(email, {
      data: {
        workspace_id: workspaceId,
        workspace_invite_id: data.id,
        invited_by: auth.user.id,
      },
      redirectTo: signupUrl,
    });

    if (inviteError) {
      const existingUserError = inviteError.message
        .toLowerCase()
        .includes("already");

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

    return created({
      invite: data,
      signupUrl,
    });
  } catch (error) {
    return serverError(error);
  }
}
