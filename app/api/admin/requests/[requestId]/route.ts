import { isRouteResponse, requireSuperAdmin, type ApiAuthContext } from "@/lib/api/auth";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { hasTransactionalMailConfig, sendTransactionalMail } from "@/lib/mail/smtp";

type RouteContext = {
  params: Promise<{ requestId: string }>;
};

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function getAppOrigin(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;

  return configuredOrigin && !configuredOrigin.includes("localhost")
    ? configuredOrigin.replace(/\/$/, "")
    : requestOrigin;
}

function isAlreadyRegisteredError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("already") || message.includes("registered");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function signupEmailHtml({
  actionLink,
  fullName,
}: {
  actionLink: string;
  fullName: string;
}) {
  const escapedActionLink = escapeHtml(actionLink);
  const escapedFullName = escapeHtml(fullName);
  const greeting = escapedFullName ? `Hi ${escapedFullName},` : "Hi,";

  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1c1917">
      <p>${greeting}</p>
      <p>Your Atmet access request was approved. Use the secure link below to create your password and finish your account setup.</p>
      <p>
        <a href="${escapedActionLink}" style="display:inline-block;border-radius:10px;background:#292524;color:#fff;padding:12px 18px;text-decoration:none">
          Complete signup
        </a>
      </p>
      <p style="color:#78716c;font-size:13px">If the button does not work, paste this link into your browser:</p>
      <p style="word-break:break-all;color:#57534e;font-size:13px">${escapedActionLink}</p>
    </div>
  `;
}

function getSignupPath(signupUrl: string) {
  try {
    const parsedSignupUrl = new URL(signupUrl);
    return `${parsedSignupUrl.pathname}${parsedSignupUrl.search}`;
  } catch {
    return signupUrl.startsWith("/") ? signupUrl : "/signup";
  }
}

function getAppConfirmLink({
  signupUrl,
  tokenHash,
  type,
}: {
  signupUrl: string;
  tokenHash: string;
  type: string;
}) {
  const origin = new URL(signupUrl).origin;
  const confirmUrl = new URL("/auth/confirm", origin);

  confirmUrl.searchParams.set("token_hash", tokenHash);
  confirmUrl.searchParams.set("type", type);
  confirmUrl.searchParams.set("next", getSignupPath(signupUrl));

  return confirmUrl.toString();
}

async function generateWaitlistActionLink({
  auth,
  email,
  fullName,
  requestId,
  signupUrl,
}: {
  auth: ApiAuthContext;
  email: string;
  fullName: string;
  requestId: string;
  signupUrl: string;
}) {
  const inviteResult = await auth.admin.auth.admin.generateLink({
    email,
    options: {
      data: {
        full_name: fullName,
        waitlist_request_id: requestId,
      },
      redirectTo: signupUrl,
    },
    type: "invite",
  });

  if (!inviteResult.error) {
    const properties = inviteResult.data.properties;
    return properties?.hashed_token
      ? getAppConfirmLink({
          signupUrl,
          tokenHash: properties.hashed_token,
          type: properties.verification_type ?? "invite",
        })
      : properties?.action_link ?? "";
  }

  if (!isAlreadyRegisteredError(inviteResult.error)) {
    throw inviteResult.error;
  }

  const magicLinkResult = await auth.admin.auth.admin.generateLink({
    email,
    options: {
      redirectTo: signupUrl,
    },
    type: "magiclink",
  });

  if (magicLinkResult.error) {
    throw magicLinkResult.error;
  }

  const properties = magicLinkResult.data.properties;
  return properties?.hashed_token
    ? getAppConfirmLink({
        signupUrl,
        tokenHash: properties.hashed_token,
        type: properties.verification_type ?? "magiclink",
      })
    : properties?.action_link ?? "";
}

async function sendWaitlistApprovalEmail({
  auth,
  email,
  fullName,
  requestId,
  signupUrl,
}: {
  auth: ApiAuthContext;
  email: string;
  fullName: string;
  requestId: string;
  signupUrl: string;
}) {
  if (hasTransactionalMailConfig()) {
    const actionLink = await generateWaitlistActionLink({
      auth,
      email,
      fullName,
      requestId,
      signupUrl,
    });

    if (!actionLink) {
      throw new Error("Supabase did not generate a signup link.");
    }

    const provider = await sendTransactionalMail({
      html: signupEmailHtml({ actionLink, fullName }),
      subject: "Your Atmet access is approved",
      text: [
        fullName ? `Hi ${fullName},` : "Hi,",
        "",
        "Your Atmet access request was approved.",
        "Use this secure link to create your password and finish setup:",
        actionLink,
      ].join("\n"),
      to: email,
    });

    return { provider };
  }

  const { error: inviteError } = await auth.admin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      waitlist_request_id: requestId,
    },
    redirectTo: signupUrl,
  });

  if (inviteError && !isAlreadyRegisteredError(inviteError)) {
    throw inviteError;
  }

  if (inviteError && isAlreadyRegisteredError(inviteError)) {
    const { error: magicLinkError } = await auth.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: signupUrl,
        shouldCreateUser: false,
      },
    });

    if (magicLinkError) {
      throw magicLinkError;
    }

    return { provider: "supabase_magic_link" as const };
  }

  return { provider: "supabase_invite" as const };
}

async function getDerivedRequestStatus(
  admin: ApiAuthContext["admin"],
  email: unknown,
  status: string,
) {
  if (status === "rejected") {
    return "rejected";
  }

  if (status !== "approved") {
    return status;
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return "invited";
  }

  const { data } = await admin
    .from("profiles")
    .select("onboarded_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  return data?.onboarded_at ? "joined" : "invited";
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireSuperAdmin();

    if (isRouteResponse(auth)) {
      return auth;
    }

    const { requestId } = await context.params;
    const body = await readJson(request);
    const status = stringValue(body.status);

    if (!["approved", "rejected", "pending"].includes(status)) {
      return badRequest("Status must be approved, rejected, or pending");
    }

    const { data: existingRequest, error: existingRequestError } = await auth.admin
      .from("waitlist_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (existingRequestError) {
      throw existingRequestError;
    }

    const { data, error } = await auth.admin
      .from("waitlist_requests")
      .update({
        status,
        reviewed_by: auth.user.id,
        reviewed_at: status === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", requestId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    let delivery: {
      provider: "custom_smtp" | "resend" | "supabase_invite" | "supabase_magic_link";
    } | null = null;
    let signupUrl: string | null = null;

    if (status === "approved") {
      const origin = getAppOrigin(request);
      signupUrl = `${origin}/signup?approved=1&request=${requestId}`;

      try {
        delivery = await sendWaitlistApprovalEmail({
          auth,
          email: normalizeEmail(data.email),
          fullName: stringValue(data.full_name),
          requestId,
          signupUrl,
        });
      } catch (emailError) {
        await auth.admin
          .from("waitlist_requests")
          .update({
            status: existingRequest.status,
            reviewed_by: existingRequest.reviewed_by,
            reviewed_at: existingRequest.reviewed_at,
          })
          .eq("id", requestId);
        throw emailError;
      }
    }

    await auth.admin.from("admin_audit_logs").insert({
      actor_id: auth.user.id,
      action: `waitlist.${status}`,
      target_type: "waitlist_request",
      target_id: requestId,
      metadata: { email: data.email },
    });

    return ok({
      request: {
        ...data,
        derived_status: await getDerivedRequestStatus(auth.admin, data.email, status),
      },
      delivery,
      signupUrl,
    });
  } catch (error) {
    return serverError(error);
  }
}
