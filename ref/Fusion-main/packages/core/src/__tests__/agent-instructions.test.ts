import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { AgentStore } from "../agent-store.js";

describe("AgentStore — instructions fields", () => {
  let testDir: string;
  let store: AgentStore;
  const createdAgentIds: string[] = [];

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "agent-instructions-test-"));
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

  it("creates an agent with instructionsText", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "executor",
      instructionsText: "Always use TypeScript strict mode.",
    });
    createdAgentIds.push(agent.id);

    expect(agent.instructionsText).toBe("Always use TypeScript strict mode.");
    expect(agent.instructionsPath).toBeUndefined();
  });

  it("creates an agent with instructionsPath", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "executor",
      instructionsPath: ".fusion/agents/custom.md",
    });
    createdAgentIds.push(agent.id);

    expect(agent.instructionsPath).toBe(".fusion/agents/custom.md");
    expect(agent.instructionsText).toBeUndefined();
  });

  it("creates an agent with both instructionsText and instructionsPath", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "reviewer",
      instructionsText: "Check for security issues.",
      instructionsPath: ".fusion/agents/reviewer.md",
    });
    createdAgentIds.push(agent.id);

    expect(agent.instructionsText).toBe("Check for security issues.");
    expect(agent.instructionsPath).toBe(".fusion/agents/reviewer.md");
  });

  it("creates an agent without instructions (default)", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "executor",
    });
    createdAgentIds.push(agent.id);

    expect(agent.instructionsText).toBeUndefined();
    expect(agent.instructionsPath).toBeUndefined();
  });

  it("persists instructionsText through roundtrip", async () => {
    const created = await store.createAgent({
      name: "test-agent",
      role: "executor",
      instructionsText: "Always write tests.",
    });
    createdAgentIds.push(created.id);

    const loaded = await store.getAgent(created.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.instructionsText).toBe("Always write tests.");
  });

  it("persists instructionsPath through roundtrip", async () => {
    const created = await store.createAgent({
      name: "test-agent",
      role: "executor",
      instructionsPath: ".fusion/agents/instructions.md",
    });
    createdAgentIds.push(created.id);

    const loaded = await store.getAgent(created.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.instructionsPath).toBe(".fusion/agents/instructions.md");
  });

  it("updates instructionsText on an existing agent", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "executor",
    });
    createdAgentIds.push(agent.id);

    const updated = await store.updateAgent(agent.id, {
      instructionsText: "Use functional programming patterns.",
    });

    expect(updated.instructionsText).toBe("Use functional programming patterns.");
  });

  it("updates instructionsPath on an existing agent", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "executor",
    });
    createdAgentIds.push(agent.id);

    const updated = await store.updateAgent(agent.id, {
      instructionsPath: ".fusion/agents/new-instructions.md",
    });

    expect(updated.instructionsPath).toBe(".fusion/agents/new-instructions.md");
  });

  it("clears instructionsText by updating to empty string", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "executor",
      instructionsText: "Some instructions",
    });
    createdAgentIds.push(agent.id);

    const updated = await store.updateAgent(agent.id, {
      instructionsText: "",
    });

    // Empty string should be persisted as-is (the engine resolver treats empty as no-op)
    expect(updated.instructionsText).toBe("");
  });

  it("clears instructionsPath by updating to empty string", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "executor",
      instructionsPath: ".fusion/agents/old.md",
    });
    createdAgentIds.push(agent.id);

    const updated = await store.updateAgent(agent.id, {
      instructionsPath: "",
    });

    expect(updated.instructionsPath).toBe("");
  });

  it("updates both instructions fields simultaneously", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "merger",
      instructionsText: "Old text",
      instructionsPath: "old.md",
    });
    createdAgentIds.push(agent.id);

    const updated = await store.updateAgent(agent.id, {
      instructionsText: "New text",
      instructionsPath: ".fusion/agents/new.md",
    });

    expect(updated.instructionsText).toBe("New text");
    expect(updated.instructionsPath).toBe(".fusion/agents/new.md");

    // Verify persistence
    const loaded = await store.getAgent(agent.id);
    expect(loaded!.instructionsText).toBe("New text");
    expect(loaded!.instructionsPath).toBe(".fusion/agents/new.md");
  });

  it("preserves other fields when updating instructions", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "executor",
      title: "My Executor",
      instructionsText: "Initial",
    });
    createdAgentIds.push(agent.id);

    const updated = await store.updateAgent(agent.id, {
      instructionsText: "Updated",
    });

    expect(updated.name).toBe("test-agent");
    expect(updated.role).toBe("executor");
    expect(updated.title).toBe("My Executor");
    expect(updated.instructionsText).toBe("Updated");
  });

  it("roundtrips instructions through getCachedAgent", async () => {
    const agent = await store.createAgent({
      name: "test-agent",
      role: "executor",
      instructionsText: "Cached instructions",
      instructionsPath: ".fusion/cached.md",
    });
    createdAgentIds.push(agent.id);

    const cached = store.getCachedAgent(agent.id);
    expect(cached).not.toBeNull();
    expect(cached!.instructionsText).toBe("Cached instructions");
    expect(cached!.instructionsPath).toBe(".fusion/cached.md");
  });
});
