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

export async function GET(request: Request) {
  try {
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const url = new URL(request.url);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "30", 10) || 30),
    );
    const { data, error } = await auth.admin
      .from("notifications")
      .select("*")
      .eq("user_id", auth.user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return ok({ notifications: data ?? [] });
  } catch (error) {
    return serverError(error);
  }
}
