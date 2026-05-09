import { describe, expect, it } from "vitest";
import { diffSnapshots } from "../notifications/diff.js";
import type { Snapshot } from "../notifications/types.js";

function task(id: string, column: "triage" | "todo" | "in-progress" | "in-review" | "done", updatedAt: string) {
  return {
    id,
    column,
    updatedAt,
    description: id,
    dependencies: [],
    steps: [],
    currentStep: 1,
    log: [],
  } as never;
}

describe("diffSnapshots", () => {
  it("emits new-task only for watched columns on initial run", () => {
    const events = diffSnapshots(new Map() as Snapshot, [task("FN-1", "in-review", "2026-01-01T00:00:00.000Z"), task("FN-2", "todo", "2026-01-01T00:00:01.000Z")], {
      notifyOnColumns: new Set(["in-review"]),
      alsoNotifyOnDone: false,
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.reason).toBe("new-task");
  });

  it.each([
    ["todo", "in-review", "entered-column"],
    ["in-review", "todo", "left-column"],
  ] as const)("handles transitions %s -> %s", (from, to, reason) => {
    const prev = new Map([["FN-1", { taskId: "FN-1", lastColumn: from, updatedAt: "2026-01-01T00:00:00.000Z" }]]) as Snapshot;
    const events = diffSnapshots(prev, [task("FN-1", to, "2026-01-01T00:00:02.000Z")], {
      notifyOnColumns: new Set(["in-review"]),
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.reason).toBe(reason);
  });

  it("emits completed when done unwatched", () => {
    const prev = new Map([["FN-1", { taskId: "FN-1", lastColumn: "in-progress", updatedAt: "2026-01-01T00:00:00.000Z" }]]) as Snapshot;
    const events = diffSnapshots(prev, [task("FN-1", "done", "2026-01-01T00:00:02.000Z")], {
      notifyOnColumns: new Set(["in-review"]),
      alsoNotifyOnDone: true,
    });
    expect(events.map((e) => e.reason)).toEqual(["completed"]);
  });

  it("emits entered-column and completed when done watched", () => {
    const prev = new Map([["FN-1", { taskId: "FN-1", lastColumn: "in-progress", updatedAt: "2026-01-01T00:00:00.000Z" }]]) as Snapshot;
    const events = diffSnapshots(prev, [task("FN-1", "done", "2026-01-01T00:00:02.000Z")], {
      notifyOnColumns: new Set(["done"]),
      alsoNotifyOnDone: true,
    });
    expect(events.map((e) => e.reason)).toEqual(["entered-column", "completed"]);
  });

  it("returns no event when column unchanged", () => {
    const prev = new Map([["FN-1", { taskId: "FN-1", lastColumn: "todo", updatedAt: "2026-01-01T00:00:00.000Z" }]]) as Snapshot;
    const events = diffSnapshots(prev, [task("FN-1", "todo", "2026-01-01T00:00:02.000Z")], {
      notifyOnColumns: new Set(["todo"]),
    });
    expect(events).toEqual([]);
  });

  it("sorts deterministically", () => {
    const prev = new Map([
      ["FN-2", { taskId: "FN-2", lastColumn: "todo", updatedAt: "2026-01-01T00:00:00.000Z" }],
      ["FN-1", { taskId: "FN-1", lastColumn: "todo", updatedAt: "2026-01-01T00:00:00.000Z" }],
    ]) as Snapshot;
    const events = diffSnapshots(prev, [task("FN-2", "in-review", "2026-01-01T00:00:01.000Z"), task("FN-1", "in-review", "2026-01-01T00:00:01.000Z")], {
      notifyOnColumns: new Set(["in-review"]),
    });
    expect(events.map((e) => e.taskId)).toEqual(["FN-1", "FN-2"]);
  });
});
