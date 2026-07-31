import {
  handleGmailToTelegramWebhook,
  verifyComposioWebhookRequest,
} from "@/lib/automations/gmail-telegram";
import { handleGenericComposioTriggerWebhook } from "@/lib/agents/composio-triggers";
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

    const admin = createSupabaseAdminClient();
    const genericResult = await handleGenericComposioTriggerWebhook({ admin, payload });

    if (genericResult.handled) {
      return ok({
        ...genericResult,
        handler: "generic",
        verificationSkipped: verification.skipped,
      });
    }

    const result = await handleGmailToTelegramWebhook({ admin, payload });

    return ok({
      ...result,
      handler: result.handled ? "gmail_telegram" : "none",
      verificationSkipped: verification.skipped,
    });
  } catch (error) {
    return serverError(error);
  }
}

export function GET() {
  return ok({ ok: true });
}
