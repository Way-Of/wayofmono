import type { Column } from "@fusion/core";

export type NotificationReason = "entered-column" | "new-task" | "left-column" | "completed";

export interface NotificationEvent {
  taskId: string;
  reason: NotificationReason;
  column: Column;
  previousColumn: Column | null;
  updatedAt: string;
}

export interface SnapshotRow {
  taskId: string;
  lastColumn: Column;
  updatedAt: string;
}

export type Snapshot = ReadonlyMap<string, SnapshotRow>;
