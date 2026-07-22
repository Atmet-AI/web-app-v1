import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";

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

    if (error) {
      return badRequest(error.message);
    }

    return ok({ user: data.user, session: data.session });
  } catch (error) {
    return serverError(error);
  }
}
