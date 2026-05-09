import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("InProcessRuntime onStart duplicate guard", () => {
  it("contains a taskAgentMap guard before creating task-worker agents", () => {
    const source = readFileSync(join(process.cwd(), "src/runtimes/in-process-runtime.ts"), "utf-8");
    expect(source).toContain("if (this.taskAgentMap.has(task.id))");
    expect(source).toContain("Skipping task-worker creation for");
  });
});
