import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const source = new URL(request.url).searchParams.get("source");
    let query = auth.supabase
      .from("skills")
      .select("*")
      .or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`)
      .is("deleted_at", null)
      .order("source", { ascending: true })
      .order("name", { ascending: true });

    if (source === "default") {
      query = query.is("workspace_id", null);
    }

    if (source === "custom") {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return ok({ skills: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "skills.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const name = stringValue(body.name);

    if (!name) {
      return badRequest("Skill name is required");
    }

    const { data, error } = await auth.admin
      .from("skills")
      .insert({
        workspace_id: workspaceId,
        name,
        description: stringValue(body.description) || null,
        content: stringValue(body.content),
        icon: stringValue(body.icon, "sparkles"),
        gradient: stringValue(body.gradient, "from-emerald-300/20 via-stone-100/10 to-sky-300/20"),
        source: "custom",
        created_by: auth.user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return created({ skill: data });
  } catch (error) {
    return serverError(error);
  }
}
