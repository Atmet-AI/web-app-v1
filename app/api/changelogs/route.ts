import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("changelogs")
      .select("*")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ok({ changelogs: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const title = stringValue(body.title);
    const content = stringValue(body.content);

    if (!title || !content) {
      return badRequest("Title and content are required");
    }

    const { data, error } = await auth.admin
      .from("changelogs")
      .insert({
        title,
        content,
        published_at: body.publish === false ? null : new Date().toISOString(),
        created_by: auth.user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return created({ changelog: data });
  } catch (error) {
    return serverError(error);
  }
}
