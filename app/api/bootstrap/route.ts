import { isRouteResponse, requireUser } from "@/lib/api/auth";
import { ok, serverError } from "@/lib/api/http";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
};

function metadataString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function nameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "User";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ") || "User";
}

function authMetadataProfile(user: { created_at?: string; email?: string | null; id: string; user_metadata?: Record<string, unknown> }) {
  const email = user.email ?? "";
  const metadata = user.user_metadata ?? {};

  return {
    avatar_url: metadataString(metadata.avatar_url),
    bio: metadataString(metadata.bio),
    created_at: user.created_at,
    email,
    full_name: metadataString(metadata.full_name) || nameFromEmail(email),
    id: user.id,
    phone_number: metadataString(metadata.phone_number),
    role_title: metadataString(metadata.role_title) || "Product builder",
  };
}

type BootstrapAuth = Exclude<Awaited<ReturnType<typeof requireUser>>, Response>;
type WorkspaceMemberRow = Record<string, unknown> & {
  profiles?: Record<string, unknown> | null;
  user_id?: string;
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringList(value: unknown[]) {
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

async function enrichWorkspaceMembers(
  auth: BootstrapAuth,
  members: unknown[] | null,
) {
  const rows = (members ?? []).map((member) => toRecord(member) as WorkspaceMemberRow);
  const memberUserIds = stringList(rows.map((member) => member.user_id));

  if (memberUserIds.length === 0 || !hasSupabaseServiceRoleKey()) {
    return rows;
  }

  const { data: profileRows } = await auth.admin
    .from("profiles")
    .select("*")
    .in("id", memberUserIds);

  const profilesById = new Map(
    (profileRows ?? []).map((profile) => [String(profile.id), toRecord(profile)]),
  );

  return rows.map((member) => {
    const userId = typeof member.user_id === "string" ? member.user_id : "";
    const storedProfile = profilesById.get(userId) ?? toRecord(member.profiles);
    const authProfile: Record<string, unknown> =
      userId === auth.user.id ? authMetadataProfile(auth.user) : {};
    const mergedProfile = {
      ...authProfile,
      ...storedProfile,
      avatar_url:
        storedProfile.avatar_url ?? authProfile.avatar_url ?? null,
      email:
        storedProfile.email ?? authProfile.email ?? "",
      full_name:
        storedProfile.full_name ?? authProfile.full_name ?? "",
      last_seen_at:
        storedProfile.last_seen_at ??
        (userId === auth.user.id ? auth.user.last_sign_in_at : null),
    };

    return {
      ...member,
      profiles: mergedProfile,
    };
  });
}

export async function GET() {
  try {
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const dataClient = hasSupabaseServiceRoleKey() ? auth.admin : auth.supabase;

    let { data: memberships, error: membershipsError } = await auth.supabase
      .from("workspace_members")
      .select("role, status, workspaces(*)")
      .eq("user_id", auth.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (membershipsError) {
      throw membershipsError;
    }

    let workspaceRecord = memberships?.[0]?.workspaces;
    let workspace = Array.isArray(workspaceRecord) ? workspaceRecord[0] : workspaceRecord;
    let workspaceId = workspace?.id as string | undefined;
    const authEmail = auth.user.email ?? "";

    const [
      { data: rawProfile, error: profileError },
      { data: preferences, error: preferencesError },
      { data: changelogs, error: changelogsError },
    ] = await Promise.all([
      dataClient.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
      dataClient.from("user_preferences").select("*").eq("user_id", auth.user.id).maybeSingle(),
      auth.supabase
        .from("changelogs")
        .select("*")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false }),
    ]);

    if (profileError || preferencesError || changelogsError) {
      throw profileError ?? preferencesError ?? changelogsError;
    }

    const authProfile = authMetadataProfile(auth.user);
    const authFullName = metadataString(auth.user.user_metadata?.full_name);
    const authAvatarUrl = metadataString(auth.user.user_metadata?.avatar_url);
    let profile = rawProfile;

    if (!profile) {
      const { data: insertedProfile, error: insertedProfileError } =
        await dataClient
          .from("profiles")
          .insert({
            avatar_url: authProfile.avatar_url || null,
            bio: authProfile.bio || null,
            email: authEmail,
            full_name: authProfile.full_name,
            id: auth.user.id,
            phone_number: authProfile.phone_number || null,
            role_title: authProfile.role_title,
          })
          .select("*")
          .single();

      if (insertedProfileError) {
        profile = authProfile;
      } else {
        profile = insertedProfile;
      }
    } else if (
      !profile.email ||
      (!profile.full_name && authFullName) ||
      (!profile.avatar_url && authAvatarUrl)
    ) {
      const { data: hydratedProfile, error: hydratedProfileError } =
        await dataClient
          .from("profiles")
          .update({
            avatar_url: profile.avatar_url || authAvatarUrl || null,
            email: profile.email || authEmail,
            full_name: profile.full_name || authFullName || nameFromEmail(authEmail),
          })
          .eq("id", auth.user.id)
          .select("*")
          .single();

      if (!hydratedProfileError) {
        profile = hydratedProfile ?? profile;
      }
    }

    const notificationsPromise = dataClient
      .from("notifications")
      .select("*")
      .eq("user_id", auth.user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(30);

    let userPreferences = preferences;
    if (!userPreferences) {
      const { data: insertedPreferences, error: insertedPreferencesError } =
        await dataClient
          .from("user_preferences")
          .insert({ user_id: auth.user.id })
          .select("*")
          .single();

      if (insertedPreferencesError) {
        userPreferences = {
          sound_enabled: true,
          startup_page: "new-chat",
          theme: "system",
          user_id: auth.user.id,
        };
      } else {
        userPreferences = insertedPreferences;
      }
    }

    if (!workspaceId && authEmail && !profile?.onboarded_at) {
      const { data: pendingInvite, error: pendingInviteError } = await dataClient
        .from("workspace_invites")
        .select("id")
        .eq("email", authEmail.toLowerCase())
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pendingInviteError) {
        throw pendingInviteError;
      }

      if (pendingInvite) {
        const { data: notifications } = await notificationsPromise;
        return ok(
          {
            notifications: notifications ?? [],
            profile,
            setupUrl: "/signup?invite=1&type=invite",
          },
          { headers: noStoreHeaders },
        );
      }
    }

    if (!workspaceId) {
      const { data: ownedWorkspace, error: ownedWorkspaceError } =
        await dataClient
          .from("workspaces")
          .select("*")
          .or(`owner_id.eq.${auth.user.id},created_by.eq.${auth.user.id}`)
          .is("deleted_at", null)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

      if (!ownedWorkspaceError && ownedWorkspace) {
        workspace = ownedWorkspace;
        workspaceId = ownedWorkspace.id;

        await dataClient
          .from("workspace_members")
          .upsert({
            joined_at: new Date().toISOString(),
            role: "owner",
            status: "active",
            user_id: auth.user.id,
            workspace_id: workspaceId,
          });

        memberships = [
          {
            role: "owner",
            status: "active",
            workspaces: workspace,
          },
        ];
      }
    }

    if (!workspaceId && profile?.is_super_admin) {
      const { data: existingWorkspace, error: existingWorkspaceError } =
        await auth.supabase
          .from("workspaces")
          .select("*")
          .is("deleted_at", null)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

      if (existingWorkspaceError) {
        throw existingWorkspaceError;
      }

      if (existingWorkspace) {
        workspace = existingWorkspace;
        workspaceId = existingWorkspace.id;
      } else {
        const defaultSlug = `workspace-${auth.user.id.slice(0, 8)}`;
        const { data: createdWorkspace, error: createdWorkspaceError } =
          await auth.supabase
            .from("workspaces")
            .insert({
              category: "Workspace intelligence",
              created_by: auth.user.id,
              name: "Atmet Workspace",
              owner_id: auth.user.id,
              slug: defaultSlug,
              status: "active",
            })
            .select("*")
            .single();

        if (createdWorkspaceError) {
          throw createdWorkspaceError;
        }

        workspace = createdWorkspace;
        workspaceId = createdWorkspace.id;
      }

      if (workspaceId) {
        const { error: membershipRepairError } = await auth.supabase
          .from("workspace_members")
          .upsert({
            joined_at: new Date().toISOString(),
            role: "owner",
            status: "active",
            user_id: auth.user.id,
            workspace_id: workspaceId,
          });

        if (membershipRepairError) {
          throw membershipRepairError;
        }

        await auth.supabase
          .from("workspace_settings")
          .upsert({ workspace_id: workspaceId });

        memberships = [
          {
            role: "owner",
            status: "active",
            workspaces: workspace,
          },
        ];
      }
    }

    if (!workspaceId) {
      const { data: notifications } = await notificationsPromise;
      return ok({
        agents: [],
        apps: [],
        brain: null,
        changelogs,
        chats: [],
        connections: [],
        members: [],
        memberships,
        notifications: notifications ?? [],
        preferences: userPreferences,
        profile,
        skills: [],
        subscription: null,
        usage: { events: [], totals: {}, userLimits: [] },
        workspace: null,
        workspaceSettings: null,
        workspaces: [],
      }, { headers: noStoreHeaders });
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
      { data: notifications, error: notificationsError },
    ] = await Promise.all([
      auth.supabase.from("workspace_settings").select("*").eq("workspace_id", workspaceId).maybeSingle(),
      auth.supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", workspaceId),
      auth.supabase
        .from("chats")
        .select("*")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false }),
      auth.supabase
        .from("skills")
        .select("*")
        .or(`source.eq.default,created_by.eq.${auth.user.id}`)
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
      notificationsPromise,
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
      notificationsError,
    ].filter(Boolean);

    if (errors[0]) {
      throw errors[0];
    }

    const enrichedMembers = await enrichWorkspaceMembers(auth, members);

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
      members: enrichedMembers,
      memberships,
      notifications,
      preferences: userPreferences,
      profile,
      skills,
      subscription,
      usage: { events: usageEvents, totals, userLimits },
      workspace,
      workspaceSettings,
      workspaces: memberships?.map((membership) => membership.workspaces).filter(Boolean) ?? [],
    }, { headers: noStoreHeaders });
  } catch (error) {
    return serverError(error);
  }
}
