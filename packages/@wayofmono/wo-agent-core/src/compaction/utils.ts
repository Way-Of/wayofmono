import type { Message, MessageContent } from "@wayofmono/wo-ai";

export interface FileOperations {
  read: Set<string>;
  written: Set<string>;
  edited: Set<string>;
}

export function createFileOps(): FileOperations {
  return { read: new Set(), written: new Set(), edited: new Set() };
}

function normalizePath(p: unknown): string | undefined {
  if (typeof p === "string" && p.length > 0) return p;
  return undefined;
}

export function extractFileOpsFromMessage(message: Message, fileOps: FileOperations): void {
  if (message.role !== "assistant") return;
  if (typeof message.content === "string") return;

  for (const block of message.content) {
    if (block.type !== "tool_use") continue;
    const name = block.name;
    const args = block.input || {};
    const path = normalizePath(args.path);
    if (!path) continue;

    switch (name) {
      case "read":
        fileOps.read.add(path);
        break;
      case "write":
        fileOps.written.add(path);
        break;
      case "edit":
      case "edit-diff":
        fileOps.edited.add(path);
        break;
    }
  }
}

export function computeFileLists(fileOps: FileOperations): { readFiles: string[]; modifiedFiles: string[] } {
  const modified = new Set([...fileOps.edited, ...fileOps.written]);
  const readOnly = [...fileOps.read].filter(f => !modified.has(f)).sort();
  const modifiedFiles = [...modified].sort();
  return { readFiles: readOnly, modifiedFiles };
}

export function formatFileOperations(readFiles: string[], modifiedFiles: string[]): string {
  const sections: string[] = [];
  if (readFiles.length > 0) {
    sections.push(`<read-files>\n${readFiles.join("\n")}\n</read-files>`);
  }
  if (modifiedFiles.length > 0) {
    sections.push(`<modified-files>\n${modifiedFiles.join("\n")}\n</modified-files>`);
  }
  if (sections.length === 0) return "";
  return `\n\n${sections.join("\n\n")}`;
}

const TOOL_RESULT_MAX_CHARS = 2000;

function truncateForSummary(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const truncated = text.length - maxChars;
  return `${text.slice(0, maxChars)}\n\n[... ${truncated} more characters truncated]`;
}

export function serializeConversation(messages: Message[]): string {
  const parts: string[] = [];

  for (const msg of messages) {
    if (msg.role === "user") {
      const content = typeof msg.content === "string"
        ? msg.content
        : msg.content.filter((c): c is MessageContent & { type: "text" } => c.type === "text")
            .map(c => c.text).join("");
      if (content) parts.push(`[User]: ${content}`);
    } else if (msg.role === "assistant") {
      if (typeof msg.content === "string") {
        parts.push(`[Assistant]: ${msg.content}`);
      } else {
        const textParts: string[] = [];
        const toolCalls: string[] = [];
        for (const block of msg.content) {
          if (block.type === "text") textParts.push(block.text);
          if (block.type === "tool_use") {
            const argsStr = Object.entries(block.input || {})
              .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
              .join(", ");
            toolCalls.push(`${block.name}(${argsStr})`);
          }
        }
        if (textParts.length > 0) parts.push(`[Assistant]: ${textParts.join("\n")}`);
        if (toolCalls.length > 0) parts.push(`[Assistant tool calls]: ${toolCalls.join("; ")}`);
      }
    } else if (msg.role === "tool") {
      const content = typeof msg.content === "string" ? msg.content : "";
      if (content) parts.push(`[Tool result]: ${truncateForSummary(content, TOOL_RESULT_MAX_CHARS)}`);
    }
  }

  return parts.join("\n\n");
}

export const SUMMARIZATION_SYSTEM_PROMPT = `You are a context summarization assistant. Your task is to read a conversation between a user and an AI coding assistant, then produce a structured summary following the exact format specified.

Do NOT continue the conversation. Do NOT respond to any questions in the conversation. ONLY output the structured summary.`;
