import { describe, expect, it } from "vitest";
import { pruneMissing, readSnapshot, writeSnapshot } from "../notifications/store.js";

function createDb() {
  const table = new Map<string, { taskId: string; lastColumn: string; updatedAt: string }>();
  return {
    exec: (_sql: string) => undefined,
    prepare: (sql: string) => ({
      all: () => (sql.startsWith("SELECT") ? [...table.values()] : []),
      run: (...args: unknown[]) => {
        if (sql.startsWith("INSERT OR REPLACE")) {
          const [taskId, lastColumn, updatedAt] = args as [string, string, string];
          table.set(taskId, { taskId, lastColumn, updatedAt });
          return { changes: 1 };
        }
        if (sql === "DELETE FROM even_realities_seen_tasks") {
          const changes = table.size;
          table.clear();
          return { changes };
        }
        if (sql.startsWith("DELETE FROM even_realities_seen_tasks WHERE taskId NOT IN")) {
          const ids = new Set(args as string[]);
          let changes = 0;
          for (const key of [...table.keys()]) {
            if (!ids.has(key)) {
              table.delete(key);
              changes += 1;
            }
          }
          return { changes };
        }
        return { changes: 0 };
      },
      get: () => undefined,
    }),
  };
}

describe("notification store", () => {
  it("reads and writes snapshot rows", () => {
    const db = createDb();
    writeSnapshot(db as never, [
      { taskId: "FN-1", lastColumn: "todo", updatedAt: "2026-01-01T00:00:00.000Z" },
      { taskId: "FN-2", lastColumn: "in-review", updatedAt: "2026-01-01T00:00:01.000Z" },
    ]);

    const snapshot = readSnapshot(db as never);
    expect(snapshot.size).toBe(2);
    expect(snapshot.get("FN-2")?.lastColumn).toBe("in-review");
  });

  it("prunes missing rows and returns deleted count", () => {
    const db = createDb();
    writeSnapshot(db as never, [
      { taskId: "FN-1", lastColumn: "todo", updatedAt: "2026-01-01T00:00:00.000Z" },
      { taskId: "FN-2", lastColumn: "in-review", updatedAt: "2026-01-01T00:00:01.000Z" },
    ]);

    const deleted = pruneMissing(db as never, new Set(["FN-2"]));
    expect(deleted).toBe(1);
    expect(readSnapshot(db as never).has("FN-1")).toBe(false);
  });

  it("handles empty present set", () => {
    const db = createDb();
    writeSnapshot(db as never, [{ taskId: "FN-1", lastColumn: "todo", updatedAt: "2026-01-01T00:00:00.000Z" }]);
    const deleted = pruneMissing(db as never, new Set());
    expect(deleted).toBe(1);
    expect(readSnapshot(db as never).size).toBe(0);
  });
});
