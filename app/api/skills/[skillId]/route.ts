import { isRouteResponse, requireUser, requireWorkspacePermission } from "@/lib/api/auth";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ skillId: string }>;
};

async function authorizeSkill(skillId: string, permission = "workspace.read") {
  const context = await requireUser();

  if (isRouteResponse(context)) {
    return context;
  }

  const { data, error } = await context.admin
    .from("skills")
    .select("workspace_id, source")
    .eq("id", skillId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.workspace_id) {
    return permission === "workspace.read" ? context : badRequest("Default skills cannot be edited");
  }

  return requireWorkspacePermission(data.workspace_id, permission);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { skillId } = await context.params;
    const auth = await authorizeSkill(skillId);

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.supabase.from("skills").select("*, skill_versions(*)").eq("id", skillId).single();

    if (error) {
      throw error;
    }

    return ok({ skill: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { skillId } = await context.params;
    const auth = await authorizeSkill(skillId, "skills.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const content = stringValue(body.content);

    const { data, error } = await auth.admin
      .from("skills")
      .update({
        name: stringValue(body.name) || undefined,
        description: stringValue(body.description) || undefined,
        content: content || undefined,
        icon: stringValue(body.icon) || undefined,
        gradient: stringValue(body.gradient) || undefined,
      })
      .eq("id", skillId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    if (content) {
      await auth.admin.from("skill_versions").insert({
        skill_id: skillId,
        content,
        created_by: auth.user.id,
      });
    }

    return ok({ skill: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { skillId } = await context.params;
    const auth = await authorizeSkill(skillId, "skills.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { error } = await auth.admin
      .from("skills")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", skillId);

    if (error) {
      throw error;
    }

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
