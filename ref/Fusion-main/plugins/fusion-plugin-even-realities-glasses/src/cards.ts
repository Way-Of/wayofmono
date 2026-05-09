import type { Task } from "@fusion/core";
import type { NotificationReason } from "./notifications/types.js";

export type GlassesCardAction = {
  type: "start-work" | "request-review" | "quick-capture";
  taskId?: string;
  label: string;
};

export type GlassesCard = {
  id: string;
  kind: "task" | "summary";
  title: string;
  lines: string[];
  badge: string;
  taskId?: string;
  updatedAt?: string;
  actions?: GlassesCardAction[];
};

const COLUMN_BADGES: Record<string, string> = {
  triage: "triage",
  todo: "todo",
  "in-progress": "in-progress",
  "in-review": "in-review",
  done: "done",
  archived: "archived",
};

const DEFAULT_MAX_TITLE = 80;

export function truncateLine(value: string, maxChars = DEFAULT_MAX_TITLE): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, Math.max(0, maxChars - 1))}…`;
}

export function wrapLines(value: string, opts: { maxCharsPerLine?: number; maxLines?: number } = {}): string[] {
  const maxCharsPerLine = Math.max(8, opts.maxCharsPerLine ?? 36);
  const maxLines = Math.max(1, opts.maxLines ?? 2);
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = candidate;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length > maxLines) return lines.slice(0, maxLines);
  if (words.join(" ").length > lines.join(" ").length) {
    lines[lines.length - 1] = truncateLine(lines[lines.length - 1], maxCharsPerLine);
  }
  return lines;
}

export function statusBadge(column: Task["column"]): string {
  return COLUMN_BADGES[column] ?? "todo";
}

export function formatRelativeAge(updatedAt: string, opts: { now?: () => Date } = {}): string {
  const now = opts.now?.() ?? new Date();
  const at = new Date(updatedAt);
  const diffMs = Math.max(0, now.getTime() - at.getTime());
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "updated just now";
  if (mins < 60) return `updated ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `updated ${hours}h ago`;
  return `updated ${Math.floor(hours / 24)}d ago`;
}

export function taskToCard(task: Task): GlassesCard {
  const title = typeof task.title === "string" && task.title.trim() ? task.title : task.description;
  return {
    id: `task-${task.id}`,
    kind: "task",
    title: truncateLine(title, DEFAULT_MAX_TITLE),
    lines: [
      `assignee: ${task.assignedAgentId ?? task.assigneeUserId ?? "unassigned"}`,
      formatRelativeAge(task.updatedAt),
    ],
    badge: statusBadge(task.column),
    taskId: task.id,
    updatedAt: task.updatedAt,
    actions: [
      { type: "start-work", taskId: task.id, label: "Start work" },
      { type: "request-review", taskId: task.id, label: "Request review" },
    ],
  };
}

export function boardSummaryCard(tasksByColumn: Record<string, number>): GlassesCard {
  const ordered = ["triage", "todo", "in-progress", "in-review", "done"];
  return {
    id: "board-summary",
    kind: "summary",
    title: "Fusion Board Summary",
    lines: ordered.map((column) => `${column}: ${tasksByColumn[column] ?? 0}`),
    badge: "todo",
  };
}

export function notificationCard(
  task: Task,
  reason: NotificationReason,
  opts: { now?: () => Date; maxCharsPerLine?: number; maxLines?: number } = {},
): GlassesCard {
  const baseTitle = typeof task.title === "string" && task.title.trim() ? task.title : task.description;
  const reasonTitle =
    reason === "entered-column"
      ? task.column === "in-review"
        ? "In review"
        : "Moved in"
      : reason === "new-task"
        ? "New task"
        : reason === "completed"
          ? "Done"
          : "Moved out";

  return {
    id: `notif:${task.id}:${reason}`,
    kind: "task",
    title: `${reasonTitle} · ${truncateLine(baseTitle, opts.maxCharsPerLine ?? DEFAULT_MAX_TITLE)}`,
    lines: [
      `assignee: ${task.assignedAgentId ?? task.assigneeUserId ?? "unassigned"}`,
      ...wrapLines(formatRelativeAge(task.updatedAt, { now: opts.now }), {
        maxCharsPerLine: opts.maxCharsPerLine,
        maxLines: opts.maxLines ?? 1,
      }),
    ],
    badge: statusBadge(task.column),
    taskId: task.id,
    updatedAt: task.updatedAt,
  };
}
