import type { Column } from "@fusion/core";
import type { PluginDb } from "../index.js";
import type { SnapshotRow } from "./types.js";

export function readSnapshot(db: PluginDb): Map<string, SnapshotRow> {
  const rows = db.prepare("SELECT taskId, lastColumn, updatedAt FROM even_realities_seen_tasks").all() as Array<{
    taskId: string;
    lastColumn: Column;
    updatedAt: string;
  }>;
  const out = new Map<string, SnapshotRow>();
  for (const row of rows) {
    out.set(row.taskId, { taskId: row.taskId, lastColumn: row.lastColumn, updatedAt: row.updatedAt });
  }
  return out;
}

export function writeSnapshot(db: PluginDb, rows: ReadonlyArray<SnapshotRow>): void {
  db.exec("BEGIN");
  try {
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO even_realities_seen_tasks(taskId, lastColumn, updatedAt) VALUES (?, ?, ?)",
    );
    for (const row of rows) {
      stmt.run(row.taskId, row.lastColumn, row.updatedAt);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function pruneMissing(db: PluginDb, presentTaskIds: ReadonlySet<string>): number {
  if (presentTaskIds.size === 0) {
    const result = db.prepare("DELETE FROM even_realities_seen_tasks").run() as { changes?: number };
    return result.changes ?? 0;
  }

  const ids = [...presentTaskIds];
  const placeholders = ids.map(() => "?").join(",");
  const result = db
    .prepare(`DELETE FROM even_realities_seen_tasks WHERE taskId NOT IN (${placeholders})`)
    .run(...ids) as { changes?: number };
  return result.changes ?? 0;
}
