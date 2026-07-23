import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { ok, serverError } from "@/lib/api/http";

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function deriveWaitlistStatus(
  status: unknown,
  profile: { onboarded_at?: unknown } | undefined,
) {
  const normalizedStatus =
    typeof status === "string" ? status.trim().toLowerCase() : "pending";

  if (normalizedStatus === "rejected") {
    return "rejected";
  }

  if (normalizedStatus === "approved") {
    return profile?.onboarded_at ? "joined" : "invited";
  }

  return normalizedStatus || "pending";
}

export async function GET() {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await auth.admin
      .from("waitlist_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const requests = data ?? [];
    const emails = Array.from(
      new Set(requests.map((request) => normalizeEmail(request.email)).filter(Boolean)),
    );

    const profilesByEmail = new Map<string, { onboarded_at?: unknown }>();

    if (emails.length > 0) {
      const { data: profiles, error: profilesError } = await auth.admin
        .from("profiles")
        .select("email,onboarded_at")
        .in("email", emails);

      if (profilesError) {
        throw profilesError;
      }

      for (const profile of profiles ?? []) {
        const email = normalizeEmail(profile.email);
        if (email) {
          profilesByEmail.set(email, profile);
        }
      }
    }

    return ok({
      requests: requests.map((request) => {
        const email = normalizeEmail(request.email);
        const profile = profilesByEmail.get(email);
        return {
          ...request,
          derived_status: deriveWaitlistStatus(request.status, profile),
          onboarded_at: profile?.onboarded_at ?? null,
        };
      }),
    });
  } catch (error) {
    return serverError(error);
  }
}
