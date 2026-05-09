import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile, readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { AgentStore } from "../agent-store.js";
import {
  getCanonicalAgentInstructionsBundleDirName,
  getLegacyAgentInstructionsBundleDirName,
  getSafeAgentAssetIdSegment,
} from "../types.js";

describe("AgentStore — instructions bundle", () => {
  let testDir: string;
  let store: AgentStore;
  const createdAgentIds: string[] = [];

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "agent-instructions-bundle-test-"));
    store = new AgentStore({ rootDir: testDir, inMemoryDb: true });
    await store.init();
  });

  afterEach(async () => {
    // Teardown order: entity cleanup first, then filesystem
    // Delete all created agents explicitly
    for (const agentId of createdAgentIds) {
      try {
        await store.deleteAgent(agentId);
      } catch {
        // Ignore cleanup errors for already-removed entities
      }
    }
    createdAgentIds.length = 0;

    store.close();

    // Filesystem cleanup last
    try {
      await rm(testDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("persists bundleConfig through create + load roundtrip", async () => {
    const created = await store.createAgent({
      name: "bundle-agent",
      role: "executor",
      bundleConfig: {
        mode: "managed",
        entryFile: "AGENTS.md",
        files: ["AGENTS.md", "STYLE.md"],
      },
    });
    createdAgentIds.push(created.id);

    expect(created.bundleConfig).toEqual({
      mode: "managed",
      entryFile: "AGENTS.md",
      files: ["AGENTS.md", "STYLE.md"],
    });

    const loaded = await store.getAgent(created.id);
    expect(loaded?.bundleConfig).toEqual(created.bundleConfig);
  });

  it("getInstructionsDir returns the managed bundle directory path", async () => {
    const agent = await store.createAgent({ name: "dir-agent", role: "executor" });
    createdAgentIds.push(agent.id);
    expect(store.getInstructionsDir(agent.id)).toBe(
      join(testDir, "agents", getCanonicalAgentInstructionsBundleDirName(agent.name, agent.id)),
    );
  });

  it("listBundleFiles returns empty for missing directory and sorted .md files only", async () => {
    const agent = await store.createAgent({ name: "list-agent", role: "executor" });
    createdAgentIds.push(agent.id);

    expect(await store.listBundleFiles(agent.id)).toEqual([]);

    const dir = store.getInstructionsDir(agent.id);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "z.md"), "z", "utf-8");
    await writeFile(join(dir, "a.md"), "a", "utf-8");
    await writeFile(join(dir, "b.txt"), "not markdown", "utf-8");
    await mkdir(join(dir, "nested"), { recursive: true });

    expect(await store.listBundleFiles(agent.id)).toEqual(["a.md", "z.md"]);
  });

  it("readBundleFile reads content and rejects missing/traversal paths", async () => {
    const agent = await store.createAgent({ name: "read-agent", role: "executor" });
    createdAgentIds.push(agent.id);

    await store.writeBundleFile(agent.id, "AGENTS.md", "Hello bundle");
    await expect(store.readBundleFile(agent.id, "AGENTS.md")).resolves.toBe("Hello bundle");

    await expect(store.readBundleFile(agent.id, "missing.md")).rejects.toThrow(/ENOENT|no such file/i);
    await expect(store.readBundleFile(agent.id, "../etc/passwd")).rejects.toThrow(/traversal/i);
  });

  it("writeBundleFile creates directories, overwrites, validates paths, and enforces max file count", async () => {
    const agent = await store.createAgent({ name: "write-agent", role: "executor" });
    createdAgentIds.push(agent.id);
    const dir = store.getInstructionsDir(agent.id);

    await store.writeBundleFile(agent.id, "AGENTS.md", "first");
    expect(await readFile(join(dir, "AGENTS.md"), "utf-8")).toBe("first");

    await store.writeBundleFile(agent.id, "AGENTS.md", "second");
    expect(await readFile(join(dir, "AGENTS.md"), "utf-8")).toBe("second");

    await expect(store.writeBundleFile(agent.id, "notes.txt", "bad")).rejects.toThrow(/\.md/i);
    await expect(store.writeBundleFile(agent.id, "../evil.md", "bad")).rejects.toThrow(/traversal/i);
    await expect(store.writeBundleFile(agent.id, `${"a".repeat(501)}.md`, "bad")).rejects.toThrow(/500/i);

    for (let i = 1; i < 10; i += 1) {
      await store.writeBundleFile(agent.id, `file-${i}.md`, `content-${i}`);
    }

    await expect(store.writeBundleFile(agent.id, "overflow.md", "11th")).rejects.toThrow(/10/i);
    await expect(store.writeBundleFile(agent.id, "file-1.md", "overwrite-allowed")).resolves.toBeUndefined();
  });

  it("deleteBundleFile removes files and throws when missing", async () => {
    const agent = await store.createAgent({ name: "delete-agent", role: "executor" });
    createdAgentIds.push(agent.id);
    const filePath = join(store.getInstructionsDir(agent.id), "AGENTS.md");

    await store.writeBundleFile(agent.id, "AGENTS.md", "to-delete");
    await store.deleteBundleFile(agent.id, "AGENTS.md");

    await expect(access(filePath)).rejects.toThrow();
    await expect(store.deleteBundleFile(agent.id, "AGENTS.md")).rejects.toThrow(/ENOENT|no such file/i);
  });

  it("setBundleConfig validates input and creates managed directory", async () => {
    const agent = await store.createAgent({ name: "config-agent", role: "executor" });
    createdAgentIds.push(agent.id);

    const managed = await store.setBundleConfig(agent.id, {
      mode: "managed",
      entryFile: "AGENTS.md",
      files: ["AGENTS.md"],
    });

    expect(managed.bundleConfig).toEqual({
      mode: "managed",
      entryFile: "AGENTS.md",
      files: ["AGENTS.md"],
    });

    const dir = store.getInstructionsDir(agent.id);
    await expect(access(dir)).resolves.toBeUndefined();

    await expect(
      store.setBundleConfig(agent.id, {
        mode: "external",
        entryFile: "AGENTS.md",
        files: [],
      }),
    ).rejects.toThrow(/externalPath/i);

    await expect(
      store.setBundleConfig(agent.id, {
        mode: "managed",
        entryFile: "   ",
        files: [],
      }),
    ).rejects.toThrow(/entryFile/i);
  });

  it("migrateLegacyInstructions migrates instructionsText to managed bundle", async () => {
    const agent = await store.createAgent({
      name: "migrate-text",
      role: "executor",
      instructionsText: "Legacy text content",
    });
    createdAgentIds.push(agent.id);

    const migrated = await store.migrateLegacyInstructions(agent.id);

    expect(migrated.instructionsText).toBeUndefined();
    expect(migrated.instructionsPath).toBeUndefined();
    expect(migrated.bundleConfig).toEqual({
      mode: "managed",
      entryFile: "AGENTS.md",
      files: ["AGENTS.md"],
    });

    await expect(store.readBundleFile(agent.id, "AGENTS.md")).resolves.toBe("Legacy text content");
  });

  it("migrateLegacyInstructions migrates instructionsPath to AGENTS.md", async () => {
    const sourcePath = "legacy-path.md";
    await writeFile(join(testDir, sourcePath), "Legacy path content", "utf-8");

    const agent = await store.createAgent({
      name: "migrate-path",
      role: "executor",
      instructionsPath: sourcePath,
    });
    createdAgentIds.push(agent.id);

    const migrated = await store.migrateLegacyInstructions(agent.id);

    expect(migrated.instructionsPath).toBeUndefined();
    expect(migrated.bundleConfig).toEqual({
      mode: "managed",
      entryFile: "AGENTS.md",
      files: ["AGENTS.md"],
    });
    await expect(store.readBundleFile(agent.id, "AGENTS.md")).resolves.toBe("Legacy path content");
  });

  it("migrateLegacyInstructions migrates both legacy fields", async () => {
    await mkdir(join(testDir, "legacy"), { recursive: true });
    const sourcePath = "legacy/extra.md";
    await writeFile(join(testDir, sourcePath), "Secondary path content", "utf-8");

    const agent = await store.createAgent({
      name: "migrate-both",
      role: "executor",
      instructionsText: "Primary inline content",
      instructionsPath: sourcePath,
    });
    createdAgentIds.push(agent.id);

    const migrated = await store.migrateLegacyInstructions(agent.id);

    expect(migrated.instructionsText).toBeUndefined();
    expect(migrated.instructionsPath).toBeUndefined();
    expect(migrated.bundleConfig).toEqual({
      mode: "managed",
      entryFile: "AGENTS.md",
      files: ["AGENTS.md", "extra.md"],
    });

    await expect(store.readBundleFile(agent.id, "AGENTS.md")).resolves.toBe("Primary inline content");
    await expect(store.readBundleFile(agent.id, "extra.md")).resolves.toBe("Secondary path content");
  });

  it("migrateLegacyInstructions is idempotent when bundleConfig already exists", async () => {
    const agent = await store.createAgent({
      name: "already-migrated",
      role: "executor",
      bundleConfig: {
        mode: "managed",
        entryFile: "AGENTS.md",
        files: ["AGENTS.md"],
      },
      instructionsText: "should-stay",
    });
    createdAgentIds.push(agent.id);

    const migrated = await store.migrateLegacyInstructions(agent.id);

    expect(migrated.bundleConfig).toEqual({
      mode: "managed",
      entryFile: "AGENTS.md",
      files: ["AGENTS.md"],
    });
    expect(migrated.instructionsText).toBe("should-stay");
  });

  it("migrateLegacyInstructions creates empty managed bundle config when no legacy fields exist", async () => {
    const agent = await store.createAgent({
      name: "no-legacy",
      role: "executor",
    });
    createdAgentIds.push(agent.id);

    const migrated = await store.migrateLegacyInstructions(agent.id);

    expect(migrated.bundleConfig).toEqual({
      mode: "managed",
      entryFile: "AGENTS.md",
      files: [],
    });
    expect(migrated.instructionsText).toBeUndefined();
    expect(migrated.instructionsPath).toBeUndefined();
  });

  it("uses existing legacy id-only instructions directory when present", async () => {
    const agent = await store.createAgent({ name: "Legacy Bundle", role: "executor" });
    createdAgentIds.push(agent.id);

    const legacyDir = join(testDir, "agents", getLegacyAgentInstructionsBundleDirName(agent.id));
    await mkdir(legacyDir, { recursive: true });
    await writeFile(join(legacyDir, "AGENTS.md"), "legacy content", "utf-8");

    await expect(store.readBundleFile(agent.id, "AGENTS.md")).resolves.toBe("legacy content");
  });

  it("uses previously-created display-name instructions directory for same id", async () => {
    const agent = await store.createAgent({ name: "Current Name", role: "executor" });
    createdAgentIds.push(agent.id);

    const priorDirName = `previous-name-${getSafeAgentAssetIdSegment(agent.id)}-instructions`;
    const priorDir = join(testDir, "agents", priorDirName);
    await mkdir(priorDir, { recursive: true });
    await writeFile(join(priorDir, "AGENTS.md"), "existing display path", "utf-8");

    await expect(store.readBundleFile(agent.id, "AGENTS.md")).resolves.toBe("existing display path");
  });
});
