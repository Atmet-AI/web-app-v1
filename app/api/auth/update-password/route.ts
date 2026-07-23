import { isRouteResponse, requireUser } from "@/lib/api/auth";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const auth = await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const body = await readJson(request);
    const password = stringValue(body.password);

    if (!password) {
      return badRequest("Password is required");
    }

    if (password.length < 8) {
      return badRequest("Password must be at least 8 characters");
    }

    const { error } = await auth.supabase.auth.updateUser({ password });

    if (error) {
      return badRequest(error.message);
    }

    await auth.supabase.auth.signOut();

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
