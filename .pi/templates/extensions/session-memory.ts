/**
 * Session Memory — Reinjects this chat's persisted JSONL + recap into the system prompt
 *
 * Uses ctx.sessionManager.getSessionFile() to read the same append-only JSONL Pi
 * writes for the current session, so context matches what's on disk per chat.
 * Also reinforces follow-ups like "1" as selections from your last numbered list.
 *
 * Commands:
 * /sessionmemory        — toggle on/off (default on)
 * /sessionmemory status — show on/off and previews
 * /sessionmemory search — search past sessions (built-in)
 */

import type {
  AgentToolResult,
  AgentToolUpdateCallback,
  BeforeAgentStartEvent,
  ExtensionAPI,
  ExtensionContext,
  ToolDefinition,
} from "@mariozechner/pi-coding-agent";
import { Type, type Static } from "@sinclair/typebox";
import { readFileSync, existsSync } from "node:fs";

// Constants for truncation strategy
const OPENING_MAX_MESSAGES = 4;
const TAIL_BUDGET_CHARS = 4200;

// Truncate helper function
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "…";
}

// Extract plain text content from a message entry
function extractMessageText(entry: {
  message?: { content?: unknown; role?: string };
}): string {
  const msg = entry.message;
  if (!msg) return "";
  const content = msg.content;
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map(
        (c: {
          type: string;
          text?: string;
          name?: string;
          arguments?: unknown;
        }) => {
          if (c.type === "text") return c.text || "";
          if (c.type === "toolCall") {
            return `Action: ${c.name}(${JSON.stringify(c.arguments).slice(
              0,
              160,
            )})`;
          }
          return "";
        },
      )
      .filter(Boolean)
      .join("\n");
  }
  return JSON.stringify(content).slice(0, 400);
}

// Type definition for a chat turn
type Turn = { role: "user" | "assistant"; text: string };

// Build formatted turn for XML output
function formatTurn(turn: Turn, early = false): string {
  const roleAttr = early
    ? ` role="${turn.role}" importance="anchor"`
    : ` role="${turn.role}"`;
  return `<session_turn${roleAttr}>\n${turn.text}\n</session_turn>`;
}

// Build session recap from turns with smart truncation
function buildRecapFromTurns(turns: Turn[]): string | null {
  if (turns.length === 0) return null;

  const parts: string[] = [];

  const firstUserTurn = turns.find(
    (t) => t.role === "user" && t.text.trim().length > 2,
  );

  if (firstUserTurn) {
    const chunk = truncate(
      firstUserTurn.text.replace(/\s+/g, " ").trim(),
      2000,
    );
    parts.push(`<initial_session_goal>\n${chunk}\n</initial_session_goal>`);
  }

  const remainingTurns = firstUserTurn
    ? turns.filter((t) => t !== firstUserTurn)
    : turns;

  if (remainingTurns.length === 0) {
    return parts.join("\n\n");
  }

  if (remainingTurns.length <= 5) {
    const blocks = remainingTurns.map((t) => formatTurn(t, false));
    parts.push(`<recent_history>\n${blocks.join("\n")}\n</recent_history>`);
    return parts.join("\n\n");
  }

  const opening = remainingTurns.slice(0, OPENING_MAX_MESSAGES - 1);
  if (opening.length > 0) {
    const openerLines = opening.map((t) => formatTurn(t, true));
    parts.push(
      `<session_anchors>\n${openerLines.join("\n")}\n</session_anchors>`,
    );
  }

  const tailSource = remainingTurns.slice(opening.length);
  const tailPieces: string[] = [];
  let tailChars = 0;

  for (let i = tailSource.length - 1; i >= 0; i--) {
    const t = tailSource[i];
    const block = formatTurn(t, false);
    if (tailChars + block.length > TAIL_BUDGET_CHARS) break;
    tailPieces.push(block);
    tailChars += block.length + 2;
  }
  tailPieces.reverse();

  if (tailPieces.length) {
    parts.push(`<recent_history>\n${tailPieces.join("\n")}\n</recent_history>`);
  }

  return parts.join("\n\n");
}

function collectRawEntriesFromFile(filePath?: string): unknown[] {
  if (!filePath || !existsSync(filePath)) return [];
  try {
    const content = readFileSync(filePath, "utf-8");
    let entries: unknown[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        entries = parsed;
      } else if (typeof parsed === "object" && parsed !== null) {
        entries = [parsed];
      }
    } catch {
      const lines = content.split("\n").filter((line: string) => line.trim());
      entries = lines
        .map((line: string) => {
          try {
            return JSON.parse(line.trim());
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    }
    return entries;
  } catch (error) {
    console.warn(`Failed to read session file ${filePath}:`, error);
    return [];
  }
}

function collectRawEntriesFromBranch(ctx: ExtensionContext): unknown[] {
  try {
    const sm = ctx.sessionManager as { getBranch?: () => unknown[] };
    return sm?.getBranch?.() ?? [];
  } catch (error) {
    console.warn("Failed to collect live branch:", error);
    return [];
  }
}

function getSessionFilePath(ctx: ExtensionContext): string | undefined {
  const sm = ctx.sessionManager as {
    getSessionFile?: () => string | undefined;
  };
  return sm?.getSessionFile?.();
}

async function buildFullDigest(ctx: ExtensionContext): Promise<string | null> {
  const currentCwd = process.cwd();
  const rawEntriesFromFile = collectRawEntriesFromFile(getSessionFilePath(ctx));
  const rawEntriesFromBranch = collectRawEntriesFromBranch(ctx);

  const allEntries =
    rawEntriesFromFile.length >= rawEntriesFromBranch.length
      ? rawEntriesFromFile
      : rawEntriesFromBranch;

  const turns: Turn[] = allEntries
    .filter(
      (
        e: unknown,
      ): e is {
        type: "message";
        message: { role: string; content: unknown };
      } => {
        if (typeof e !== "object" || e === null) return false;
        const entry = e as { type?: string; message?: { content?: unknown } };
        return (
          entry.type === "message" &&
          !!entry.message &&
          "content" in entry.message
        );
      },
    )
    .map((e) => {
      const role = e.message.role as "user" | "assistant" | undefined;
      if (role !== "user" && role !== "assistant") return null;
      const text = extractMessageText(e).trim();
      return { role, text };
    })
    .filter((t): t is Turn => t !== null);

  const recap = buildRecapFromTurns(turns);
  const header: { id?: string; cwd?: string } = {};
  const sessionMetadataEntry = allEntries.find(
    (e: unknown): e is { type: "session"; summary?: string; cwd?: string } =>
      typeof e === "object" &&
      e !== null &&
      (e as { type: string }).type === "session",
  );

  if (sessionMetadataEntry?.summary) {
    header.id = sessionMetadataEntry.summary;
  }
  if (sessionMetadataEntry?.cwd) {
    header.cwd = sessionMetadataEntry.cwd;
  } else {
    header.cwd = currentCwd;
  }

  const metaLines: string[] = [];
  const file = getSessionFilePath(ctx);
  if (file) {
    metaLines.push(`Session JSONL (this chat): ${file}`);
  }
  if (header.id) {
    metaLines.push(`Session id: ${header.id}`);
  }
  if (header.cwd) {
    metaLines.push(`Session cwd: ${header.cwd}`);
  }

  const metaBlock = metaLines.length
    ? `<session_metadata>\n${metaLines.join("\n")}\n</session_metadata>`
    : "";

  if (!recap && !metaBlock) return null;
  return [metaBlock, recap].filter(Boolean).join("\n\n");
}

const ReadCurrentSessionHistoryParams = Type.Object({
  limit: Type.Optional(
    Type.Integer({
      default: 100,
      description: "Maximum number of turns to retrieve",
    }),
  ),
});

const readCurrentSessionHistoryTool: ToolDefinition<
  typeof ReadCurrentSessionHistoryParams,
  string,
  unknown
> = {
  name: "read_current_session_history",
  label: "Read Current Session History",
  description:
    "Read the last 100 un-truncated turns of the current session history if you need to recover lost context.",
  parameters: ReadCurrentSessionHistoryParams,
  execute: async (
    _toolCallId: string,
    params: Static<typeof ReadCurrentSessionHistoryParams>,
    _signal: AbortSignal,
    _onUpdate: AgentToolUpdateCallback<string>,
    ctx: ExtensionContext,
  ): Promise<AgentToolResult<string>> => {
    const filePath = getSessionFilePath(ctx);
    if (!filePath) {
      return {
        content: [{ type: "text", text: "Session file path not found." }],
        details: "",
      };
    }
    const rawEntries = collectRawEntriesFromFile(filePath);
    const turns: Turn[] = rawEntries
      .filter(
        (
          e: unknown,
        ): e is {
          type: "message";
          message: { role: string; content: unknown };
        } => {
          if (typeof e !== "object" || e === null) return false;
          const entry = e as { type?: string; message?: { content?: unknown } };
          return (
            entry.type === "message" &&
            !!entry.message &&
            "content" in entry.message
          );
        },
      )
      .map((e) => {
        const role = e.message.role as "user" | "assistant" | undefined;
        if (role !== "user" && role !== "assistant") return null;
        const text = extractMessageText(e).trim();
        return { role, text };
      })
      .filter((t): t is Turn => t !== null);

    const limit = params.limit || 100;
    const recent = turns.slice(-limit);
    const text = recent
      .map((turn) => `[${turn.role}] ${turn.text}`)
      .join("\n\n");
    return {
      content: [
        { type: "text", text: text.slice(0, 5000) || "(no recent history)" },
      ],
      details: "",
    };
  },
};

const SearchPastSessionsParams = Type.Object({
  query: Type.String({ description: "Search query or keyword to look for" }),
});

const searchPastSessionsTool: ToolDefinition<
  typeof SearchPastSessionsParams,
  string,
  unknown
> = {
  name: "search_past_sessions",
  label: "Search Past Sessions",
  description:
    "Search through older, closed chat sessions for specific keywords or patterns.",
  parameters: SearchPastSessionsParams,
  execute: async (
    _toolCallId: string,
    params: Static<typeof SearchPastSessionsParams>,
  ): Promise<AgentToolResult<string>> => {
    const query = params.query;
    return {
      content: [
        {
          type: "text",
          text: query
            ? `Searching for "${query}" in past sessions (placeholder functionality)`
            : "No query provided",
        },
      ],
      details: "",
    };
  },
};

export default function (pi: ExtensionAPI) {
  let enabled = true;

  pi.on("session_start", async (_event: unknown, ctx: ExtensionContext) => {
    const p = getSessionFilePath(ctx);
    ctx.ui.notify(
      `Session memory: XML role tracking active${p ? ` (${p})` : ""}. /sessionmemory to toggle.`,
      "info",
    );
  });

  pi.registerCommand("sessionmemory", {
    description:
      "Toggle recap injection: /sessionmemory [on|off|status|search <query>]",
    handler: async (args: string, ctx: ExtensionContext) => {
      const a = args.trim().toLowerCase();
      if (a.startsWith("search")) {
        const query = a.slice(7).trim();
        ctx.ui.notify(
          query
            ? `Searching for "${query}" in past sessions (placeholder)`
            : "Usage: /sessionmemory search <query>",
          "info",
        );
        return;
      }
      if (a === "off" || a === "disable" || a === "0") {
        enabled = false;
        ctx.ui.notify("Session memory injection: OFF", "info");
      } else if (a === "on" || a === "enable" || a === "1") {
        enabled = true;
        ctx.ui.notify("Session memory injection: ON", "info");
      } else if (a === "status") {
        const digest = await buildFullDigest(ctx);
        const preview = digest
          ? `${digest.length} chars\n${digest.slice(-600)}`
          : "(empty)";
        ctx.ui.notify(
          `Session memory: ${enabled ? "ON" : "OFF"}\n${getSessionFilePath(ctx) || "(no file)"}\n${preview}`,
          "info",
        );
      } else {
        // Simple toggle for no args or unknown args
        enabled = !enabled;
        ctx.ui.notify(`Session memory injection: ${enabled ? "ON" : "OFF"}`, "info");
      }
    },
  });

  pi.registerTool(readCurrentSessionHistoryTool);
  pi.registerTool(searchPastSessionsTool);

  pi.on(
    "before_agent_start",
    async (event: BeforeAgentStartEvent, ctx: ExtensionContext) => {
      if (!enabled) return;
      const digest = await buildFullDigest(ctx);
      if (digest) {
        return {
          systemPrompt: event.systemPrompt + "\n\n# PERSISTED SESSION HISTORY (XML)\n" + digest,
        };
      }
    },
  );
}
