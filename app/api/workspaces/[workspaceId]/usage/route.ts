import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { ok, readJson, serverError } from "@/lib/api/http";

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

    const period = new URL(request.url).searchParams.get("period") ?? "month";
    const since = new Date();
    since.setDate(period === "week" ? since.getDate() - 7 : 1);
    since.setHours(0, 0, 0, 0);

    const [{ data: events, error: eventsError }, { data: limits, error: limitsError }] =
      await Promise.all([
        auth.supabase
          .from("usage_events")
          .select("*")
          .eq("workspace_id", workspaceId)
          .gte("created_at", since.toISOString()),
        auth.supabase
          .from("user_usage_limits")
          .select("*, profiles(full_name, email, avatar_url)")
          .eq("workspace_id", workspaceId),
      ]);

    if (eventsError || limitsError) {
      throw eventsError ?? limitsError;
    }

    const totals = (events ?? []).reduce<Record<string, number>>((acc, event) => {
      const resource = String(event.resource);
      acc[resource] = (acc[resource] ?? 0) + Number(event.quantity ?? 0);
      return acc;
    }, {});

    return ok({ totals, events, userLimits: limits });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "usage.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const { data, error } = await auth.admin
      .from("user_usage_limits")
      .upsert({
        workspace_id: workspaceId,
        user_id: body.userId,
        monthly_token_cap: body.monthlyTokenCap,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ limit: data });
  } catch (error) {
    return serverError(error);
  }
}
