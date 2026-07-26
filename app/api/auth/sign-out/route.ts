import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recordSessionLog } from "@/lib/api/audit";
import { ok, serverError } from "@/lib/api/http";
import { createSupabaseAdminClient, hasSupabaseServiceRoleKey } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.auth.signOut();
    if (hasSupabaseServiceRoleKey()) {
      await recordSessionLog(createSupabaseAdminClient(), {
        event: "auth.sign_out",
        request,
        user,
      });
    }
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
