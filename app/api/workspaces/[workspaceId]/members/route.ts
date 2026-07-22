import crypto from "node:crypto";
import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.supabase
      .from("workspace_members")
      .select("*, profiles(*)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return ok({ members: data });
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
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const signupUrl = `${origin}/signup?invite=${rawToken}`;

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
      throw inviteError;
    }

    return created({
      invite: data,
      signupUrl,
    });
  } catch (error) {
    return serverError(error);
  }
}
