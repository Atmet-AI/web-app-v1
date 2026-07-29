import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const appsDocsDirectory = path.join(process.cwd(), "public", "Apps-docs");

const appDocAliases = {
  calendar: ["calendar", "google-calendar", "googlecalendar"],
  chatgpt: ["chatgpt", "openai", "open-ai"],
  claude: ["claude", "anthropic"],
  drive: ["drive", "google-drive", "googledrive"],
  github: ["github"],
  gmail: ["gmail"],
  "google-sheets": ["google-sheets", "googlesheets", "sheets"],
  instagram: ["instagram"],
  outlook: ["outlook"],
  slack: ["slack"],
  telegram: ["telegram", "telegrm"],
} as const satisfies Record<string, readonly string[]>;

type AppDocItem = {
  description: string;
  slug: string;
  title: string;
};

type AppDocsForRequest = {
  context: string;
  fileName: string;
  toolSlugs: string[];
  triggerSlugs: string[];
};

function normalizeLookupKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function truncateText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength
    ? `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}...`
    : normalized;
}

async function readAppDoc(appKey: string) {
  const files = await readdir(appsDocsDirectory).catch(() => []);
  const markdownFiles = files.filter((file) => file.toLowerCase().endsWith(".md"));
  const aliases = [
    appKey,
    ...(appDocAliases[appKey as keyof typeof appDocAliases] ?? []),
  ].map(normalizeLookupKey);
  const fileName = markdownFiles.find((file) =>
    aliases.includes(normalizeLookupKey(file.replace(/\.md$/i, ""))),
  );

  if (!fileName) {
    return null;
  }

  const markdown = await readFile(path.join(appsDocsDirectory, fileName), "utf8");
  const trimmed = markdown.trim();
  return trimmed ? { fileName, markdown: trimmed } : null;
}

function getMarkdownSection(markdown: string, heading: string) {
  const pattern = new RegExp(`^##\\s+${heading}\\s*$`, "im");
  const match = pattern.exec(markdown);

  if (!match) {
    return "";
  }

  const afterHeading = markdown.slice(match.index + match[0].length);
  const nextHeading = /^##\s+/m.exec(afterHeading);
  return nextHeading ? afterHeading.slice(0, nextHeading.index) : afterHeading;
}

function parseDocItems(markdown: string, heading: string) {
  const section = getMarkdownSection(markdown, heading);
  const matches = Array.from(section.matchAll(/^###\s+(.+)$/gm));

  return matches
    .map((match, index) => {
      const start = match.index ?? 0;
      const end =
        index + 1 < matches.length ? matches[index + 1].index ?? section.length : section.length;
      const block = section.slice(start, end);
      const slug =
        /\*\*Slug:\*\*\s*`?([A-Z0-9_]+)`?/i.exec(block)?.[1]?.trim().toUpperCase() ??
        "";

      if (!slug) {
        return null;
      }

      const description = block
        .replace(/^###\s+.+$/m, "")
        .replace(/\*\*Slug:\*\*.*$/gim, "")
        .split(/^####\s+/m)[0]
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            line &&
            !line.startsWith("|") &&
            !line.startsWith("- **") &&
            !/^#+\s+/.test(line),
        )
        .join(" ");

      return {
        description: truncateText(description, 360),
        slug,
        title: match[1].trim(),
      } satisfies AppDocItem;
    })
    .filter((item): item is AppDocItem => Boolean(item));
}

function getOverview(markdown: string) {
  const beforeTools = markdown.split(/^##\s+Tools\s*$/im)[0] ?? "";
  return truncateText(
    beforeTools
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && !line.startsWith("- **"))
      .join(" "),
    900,
  );
}

function requestTokens(content: string) {
  return new Set(
    content
      .toLowerCase()
      .replace(/[_:./-]+/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3),
  );
}

function scoreDocItem(item: AppDocItem, content: string) {
  const tokens = requestTokens(content);
  const haystack = `${item.slug} ${item.title} ${item.description}`
    .toLowerCase()
    .replace(/[_:./-]+/g, " ");
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += token.length > 5 ? 4 : 2;
    }
  }

  const normalized = content.toLowerCase();
  const intentSignals = [
    [/\b(send|email to|mail to)\b/, ["send", "message", "email"], 24],
    [/\b(draft)\b/, ["draft", "create"], 20],
    [/\b(reply|respond)\b/, ["reply", "thread"], 20],
    [/\b(forward)\b/, ["forward"], 20],
    [/\b(list|latest|last|recent|fetch|read|get|show|find|search)\b/, ["list", "fetch", "get", "find", "search", "read"], 18],
    [/\b(create|add|new|upload|post)\b/, ["create", "add", "upload", "post"], 16],
    [/\b(update|edit|modify|change)\b/, ["update", "modify", "edit"], 16],
    [/\b(delete|trash|remove)\b/, ["delete", "trash", "remove"], 16],
    [/\b(trigger|when|whenever|automation|schedule|event)\b/, ["trigger", "event", "watch", "webhook"], 20],
  ] as const;

  for (const [pattern, words, weight] of intentSignals) {
    if (pattern.test(normalized) && words.some((word) => haystack.includes(word))) {
      score += weight;
    }
  }

  return score;
}

function rankDocItems(items: AppDocItem[], content: string, limit: number) {
  return items
    .map((item, index) => ({ index, item, score: scoreDocItem(item, content) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}

function formatDocItems(title: string, items: AppDocItem[]) {
  if (items.length === 0) {
    return "";
  }

  return [
    `${title}:`,
    ...items.map((item) =>
      `- ${item.slug}: ${item.title}${item.description ? ` - ${item.description}` : ""}`,
    ),
  ].join("\n");
}

export async function getAppDocsForRequest({
  appKey,
  content,
  maxTools = 18,
  maxTriggers = 10,
}: {
  appKey: string;
  content: string;
  maxTools?: number;
  maxTriggers?: number;
}): Promise<AppDocsForRequest | null> {
  const doc = await readAppDoc(appKey);

  if (!doc) {
    return null;
  }

  const tools = rankDocItems(parseDocItems(doc.markdown, "Tools"), content, maxTools);
  const triggers = rankDocItems(
    parseDocItems(doc.markdown, "Triggers"),
    content,
    maxTriggers,
  );
  const overview = getOverview(doc.markdown);
  const context = [
    `Source: public/Apps-docs/${doc.fileName}`,
    overview ? `Overview: ${overview}` : "",
    formatDocItems("Relevant documented tools", tools),
    formatDocItems("Relevant documented triggers", triggers),
    "Use these docs as the app capability map when choosing Composio tools or explaining trigger-based automations.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    context,
    fileName: doc.fileName,
    toolSlugs: tools.map((tool) => tool.slug),
    triggerSlugs: triggers.map((trigger) => trigger.slug),
  };
}
