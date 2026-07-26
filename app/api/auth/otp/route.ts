import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recordSessionLog } from "@/lib/api/audit";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { createSupabaseAdminClient, hasSupabaseServiceRoleKey } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = stringValue(body.email).toLowerCase();

    if (!email) {
      return badRequest("Email is required");
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });
    const admin = hasSupabaseServiceRoleKey() ? createSupabaseAdminClient() : null;

    if (error) {
      if (admin) await recordSessionLog(admin, {
        event: "auth.otp_failed",
        metadata: { email, reason: error.message },
        request,
      });
      return badRequest(error.message);
    }

    if (admin) await recordSessionLog(admin, {
      event: "auth.otp_requested",
      metadata: { email },
      request,
    });

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
