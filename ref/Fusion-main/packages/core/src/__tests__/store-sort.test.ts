import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TaskStore } from "../store.js";
import { sortTasksByPriorityThenAgeAndId } from "../task-priority.js";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), "kb-store-sort-test-"));
}

describe("TaskStore.listTasks() sort order", () => {
  let rootDir: string;
  let store: TaskStore;

  beforeEach(async () => {
    rootDir = makeTmpDir();
    store = new TaskStore(rootDir, join(rootDir, ".fusion-global-settings"), { inMemoryDb: true });
    await store.init();
  });

  afterEach(async () => {
    store.stopWatching();
    await rm(rootDir, { recursive: true, force: true });
  });

  it("returns tasks with identical createdAt in ascending ID order", async () => {
    // Create three tasks — they may get the same createdAt if created fast enough
    const t1 = await store.createTask({ description: "Task one" });
    const t2 = await store.createTask({ description: "Task two" });
    const t3 = await store.createTask({ description: "Task three" });

    // Force identical createdAt by rewriting the task.json files
    const { readFile, writeFile } = await import("node:fs/promises");
    const tasksDir = join(rootDir, ".fusion", "tasks");
    const sameTimestamp = "2026-06-01T00:00:00Z";

    for (const t of [t1, t2, t3]) {
      const jsonPath = join(tasksDir, t.id, "task.json");
      const data = JSON.parse(await readFile(jsonPath, "utf-8"));
      data.createdAt = sameTimestamp;
      data.updatedAt = sameTimestamp;
      await writeFile(jsonPath, JSON.stringify(data, null, 2));
    }

    const tasks = await store.listTasks();
    const ids = tasks.map((t) => t.id);

    // Should be ascending by numeric ID portion
    const nums = ids.map((id) => parseInt(id.slice(id.lastIndexOf("-") + 1), 10));
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBeGreaterThan(nums[i - 1]);
    }
  });

  it("provides deterministic helper ordering by priority then age then id", () => {
    const sorted = sortTasksByPriorityThenAgeAndId([
      { id: "FN-010", createdAt: "2026-01-02T00:00:00Z", priority: "normal" },
      { id: "FN-001", createdAt: "2026-01-01T00:00:00Z", priority: "high" },
      { id: "FN-002", createdAt: "2026-01-01T00:00:00Z", priority: "high" },
      { id: "FN-003", createdAt: "2026-01-01T00:00:00Z" },
      { id: "FN-004", createdAt: "2026-01-01T00:00:00Z", priority: "urgent" },
    ]);

    expect(sorted.map((task) => task.id)).toEqual(["FN-004", "FN-001", "FN-002", "FN-003", "FN-010"]);
  });
});
