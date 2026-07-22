import { isRouteResponse, requireWorkspacePermission } from "@/lib/api/auth";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";

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

    const [{ data: subscription, error: subscriptionError }, { data: plans, error: plansError }] =
      await Promise.all([
        auth.supabase.from("workspace_subscriptions").select("*, billing_plans(*)").eq("workspace_id", workspaceId).single(),
        auth.supabase.from("billing_plans").select("*").eq("active", true).order("sort_order"),
      ]);

    if (subscriptionError || plansError) {
      throw subscriptionError ?? plansError;
    }

    return ok({ subscription, plans });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const auth = await requireWorkspacePermission(workspaceId, "billing.manage");

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const { data, error } = await auth.admin
      .from("workspace_subscriptions")
      .upsert({
        workspace_id: workspaceId,
        plan_key: stringValue(body.planKey, "pro"),
        status: stringValue(body.status, "active"),
        billing_email: stringValue(body.billingEmail) || auth.user.email,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ subscription: data });
  } catch (error) {
    return serverError(error);
  }
}
