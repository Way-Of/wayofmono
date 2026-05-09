import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  normalizeAgentSkills,
  collectPluginSkillNames,
  buildSessionSkillContext,
  buildSessionSkillContextSync,
  SKILL_DIAGNOSTIC_MESSAGES,
  type SessionPurpose,
} from "../session-skill-context.js";
import type { Agent, AgentStore } from "@fusion/core";
import type { PluginRunner } from "../plugin-runner.js";

describe("normalizeAgentSkills", () => {
  it("returns empty array for non-array input", () => {
    expect(normalizeAgentSkills(undefined)).toEqual([]);
    expect(normalizeAgentSkills(null)).toEqual([]);
    expect(normalizeAgentSkills("string")).toEqual([]);
    expect(normalizeAgentSkills({})).toEqual([]);
  });

  it("handles string entries", () => {
    const skills = ["triage", "executor", "reviewer"];
    expect(normalizeAgentSkills(skills)).toEqual(["triage", "executor", "reviewer"]);
  });

  it("handles object entries with name property", () => {
    const skills = [
      { name: "triage" },
      { name: "executor" },
      { name: "reviewer" },
    ];
    expect(normalizeAgentSkills(skills)).toEqual(["triage", "executor", "reviewer"]);
  });

  it("handles mixed string and object entries", () => {
    const skills = [
      "triage",
      { name: "executor" },
      { name: "reviewer" },
      "merger",
    ];
    expect(normalizeAgentSkills(skills)).toEqual(["triage", "executor", "reviewer", "merger"]);
  });

  it("trims whitespace from entries", () => {
    const skills = ["  triage  ", { name: "  executor  " }];
    expect(normalizeAgentSkills(skills)).toEqual(["triage", "executor"]);
  });

  it("drops empty entries", () => {
    const skills = ["", "triage", "   ", "executor", { name: "" }, { name: "reviewer" }];
    expect(normalizeAgentSkills(skills)).toEqual(["triage", "executor", "reviewer"]);
  });

  it("drops invalid entries", () => {
    const skills = [
      123,
      null,
      { foo: "bar" },
      "triage",
      undefined,
      { name: "executor" },
    ];
    expect(normalizeAgentSkills(skills)).toEqual(["triage", "executor"]);
  });

  it("deduplicates while preserving first occurrence order", () => {
    const skills = ["triage", "executor", "triage", "reviewer", "executor"];
    expect(normalizeAgentSkills(skills)).toEqual(["triage", "executor", "reviewer"]);
  });

  it("handles duplicate object entries", () => {
    const skills = [
      { name: "triage" },
      { name: "executor" },
      { name: "triage" },
    ];
    expect(normalizeAgentSkills(skills)).toEqual(["triage", "executor"]);
  });

  it("handles case-sensitive deduplication", () => {
    const skills = ["Triage", "triage", "EXECUTOR", "executor"];
    expect(normalizeAgentSkills(skills)).toEqual(["Triage", "triage", "EXECUTOR", "executor"]);
  });

  it("returns empty array for array of only invalid entries", () => {
    expect(normalizeAgentSkills([null, undefined, "", 123, {}])).toEqual([]);
  });

  it("handles object entries with name, deduplicates, trims, and drops invalid entries", () => {
    const skills = [
      { name: "  review  " },
      "  custom-skill  ",
      { name: "review" },
      123,
      null,
      { foo: "bar" },
      "",
      { name: "" },
    ];
    expect(normalizeAgentSkills(skills)).toEqual(["review", "custom-skill"]);
  });
});

describe("buildSessionSkillContextSync", () => {
  const projectRootDir = "/test/project";

  describe("assigned agent skills", () => {
    it("uses assigned agent skills when available", () => {
      const agent = {
        id: "agent-001",
        name: "Test Agent",
        role: "executor" as const,
        state: "idle" as const,
        metadata: { skills: ["triage", "executor"] },
      } as unknown as Agent;

      const result = buildSessionSkillContextSync(agent, "executor", projectRootDir);

      expect(result.skillSource).toBe("assigned-agent");
      expect(result.resolvedSkillNames).toEqual(["triage", "executor"]);
      expect(result.skillSelectionContext).toEqual({
        projectRootDir,
        requestedSkillNames: ["triage", "executor"],
        sessionPurpose: "executor",
      });
    });

    it("uses object-style agent skills", () => {
      const agent: Agent = {
        id: "agent-001",
        name: "Test Agent",
        role: "executor",
        state: "idle",
        metadata: { skills: [{ name: "triage" }, { name: "executor" }] },
      } as unknown as Agent;

      const result = buildSessionSkillContextSync(agent, "executor", projectRootDir);

      expect(result.skillSource).toBe("assigned-agent");
      expect(result.resolvedSkillNames).toEqual(["triage", "executor"]);
    });

    it("correctly extracts skills from a cached agent object", () => {
      const agent = {
        id: "agent-001",
        name: "Test Agent",
        role: "executor" as const,
        state: "idle" as const,
        metadata: { skills: ["triage", "executor"] },
      } as unknown as Agent;

      const result = buildSessionSkillContextSync(agent, "executor", projectRootDir);

      expect(result.skillSource).toBe("assigned-agent");
      expect(result.resolvedSkillNames).toEqual(["triage", "executor"]);
      expect(result.skillSelectionContext).toEqual({
        projectRootDir,
        requestedSkillNames: ["triage", "executor"],
        sessionPurpose: "executor",
      });
    });

    it("falls back to role when agent has empty skills", () => {
      const agent: Agent = {
        id: "agent-001",
        name: "Test Agent",
        role: "executor",
        state: "idle",
        metadata: { skills: [] },
      } as unknown as Agent;

      const result = buildSessionSkillContextSync(agent, "executor", projectRootDir);

      expect(result.skillSource).toBe("role-fallback");
      expect(result.resolvedSkillNames).toEqual(["fusion"]);
    });

    it("falls back to role when agent has no metadata", () => {
      const agent: Agent = {
        id: "agent-001",
        name: "Test Agent",
        role: "executor",
        state: "idle",
        metadata: {},
      } as unknown as Agent;

      const result = buildSessionSkillContextSync(agent, "executor", projectRootDir);

      expect(result.skillSource).toBe("role-fallback");
      expect(result.resolvedSkillNames).toEqual(["fusion"]);
    });

    it("falls back to role when agent has no metadata.skills", () => {
      const agent: Agent = {
        id: "agent-001",
        name: "Test Agent",
        role: "executor",
        state: "idle",
      } as unknown as Agent;

      const result = buildSessionSkillContextSync(agent, "executor", projectRootDir);

      expect(result.skillSource).toBe("role-fallback");
      expect(result.resolvedSkillNames).toEqual(["fusion"]);
    });
  });

  describe("role fallback skills", () => {
    it("returns fusion role fallback for triage purpose", () => {
      const result = buildSessionSkillContextSync(null, "triage", projectRootDir);

      expect(result.skillSource).toBe("role-fallback");
      expect(result.resolvedSkillNames).toEqual(["fusion"]);
    });

    it("returns fusion role fallback for executor purpose", () => {
      const result = buildSessionSkillContextSync(null, "executor", projectRootDir);

      expect(result.skillSource).toBe("role-fallback");
      expect(result.resolvedSkillNames).toEqual(["fusion"]);
    });

    it("returns fusion role fallback for reviewer purpose", () => {
      const result = buildSessionSkillContextSync(null, "reviewer", projectRootDir);

      expect(result.skillSource).toBe("role-fallback");
      expect(result.resolvedSkillNames).toEqual(["fusion"]);
    });

    it("returns fusion role fallback for merger purpose", () => {
      const result = buildSessionSkillContextSync(null, "merger", projectRootDir);

      expect(result.skillSource).toBe("role-fallback");
      expect(result.resolvedSkillNames).toEqual(["fusion"]);
    });

    it("returns no skills for heartbeat purpose (no role fallback)", () => {
      const result = buildSessionSkillContextSync(null, "heartbeat", projectRootDir);

      expect(result.skillSource).toBe("none");
      expect(result.resolvedSkillNames).toEqual([]);
      expect(result.skillSelectionContext).toBeUndefined();
    });

    it("uses agent skills over role fallback", () => {
      const agent: Agent = {
        id: "agent-001",
        name: "Test Agent",
        role: "executor",
        state: "idle",
        metadata: { skills: ["custom-skill-1", "custom-skill-2"] },
      } as unknown as Agent;

      const result = buildSessionSkillContextSync(agent, "executor", projectRootDir);

      expect(result.skillSource).toBe("assigned-agent");
      expect(result.resolvedSkillNames).toEqual(["custom-skill-1", "custom-skill-2"]);
    });
  });

  describe("no skills available", () => {
    it("returns undefined context when no skills and no fallback", () => {
      const result = buildSessionSkillContextSync(null, "heartbeat", projectRootDir);

      expect(result.skillSelectionContext).toBeUndefined();
      expect(result.resolvedSkillNames).toEqual([]);
    });
  });

  it("merges plugin skills in sync path", () => {
    const pluginRunner = {
      getPluginSkills: vi.fn().mockReturnValue([
        { pluginId: "plugin-a", skill: { name: "plugin-skill" } },
      ]),
    } as unknown as PluginRunner;

    const result = buildSessionSkillContextSync(null, "executor", projectRootDir, pluginRunner);
    expect(result.resolvedSkillNames).toEqual(["fusion", "plugin-skill"]);
  });

  it("keeps legacy behavior in sync path when pluginRunner is omitted", () => {
    const result = buildSessionSkillContextSync(null, "executor", projectRootDir);
    expect(result.resolvedSkillNames).toEqual(["fusion"]);
  });
});

describe("collectPluginSkillNames", () => {
  it("returns empty arrays when pluginRunner is undefined", () => {
    expect(collectPluginSkillNames(undefined)).toEqual({ names: [], pluginIds: [] });
  });

  it("returns empty arrays when no plugin skills are contributed", () => {
    const pluginRunner = { getPluginSkills: vi.fn().mockReturnValue([]) } as unknown as PluginRunner;
    expect(collectPluginSkillNames(pluginRunner)).toEqual({ names: [], pluginIds: [] });
  });

  it("returns enabled plugin skill names and dedupes by first occurrence", () => {
    const pluginRunner = {
      getPluginSkills: vi.fn().mockReturnValue([
        { pluginId: "plugin-a", skill: { name: "alpha" } },
        { pluginId: "plugin-b", skill: { name: "beta" } },
        { pluginId: "plugin-c", skill: { name: "alpha" } },
      ]),
    } as unknown as PluginRunner;

    expect(collectPluginSkillNames(pluginRunner)).toEqual({
      names: ["alpha", "beta"],
      pluginIds: ["plugin-a", "plugin-b"],
    });
  });

  it("filters out disabled skills", () => {
    const pluginRunner = {
      getPluginSkills: vi.fn().mockReturnValue([
        { pluginId: "plugin-a", skill: { name: "alpha", enabled: false } },
        { pluginId: "plugin-b", skill: { name: "beta", enabled: true } },
      ]),
    } as unknown as PluginRunner;

    expect(collectPluginSkillNames(pluginRunner)).toEqual({
      names: ["beta"],
      pluginIds: ["plugin-b"],
    });
  });
});

describe("buildSessionSkillContext", () => {
  const projectRootDir = "/test/project";

  it("uses assigned agent skills when available", async () => {
    const mockAgent: Agent = {
      id: "agent-001",
      name: "Test Agent",
      role: "executor",
      state: "idle",
      metadata: { skills: ["triage", "executor"] },
    } as unknown as Agent;

    const mockAgentStore = {
      getAgent: vi.fn().mockResolvedValue(mockAgent),
    } as unknown as AgentStore;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: { assignedAgentId: "agent-001" },
      sessionPurpose: "executor",
      projectRootDir,
    });

    expect(result.skillSource).toBe("assigned-agent");
    expect(result.resolvedSkillNames).toEqual(["triage", "executor"]);
    expect(mockAgentStore.getAgent).toHaveBeenCalledWith("agent-001");
  });

  it("resolves assigned-agent skills when task.assignedAgentId points to an agent with metadata.skills", async () => {
    const mockAgent: Agent = {
      id: "agent-001",
      name: "Test Agent",
      role: "executor",
      state: "idle",
      metadata: { skills: ["review", "custom-skill"] },
    } as unknown as Agent;

    const mockAgentStore = {
      getAgent: vi.fn().mockResolvedValue(mockAgent),
    } as unknown as AgentStore;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: { assignedAgentId: "agent-001" },
      sessionPurpose: "executor",
      projectRootDir,
    });

    expect(result.skillSource).toBe("assigned-agent");
    expect(result.resolvedSkillNames).toEqual(["review", "custom-skill"]);
    expect(result.skillSelectionContext?.requestedSkillNames).toEqual(["review", "custom-skill"]);
    expect(mockAgentStore.getAgent).toHaveBeenCalledWith("agent-001");
  });

  it("falls back to role fallback skills when assigned agent has no skills", async () => {
    const mockAgent: Agent = {
      id: "agent-001",
      name: "Test Agent",
      role: "executor",
      state: "idle",
      metadata: { skills: [] },
    } as unknown as Agent;

    const mockAgentStore = {
      getAgent: vi.fn().mockResolvedValue(mockAgent),
    } as unknown as AgentStore;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: { assignedAgentId: "agent-001" },
      sessionPurpose: "executor",
      projectRootDir,
    });

    expect(result.skillSource).toBe("role-fallback");
    expect(result.resolvedSkillNames).toEqual(["fusion"]);
  });

  it("falls back to role when no assignedAgentId", async () => {
    const mockAgentStore = {
      getAgent: vi.fn(),
    } as unknown as AgentStore;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: {},
      sessionPurpose: "executor",
      projectRootDir,
    });

    expect(result.skillSource).toBe("role-fallback");
    expect(result.resolvedSkillNames).toEqual(["fusion"]);
    expect(mockAgentStore.getAgent).not.toHaveBeenCalled();
  });

  it("falls back to role when assigned agent not found", async () => {
    const mockAgentStore = {
      getAgent: vi.fn().mockResolvedValue(null),
    } as unknown as AgentStore;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: { assignedAgentId: "nonexistent" },
      sessionPurpose: "triage",
      projectRootDir,
    });

    expect(result.skillSource).toBe("role-fallback");
    expect(result.resolvedSkillNames).toEqual(["fusion"]);
  });

  it("falls back to role when agent lookup throws", async () => {
    const mockAgentStore = {
      getAgent: vi.fn().mockRejectedValue(new Error("DB error")),
    } as unknown as AgentStore;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: { assignedAgentId: "agent-001" },
      sessionPurpose: "reviewer",
      projectRootDir,
    });

    expect(result.skillSource).toBe("role-fallback");
    expect(result.resolvedSkillNames).toEqual(["fusion"]);
  });

  it("uses heartbeat with no skills when no assigned agent", async () => {
    const mockAgentStore = {
      getAgent: vi.fn(),
    } as unknown as AgentStore;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: {},
      sessionPurpose: "heartbeat",
      projectRootDir,
    });

    expect(result.skillSource).toBe("none");
    expect(result.resolvedSkillNames).toEqual([]);
    expect(result.skillSelectionContext).toBeUndefined();
  });

  it("appends plugin skills to requestedSkillNames", async () => {
    const mockAgentStore = { getAgent: vi.fn().mockResolvedValue(null) } as unknown as AgentStore;
    const pluginRunner = {
      getPluginSkills: vi.fn().mockReturnValue([
        { pluginId: "plugin-a", skill: { name: "plugin-skill" } },
      ]),
    } as unknown as PluginRunner;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: {},
      sessionPurpose: "executor",
      projectRootDir,
      pluginRunner,
    });

    expect(result.resolvedSkillNames).toEqual(["fusion", "plugin-skill"]);
    expect(result.skillSelectionContext?.requestedSkillNames).toEqual(["fusion", "plugin-skill"]);
  });

  it("deduplicates plugin skills against assigned-agent skills case-insensitively", async () => {
    const mockAgent: Agent = {
      id: "agent-001",
      name: "Test Agent",
      role: "executor",
      state: "idle",
      metadata: { skills: ["Fusion"] },
    } as unknown as Agent;
    const mockAgentStore = { getAgent: vi.fn().mockResolvedValue(mockAgent) } as unknown as AgentStore;
    const pluginRunner = {
      getPluginSkills: vi.fn().mockReturnValue([
        { pluginId: "plugin-a", skill: { name: "fusion" } },
        { pluginId: "plugin-b", skill: { name: "plugin-skill" } },
      ]),
    } as unknown as PluginRunner;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: { assignedAgentId: "agent-001" },
      sessionPurpose: "executor",
      projectRootDir,
      pluginRunner,
    });

    expect(result.resolvedSkillNames).toEqual(["Fusion", "plugin-skill"]);
  });

  it("creates heartbeat skill context from plugin skills when no agent skills exist", async () => {
    const mockAgentStore = { getAgent: vi.fn() } as unknown as AgentStore;
    const pluginRunner = {
      getPluginSkills: vi.fn().mockReturnValue([
        { pluginId: "plugin-a", skill: { name: "plugin-skill" } },
      ]),
    } as unknown as PluginRunner;

    const result = await buildSessionSkillContext({
      agentStore: mockAgentStore,
      task: {},
      sessionPurpose: "heartbeat",
      projectRootDir,
      pluginRunner,
    });

    expect(result.skillSource).toBe("role-fallback");
    expect(result.skillSelectionContext?.requestedSkillNames).toEqual(["plugin-skill"]);
  });
});

describe("SKILL_DIAGNOSTIC_MESSAGES", () => {
  it("provides missing skill message template", () => {
    const msg = SKILL_DIAGNOSTIC_MESSAGES.missing("custom-skill");
    expect(msg).toBe('skill selection: requested skill "custom-skill" not found in discovered skills');
  });

  it("provides filtered skill message template", () => {
    const msg = SKILL_DIAGNOSTIC_MESSAGES.filtered("custom-skill");
    expect(msg).toBe('skill selection: requested skill "custom-skill" filtered out by execution-enabled settings');
  });

  it("provides assigned agent message template", () => {
    const msg = SKILL_DIAGNOSTIC_MESSAGES.assignedAgentSkills(3, "agent-001");
    expect(msg).toBe("Using skills from assigned agent agent-001 (3 skills)");
  });

  it("provides role fallback message template", () => {
    const msg = SKILL_DIAGNOSTIC_MESSAGES.roleFallbackSkills("triage", ["fusion"]);
    expect(msg).toBe("Using role fallback skills for triage: [fusion]");
  });

  it("provides no skills available message template", () => {
    const msg = SKILL_DIAGNOSTIC_MESSAGES.noSkillsAvailable("heartbeat");
    expect(msg).toBe("No skills available for heartbeat session (no assigned agent, no role fallback)");
  });
});
