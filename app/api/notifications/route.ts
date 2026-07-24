import { isRouteResponse, requireUser } from "@/lib/api/auth";
import { ok, serverError } from "@/lib/api/http";

type AuthContext = Exclude<Awaited<ReturnType<typeof requireUser>>, Response>;

async function loadNotifications(
  userId: string,
  admin: AuthContext["admin"],
) {
  return admin
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(30);
}

export async function GET() {
  try {
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { data, error } = await loadNotifications(auth.user.id, auth.admin);

    if (error) {
      throw error;
    }

    return ok({ notifications: data ?? [] });
  } catch (error) {
    return serverError(error);
  }
}
