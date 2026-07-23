import { isRouteResponse, requireUser } from "@/lib/api/auth";
import { ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
};

export async function GET() {
  try {
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const dataClient = hasSupabaseServiceRoleKey() ? auth.admin : auth.supabase;

    const [{ data: profile, error: profileError }, { data: preferences, error: preferencesError }] =
      await Promise.all([
        dataClient.from("profiles").select("*").eq("id", auth.user.id).single(),
        dataClient.from("user_preferences").select("*").eq("user_id", auth.user.id).single(),
      ]);

    if (profileError || preferencesError) {
      throw profileError ?? preferencesError;
    }

    return ok({ profile, preferences }, { headers: noStoreHeaders });
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

    const dataClient = hasSupabaseServiceRoleKey() ? auth.admin : auth.supabase;

    const body = await readJson(request);
    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const preferences = body.preferences && typeof body.preferences === "object" ? body.preferences : {};

    const profilePatch: Record<string, unknown> = {};
    const profileRecord = profile as Record<string, unknown>;

    profilePatch.id = auth.user.id;
    profilePatch.email = auth.user.email ?? "";

    if ("fullName" in profileRecord) {
      profilePatch.full_name = stringValue(profileRecord.fullName);
    }
    if ("avatarUrl" in profileRecord) {
      profilePatch.avatar_url = stringValue(profileRecord.avatarUrl);
    }
    if ("roleTitle" in profileRecord) {
      profilePatch.role_title = stringValue(profileRecord.roleTitle);
    }
    if ("timezone" in profileRecord) {
      profilePatch.timezone = stringValue(profileRecord.timezone, "Asia/Amman");
    }
    if ("phoneNumber" in profileRecord) {
      profilePatch.phone_number = stringValue(profileRecord.phoneNumber);
    }
    if ("bio" in profileRecord) {
      profilePatch.bio = stringValue(profileRecord.bio);
    }

    const metadataPatch: Record<string, string> = {};
    if ("fullName" in profileRecord) {
      metadataPatch.full_name = stringValue(profileRecord.fullName);
    }
    if ("avatarUrl" in profileRecord) {
      metadataPatch.avatar_url = stringValue(profileRecord.avatarUrl);
    }
    if ("roleTitle" in profileRecord) {
      metadataPatch.role_title = stringValue(profileRecord.roleTitle);
    }
    if ("phoneNumber" in profileRecord) {
      metadataPatch.phone_number = stringValue(profileRecord.phoneNumber);
    }
    if ("bio" in profileRecord) {
      metadataPatch.bio = stringValue(profileRecord.bio);
    }

    if (Object.keys(metadataPatch).length > 0) {
      const { error: metadataError } = await auth.supabase.auth.updateUser({
        data: metadataPatch,
      });

      if (metadataError) {
        throw metadataError;
      }
    }

    let nextProfile = null;
    let profileError = null;

    if (Object.keys(profilePatch).length > 0) {
      const profileUpdatePatch = { ...profilePatch };
      delete profileUpdatePatch.id;

      const { data: updatedProfile, error: updateProfileError } = await dataClient
        .from("profiles")
        .update(profileUpdatePatch)
        .eq("id", auth.user.id)
        .select("*")
        .maybeSingle();

      if (updateProfileError) {
        profileError = updateProfileError;
      } else if (updatedProfile) {
        nextProfile = updatedProfile;
      } else {
        const { data: insertedProfile, error: insertProfileError } = await dataClient
          .from("profiles")
          .insert(profilePatch)
          .select("*")
          .single();
        nextProfile = insertedProfile;
        profileError = insertProfileError;
      }
    } else {
      const { data: selectedProfile, error: selectProfileError } = await dataClient
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .single();
      nextProfile = selectedProfile;
      profileError = selectProfileError;
    }

    const preferencesRecord = preferences as Record<string, unknown>;
    const preferencesPatch: Record<string, unknown> = { user_id: auth.user.id };
    if ("theme" in preferencesRecord) {
      preferencesPatch.theme = stringValue(preferencesRecord.theme, "system");
    }
    if ("soundEnabled" in preferencesRecord) {
      preferencesPatch.sound_enabled =
        typeof preferencesRecord.soundEnabled === "boolean"
          ? preferencesRecord.soundEnabled
          : undefined;
    }
    if ("startupPage" in preferencesRecord) {
      preferencesPatch.startup_page = stringValue(
        preferencesRecord.startupPage,
        "new-chat",
      );
    }

    const shouldUpdatePreferences = Object.keys(preferencesPatch).length > 1;
    let nextPreferences = null;
    let preferencesError = null;

    if (shouldUpdatePreferences) {
      const preferencesUpdatePatch = { ...preferencesPatch };
      delete preferencesUpdatePatch.user_id;

      const { data: updatedPreferences, error: updatePreferencesError } =
        await dataClient
          .from("user_preferences")
          .update(preferencesUpdatePatch)
          .eq("user_id", auth.user.id)
          .select("*")
          .maybeSingle();

      if (updatePreferencesError) {
        preferencesError = updatePreferencesError;
      } else if (updatedPreferences) {
        nextPreferences = updatedPreferences;
      } else {
        const { data: insertedPreferences, error: insertPreferencesError } =
          await dataClient
            .from("user_preferences")
            .insert(preferencesPatch)
            .select("*")
            .single();
        nextPreferences = insertedPreferences;
        preferencesError = insertPreferencesError;
      }
    }

    if (profileError || preferencesError) {
      const fallbackProfile = {
        avatar_url: stringValue(profilePatch.avatar_url),
        bio: stringValue(profilePatch.bio),
        created_at: auth.user.created_at,
        email: auth.user.email ?? "",
        full_name:
          stringValue(profilePatch.full_name) ||
          stringValue(auth.user.user_metadata?.full_name) ||
          "User",
        id: auth.user.id,
        phone_number: stringValue(profilePatch.phone_number),
        role_title: stringValue(profilePatch.role_title, "Product builder"),
      };

      if (profileError && !preferencesError) {
        return ok(
          {
            profile: fallbackProfile,
            profilePersistenceWarning:
              typeof profileError.message === "string"
                ? profileError.message
                : "Profile row could not be written",
            preferences: nextPreferences,
          },
          { headers: noStoreHeaders },
        );
      }

      throw profileError ?? preferencesError;
    }

    if (nextProfile) {
      const metadata: Record<string, string> = {};
      const fullName = stringValue((nextProfile as Record<string, unknown>).full_name);
      const avatarUrl = stringValue((nextProfile as Record<string, unknown>).avatar_url);

      if (fullName) {
        metadata.full_name = fullName;
      }
      if (avatarUrl) {
        metadata.avatar_url = avatarUrl;
      }

      if (Object.keys(metadata).length > 0) {
        await auth.supabase.auth.updateUser({ data: metadata });
      }
    }

    return ok(
      { profile: nextProfile, preferences: nextPreferences },
      { headers: noStoreHeaders },
    );
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
