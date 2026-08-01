export type ConnectorCatalogEntry = {
  description: string;
  gradient: string;
  key: string;
  logo: string;
  name: string;
};

export const connectorCatalog = [
  {
    description: "Use OpenAI chat models inside Atmet workflows.",
    gradient: "from-emerald-400/20 via-stone-100/10 to-stone-500/10",
    key: "chatgpt",
    logo: "https://svgl.app/openai.svg",
    name: "ChatGPT",
  },
  {
    description: "Use Anthropic Claude for writing, analysis, and reasoning.",
    gradient: "from-orange-300/20 via-stone-100/10 to-stone-500/10",
    key: "claude",
    logo: "https://svgl.app/anthropic.svg",
    name: "Claude",
  },
  {
    description: "Read, draft, and send Gmail messages with workspace context.",
    gradient: "from-red-300/20 via-stone-100/10 to-blue-300/10",
    key: "gmail",
    logo: "https://svgl.app/gmail.svg",
    name: "Gmail",
  },
  {
    description: "Read, draft, and send Outlook mail with Microsoft workspace context.",
    gradient: "from-sky-400/20 via-stone-100/10 to-blue-500/10",
    key: "outlook",
    logo: "https://svgl.app/outlook.svg",
    name: "Microsoft Outlook",
  },
  {
    description: "Search, read, and organize shared workspace files.",
    gradient: "from-sky-300/20 via-stone-100/10 to-lime-300/10",
    key: "drive",
    logo: "https://svgl.app/google-drive.svg",
    name: "Drive",
  },
  {
    description: "Read spreadsheet data and create structured updates.",
    gradient: "from-green-300/20 via-stone-100/10 to-emerald-300/10",
    key: "google-sheets",
    logo: "https://svgl.app/google-sheets.svg",
    name: "Google Sheets",
  },
  {
    description: "Track Instagram content, comments, and social workflow context.",
    gradient: "from-pink-400/20 via-stone-100/10 to-orange-300/10",
    key: "instagram",
    logo: "https://svgl.app/instagram.svg",
    name: "Instagram",
  },
  {
    description: "Use meetings, availability, and follow-ups in Atmet.",
    gradient: "from-blue-300/20 via-stone-100/10 to-amber-300/10",
    key: "calendar",
    logo: "https://svgl.app/google-calendar.svg",
    name: "Calendar",
  },
  {
    description: "Route Telegram messages and workflow updates through Atmet.",
    gradient: "from-sky-400/20 via-stone-100/10 to-cyan-300/10",
    key: "telegram",
    logo: "https://svgl.app/telegram.svg",
    name: "Telegram",
  },
  {
    description: "Summarize channels and turn decisions into tasks.",
    gradient: "from-violet-400/20 via-stone-100/10 to-amber-300/10",
    key: "slack",
    logo: "https://svgl.app/slack.svg",
    name: "Slack",
  },
  {
    description: "Track pull requests, issues, reviews, and releases.",
    gradient: "from-stone-500/20 via-stone-100/10 to-blue-400/10",
    key: "github",
    logo: "https://svgl.app/github_dark.svg",
    name: "GitHub",
  },
] as const satisfies ConnectorCatalogEntry[];

export const connectorCatalogKeys = connectorCatalog.map((connector) => connector.key);

export function getConnectorCatalogEntry(appKey: string) {
  return connectorCatalog.find((connector) => connector.key === appKey) ?? null;
}
