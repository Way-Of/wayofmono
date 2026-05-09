import type { PluginSettingSchema } from "@fusion/plugin-sdk";

const DEFAULT_BASE_URL = "http://localhost:4040";
const DEFAULT_POLLING_INTERVAL_SECONDS = 30;
const MIN_POLLING_INTERVAL_SECONDS = 5;
const DEFAULT_NOTIFY_COLUMNS = ["in-review"];
const DEFAULT_QUICK_CAPTURE_COLUMN = "triage";

type TaskColumn = "triage" | "todo" | "in-progress" | "in-review" | "done";

const COLUMN_SET = new Set<TaskColumn>(["triage", "todo", "in-progress", "in-review", "done"]);

export const settingsSchema: Record<string, PluginSettingSchema> = {
  fusionApiBaseUrl: {
    type: "string",
    label: "Fusion API Base URL",
    defaultValue: DEFAULT_BASE_URL,
  },
  fusionApiToken: {
    type: "password",
    label: "Fusion API Token",
  },
  apiKey: {
    type: "password",
    label: "Glasses Route API Key",
  },
  glassesDeviceId: {
    type: "string",
    label: "Glasses Device ID",
  },
  pollingIntervalSeconds: {
    type: "number",
    label: "Polling Interval (seconds)",
    defaultValue: DEFAULT_POLLING_INTERVAL_SECONDS,
  },
  notifyOnColumns: {
    type: "array",
    label: "Notify on Columns",
    itemType: "string",
    defaultValue: DEFAULT_NOTIFY_COLUMNS,
  },
  quickCaptureDefaultColumn: {
    type: "enum",
    label: "Quick Capture Default Column",
    enumValues: [...COLUMN_SET],
    defaultValue: DEFAULT_QUICK_CAPTURE_COLUMN,
  },
  enableAgentActions: {
    type: "boolean",
    label: "Enable Agent Actions",
    defaultValue: true,
  },
};

function getSettingString(settings: Record<string, unknown>, key: string): string | undefined {
  const value = settings[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function getFusionBaseUrl(settings: Record<string, unknown>): string {
  return getSettingString(settings, "fusionApiBaseUrl") ?? DEFAULT_BASE_URL;
}

export function getFusionToken(settings: Record<string, unknown>): string | undefined {
  return getSettingString(settings, "fusionApiToken");
}

export function getPollingIntervalMs(settings: Record<string, unknown>): number {
  const raw = settings.pollingIntervalSeconds;
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return DEFAULT_POLLING_INTERVAL_SECONDS * 1000;
  }
  const seconds = Math.max(MIN_POLLING_INTERVAL_SECONDS, Math.floor(raw));
  return seconds * 1000;
}

export function getNotifyColumns(settings: Record<string, unknown>): TaskColumn[] {
  const raw = settings.notifyOnColumns;
  if (!Array.isArray(raw)) {
    return [...DEFAULT_NOTIFY_COLUMNS] as TaskColumn[];
  }
  const columns = raw
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value): value is TaskColumn => COLUMN_SET.has(value as TaskColumn));
  return columns.length > 0 ? columns : ([...DEFAULT_NOTIFY_COLUMNS] as TaskColumn[]);
}

export function getQuickCaptureColumn(settings: Record<string, unknown>): TaskColumn {
  const raw = getSettingString(settings, "quickCaptureDefaultColumn");
  return raw && COLUMN_SET.has(raw as TaskColumn) ? (raw as TaskColumn) : DEFAULT_QUICK_CAPTURE_COLUMN;
}

export function agentActionsEnabled(settings: Record<string, unknown>): boolean {
  const raw = settings.enableAgentActions;
  return typeof raw === "boolean" ? raw : true;
}

export type { TaskColumn };
