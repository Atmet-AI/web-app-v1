import { isRouteResponse, requireUser } from "@/lib/api/auth";
import { badRequest, created, jsonObject, ok, readJson, serverError, stringValue } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const context = await requireUser();

    if (isRouteResponse(context)) {
      return context;
    }

    const body = await readJson(request);
    const password = stringValue(body.password);
    const inviteToken = stringValue(body.inviteToken);
    const profile = jsonObject(body.profile);
    const workspace = jsonObject(body.workspace);

    if (password) {
      const { error } = await context.supabase.auth.updateUser({ password });

      if (error) {
        return badRequest(error.message);
      }
    }

    const fullName = stringValue(profile.fullName);
    const avatarUrl = stringValue(profile.avatarUrl);
    const roleTitle = stringValue(profile.roleTitle);
    const timezone = stringValue(profile.timezone, "Asia/Amman");

    const { error: profileError } = await context.admin.from("profiles").upsert({
      id: context.user.id,
      email: context.user.email ?? "",
      full_name: fullName || context.user.user_metadata?.full_name || null,
      avatar_url: avatarUrl || null,
      role_title: roleTitle || null,
      timezone,
      onboarded_at: new Date().toISOString(),
    });

    if (profileError) {
      throw profileError;
    }

    if (inviteToken) {
      const { data, error } = await context.supabase.rpc("accept_workspace_invite", {
        invite_token: inviteToken,
      });

      if (error) {
        return badRequest(error.message);
      }

      return ok({ workspaceId: data, invited: true });
    }

    const workspaceName = stringValue(workspace.name);

    if (!workspaceName) {
      return ok({ success: true });
    }

    const slugBase = stringValue(workspace.slug, workspaceName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${slugBase || "workspace"}-${Date.now().toString(36)}`;

    const { data: createdWorkspace, error: workspaceError } = await context.admin
      .from("workspaces")
      .insert({
        name: workspaceName,
        slug,
        category: stringValue(workspace.category, "Workspace intelligence"),
        avatar_url: stringValue(workspace.avatarUrl) || null,
        owner_id: context.user.id,
        created_by: context.user.id,
      })
      .select("id, name, slug")
      .single();

    if (workspaceError) {
      throw workspaceError;
    }

    await context.admin.from("workspace_members").insert({
      workspace_id: createdWorkspace.id,
      user_id: context.user.id,
      role: "owner",
      status: "active",
      joined_at: new Date().toISOString(),
    });

    await context.admin.from("workspace_settings").insert({ workspace_id: createdWorkspace.id });
    await context.admin.from("workspace_brain").insert({ workspace_id: createdWorkspace.id });
    await context.admin.from("workspace_usage_controls").insert({ workspace_id: createdWorkspace.id });
    await context.admin.from("workspace_subscriptions").insert({
      workspace_id: createdWorkspace.id,
      plan_key: "pro",
      status: "active",
      billing_email: context.user.email,
    });

    return created({ workspace: createdWorkspace });
  } catch (error) {
    return serverError(error);
  }
}
