import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { TaskStore } from "../store.js";
import { PluginStore } from "../plugin-store.js";
import { AutomationStore } from "../automation-store.js";
import { RoutineStore } from "../routine-store.js";

describe("project root guards", () => {
  const fusionDir = join(tmpdir(), "fusion-root-guard", ".fusion");

  it.each([
    ["TaskStore", () => new TaskStore(fusionDir, undefined, { inMemoryDb: true })],
    ["PluginStore", () => new PluginStore(fusionDir, { inMemoryDb: true })],
    ["AutomationStore", () => new AutomationStore(fusionDir, { inMemoryDb: true })],
    ["RoutineStore", () => new RoutineStore(fusionDir, { inMemoryDb: true })],
  ])("rejects a .fusion directory for %s", (_label, createStore) => {
    expect(createStore).toThrow(/expected a project root, got a \.fusion directory/i);
  });
});
