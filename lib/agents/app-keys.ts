import { connectorCatalog } from "@/lib/connectors/catalog";
import { stringValue } from "@/lib/api/http";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function addAppKey(keys: Set<string>, value: unknown) {
  const raw = stringValue(value).toLowerCase();
  if (!raw) {
    return;
  }

  const connector = connectorCatalog.find(
    (item) =>
      item.key.toLowerCase() === raw ||
      item.name.toLowerCase() === raw ||
      item.logo.toLowerCase() === raw,
  );

  if (connector) {
    keys.add(connector.key);
  }
}

function addMentionedAppNames(keys: Set<string>, content: unknown) {
  const text = stringValue(content).toLowerCase();
  if (!text) {
    return;
  }

  for (const connector of connectorCatalog) {
    const labels = [connector.key, connector.name, connector.logo].filter(Boolean);
    if (
      labels.some((label) =>
        new RegExp(`(^|[^a-z0-9])${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").toLowerCase()}([^a-z0-9]|$)`).test(
          text,
        ),
      )
    ) {
      keys.add(connector.key);
    }
  }
}

export function deriveAppKeysFromChatMessages(messages: unknown[]) {
  const keys = new Set<string>();

  for (const message of messages) {
    const record = asRecord(message);
    const metadata = asRecord(record.metadata);

    for (const mention of Array.isArray(metadata.mentions) ? metadata.mentions : []) {
      const mentionRecord = asRecord(mention);
      if (mentionRecord.kind === "apps") {
        addAppKey(keys, mentionRecord.key);
        addAppKey(keys, mentionRecord.name);
      }
    }

    for (const item of Array.isArray(metadata.connectedAppContext)
      ? metadata.connectedAppContext
      : []) {
      const appRecord = asRecord(item);
      addAppKey(keys, appRecord.appKey);
    }

    addMentionedAppNames(keys, record.content);
  }

  return Array.from(keys);
}
