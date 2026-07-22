import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/api/http";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
