import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recordSessionLog } from "@/lib/api/audit";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { createSupabaseAdminClient, hasSupabaseServiceRoleKey } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = stringValue(body.email).toLowerCase();
    const next = stringValue(body.next, "/");

    if (!email) {
      return badRequest("Email is required");
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    const admin = hasSupabaseServiceRoleKey() ? createSupabaseAdminClient() : null;

    if (error) {
      if (admin) await recordSessionLog(admin, {
        event: "auth.magic_link_failed",
        metadata: { email, next, reason: error.message },
        request,
      });
      return badRequest(error.message);
    }

    if (admin) await recordSessionLog(admin, {
      event: "auth.magic_link_requested",
      metadata: { email, next },
      request,
    });

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
