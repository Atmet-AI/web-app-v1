import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedTypes = new Set(["email", "magiclink", "recovery", "invite", "signup", "email_change"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") ?? "email";
  const next = url.searchParams.get("next") ?? url.searchParams.get("redirect_to") ?? "/";
  let redirectTo = new URL("/", url.origin);

  if (next.startsWith("/")) {
    redirectTo = new URL(next, url.origin);
  } else {
    try {
      const parsedNext = new URL(next);

      if (parsedNext.origin === url.origin) {
        redirectTo = parsedNext;
      }
    } catch {
      redirectTo = new URL("/", url.origin);
    }
  }

  if (!tokenHash || !allowedTypes.has(type)) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "invalid_link");
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "email" | "magiclink" | "recovery" | "invite" | "signup" | "email_change",
  });

  if (error) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "expired_link");
    return NextResponse.redirect(redirectTo);
  }

  return NextResponse.redirect(redirectTo);
}
