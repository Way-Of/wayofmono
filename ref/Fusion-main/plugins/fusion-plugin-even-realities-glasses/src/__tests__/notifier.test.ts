import { afterEach, describe, expect, it, vi } from "vitest";
import { createNotifier } from "../notifier.js";

afterEach(() => {
  vi.useRealTimers();
});

function createDb() {
  const table = new Map<string, { taskId: string; lastColumn: string; updatedAt: string }>();
  return {
    exec: (_sql: string) => undefined,
    prepare: (sql: string) => ({
      get: () => undefined,
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
    }),
  } as any;
}

function task(id: string, column: string, updatedAt: string) {
  return { id, column, updatedAt, description: id, dependencies: [], steps: [], currentStep: 1, log: [] } as any;
}

describe("createNotifier", () => {
  it("seeds snapshot and emits only watched new tasks", async () => {
    const db = createDb();
    const transport = { pushCard: vi.fn(async () => undefined) } as any;
    const notifier = createNotifier({
      taskStore: { listTasks: vi.fn(async () => [task("FN-1", "todo", "2026-01-01T00:00:00.000Z"), task("FN-2", "in-review", "2026-01-01T00:00:01.000Z")]) } as any,
      db,
      transport,
      settings: { notifyOnColumns: ["in-review"] },
      pluginId: "p1",
      logger: console as any,
      now: () => new Date("2026-01-01T00:00:02.000Z"),
    });

    const events = await notifier.pollOnce();
    expect(events.map((e) => e.taskId)).toEqual(["FN-2"]);
    expect(transport.pushCard).toHaveBeenCalledTimes(1);
  });

  it("emits entered-column transition once", async () => {
    const db = createDb();
    const listTasks = vi
      .fn()
      .mockResolvedValueOnce([task("FN-1", "todo", "2026-01-01T00:00:00.000Z")])
      .mockResolvedValueOnce([task("FN-1", "in-review", "2026-01-01T00:00:05.000Z")]);
    const transport = { pushCard: vi.fn(async () => undefined) } as any;
    const notifier = createNotifier({ taskStore: { listTasks } as any, db, transport, settings: { notifyOnColumns: ["in-review"] }, pluginId: "p1", logger: console as any });

    await notifier.pollOnce();
    const events = await notifier.pollOnce();
    expect(events).toHaveLength(1);
    expect(events[0]?.reason).toBe("entered-column");
  });

  it("continues when push fails", async () => {
    const db = createDb();
    const transport = { pushCard: vi.fn().mockRejectedValueOnce(new Error("nope")).mockResolvedValueOnce(undefined) } as any;
    const notifier = createNotifier({
      taskStore: { listTasks: vi.fn(async () => [task("FN-1", "in-review", "2026-01-01T00:00:00.000Z"), task("FN-2", "in-review", "2026-01-01T00:00:01.000Z")]) } as any,
      db,
      transport,
      settings: { notifyOnColumns: ["in-review"] },
      pluginId: "p1",
      logger: { error: vi.fn() } as any,
    });

    const events = await notifier.pollOnce();
    expect(events).toHaveLength(2);
    expect(transport.pushCard).toHaveBeenCalledTimes(2);
  });

  it("stop clears timer", async () => {
    vi.useFakeTimers();
    const listTasks = vi.fn(async () => [task("FN-1", "todo", "2026-01-01T00:00:00.000Z")]);
    const notifier = createNotifier({ taskStore: { listTasks } as any, db: createDb(), transport: { pushCard: vi.fn(async () => undefined) } as any, settings: { pollingIntervalSeconds: 5 }, pluginId: "p1", logger: console as any });
    notifier.start();
    await vi.advanceTimersByTimeAsync(5000);
    const before = listTasks.mock.calls.length;
    await notifier.stop();
    await vi.advanceTimersByTimeAsync(10000);
    expect(listTasks.mock.calls.length).toBe(before);
  });

  it("peek/drain and ring buffer", async () => {
    const db = createDb();
    const tasks = Array.from({ length: 220 }, (_, i) => task(`FN-${i}`, "in-review", `2026-01-01T00:00:${String(i % 60).padStart(2, "0")}.000Z`));
    const notifier = createNotifier({ taskStore: { listTasks: vi.fn(async () => tasks) } as any, db, transport: { pushCard: vi.fn(async () => undefined) } as any, settings: { notifyOnColumns: ["in-review"] }, pluginId: "p1", logger: console as any });

    await notifier.pollOnce();
    expect(notifier.peekPending(200)).toHaveLength(200);
    expect(notifier.drainPending(10)).toHaveLength(10);
    expect(notifier.peekPending(200)).toHaveLength(190);
  });
});
