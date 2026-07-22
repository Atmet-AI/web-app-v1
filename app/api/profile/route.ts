import { isRouteResponse, requireUser } from "@/lib/api/auth";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";

export async function GET() {
  try {
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const [{ data: profile, error: profileError }, { data: preferences, error: preferencesError }] =
      await Promise.all([
        auth.supabase.from("profiles").select("*").eq("id", auth.user.id).single(),
        auth.supabase.from("user_preferences").select("*").eq("user_id", auth.user.id).single(),
      ]);

    if (profileError || preferencesError) {
      throw profileError ?? preferencesError;
    }

    return ok({ profile, preferences });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const preferences = body.preferences && typeof body.preferences === "object" ? body.preferences : {};

    const [{ data: nextProfile, error: profileError }, { data: nextPreferences, error: preferencesError }] =
      await Promise.all([
        auth.admin
          .from("profiles")
          .update({
            full_name: stringValue((profile as Record<string, unknown>).fullName) || undefined,
            avatar_url: stringValue((profile as Record<string, unknown>).avatarUrl) || undefined,
            role_title: stringValue((profile as Record<string, unknown>).roleTitle) || undefined,
            timezone: stringValue((profile as Record<string, unknown>).timezone) || undefined,
            bio: stringValue((profile as Record<string, unknown>).bio) || undefined,
          })
          .eq("id", auth.user.id)
          .select("*")
          .single(),
        auth.admin
          .from("user_preferences")
          .upsert({
            user_id: auth.user.id,
            theme: stringValue((preferences as Record<string, unknown>).theme, "system"),
            sound_enabled:
              typeof (preferences as Record<string, unknown>).soundEnabled === "boolean"
                ? (preferences as Record<string, unknown>).soundEnabled
                : undefined,
            startup_page: stringValue((preferences as Record<string, unknown>).startupPage, "new-chat"),
          })
          .select("*")
          .single(),
      ]);

    if (profileError || preferencesError) {
      throw profileError ?? preferencesError;
    }

    return ok({ profile: nextProfile, preferences: nextPreferences });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE() {
  try {
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { error } = await auth.admin.auth.admin.deleteUser(auth.user.id);

    if (error) {
      throw error;
    }

    await auth.supabase.auth.signOut();

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
