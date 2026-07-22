import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";

const otpTypes = new Set(["email", "magiclink", "recovery", "invite", "signup", "email_change"]);

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = stringValue(body.email).toLowerCase();
    const token = stringValue(body.token);
    const type = stringValue(body.type, "email");

    if (!email || !token) {
      return badRequest("Email and OTP are required");
    }

    if (!otpTypes.has(type)) {
      return badRequest("Invalid OTP type");
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as "email" | "magiclink" | "recovery" | "invite" | "signup" | "email_change",
    });

    if (error) {
      return badRequest(error.message);
    }

    return ok({ user: data.user, session: data.session });
  } catch (error) {
    return serverError(error);
  }
}
