import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = stringValue(body.email).toLowerCase();

    if (!email) {
      return badRequest("Email is required");
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/login?reset=1`,
    });

    if (error) {
      return badRequest(error.message);
    }

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
