import type { SupabaseClient } from "@supabase/supabase-js";
import type { JsonRecord } from "@/lib/api/http";
import { stringValue } from "@/lib/api/http";
import { runWorkflowAgent } from "@/lib/agents/runner";
import { getComposioTriggerId, getComposioTriggerSlug } from "@/lib/automations/gmail-telegram";

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function findDeepString(value: unknown, keys: string[]) {
  const stack = [value];
  const normalizedKeys = keys.map((key) => key.toLowerCase());

  while (stack.length > 0) {
    const current = stack.shift();
    const record = asRecord(current);
    for (const [key, item] of Object.entries(record)) {
      if (normalizedKeys.includes(key.toLowerCase()) && typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        stack.push(item);
      }
    }
  }

  return "";
}

function sanitizeTriggerEvent(payload: JsonRecord, triggerSlug: string, triggerId: string) {
  return {
    appKey: findDeepString(payload, ["appKey", "toolkit", "app"]),
    eventId: findDeepString(payload, [
      "event_id",
      "eventId",
      "id",
      "message_id",
      "messageId",
    ]),
    receivedAt:
      findDeepString(payload, ["date", "received_at", "receivedAt", "created_at", "createdAt"]) ||
      new Date().toISOString(),
    triggerId,
    triggerSlug,
  };
}

export async function handleGenericComposioTriggerWebhook({
  admin,
  payload,
}: {
  admin: SupabaseClient;
  payload: JsonRecord;
}) {
  const triggerSlug = getComposioTriggerSlug(payload);
  const triggerId = getComposioTriggerId(payload);

  if (!triggerSlug && !triggerId) {
    return { handled: false, reason: "missing_trigger_identity", results: [] };
  }

  let query = admin
    .from("workflow_agents")
    .select("id, settings")
    .eq("runtime_state", "running")
    .eq("status", "active")
    .eq("settings->eventTrigger->>provider", "composio")
    .is("deleted_at", null);

  if (triggerId) {
    query = query.eq("settings->eventTrigger->>triggerId", triggerId);
  } else {
    query = query.eq("settings->eventTrigger->>triggerSlug", triggerSlug);
  }

  const { data: agents, error } = await query;
  if (error) {
    throw error;
  }

  const results = [];
  for (const agent of agents ?? []) {
    const agentId = stringValue(agent.id);
    if (!agentId) {
      continue;
    }

    try {
      const result = await runWorkflowAgent({
        admin,
        agentId,
        startedBy: null,
        trigger: "composio",
        triggerEvent: sanitizeTriggerEvent(payload, triggerSlug, triggerId),
      });
      results.push({ agentId, ok: true, runId: result.runId, status: result.status });
    } catch (error) {
      results.push({
        agentId,
        error: error instanceof Error ? error.message : "Trigger run failed",
        ok: false,
      });
    }
  }

  return {
    handled: results.length > 0,
    reason: results.length > 0 ? "matched_agents" : "no_matching_agents",
    results,
  };
}
