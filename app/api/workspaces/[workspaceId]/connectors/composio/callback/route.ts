import { NextResponse } from "next/server";
import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { jsonObject, serverError, stringValue } from "@/lib/api/http";
import {
  getComposioToolkitSlug,
  listCurrentUserComposioAccounts,
  selectBestComposioAccount,
} from "@/lib/composio";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "connectors.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const url = new URL(request.url);
    const appKey = stringValue(url.searchParams.get("appKey"));
    const toolkitSlug = getComposioToolkitSlug(appKey);
    const redirectUrl = new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? url.origin);
    redirectUrl.searchParams.set("page", "connectors");

    if (!appKey || !toolkitSlug) {
      redirectUrl.searchParams.set("composio", "unsupported");
      return NextResponse.redirect(redirectUrl);
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

    const existingSettings = jsonObject(existingConnection?.settings);
    const existingUsers = jsonObject(existingSettings.users);
    const accounts = await listCurrentUserComposioAccounts({
      toolkitSlug,
      userId: auth.user.id,
      workspaceId,
    });
    const account = selectBestComposioAccount(accounts);
    const accountStatus = stringValue(account?.status).toUpperCase();
    const connected = accountStatus === "ACTIVE";

    const nextSettings = {
      ...existingSettings,
      provider: "composio",
      toolkitSlug,
      users: {
        ...existingUsers,
        [auth.user.id]: {
          authConfigId: stringValue(account?.auth_config?.id),
          connectedAccountId: stringValue(account?.id),
          connectedAt: connected ? new Date().toISOString() : null,
          status: connected ? "connected" : "pending",
          syncedAt: new Date().toISOString(),
        },
      },
    };

    const { error } = await auth.admin.from("workspace_connectors").upsert(
      {
        app_key: appKey,
        connected_at: connected ? new Date().toISOString() : null,
        connected_by: auth.user.id,
        disconnected_at: null,
        settings: nextSettings,
        status: connected ? "connected" : "pending",
        workspace_id: workspaceId,
      },
      { onConflict: "workspace_id,app_key" },
    );

    if (error) {
      throw error;
    }

    redirectUrl.searchParams.set("composio", connected ? "connected" : "pending");
    redirectUrl.searchParams.set("app", appKey);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return serverError(error);
  }
}
