import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTransactionalMailConfig, sendTransactionalMail } from "@/lib/mail/smtp";
import { passwordResetEmail } from "@/lib/mail/templates";

function getResetConfirmLink({
  resetUrl,
  tokenHash,
  type,
}: {
  resetUrl: string;
  tokenHash: string;
  type: string;
}) {
  const origin = new URL(resetUrl).origin;
  const confirmUrl = new URL("/auth/confirm", origin);

  confirmUrl.searchParams.set("token_hash", tokenHash);
  confirmUrl.searchParams.set("type", type);
  confirmUrl.searchParams.set("next", "/login?reset=1");

  return confirmUrl.toString();
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = stringValue(body.email).toLowerCase();

    if (!email) {
      return badRequest("Email is required");
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    if (hasTransactionalMailConfig()) {
      const resetUrl = `${origin}/login?reset=1`;
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin.auth.admin.generateLink({
        email,
        options: {
          redirectTo: resetUrl,
        },
        type: "recovery",
      });

      if (error) {
        return badRequest(error.message);
      }

      const properties = data.properties;
      const actionLink = properties?.hashed_token
        ? getResetConfirmLink({
            resetUrl,
            tokenHash: properties.hashed_token,
            type: properties.verification_type ?? "recovery",
          })
        : properties?.action_link ?? "";

      if (!actionLink) {
        return badRequest("Supabase did not generate a password reset link.");
      }

      await sendTransactionalMail({
        html: passwordResetEmail({ actionLink }),
        subject: "Reset your Atmet password",
        text: [
          "We received a request to reset your Atmet password.",
          "",
          "Use this secure link to choose a new password:",
          actionLink,
          "",
          "If you did not request this, you can ignore this email.",
        ].join("\n"),
        to: email,
      });

      return ok({ success: true });
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/login?reset=1`,
    });

    if (error) {
      return badRequest(error.message);
    }

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
