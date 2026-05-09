import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { rm } from "node:fs/promises";
import { Database } from "@fusion/core";
import { afterEach, describe, expect, it } from "vitest";
import plugin, {
  RoadmapStore,
  applyRoadmapFeatureReorder,
  applyRoadmapMilestoneReorder,
  mapAllFeaturesToTaskHandoffs,
  mapFeatureToTaskHandoff,
  mapRoadmapToMissionHandoff,
  mapRoadmapWithHierarchyToMissionHandoff,
  moveRoadmapFeature,
  normalizeRoadmapFeatureOrder,
  normalizeRoadmapMilestoneOrder,
} from "../index.js";

describe("roadmap-planner package surface", () => {
  const tmpDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
    tmpDirs.length = 0;
  });

  it("keeps manifest and plugin entry metadata aligned", () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), "manifest.json"), "utf8")) as {
      id: string;
      version: string;
      dashboardViews?: Array<{ viewId: string }>;
    };

    expect(plugin.manifest.id).toBe(manifest.id);
    expect(plugin.manifest.version).toBe(manifest.version);
    expect(plugin.dashboardViews?.[0]?.viewId).toBe(manifest.dashboardViews?.[0]?.viewId);
  });

  it("declares expected package exports", () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8")) as {
      exports: Record<string, unknown>;
    };

    expect(pkg.exports).toHaveProperty(".");
    expect(pkg.exports).toHaveProperty("./server");
    expect(pkg.exports).toHaveProperty("./dashboard-view");
  });

  it("exports plugin manifest with roadmap id", () => {
    expect(plugin.manifest.id).toBe("roadmap-planner");
  });

  it("registers onSchemaInit hook that creates roadmap tables and indexes", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "roadmap-plugin-schema-test-"));
    tmpDirs.push(tmpDir);

    const db = new Database(join(tmpDir, ".fusion"), { inMemory: true });
    db.init();

    expect(plugin.hooks?.onSchemaInit).toBeTypeOf("function");
    plugin.hooks?.onSchemaInit?.(db);

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as Array<{ name: string }>;
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'").all() as Array<{ name: string }>;

    expect(tables.map((row) => row.name)).toEqual(expect.arrayContaining([
      "roadmaps",
      "roadmap_milestones",
      "roadmap_features",
    ]));
    expect(indexes.map((row) => row.name)).toEqual(expect.arrayContaining([
      "idxRoadmapMilestonesRoadmapOrder",
      "idxRoadmapFeaturesMilestoneOrder",
    ]));

    db.close();
  });

  it("re-exports roadmap domain symbols", () => {
    expect(typeof normalizeRoadmapMilestoneOrder).toBe("function");
    expect(typeof applyRoadmapMilestoneReorder).toBe("function");
    expect(typeof normalizeRoadmapFeatureOrder).toBe("function");
    expect(typeof applyRoadmapFeatureReorder).toBe("function");
    expect(typeof moveRoadmapFeature).toBe("function");
    expect(typeof mapFeatureToTaskHandoff).toBe("function");
    expect(typeof mapRoadmapToMissionHandoff).toBe("function");
    expect(typeof mapRoadmapWithHierarchyToMissionHandoff).toBe("function");
    expect(typeof mapAllFeaturesToTaskHandoffs).toBe("function");
    expect(typeof RoadmapStore).toBe("function");
  });
});
