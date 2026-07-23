import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forbidden, unauthorized } from "@/lib/api/http";
import { isUserSessionExpired } from "@/lib/auth/session";

export type ApiAuthContext = {
  admin: SupabaseClient;
  supabase: SupabaseClient;
  user: User;
};

export function isRouteResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export async function requireUser(): Promise<ApiAuthContext | NextResponse> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return unauthorized();
  }

  if (isUserSessionExpired(user)) {
    await supabase.auth.signOut();
    return unauthorized("Session expired");
  }

  return {
    admin: createSupabaseAdminClient(),
    supabase,
    user,
  };
}

export async function requireSuperAdmin(): Promise<ApiAuthContext | NextResponse> {
  const context = await requireUser();

  if (isRouteResponse(context)) {
    return context;
  }

  const { data, error } = await context.supabase.rpc("is_super_admin", {
    target_user_id: context.user.id,
  });

  if (error || data !== true) {
    return forbidden();
  }

  return context;
}

export async function requireWorkspacePermission(
  workspaceId: string,
  permissionKey: string,
): Promise<ApiAuthContext | NextResponse> {
  const context = await requireUser();

  if (isRouteResponse(context)) {
    return context;
  }

  const { data, error } = await context.supabase.rpc("has_workspace_permission", {
    permission_key: permissionKey,
    target_user_id: context.user.id,
    target_workspace_id: workspaceId,
  });

  if (error || data !== true) {
    return forbidden();
  }

  return context;
}
