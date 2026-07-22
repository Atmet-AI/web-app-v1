import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { userId } = await context.params;
    const { data, error } = await auth.admin
      .from("profiles")
      .select("*, user_preferences(*), workspace_members(*, workspaces(name, slug, status))")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return ok({ user: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { userId } = await context.params;
    const body = await readJson(request);
    const { data, error } = await auth.admin
      .from("profiles")
      .update({
        full_name: stringValue(body.fullName) || undefined,
        role_title: stringValue(body.roleTitle) || undefined,
        timezone: stringValue(body.timezone) || undefined,
        is_super_admin: typeof body.isSuperAdmin === "boolean" ? body.isSuperAdmin : undefined,
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ user: data });
  } catch (error) {
    return serverError(error);
  }
}
