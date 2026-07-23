import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ requestId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { requestId } = await context.params;
    const body = await readJson(request);
    const status = stringValue(body.status);

    if (!["approved", "rejected", "pending"].includes(status)) {
      return badRequest("Status must be approved, rejected, or pending");
    }

    const { data, error } = await auth.admin
      .from("waitlist_requests")
      .update({
        status,
        reviewed_by: auth.user.id,
        reviewed_at: status === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", requestId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    let signupUrl: string | null = null;

    if (status === "approved") {
      const requestOrigin = new URL(request.url).origin;
      const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;
      const origin =
        configuredOrigin && !configuredOrigin.includes("localhost")
          ? configuredOrigin
          : requestOrigin;
      signupUrl = `${origin}/signup?approved=1&request=${requestId}`;
      const { error: inviteError } = await auth.admin.auth.admin.inviteUserByEmail(data.email, {
        data: {
          full_name: data.full_name,
          waitlist_request_id: requestId,
        },
        redirectTo: signupUrl,
      });

      if (inviteError) {
        throw inviteError;
      }
    }

    await auth.admin.from("admin_audit_logs").insert({
      actor_id: auth.user.id,
      action: `waitlist.${status}`,
      target_type: "waitlist_request",
      target_id: requestId,
      metadata: { email: data.email },
    });

    return ok({ request: data, signupUrl });
  } catch (error) {
    return serverError(error);
  }
}
