import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recordSessionLog } from "@/lib/api/audit";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { createSupabaseAdminClient, hasSupabaseServiceRoleKey } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = stringValue(body.email).toLowerCase();
    const password = stringValue(body.password);

    if (!email || !password) {
      return badRequest("Email and password are required");
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    const admin = hasSupabaseServiceRoleKey() ? createSupabaseAdminClient() : null;

    if (error) {
      if (admin) await recordSessionLog(admin, {
        event: "auth.sign_in_failed",
        metadata: { email, reason: error.message },
        request,
      });
      return badRequest(error.message);
    }

    if (admin) await recordSessionLog(admin, {
      event: "auth.sign_in",
      metadata: { email },
      request,
      user: data.user,
    });

    return ok({ user: data.user, session: data.session });
  } catch (error) {
    return serverError(error);
  }
}
