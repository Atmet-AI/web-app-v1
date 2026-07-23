import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let pendingCookies: Array<{
    name: string;
    options?: Parameters<typeof NextResponse.next>["0"] extends never
      ? never
      : Record<string, unknown>;
    value: string;
  }> = [];
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies = cookiesToSet.map(({ name, value, options }) => ({
            name,
            options,
            value,
          }));

          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const code = request.nextUrl.searchParams.get("code");

  if (pathname === "/signup" && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=expired_link", request.url));
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete("code");
    redirectUrl.searchParams.set("invite", redirectUrl.searchParams.get("invite") ?? "1");
    redirectUrl.searchParams.set("type", "invite");

    const redirectResponse = NextResponse.redirect(redirectUrl);
    pendingCookies.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options);
    });

    return redirectResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const workspaceInviteId = user.user_metadata?.workspace_invite_id;
  const inviteSetupCompleted =
    user.user_metadata?.invite_setup_completed === true;
  const hasPendingWorkspaceInvite =
    typeof workspaceInviteId === "string" &&
    workspaceInviteId.length > 0 &&
    !inviteSetupCompleted;

  if (hasPendingWorkspaceInvite && pathname !== "/signup") {
    return NextResponse.redirect(
      new URL("/signup?invite=1&type=invite", request.url),
    );
  }

  return response;
}

export const config = {
  matcher: ["/", "/signup"],
};
