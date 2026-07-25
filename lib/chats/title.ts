const DEFAULT_CHAT_TITLE = "New chat";
const MAX_TITLE_LENGTH = 52;
const MAX_TITLE_WORDS = 7;

const leadingRequestPattern =
  /^(can you|could you|would you|please|pls|hey|hi|hello|yo|i want you to|i need you to|help me|tell me|show me|make me|create me)\s+/i;

const smallWords = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

function cleanChatTitleSource(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " code ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/app:\/\/\S+/g, "")
    .replace(/[@#/]+/g, " ")
    .replace(/[<>{}[\]()*_=|\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word, index) => {
      if (!word) {
        return word;
      }

      if (/^[A-Z0-9]{2,}$/.test(word)) {
        return word;
      }

      const lower = word.toLowerCase();
      if (index > 0 && smallWords.has(lower)) {
        return lower;
      }

      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join(" ");
}

export function summarizeChatTitle(value: string, fallback = DEFAULT_CHAT_TITLE) {
  const cleaned = cleanChatTitleSource(value)
    .replace(leadingRequestPattern, "")
    .replace(/[.!?]+.*$/, "")
    .replace(/[,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return fallback;
  }

  const words = cleaned.split(" ").slice(0, MAX_TITLE_WORDS);
  let title = titleCase(words.join(" "));

  if (title.length > MAX_TITLE_LENGTH) {
    title = `${title.slice(0, MAX_TITLE_LENGTH - 1).trim()}...`;
  }

  return title || fallback;
}

export function isAutoChatTitle(title: string, firstMessage?: string) {
  const normalized = title.trim().toLowerCase();

  if (
    !normalized ||
    normalized === "untitled chat" ||
    normalized === DEFAULT_CHAT_TITLE.toLowerCase() ||
    /^new chat\s*\d*$/i.test(title)
  ) {
    return true;
  }

  if (!firstMessage) {
    return false;
  }

  return normalized === firstMessage.trim().slice(0, 80).toLowerCase();
}
