import { appendFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SessionHeader, SessionMessageLine, SessionStoreConfig, ToolCallData } from "./types.js";

const DEFAULT_PREFIX = "wo-chat-";
const DEFAULT_MAX_FILE_BYTES = 12 * 1024 * 1024;
const DEFAULT_MAX_LINE_CHARS = 1_000_000;

export function sanitizeKey(raw: string): string {
  const t = raw.trim().slice(0, 200).replace(/[^a-zA-Z0-9._-]/g, "_");
  return t.length > 0 ? t : "session";
}

export function createSessionStore(config: SessionStoreConfig) {
  const dir = config.sessionsDir;
  const prefix = config.prefix ?? DEFAULT_PREFIX;
  const maxFileBytes = config.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
  const maxLineChars = config.maxLineChars ?? DEFAULT_MAX_LINE_CHARS;

  async function ensureDir(): Promise<void> {
    await mkdir(dir, { recursive: true });
  }

  function sessionPath(sessionKey: string): string {
    return join(dir, `${prefix}${sanitizeKey(sessionKey)}.jsonl`);
  }

  function trimContent(s: string): string {
    if (s.length <= maxLineChars) return s;
    return `${s.slice(0, maxLineChars - 20)}\n…[truncated]`;
  }

  async function ensureHeader(sessionKey: string, workspace: string): Promise<void> {
    const abs = sessionPath(sessionKey);
    try {
      await stat(abs);
    } catch {
      const key = sanitizeKey(sessionKey);
      const header: SessionHeader = {
        type: "session",
        kind: "wo-agent",
        id: key,
        workspace,
        createdAt: new Date().toISOString(),
        engine: "wo-agent",
      };
      await ensureDir();
      await writeFile(abs, `${JSON.stringify(header)}\n`, "utf8");
    }
  }

  async function loadMessages(sessionKey: string): Promise<Array<{ role: string; content: string }>> {
    const abs = sessionPath(sessionKey);
    try {
      const st = await stat(abs);
      if (!st.isFile() || st.size > maxFileBytes) return [];
      const text = await readFile(abs, "utf8");
      const out: Array<{ role: string; content: string }> = [];
      for (const line of text.split("\n")) {
        const t = line.trim();
        if (!t) continue;
        try {
          const row = JSON.parse(t) as Record<string, unknown>;
          if (row.type !== "message" || !row.message) continue;
          const msg = row.message as Record<string, unknown>;
          const role = String(msg.role ?? "");
          const content = String(msg.content ?? "");
          if (role === "user" || role === "assistant") {
            out.push({ role, content });
          }
        } catch {
          /* skip bad line */
        }
      }
      return out;
    } catch {
      return [];
    }
  }

  async function syncMessages(sessionKey: string, messages: Array<{ role: string; content: string }>, workspace: string): Promise<void> {
    const key = sanitizeKey(sessionKey);
    const userAsst = messages.filter(
      m => m.role === "user" || (m.role === "assistant" && m.content.trim().length > 0),
    );
    const header: SessionHeader = {
      type: "session",
      kind: "wo-agent",
      id: key,
      workspace,
      createdAt: new Date().toISOString(),
      engine: "wo-agent",
    };
    const lines: string[] = [JSON.stringify(header)];
    for (const m of userAsst) {
      const row: SessionMessageLine = {
        type: "message",
        message: {
          role: m.role as "user" | "assistant",
          content: trimContent(m.content),
          createdAt: new Date().toISOString(),
        },
      };
      lines.push(JSON.stringify(row));
    }
    await ensureDir();
    const abs = sessionPath(key);
    const tmp = `${abs}.tmp`;
    const body = `${lines.join("\n")}\n`;
    await writeFile(tmp, body, "utf8");
    await rename(tmp, abs);
  }

  async function appendMessage(sessionKey: string, role: "user" | "assistant" | "tool", content: string, workspace: string): Promise<void> {
    const key = sanitizeKey(sessionKey);
    await ensureHeader(key, workspace);
    const abs = sessionPath(key);
    const row: SessionMessageLine = {
      type: "message",
      message: {
        role: role as "user" | "assistant",
        content: trimContent(content),
        createdAt: new Date().toISOString(),
      },
    };
    await appendFile(abs, `${JSON.stringify(row)}\n`, "utf8");
  }

  async function appendToolCalls(sessionKey: string, toolCalls: ToolCallData[], workspace: string): Promise<void> {
    const key = sanitizeKey(sessionKey);
    await ensureHeader(key, workspace);
    const abs = sessionPath(key);
    const row = {
      type: "tool_calls",
      toolCalls: toolCalls.map(tc => ({
        id: tc.id,
        name: tc.name,
        arguments: tc.arguments,
        timestamp: new Date().toISOString(),
      })),
    };
    await appendFile(abs, `${JSON.stringify(row)}\n`, "utf8");
  }

  return {
    dir,
    sessionPath,
    ensureDir,
    loadMessages,
    syncMessages,
    appendMessage,
    appendToolCalls,
    sanitizeKey,
  };
}

export type SessionStore = ReturnType<typeof createSessionStore>;
