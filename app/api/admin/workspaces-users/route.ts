import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { ok, serverError } from "@/lib/api/http";

export async function GET() {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const [{ data: workspaces, error: workspacesError }, { data: users, error: usersError }] =
      await Promise.all([
        auth.admin
          .from("workspaces")
          .select("*, workspace_members(count), workspace_subscriptions(plan_key, status)")
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
        auth.admin.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);

    if (workspacesError || usersError) {
      throw workspacesError ?? usersError;
    }

    return ok({ workspaces, users });
  } catch (error) {
    return serverError(error);
  }
}
