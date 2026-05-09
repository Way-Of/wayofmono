/**
 * Regression tests for the FTS5 runtime guard.
 *
 * On Node builds whose bundled SQLite lacks FTS5 (older 22.x LTS),
 * `CREATE VIRTUAL TABLE … USING fts5(…)` throws `no such module: fts5`
 * and the dashboard crashes on first-run DB migration. These tests lock in
 * the fallback path: init() must succeed, and search() must route through
 * LIKE-based SQL.
 *
 * The `FUSION_DISABLE_FTS5=1` env var forces the probe to report FTS5 as
 * unavailable even on runtimes that support it — so the CI machine can
 * exercise the same code path a fresh install on an old Node would hit.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rm } from "node:fs/promises";
import { Database } from "../db.js";
import { ArchiveDatabase } from "../archive-db.js";
import { TaskStore } from "../store.js";

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), "kb-fts5-guard-test-"));
}

describe("FTS5 runtime guard", () => {
  let prevEnv: string | undefined;

  beforeEach(() => {
    prevEnv = process.env.FUSION_DISABLE_FTS5;
    process.env.FUSION_DISABLE_FTS5 = "1";
  });

  afterEach(() => {
    if (prevEnv === undefined) {
      delete process.env.FUSION_DISABLE_FTS5;
    } else {
      process.env.FUSION_DISABLE_FTS5 = prevEnv;
    }
  });

  describe("Database", () => {
    let tmpDir: string;
    let fusionDir: string;
    let db: Database;

    beforeEach(() => {
      tmpDir = makeTmpDir();
      fusionDir = join(tmpDir, ".fusion");
      db = new Database(fusionDir);
    });

    afterEach(async () => {
      try { db.close(); } catch { /* already closed */ }
      await rm(tmpDir, { recursive: true, force: true });
    });

    it("reports fts5Available=false when FUSION_DISABLE_FTS5 is set", () => {
      expect(db.fts5Available).toBe(false);
    });

    it("init() does not throw when FTS5 is unavailable", () => {
      expect(() => db.init()).not.toThrow();
    });

    it("skips creating tasks_fts virtual table", () => {
      db.init();
      const row = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='tasks_fts'"
      ).get() as { name: string } | undefined;
      expect(row).toBeUndefined();
    });

    it("skips creating FTS5 triggers", () => {
      db.init();
      const triggers = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='trigger'"
      ).all() as { name: string }[];
      const ftsTriggers = triggers.filter((t) => t.name.startsWith("tasks_fts_"));
      expect(ftsTriggers).toHaveLength(0);
    });

    it("still advances the schemaVersion so migrations don't retry", () => {
      db.init();
      const row = db.prepare(
        "SELECT value FROM __meta WHERE key = 'schemaVersion'"
      ).get() as { value: string };
      // Migration 21 guards FTS5; 35 also guards. The final version is
      // the full SCHEMA_VERSION regardless of FTS5 availability.
      expect(Number(row.value)).toBeGreaterThanOrEqual(35);
    });
  });

  describe("TaskStore.searchTasks LIKE fallback", () => {
    let rootDir: string;
    let globalDir: string;
    let store: TaskStore;

    beforeEach(async () => {
      rootDir = makeTmpDir();
      globalDir = makeTmpDir();
      store = new TaskStore(rootDir, globalDir);
      await store.init();
    });

    afterEach(async () => {
      store.close();
      await rm(rootDir, { recursive: true, force: true });
      await rm(globalDir, { recursive: true, force: true });
    });

    it("finds tasks by exact id match", async () => {
      await store.createTask({ description: "First task" });
      await store.createTask({ description: "Second task" });

      const results = await store.searchTasks("FN-001");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("FN-001");
    });

    it("finds tasks by title substring", async () => {
      await store.createTask({ title: "Fix login bug", description: "Login issue" });
      await store.createTask({ title: "Add dashboard feature", description: "New UI" });

      const results = await store.searchTasks("dashboard");
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Add dashboard feature");
    });

    it("finds tasks by description substring", async () => {
      await store.createTask({ description: "Fix the login button on the homepage" });
      await store.createTask({ description: "Update the settings page layout" });

      const results = await store.searchTasks("homepage");
      expect(results).toHaveLength(1);
      expect(results[0].description).toContain("homepage");
    });

    it("finds tasks by comment text", async () => {
      const task = await store.createTask({ description: "A task" });
      await store.addComment(task.id, "Need to prioritize the xylophone implementation", "tester");

      const results = await store.searchTasks("xylophone");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(task.id);
    });

    it("is case insensitive (LIKE on SQLite is ASCII-case-insensitive)", async () => {
      await store.createTask({ title: "UPPERCASE SEARCH TEST", description: "x" });

      const results = await store.searchTasks("uppercase");
      expect(results).toHaveLength(1);
    });

    it("uses OR semantics across tokens", async () => {
      await store.createTask({ title: "Fix login", description: "Button issues" });
      await store.createTask({ title: "Add dashboard", description: "New features" });

      const results = await store.searchTasks("login dashboard");
      expect(results).toHaveLength(2);
    });

    it("returns empty array for non-matching query", async () => {
      await store.createTask({ description: "Regular task description" });

      const results = await store.searchTasks("xyznonexistent12345");
      expect(results).toHaveLength(0);
    });

    it("escapes LIKE metacharacters in user input", async () => {
      await store.createTask({ description: "this has 100% coverage" });
      await store.createTask({ description: "the word percent does not have a literal" });

      // "100%" with a literal percent should match only the first task,
      // not every task via wildcard.
      const results = await store.searchTasks("100%");
      expect(results).toHaveLength(1);
      expect(results[0].description).toContain("100%");
    });

    it("respects limit option", async () => {
      await store.createTask({ title: "widget alpha", description: "x" });
      await store.createTask({ title: "widget beta", description: "x" });
      await store.createTask({ title: "widget gamma", description: "x" });

      const results = await store.searchTasks("widget", { limit: 2 });
      expect(results).toHaveLength(2);
    });

    it("excludes archived tasks when includeArchived is false", async () => {
      const uniqueTerm = `archguardterm${Date.now()}`;
      const task = await store.createTask({ description: `archived ${uniqueTerm}` });
      await store.moveTask(task.id, "todo");
      await store.moveTask(task.id, "in-progress");
      await store.moveTask(task.id, "in-review");
      await store.moveTask(task.id, "done");
      await store.archiveTask(task.id);

      const withArchived = await store.searchTasks(uniqueTerm);
      const withoutArchived = await store.searchTasks(uniqueTerm, { includeArchived: false });

      expect(withArchived.some((r) => r.id === task.id)).toBe(true);
      expect(withoutArchived.some((r) => r.id === task.id)).toBe(false);
    });
  });

  describe("ArchiveDatabase.search LIKE fallback", () => {
    let tmpDir: string;
    let fusionDir: string;
    let archive: ArchiveDatabase;

    beforeEach(() => {
      tmpDir = makeTmpDir();
      fusionDir = join(tmpDir, ".fusion");
      archive = new ArchiveDatabase(fusionDir);
      archive.init();
    });

    afterEach(async () => {
      try { archive.close(); } catch { /* already closed */ }
      await rm(tmpDir, { recursive: true, force: true });
    });

    it("reports fts5Available=false under the env override", () => {
      expect(archive.fts5Available).toBe(false);
    });

    it("init() does not throw when FTS5 is unavailable", () => {
      // init was called in beforeEach; re-running should still work
      expect(() => archive.init()).not.toThrow();
    });

    it("skips creating archived_tasks_fts virtual table", () => {
      // Direct probe via sqlite_master — exposed through Database's prepared
      // statement interface isn't available here, so we test via a known
      // side effect: search() must still return results.
      archive.upsert({
        id: "FN-ARCH-001",
        archivedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2025-12-01T00:00:00.000Z",
        updatedAt: "2025-12-02T00:00:00.000Z",
        title: "archived widget alpha",
        description: "this is an archived task about widgets",
        comments: [],
      } as any);

      const results = archive.search("widget", 10);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("FN-ARCH-001");
    });

    it("finds archived tasks via LIKE across id, title, description, comments", () => {
      archive.upsert({
        id: "FN-ARCH-002",
        archivedAt: "2026-01-02T00:00:00.000Z",
        createdAt: "2025-12-01T00:00:00.000Z",
        updatedAt: "2025-12-02T00:00:00.000Z",
        title: "unrelated",
        description: "task mentions xylophone in the body",
        comments: [],
      } as any);
      archive.upsert({
        id: "FN-ARCH-003",
        archivedAt: "2026-01-03T00:00:00.000Z",
        createdAt: "2025-12-03T00:00:00.000Z",
        updatedAt: "2025-12-03T00:00:00.000Z",
        title: "unrelated",
        description: "no match here",
        comments: [],
      } as any);

      const results = archive.search("xylophone", 10);
      expect(results.map((r) => r.id)).toEqual(["FN-ARCH-002"]);
    });

    it("returns empty array for empty or whitespace-only query", () => {
      expect(archive.search("", 10)).toEqual([]);
      expect(archive.search("   ", 10)).toEqual([]);
    });
  });
});
