import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import {
  badRequest,
  jsonObject,
  ok,
  readJson,
  serverError,
  stringValue,
} from "@/lib/api/http";
import {
  createComposioConnectLink,
  deleteComposioConnectedAccount,
  getComposioAuthConfigId,
  getComposioToolkitSlug,
  getComposioUserConnection,
  getConnectedComposioUserIds,
  isComposioConfigured,
} from "@/lib/composio";
import { getConnectorCatalogEntry } from "@/lib/connectors/catalog";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "workspace.read");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const [{ data: apps, error: appsError }, { data: connections, error: connectionsError }] =
      await Promise.all([
        auth.supabase.from("app_catalog").select("*").eq("enabled", true).order("name"),
        auth.supabase.from("workspace_connectors").select("*").eq("workspace_id", workspaceId),
      ]);

    if (appsError || connectionsError) {
      throw appsError ?? connectionsError;
    }

    return ok({ apps, connections });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "connectors.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const appKey = stringValue(body.appKey);
    const action = stringValue(body.action, "connect");
    const toolkitSlug = getComposioToolkitSlug(appKey);

    if (!appKey) {
      return badRequest("App key is required");
    }

    if (!toolkitSlug) {
      return badRequest("This connector is not available in Composio yet.");
    }

    if (action !== "disconnect" && !isComposioConfigured()) {
      return badRequest("COMPOSIO_API_KEY is not configured.");
    }

    const { data: existingConnection, error: existingConnectionError } =
      await auth.admin
        .from("workspace_connectors")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("app_key", appKey)
        .maybeSingle();

    if (existingConnectionError) {
      throw existingConnectionError;
    }

    const catalogEntry = getConnectorCatalogEntry(appKey);
    if (catalogEntry) {
      const { error: catalogError } = await auth.admin
        .from("app_catalog")
        .upsert(
          {
            description: catalogEntry.description,
            enabled: true,
            gradient: catalogEntry.gradient,
            key: catalogEntry.key,
            logo: catalogEntry.logo,
            name: catalogEntry.name,
          },
          { onConflict: "key" },
        );

      if (catalogError) {
        throw catalogError;
      }
    }

    const existingSettings = jsonObject(existingConnection?.settings);
    const existingUsers = jsonObject(existingSettings.users);

    let payload: Record<string, unknown>;
    let redirectUrl = "";

    if (action === "disconnect") {
      const currentUserConnection = getComposioUserConnection(
        existingSettings,
        auth.user.id,
      );
      const connectedAccountId = stringValue(
        currentUserConnection.connectedAccountId,
      );

      if (connectedAccountId) {
        await deleteComposioConnectedAccount(connectedAccountId);
      }

      const nextUsers = { ...existingUsers };
      delete nextUsers[auth.user.id];

      const nextSettings = {
        ...existingSettings,
        provider: "composio",
        toolkitSlug,
        users: nextUsers,
      };
      const hasConnectedUsers = getConnectedComposioUserIds(nextSettings).length > 0;

      payload = {
        app_key: appKey,
        disconnected_at: hasConnectedUsers ? null : new Date().toISOString(),
        settings: nextSettings,
        status: hasConnectedUsers ? "connected" : "disconnected",
        workspace_id: workspaceId,
      };
    } else {
      const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
      const callbackUrl = new URL(
        `/api/workspaces/${workspaceId}/connectors/composio/callback`,
        origin,
      );
      callbackUrl.searchParams.set("appKey", appKey);

      const authConfigId = await getComposioAuthConfigId({ appKey, toolkitSlug });
      const link = await createComposioConnectLink({
        appKey,
        authConfigId,
        callbackUrl: callbackUrl.toString(),
        toolkitSlug,
        userId: auth.user.id,
        workspaceId,
      });
      redirectUrl = stringValue(link.redirect_url);

      if (!redirectUrl) {
        return badRequest("Composio did not return a connect link.");
      }

      payload = {
        app_key: appKey,
        connected_at: null,
        connected_by: auth.user.id,
        description: stringValue(body.description) || null,
        disconnected_at: null,
        profile_name: stringValue(body.profileName) || null,
        settings: {
          ...existingSettings,
          provider: "composio",
          toolkitSlug,
          users: {
            ...existingUsers,
            [auth.user.id]: {
              authConfigId,
              connectedAccountId: stringValue(link.connected_account_id),
              expiresAt: stringValue(link.expires_at),
              linkToken: stringValue(link.link_token),
              requestedAt: new Date().toISOString(),
              status: "pending",
            },
          },
        },
        status: "pending",
        workspace_id: workspaceId,
      };
    }

    const { data, error } = await auth.admin
      .from("workspace_connectors")
      .upsert(payload, { onConflict: "workspace_id,app_key" })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ connection: data, redirectUrl });
  } catch (error) {
    return serverError(error);
  }
}
