import { isRouteResponse, requireUser } from "@/lib/api/auth";
import { ok, serverError } from "@/lib/api/http";

export async function GET() {
  try {
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data: memberships, error: membershipsError } = await auth.supabase
      .from("workspace_members")
      .select("role, status, workspaces(*)")
      .eq("user_id", auth.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (membershipsError) {
      throw membershipsError;
    }

    const workspaceRecord = memberships?.[0]?.workspaces;
    const workspace = Array.isArray(workspaceRecord) ? workspaceRecord[0] : workspaceRecord;
    const workspaceId = workspace?.id as string | undefined;

    const [
      { data: profile, error: profileError },
      { data: preferences, error: preferencesError },
      { data: changelogs, error: changelogsError },
    ] = await Promise.all([
      auth.supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
      auth.supabase.from("user_preferences").select("*").eq("user_id", auth.user.id).maybeSingle(),
      auth.supabase
        .from("changelogs")
        .select("*")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false }),
    ]);

    if (profileError || preferencesError || changelogsError) {
      throw profileError ?? preferencesError ?? changelogsError;
    }

    if (!workspaceId) {
      return ok({
        agents: [],
        apps: [],
        brain: null,
        changelogs,
        chats: [],
        connections: [],
        members: [],
        memberships,
        preferences,
        profile,
        skills: [],
        subscription: null,
        usage: { events: [], totals: {}, userLimits: [] },
        workspace: null,
        workspaceSettings: null,
        workspaces: [],
      });
    }

    const [
      { data: workspaceSettings, error: workspaceSettingsError },
      { data: members, error: membersError },
      { data: chats, error: chatsError },
      { data: skills, error: skillsError },
      { data: apps, error: appsError },
      { data: connections, error: connectionsError },
      { data: agents, error: agentsError },
      { data: brain, error: brainError },
      { data: subscription, error: subscriptionError },
      { data: usageEvents, error: usageEventsError },
      { data: userLimits, error: userLimitsError },
    ] = await Promise.all([
      auth.supabase.from("workspace_settings").select("*").eq("workspace_id", workspaceId).maybeSingle(),
      auth.supabase.from("workspace_members").select("*, profiles(*)").eq("workspace_id", workspaceId),
      auth.supabase
        .from("chats")
        .select("*, chat_messages(id, role, content, created_at)")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false }),
      auth.supabase
        .from("skills")
        .select("*")
        .or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`)
        .is("deleted_at", null)
        .order("source", { ascending: true })
        .order("name", { ascending: true }),
      auth.supabase.from("app_catalog").select("*").eq("enabled", true).order("name"),
      auth.supabase.from("workspace_connectors").select("*").eq("workspace_id", workspaceId),
      auth.supabase
        .from("workflow_agents")
        .select("*, workflow_nodes(*), workflow_edges(*)")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      auth.supabase.from("workspace_brain").select("*").eq("workspace_id", workspaceId).maybeSingle(),
      auth.supabase
        .from("workspace_subscriptions")
        .select("*, billing_plans(*)")
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
      auth.supabase
        .from("usage_events")
        .select("*")
        .eq("workspace_id", workspaceId)
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      auth.supabase
        .from("user_usage_limits")
        .select("*, profiles(full_name, email, avatar_url)")
        .eq("workspace_id", workspaceId),
    ]);

    const errors = [
      workspaceSettingsError,
      membersError,
      chatsError,
      skillsError,
      appsError,
      connectionsError,
      agentsError,
      brainError,
      subscriptionError,
      usageEventsError,
      userLimitsError,
    ].filter(Boolean);

    if (errors[0]) {
      throw errors[0];
    }

    const totals = (usageEvents ?? []).reduce<Record<string, number>>((acc, event) => {
      const resource = String(event.resource);
      acc[resource] = (acc[resource] ?? 0) + Number(event.quantity ?? 0);
      return acc;
    }, {});

    return ok({
      agents,
      apps,
      brain,
      changelogs,
      chats,
      connections,
      members,
      memberships,
      preferences,
      profile,
      skills,
      subscription,
      usage: { events: usageEvents, totals, userLimits },
      workspace,
      workspaceSettings,
      workspaces: memberships?.map((membership) => membership.workspaces).filter(Boolean) ?? [],
    });
  } catch (error) {
    return serverError(error);
  }
}
