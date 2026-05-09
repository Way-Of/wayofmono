import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { PluginLoader, PluginStore } from "@fusion/core";
import { afterEach, describe, expect, it } from "vitest";
import plugin from "../index";

const testDirs: string[] = [];

afterEach(async () => {
  await Promise.all(testDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("dependency graph plugin index", () => {
  it("exports node-importable plugin metadata", () => {
    expect(plugin).toBeDefined();
    expect(plugin.manifest.id).toBe("fusion-plugin-dependency-graph");
    expect(plugin.dashboardViews?.[0]).toEqual(
      expect.objectContaining({
        viewId: "graph",
        componentPath: "./dashboard-view",
      }),
    );
  });

  it("loads src/index.ts via Node dynamic import", async () => {
    const moduleUrl = pathToFileURL(join(process.cwd(), "src/index.ts")).href;
    const module = await import(moduleUrl);
    expect(module.default?.manifest?.id).toBe("fusion-plugin-dependency-graph");
  });

  it("is loadable by PluginLoader without throwing", async () => {
    const rootDir = mkdtempSync(join(tmpdir(), "fn-3737-plugin-loader-"));
    testDirs.push(rootDir);

    const pluginStore = new PluginStore(rootDir, { inMemoryDb: true, centralGlobalDir: rootDir });
    await pluginStore.init();

    const pluginPath = join(process.cwd(), "src/index.ts");
    await pluginStore.registerPlugin({ manifest: plugin.manifest, path: pluginPath });

    const loader = new PluginLoader({
      pluginStore,
      taskStore: { logActivity: async () => undefined } as never,
      pluginDirs: [dirname(dirname(pluginPath))],
    });

    await loader.loadPlugin(plugin.manifest.id);

    const loaded = loader.getPlugin(plugin.manifest.id);
    expect(loaded?.state).toBe("started");
    expect(loaded?.dashboardViews?.[0]).toEqual(
      expect.objectContaining({ viewId: "graph", componentPath: "./dashboard-view" }),
    );
  });
});
