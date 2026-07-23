import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const code = stringValue(body.code);

    if (!code) {
      return badRequest("Code is required");
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return badRequest(error.message);
    }

    return ok({ session: data.session, user: data.user });
  } catch (error) {
    return serverError(error);
  }
}
