import type { SupabaseClient } from "@supabase/supabase-js";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function createAgentVersionSnapshot({
  admin,
  agentId,
  changeType,
  createdBy,
  summary,
}: {
  admin: SupabaseClient;
  agentId: string;
  changeType: string;
  createdBy?: string | null;
  summary: string;
}) {
  const { data: agent, error: agentError } = await admin
    .from("workflow_agents")
    .select("*, workflow_nodes(*), workflow_edges(*)")
    .eq("id", agentId)
    .maybeSingle();

  if (agentError || !agent) {
    if (agentError) {
      console.warn("Failed to load agent snapshot", agentError);
    }
    return null;
  }

  const agentRecord = asRecord(agent);
  const { data: latest } = await admin
    .from("workflow_agent_versions")
    .select("version_number")
    .eq("agent_id", agentId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const versionNumber = Number(asRecord(latest).version_number ?? 0) + 1;

  const { data, error } = await admin
    .from("workflow_agent_versions")
    .insert({
      agent_id: agentId,
      change_type: changeType,
      created_by: createdBy ?? null,
      snapshot: agentRecord,
      summary,
      version_number: versionNumber,
      workspace_id: stringValue(agentRecord.workspace_id),
    })
    .select("*")
    .single();

  if (error) {
    console.warn("Failed to create agent version snapshot", error);
    return null;
  }

  return data;
}
