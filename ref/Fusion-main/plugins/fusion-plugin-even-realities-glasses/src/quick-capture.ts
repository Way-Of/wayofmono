import type { PluginContext } from "@fusion/plugin-sdk";
import { taskToCard, type GlassesCard } from "./cards.js";
import type { TaskColumn } from "./settings.js";

export const FILLER_TOKENS = ["um", "uh", "er", "like", "you know"] as const;

const DEFAULT_MAX_TITLE_CHARS = 80;

export class GlassesInputError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "GlassesInputError";
  }
}

export function normalizeDescription(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  return String(value).trim();
}

export function stripWakePhrases(text: string): string {
  const trimmed = text.trim();
  return trimmed
    .replace(/^\s*(?:hey\s+fusion|ok\s+fusion|fusion|note|task|capture)\s*,?\s*/i, "")
    .trim();
}

export function stripFillerTokens(text: string): string {
  let cleaned = text.replace(/\s+/g, " ").trim();
  cleaned = cleaned.replace(/[.\s]+$/g, "").trim();

  for (const token of FILLER_TOKENS) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`(^|[\\s,;:!?()-])${escaped}(?=$|[\\s,;:!?()-])`, "gi"), "$1");
  }

  return cleaned.replace(/\s+/g, " ").replace(/\s+([,;:!?])/g, "$1").trim().replace(/^[,;:!?]+\s*/, "");
}

export function splitTitleAndDescription(
  text: string,
  opts: { maxTitleChars?: number } = {},
): { title: string; description: string } {
  const maxTitleChars = opts.maxTitleChars ?? DEFAULT_MAX_TITLE_CHARS;
  const normalized = text.trim();
  if (!normalized) return { title: "", description: "" };

  const boundaryMatch = normalized.match(/[.!?]\s|\n/);
  const boundaryIndex = boundaryMatch?.index ?? -1;

  let title = boundaryIndex >= 0 ? normalized.slice(0, boundaryIndex + (boundaryMatch?.[0] === "\n" ? 0 : 1)).trim() : normalized;
  let remainder = boundaryIndex >= 0 ? normalized.slice(boundaryIndex + (boundaryMatch?.[0].length ?? 0)).trim() : "";

  if (title.length > maxTitleChars) {
    const candidate = title.slice(0, maxTitleChars);
    const lastSpace = candidate.lastIndexOf(" ");
    const cut = lastSpace > 0 ? lastSpace : maxTitleChars;
    const overflow = title.slice(cut).trim();
    title = title.slice(0, cut).trim();
    remainder = [overflow, remainder].filter(Boolean).join(" ").trim();
  }

  const descriptionBase = remainder || title;
  const description = normalizeDescription(descriptionBase).slice(0, 280);
  return { title, description };
}

export function parseUtterance(raw: unknown, opts: { maxTitleChars?: number } = {}): { title: string; description: string } {
  const text = normalizeDescription(raw);
  const stripped = stripFillerTokens(stripWakePhrases(text));
  if (!stripped) {
    throw new GlassesInputError(400, "empty utterance");
  }
  return splitTitleAndDescription(stripped, opts);
}

function normalizeCaptureColumn(value: unknown, fallback: TaskColumn): TaskColumn {
  const raw = normalizeDescription(value);
  if (raw === "triage" || raw === "todo" || raw === "in-progress" || raw === "in-review" || raw === "done") {
    return raw;
  }
  return fallback;
}

export async function runQuickCapture(
  input: { text: unknown; column?: unknown },
  deps: {
    taskStore: PluginContext["taskStore"];
    pluginId: string;
    defaultColumn: TaskColumn;
  },
): Promise<{ task: Awaited<ReturnType<PluginContext["taskStore"]["createTask"]>>; card: GlassesCard }> {
  const { title, description } = parseUtterance(input.text);
  const requested = input.column;
  const normalizedColumn = normalizeCaptureColumn(requested, deps.defaultColumn);
  if (requested !== undefined && normalizeDescription(requested) !== normalizedColumn) {
    throw new GlassesInputError(400, "invalid column");
  }

  const persistedDescription = `${title}\n${description}`.trim();
  const task = await deps.taskStore.createTask({
    description: persistedDescription,
    column: normalizedColumn,
    source: {
      sourceType: "api",
      sourceMetadata: {
        pluginId: deps.pluginId,
        channel: "glasses-quick-capture",
      },
    },
  });

  return {
    task,
    card: taskToCard(task as never),
  };
}
