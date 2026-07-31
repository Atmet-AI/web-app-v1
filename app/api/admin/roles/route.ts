import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { recordActivityLog } from "@/lib/api/audit";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";

export async function GET(request: Request) {
  try {
    const workspaceId = new URL(request.url).searchParams.get("workspaceId");

    if (!workspaceId) {
      return badRequest("workspaceId is required");
    }

    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const [{ data: roles, error: rolesError }, { data: permissions, error: permissionsError }] =
      await Promise.all([
        auth.supabase
          .from("workspace_custom_roles")
          .select("*, workspace_custom_role_permissions(*)")
          .eq("workspace_id", workspaceId),
        auth.supabase.from("permissions").select("*").order("key"),
      ]);

    if (rolesError || permissionsError) {
      throw rolesError ?? permissionsError;
    }

    return ok({ roles, permissions });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const workspaceId = stringValue(body.workspaceId);
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const name = stringValue(body.name);

    if (!name) {
      return badRequest("Role name is required");
    }

    const { data: role, error } = await auth.admin
      .from("workspace_custom_roles")
      .insert({
        workspace_id: workspaceId,
        name,
        description: stringValue(body.description) || null,
        created_by: auth.user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    if (Array.isArray(body.permissions) && body.permissions.length > 0) {
      await auth.admin.from("workspace_custom_role_permissions").insert(
        body.permissions.map((permissionKey) => ({
          custom_role_id: role.id,
          permission_key: permissionKey,
        })),
      );
    }

    await recordActivityLog(auth.admin, {
      action: "workspace.role.created",
      actorId: auth.user.id,
      metadata: {
        permissionCount: Array.isArray(body.permissions) ? body.permissions.length : 0,
        roleName: role.name,
      },
      request,
      targetId: role.id,
      targetType: "workspace_custom_role",
      workspaceId,
    });

    return created({ role });
  } catch (error) {
    return serverError(error);
  }
}
