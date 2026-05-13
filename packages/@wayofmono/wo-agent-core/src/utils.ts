import type { Message, TruncationResult } from "./types.js";

const DEFAULT_MAX_BYTES = 1024 * 1024;
const DEFAULT_MAX_LINES = 10000;

export function truncateHead(
  text: string,
  maxBytes = DEFAULT_MAX_BYTES,
  maxLines = DEFAULT_MAX_LINES
): TruncationResult {
  const encoder = new TextEncoder();
  const originalLength = encoder.encode(text).length;

  if (originalLength <= maxBytes) {
    const lines = text.split("\n");
    if (lines.length <= maxLines) {
      return { text, truncated: false, originalLength };
    }
    return {
      text: lines.slice(0, maxLines).join("\n"),
      truncated: true,
      originalLength,
    };
  }

  let truncated = "";
  let bytes = 0;
  const lines = text.split("\n");
  let lineCount = 0;

  for (const line of lines) {
    if (lineCount >= maxLines) break;
    const lineBytes = encoder.encode(line + "\n").length;
    if (bytes + lineBytes > maxBytes) break;
    truncated += line + "\n";
    bytes += lineBytes;
    lineCount++;
  }

  return { text: truncated.trimEnd(), truncated: true, originalLength };
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${size} ${units[i]}`;
}

export function convertToLlm(messages: Message[]): Message[] {
  return messages.map((msg) => {
    if (typeof msg.content === "string") {
      return { ...msg };
    }
    return {
      ...msg,
      content: msg.content.map((c) => {
        if (typeof c === "string") return c;
        if (c.type === "text") return c.text;
        if (c.type === "image") return `[Image: ${c.source.mediaType}]`;
        return JSON.stringify(c);
      }).join(""),
    };
  });
}

export function isToolCallEventType(toolName: string, event: unknown): boolean {
  if (typeof event !== "object" || event === null) return false;
  const e = event as Record<string, unknown>;
  return e.toolName === toolName;
}

export function getMarkdownTheme(theme: {
  fg(color: string, text: string): string;
  bold(text: string): string;
  dim(text: string): string;
}): {
  heading: (text: string, level: number) => string;
  code: (text: string) => string;
  link: (text: string, url: string) => string;
} {
  return {
    heading: (text: string, level: number) => theme.bold(`${"#".repeat(level)} ${text}`),
    code: (text: string) => theme.fg("cyan", text),
    link: (text: string, url: string) => `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`,
  };
}

export async function withFileMutationQueue<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}
