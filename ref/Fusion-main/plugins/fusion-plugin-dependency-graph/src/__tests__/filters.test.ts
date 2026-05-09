import { describe, expect, it } from "vitest";
import type { Task } from "@fusion/core";
import { EXCLUDED_COLUMNS, filterGraphTasks, INCLUDED_COLUMNS } from "../filters";

function createTask(id: string, column: Task["column"], dependencies: string[] = []): Task {
  return {
    id,
    description: `Task ${id}`,
    column,
    dependencies,
    steps: [],
    currentStep: 0,
    log: [],
  } as Task;
}

describe("filterGraphTasks", () => {
  it("returns empty for empty input", () => {
    expect(filterGraphTasks([])).toEqual([]);
  });

  it("includes tasks from all included columns", () => {
    const tasks = Array.from(INCLUDED_COLUMNS).map((column, index) => createTask(`FN-${index + 1}`, column));

    expect(filterGraphTasks(tasks)).toEqual(tasks);
  });

  it("returns empty when only excluded columns are present", () => {
    const tasks = Array.from(EXCLUDED_COLUMNS).map((column, index) => createTask(`FN-${index + 1}`, column));

    expect(filterGraphTasks(tasks)).toEqual([]);
  });

  it("includes and excludes exact columns for mixed input", () => {
    const tasks = [
      createTask("FN-1", "triage"),
      createTask("FN-2", "todo"),
      createTask("FN-3", "in-progress"),
      createTask("FN-4", "in-review"),
      createTask("FN-5", "done"),
      createTask("FN-6", "archived"),
    ];

    expect(filterGraphTasks(tasks).map((task) => task.id)).toEqual(["FN-1", "FN-2", "FN-3", "FN-4"]);
  });

  it.each([
    ["triage", true],
    ["todo", true],
    ["in-progress", true],
    ["in-review", true],
    ["done", false],
    ["archived", false],
  ] as const)("column %s inclusion=%s", (column, included) => {
    const task = createTask("FN-1", column);
    const result = filterGraphTasks([task]);

    expect(result.length > 0).toBe(included);
  });

  it("gracefully excludes tasks with invalid columns", () => {
    const invalidTask = {
      ...createTask("FN-invalid", "todo"),
      column: undefined,
    } as unknown as Task;

    expect(filterGraphTasks([invalidTask])).toEqual([]);
  });

  it("preserves task object identity", () => {
    const taskA = createTask("FN-1", "todo");
    const taskB = createTask("FN-2", "in-review");
    const result = filterGraphTasks([taskA, taskB]);

    expect(result[0]).toBe(taskA);
    expect(result[1]).toBe(taskB);
  });
});
