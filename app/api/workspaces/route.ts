import { isRouteResponse, requireUser } from "@/lib/api/auth";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";

export async function GET() {
  try {
    const context = await requireUser();

    if (isRouteResponse(context)) {
      return context;
    }

    const { data, error } = await context.supabase
      .from("workspace_members")
      .select("role, status, workspaces(*, workspace_subscriptions(*))")
      .eq("user_id", context.user.id)
      .eq("status", "active");

    if (error) {
      throw error;
    }

    return ok({ workspaces: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireUser();

    if (isRouteResponse(context)) {
      return context;
    }

    const body = await readJson(request);
    const name = stringValue(body.name);

    if (!name) {
      return badRequest("Workspace name is required");
    }

    const slugBase = stringValue(body.slug, name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { data: workspace, error } = await context.admin
      .from("workspaces")
      .insert({
        name,
        slug: `${slugBase || "workspace"}-${Date.now().toString(36)}`,
        avatar_url: stringValue(body.avatarUrl) || null,
        category: stringValue(body.category, "Workspace intelligence"),
        owner_id: context.user.id,
        created_by: context.user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await context.admin.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: context.user.id,
      role: "owner",
      status: "active",
      joined_at: new Date().toISOString(),
    });
    await context.admin.from("workspace_settings").insert({ workspace_id: workspace.id });
    await context.admin.from("workspace_brain").insert({ workspace_id: workspace.id });
    await context.admin.from("workspace_usage_controls").insert({ workspace_id: workspace.id });
    await context.admin.from("workspace_subscriptions").insert({
      workspace_id: workspace.id,
      plan_key: "pro",
      status: "active",
      billing_email: context.user.email,
    });

    return created({ workspace });
  } catch (error) {
    return serverError(error);
  }
}
