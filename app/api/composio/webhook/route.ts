import {
  handleGmailToTelegramWebhook,
  verifyComposioWebhookRequest,
} from "@/lib/automations/gmail-telegram";
import { forbidden, ok, serverError } from "@/lib/api/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const verification = verifyComposioWebhookRequest({
      body,
      headers: request.headers,
    });

    if (!verification.ok) {
      return forbidden();
    }

    const payload = JSON.parse(body) as Record<string, unknown>;

    if (payload.type !== "composio.trigger.message") {
      return ok({ handled: false, reason: "ignored_event_type" });
    }

    const result = await handleGmailToTelegramWebhook({
      admin: createSupabaseAdminClient(),
      payload,
    });

    return ok({
      ...result,
      verificationSkipped: verification.skipped,
    });
  } catch (error) {
    return serverError(error);
  }
}

export function GET() {
  return ok({ ok: true });
}
