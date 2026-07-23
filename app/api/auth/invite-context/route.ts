import crypto from "node:crypto";
import { badRequest, ok, serverError } from "@/lib/api/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token")?.trim() ?? "";
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const admin = createSupabaseAdminClient();

    let inviteQuery = admin
      .from("workspace_invites")
      .select("id, workspace_id, email, invited_by")
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (token) {
      inviteQuery = inviteQuery.eq(
        "token_hash",
        crypto.createHash("sha256").update(token).digest("hex"),
      );
    } else if (user?.email) {
      inviteQuery = inviteQuery.eq("email", user.email.toLowerCase());
    } else {
      return badRequest("Invite token is required");
    }

    const { data: invites, error: inviteError } = await inviteQuery;

    if (inviteError) {
      throw inviteError;
    }

    const invite = invites?.[0];

    if (!invite) {
      return badRequest("Invite is invalid or expired");
    }

    if (
      user?.email &&
      stringValue(invite.email).toLowerCase() !== user.email.toLowerCase()
    ) {
      return badRequest("This invite belongs to another email address");
    }

    const { data: workspace, error: workspaceError } = await admin
      .from("workspaces")
      .select("id, name, avatar_url, owner_id")
      .eq("id", invite.workspace_id)
      .single();

    if (workspaceError) {
      throw workspaceError;
    }

    const adminProfileId = stringValue(invite.invited_by, stringValue(workspace.owner_id));
    const { data: adminProfile, error: adminProfileError } = adminProfileId
      ? await admin
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", adminProfileId)
          .maybeSingle()
      : { data: null, error: null };

    if (adminProfileError) {
      throw adminProfileError;
    }

    return ok({
      admin: {
        avatarUrl: stringValue(adminProfile?.avatar_url),
        name: stringValue(
          adminProfile?.full_name,
          stringValue(adminProfile?.email, "Workspace admin"),
        ),
      },
      invite: {
        email: invite.email,
        id: invite.id,
      },
      workspace: {
        avatarUrl: stringValue(workspace.avatar_url),
        id: workspace.id,
        name: stringValue(workspace.name, "Workspace"),
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
