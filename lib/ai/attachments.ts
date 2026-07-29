import { OfficeParser, type SupportedFileType } from "officeparser";

export type ChatAttachmentInput = {
  data: string;
  name: string;
  size: number;
  type: string;
};

export type ChatAttachmentImage = {
  data: string;
  mediaType: string;
};

export type ParsedChatAttachment = {
  error?: string;
  image?: ChatAttachmentImage;
  kind: "document" | "image" | "text" | "unsupported";
  name: string;
  size: number;
  text: string;
  type: string;
};

const MAX_ATTACHMENTS = 6;
const MAX_FILE_BYTES = 150 * 1024 * 1024;
const MAX_EXTRACTED_CHARS_PER_FILE = 14_000;
const MAX_CONTEXT_CHARS = 36_000;

const officeFileTypes = new Set<SupportedFileType>([
  "csv",
  "docx",
  "epub",
  "html",
  "md",
  "odp",
  "ods",
  "odt",
  "pdf",
  "pptx",
  "rtf",
  "xlsx",
]);

const textExtensions = new Set([
  "c",
  "cpp",
  "css",
  "go",
  "java",
  "js",
  "json",
  "jsx",
  "log",
  "md",
  "py",
  "rb",
  "rs",
  "sql",
  "txt",
  "ts",
  "tsx",
  "xml",
  "yaml",
  "yml",
]);

const mimeExtensionMap = new Map([
  ["application/msword", "doc"],
  ["application/pdf", "pdf"],
  ["application/rtf", "rtf"],
  ["application/vnd.ms-excel", "xls"],
  ["application/vnd.ms-powerpoint", "ppt"],
  ["application/vnd.oasis.opendocument.presentation", "odp"],
  ["application/vnd.oasis.opendocument.spreadsheet", "ods"],
  ["application/vnd.oasis.opendocument.text", "odt"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["text/csv", "csv"],
  ["text/html", "html"],
  ["text/markdown", "md"],
]);

function extensionFromName(name: string) {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match?.[1]?.toLowerCase() ?? "";
}

function extensionFromAttachment(name: string, type: string) {
  return extensionFromName(name) || mimeExtensionMap.get(type) || "";
}

function isImageMime(type: string) {
  return /^image\/(png|jpe?g|webp|gif)$/i.test(type);
}

function isTextLike(type: string, extension: string) {
  return (
    type.startsWith("text/") ||
    type === "application/json" ||
    type === "application/xml" ||
    type === "application/javascript" ||
    textExtensions.has(extension)
  );
}

function truncate(value: string, maxLength: number) {
  const cleaned = value.replace(/\u0000/g, "").replace(/\s+\n/g, "\n").trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength).trim()}\n...[truncated]`;
}

function decodeBase64(data: string) {
  const normalized = data.includes(",") ? data.split(",").pop() ?? "" : data;
  return Buffer.from(normalized, "base64");
}

async function parseOfficeText(buffer: Buffer, fileType: SupportedFileType) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const parserConfig = {
      abortSignal: controller.signal,
      ignoreComments: false,
      ignoreHeadersAndFooters: false,
      ignoreNotes: false,
      ocr: false,
    };
    let ast: Awaited<ReturnType<typeof OfficeParser.parseOffice>>;

    try {
      ast = await OfficeParser.parseOffice(buffer, parserConfig);
    } catch (error) {
      if (!fileType) {
        throw error;
      }

      ast = await OfficeParser.parseOffice(buffer, {
        ...parserConfig,
        fileType,
      });
    }

    const result = await ast.to("text", {
      includeImages: true,
      textConfig: {
        preserveLayout: true,
        renderNotes: true,
      },
    });
    const value = typeof result.value === "string" ? result.value : "";

    return value || ast.toText?.() || "";
  } finally {
    clearTimeout(timeout);
  }
}

export async function parseChatAttachment(
  attachment: ChatAttachmentInput,
): Promise<ParsedChatAttachment> {
  const name = attachment.name.trim() || "attachment";
  const type = attachment.type.trim().toLowerCase();
  const size = Number.isFinite(attachment.size) ? attachment.size : 0;
  const extension = extensionFromAttachment(name, type);

  if (!attachment.data) {
    return {
      error: "The uploaded file had no readable content.",
      kind: "unsupported",
      name,
      size,
      text: "",
      type,
    };
  }

  if (size > MAX_FILE_BYTES) {
    return {
      error: "File is larger than the 150 MB per-message limit.",
      kind: "unsupported",
      name,
      size,
      text: "",
      type,
    };
  }

  if (isImageMime(type)) {
    return {
      image: {
        data: attachment.data,
        mediaType: type,
      },
      kind: "image",
      name,
      size,
      text: "Image attached visually. Use the image content if the selected AI model supports vision.",
      type,
    };
  }

  const buffer = decodeBase64(attachment.data);

  if (
    isTextLike(type, extension) &&
    !officeFileTypes.has(extension as SupportedFileType)
  ) {
    return {
      kind: "text",
      name,
      size,
      text: truncate(buffer.toString("utf8"), MAX_EXTRACTED_CHARS_PER_FILE),
      type,
    };
  }

  if (officeFileTypes.has(extension as SupportedFileType)) {
    try {
      const text = await parseOfficeText(buffer, extension as SupportedFileType);
      return {
        kind: "document",
        name,
        size,
        text: truncate(
          text || "No extractable text was found in this file.",
          MAX_EXTRACTED_CHARS_PER_FILE,
        ),
        type,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Document parser could not read this file.",
        kind: "document",
        name,
        size,
        text:
          "A document was attached, but text extraction failed. The assistant can still identify the file name and type, but cannot read its body text from this upload.",
        type,
      };
    }
  }

  if (extension === "doc" || extension === "xls" || extension === "ppt") {
    return {
      error:
        "Legacy Microsoft Office files are attached but cannot be text-extracted reliably. Save/export the file as DOCX, XLSX, PPTX, PDF, or paste the text.",
      kind: "document",
      name,
      size,
      text:
        "A legacy Microsoft Office document was attached, but this upload format could not be text-extracted.",
      type,
    };
  }

  return {
    error: "This file type is not supported for text extraction yet.",
    kind: "unsupported",
    name,
    size,
    text: "",
    type,
  };
}

export async function parseChatAttachments(value: unknown) {
  const attachments = Array.isArray(value)
    ? value
        .map((item) => {
          const record =
            item && typeof item === "object" && !Array.isArray(item)
              ? (item as Record<string, unknown>)
              : {};

          return {
            data: typeof record.data === "string" ? record.data : "",
            name: typeof record.name === "string" ? record.name : "",
            size: typeof record.size === "number" ? record.size : 0,
            type: typeof record.type === "string" ? record.type : "",
          };
        })
        .filter((item) => item.name || item.data)
        .slice(0, MAX_ATTACHMENTS)
    : [];

  return Promise.all(attachments.map(parseChatAttachment));
}

export function buildAttachmentContext(attachments: ParsedChatAttachment[]) {
  if (attachments.length === 0) {
    return "";
  }

  const sections = attachments.map((attachment, index) => {
    const heading = [
      `### Attachment ${index + 1}: ${attachment.name}`,
      `Type: ${attachment.type || "unknown"}`,
      `Size: ${attachment.size} bytes`,
      `Kind: ${attachment.kind}`,
      attachment.error ? `Warning: ${attachment.error}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return [heading, attachment.text ? `Content:\n${attachment.text}` : ""]
      .filter(Boolean)
      .join("\n");
  });

  return truncate(
    [
      "Uploaded File Context",
      "Use this uploaded-file context when answering the user's latest message. If an attachment is an image and visual content is available in the model input, inspect the image directly. If extraction failed, say what was unavailable. Do not tell the user to upload a PDF unless the user specifically asked for PDF; for documents, prefer DOCX, XLSX, PPTX, PDF, plain text, Markdown, CSV, or screenshots as appropriate.",
      ...sections,
    ].join("\n\n"),
    MAX_CONTEXT_CHARS,
  );
}

export function serializeAttachmentMetadata(attachments: ParsedChatAttachment[]) {
  return attachments.map((attachment) => ({
    error: attachment.error ?? null,
    kind: attachment.kind,
    name: attachment.name,
    previewData: attachment.image?.data ?? null,
    size: attachment.size,
    type: attachment.type,
  }));
}
