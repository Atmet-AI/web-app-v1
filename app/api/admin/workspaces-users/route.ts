import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { ok, serverError } from "@/lib/api/http";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/admin";

type DatabaseRecord = Record<string, unknown>;

function asRecord(value: unknown): DatabaseRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DatabaseRecord)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export async function GET() {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const dataClient = hasSupabaseServiceRoleKey() ? auth.admin : auth.supabase;

    const [
      { data: workspaces, error: workspacesError },
      { data: users, error: usersError },
      { data: members, error: membersError },
      { data: subscriptions, error: subscriptionsError },
    ] = await Promise.all([
      dataClient
        .from("workspaces")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      dataClient.from("profiles").select("*").order("created_at", { ascending: false }),
      dataClient
        .from("workspace_members")
        .select("*, profiles:profiles!workspace_members_user_id_fkey(*), workspaces(id, name, slug, status)")
        .order("created_at", { ascending: false }),
      dataClient.from("workspace_subscriptions").select("*"),
    ]);

    if (workspacesError || usersError || membersError || subscriptionsError) {
      throw workspacesError ?? usersError ?? membersError ?? subscriptionsError;
    }

    const usersById = new Map(
      (users ?? []).map((profile) => [String(profile.id), profile]),
    );
    const membersByWorkspace = (members ?? []).reduce<Record<string, unknown[]>>(
      (acc, member) => {
        const workspaceId = String(member.workspace_id ?? "");
        if (!workspaceId) return acc;
        acc[workspaceId] = [...(acc[workspaceId] ?? []), member];
        return acc;
      },
      {},
    );
    const subscriptionsByWorkspace = new Map(
      (subscriptions ?? []).map((subscription) => [
        String(subscription.workspace_id),
        subscription,
      ]),
    );

    const hydratedWorkspaces = (workspaces ?? []).map((workspace) => {
      const owner = usersById.get(String(workspace.owner_id));
      const ownerName = asString(owner?.full_name, asString(owner?.email, "Unassigned"));
      const subscription = subscriptionsByWorkspace.get(String(workspace.id));

      return {
        ...workspace,
        member_count: membersByWorkspace[String(workspace.id)]?.length ?? 0,
        owner_name: ownerName,
        plan_key: asString(subscription?.plan_key, "No plan"),
        subscription_status: asString(subscription?.status),
      };
    });

    const hydratedUsers = (users ?? []).flatMap((profile) => {
      const userMemberships = (members ?? []).filter(
        (member) => String(member.user_id) === String(profile.id),
      );

      if (userMemberships.length === 0) {
        return [
          {
            ...profile,
            default_workspace_name: "",
            membership_status: "active",
            role: profile.is_super_admin ? "super admin" : "member",
          },
        ];
      }

      return userMemberships.map((member) => {
        const workspaceRecord = Array.isArray(member.workspaces)
          ? member.workspaces[0]
          : member.workspaces;
        const workspace = asRecord(workspaceRecord);

        return {
          ...profile,
          default_workspace_name: asString(workspace.name),
          membership_status: asString(member.status, "active"),
          role: asString(member.role, profile.is_super_admin ? "super admin" : "member"),
          workspace_id: asString(member.workspace_id),
        };
      });
    });

    return ok({ workspaces: hydratedWorkspaces, users: hydratedUsers });
  } catch (error) {
    return serverError(error);
  }
}
