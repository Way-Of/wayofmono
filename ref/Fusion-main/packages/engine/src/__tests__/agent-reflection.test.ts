import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  Agent,
  AgentHeartbeatRun,
  AgentPerformanceSummary,
  AgentReflection,
  ReflectionMetrics,
  Task,
} from "@fusion/core";

vi.mock("../pi.js", () => ({
  createFnAgent: vi.fn(),
  promptWithFallback: vi.fn(),
}));

import { createFnAgent, promptWithFallback } from "../pi.js";
import { AgentReflectionService } from "../agent-reflection.js";
import { createReflectOnPerformanceTool, reflectOnPerformanceParams } from "../agent-tools.js";

const mockedCreateFnAgent = vi.mocked(createFnAgent);
const mockedPromptWithFallback = vi.mocked(promptWithFallback);

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent-1",
    name: "Execution Agent",
    role: "executor",
    state: "active",
    createdAt: "2026-04-08T00:00:00.000Z",
    updatedAt: "2026-04-08T00:00:00.000Z",
    metadata: {},
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "FN-001",
    description: "Test task",
    column: "done",
    dependencies: [],
    steps: [],
    currentStep: 0,
    log: [],
    createdAt: "2026-04-08T00:00:00.000Z",
    updatedAt: "2026-04-08T01:00:00.000Z",
    assignedAgentId: "agent-1",
    ...overrides,
  };
}

function makeSummary(overrides: Partial<AgentPerformanceSummary> = {}): AgentPerformanceSummary {
  return {
    agentId: "agent-1",
    totalTasksCompleted: 3,
    totalTasksFailed: 1,
    avgDurationMs: 120_000,
    successRate: 0.75,
    commonErrors: ["timeout"],
    strengths: ["Clear commit boundaries"],
    weaknesses: ["Improve test coverage"],
    recentReflectionCount: 2,
    computedAt: "2026-04-08T01:00:00.000Z",
    ...overrides,
  };
}

function makeReflection(overrides: Partial<AgentReflection> = {}): AgentReflection {
  return {
    id: "reflection-1",
    agentId: "agent-1",
    timestamp: "2026-04-08T01:00:00.000Z",
    trigger: "manual",
    metrics: {
      tasksCompleted: 2,
      tasksFailed: 1,
      avgDurationMs: 60_000,
      commonErrors: ["timeout"],
    },
    insights: ["Tends to stall on testing"],
    suggestedImprovements: ["Run targeted tests earlier"],
    summary: "Performance is generally solid with room to tighten test feedback loops.",
    ...overrides,
  };
}

function makeRun(overrides: Partial<AgentHeartbeatRun> = {}): AgentHeartbeatRun {
  return {
    id: "run-1",
    agentId: "agent-1",
    startedAt: "2026-04-08T00:00:00.000Z",
    endedAt: "2026-04-08T00:05:00.000Z",
    status: "completed",
    contextSnapshot: { taskId: "FN-001" },
    ...overrides,
  };
}

function createMockDeps() {
  const agentStore = {
    getAgent: vi.fn().mockResolvedValue(makeAgent()),
    getRecentRuns: vi.fn().mockResolvedValue([makeRun()]),
  } as any;

  const taskStore = {
    listTasks: vi.fn().mockResolvedValue([makeTask()]),
  } as any;

  const reflectionStore = {
    getPerformanceSummary: vi.fn().mockResolvedValue(makeSummary()),
    getLatestReflection: vi.fn().mockResolvedValue(makeReflection()),
    createReflection: vi.fn().mockImplementation(async ({
      agentId,
      trigger,
      triggerDetail,
      taskId,
      metrics,
      insights,
      suggestedImprovements,
      summary,
    }: {
      agentId: string;
      trigger: AgentReflection["trigger"];
      triggerDetail?: string;
      taskId?: string;
      metrics: ReflectionMetrics;
      insights: string[];
      suggestedImprovements: string[];
      summary: string;
    }) => makeReflection({
      agentId,
      trigger,
      triggerDetail,
      taskId,
      metrics,
      insights,
      suggestedImprovements,
      summary,
    })),
  } as any;

  return { agentStore, taskStore, reflectionStore };
}

function createMockSession() {
  return {
    state: {},
    dispose: vi.fn(),
  } as any;
}

describe("AgentReflectionService", () => {
  let tempRoot: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    tempRoot = await mkdtemp(join(tmpdir(), "agent-reflection-test-"));
  });

  describe("buildReflectionContext", () => {
    it("returns context with recent outcomes, summary, and latest reflection", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });

      const context = await service.buildReflectionContext("agent-1");

      expect(context.agent.id).toBe("agent-1");
      expect(context.recentOutcomes).toHaveLength(1);
      expect(context.performanceSummary?.successRate).toBe(0.75);
      expect(context.latestReflection?.id).toBe("reflection-1");
    });

    it("returns empty recentOutcomes when no task history exists", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      taskStore.listTasks.mockResolvedValue([]);
      agentStore.getRecentRuns.mockResolvedValue([]);

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const context = await service.buildReflectionContext("agent-1");

      expect(context.recentOutcomes).toEqual([]);
    });

    it("reads instructions from instructionsText when provided", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      agentStore.getAgent.mockResolvedValue(makeAgent({ instructionsText: "Always run tests before committing." }));

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const context = await service.buildReflectionContext("agent-1");

      expect(context.instructions).toContain("Always run tests before committing.");
    });

    it("reads instructions from file when instructionsPath is set", async () => {
      const instructionsDir = join(tempRoot, "agents");
      const instructionsPath = join(instructionsDir, "executor.md");
      await mkdir(instructionsDir, { recursive: true });
      await writeFile(instructionsPath, "Prefer smaller commits with clear messages.", { encoding: "utf-8" });

      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      agentStore.getAgent.mockResolvedValue(makeAgent({ instructionsPath: "agents/executor.md" }));

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const context = await service.buildReflectionContext("agent-1");

      expect(context.instructions).toContain("Prefer smaller commits with clear messages.");
    });

    it("handles missing agent gracefully", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      agentStore.getAgent.mockResolvedValue(null);

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const context = await service.buildReflectionContext("agent-missing");

      expect(context.agent.id).toBe("agent-missing");
      expect(context.agent.name).toContain("Unknown Agent");
    });

    it("includes latest reflection when available", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      reflectionStore.getLatestReflection.mockResolvedValue(makeReflection({ id: "reflection-latest" }));

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const context = await service.buildReflectionContext("agent-1");

      expect(context.latestReflection?.id).toBe("reflection-latest");
    });
  });

  describe("getRecentTaskOutcomes", () => {
    it("returns completed outcomes for done and in-review tasks", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      taskStore.listTasks.mockResolvedValue([
        makeTask({ id: "FN-001", column: "done", assignedAgentId: "agent-1" }),
        makeTask({ id: "FN-002", column: "in-review", assignedAgentId: "agent-1" }),
      ]);

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const outcomes = await service.getRecentTaskOutcomes("agent-1", 10);

      expect(outcomes.map((outcome) => outcome.outcome)).toEqual(["completed", "completed"]);
    });

    it("returns failed outcomes when status includes failed", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      taskStore.listTasks.mockResolvedValue([
        makeTask({ id: "FN-FAIL", column: "todo", status: "failed", assignedAgentId: "agent-1" }),
      ]);

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const outcomes = await service.getRecentTaskOutcomes("agent-1", 10);

      expect(outcomes).toHaveLength(1);
      expect(outcomes[0]?.outcome).toBe("failed");
    });

    it("returns stuck outcomes when task was killed by stuck detector", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      taskStore.listTasks.mockResolvedValue([
        makeTask({
          id: "FN-STUCK",
          column: "todo",
          status: "stuck-killed",
          assignedAgentId: "agent-1",
          log: [{ timestamp: "2026-04-08T00:00:00.000Z", action: "Task terminated due to stuck agent session" }],
        }),
      ]);

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const outcomes = await service.getRecentTaskOutcomes("agent-1", 10);

      expect(outcomes).toHaveLength(1);
      expect(outcomes[0]?.outcome).toBe("stuck");
    });

    it("respects limit parameter", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      taskStore.listTasks.mockResolvedValue([
        makeTask({ id: "FN-001", assignedAgentId: "agent-1" }),
        makeTask({ id: "FN-002", assignedAgentId: "agent-1" }),
        makeTask({ id: "FN-003", assignedAgentId: "agent-1" }),
      ]);

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const outcomes = await service.getRecentTaskOutcomes("agent-1", 2);

      expect(outcomes).toHaveLength(2);
    });

    it("returns empty array when agent has no tasks", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      taskStore.listTasks.mockResolvedValue([makeTask({ assignedAgentId: "agent-2" })]);
      agentStore.getRecentRuns.mockResolvedValue([]);

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const outcomes = await service.getRecentTaskOutcomes("agent-1", 10);

      expect(outcomes).toEqual([]);
    });
  });

  describe("extractErrorPatterns", () => {
    it("returns common errors from performance summary", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      reflectionStore.getPerformanceSummary.mockResolvedValue(makeSummary({ commonErrors: ["timeout", "merge conflict"] }));

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const errors = await service.extractErrorPatterns("agent-1");

      expect(errors).toEqual(["timeout", "merge conflict"]);
    });

    it("returns empty array when no summary exists", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      reflectionStore.getPerformanceSummary.mockResolvedValue(makeSummary({
        totalTasksCompleted: 0,
        totalTasksFailed: 0,
        avgDurationMs: 0,
        successRate: 0,
        commonErrors: [],
        strengths: [],
        weaknesses: [],
        recentReflectionCount: 0,
      }));

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const errors = await service.extractErrorPatterns("agent-1");

      expect(errors).toEqual([]);
    });

    it("returns empty array when summary has no errors", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      reflectionStore.getPerformanceSummary.mockResolvedValue(makeSummary({ commonErrors: [] }));

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const errors = await service.extractErrorPatterns("agent-1");

      expect(errors).toEqual([]);
    });
  });

  describe("generateReflection", () => {
    it("creates reflection when data is available", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      const session = createMockSession();

      mockedCreateFnAgent.mockImplementation(async (options: any) => {
        options.onText?.(JSON.stringify({
          insights: ["Strong execution on scoped changes"],
          suggestedImprovements: ["Run tests earlier in the cycle"],
          summary: "Execution quality is strong with room to tighten feedback loops.",
        }));
        return { session };
      });
      mockedPromptWithFallback.mockResolvedValue(undefined);

      const service = new AgentReflectionService({
        agentStore,
        taskStore,
        reflectionStore,
        rootDir: tempRoot,
      });

      const reflection = await service.generateReflection("agent-1", "manual", {
        taskId: "FN-001",
        triggerDetail: "manual check",
      });

      expect(reflection).not.toBeNull();
      expect(reflectionStore.createReflection).toHaveBeenCalledTimes(1);
      expect(reflectionStore.createReflection).toHaveBeenCalledWith(expect.objectContaining({
        agentId: "agent-1",
        trigger: "manual",
        triggerDetail: "manual check",
        taskId: "FN-001",
      }));
      expect(mockedCreateFnAgent).toHaveBeenCalledWith(expect.objectContaining({
        tools: "readonly",
      }));
    });

    it("returns null when no meaningful data exists", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      taskStore.listTasks.mockResolvedValue([]);
      agentStore.getRecentRuns.mockResolvedValue([]);

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const reflection = await service.generateReflection("agent-1", "manual");

      expect(reflection).toBeNull();
      expect(mockedCreateFnAgent).not.toHaveBeenCalled();
      expect(reflectionStore.createReflection).not.toHaveBeenCalled();
    });

    it("returns null on AI session failure", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      mockedCreateFnAgent.mockRejectedValue(new Error("AI unavailable"));

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      const reflection = await service.generateReflection("agent-1", "manual");

      expect(reflection).toBeNull();
      expect(reflectionStore.createReflection).not.toHaveBeenCalled();
    });

    it("persists reflection via reflectionStore.createReflection", async () => {
      const { agentStore, taskStore, reflectionStore } = createMockDeps();
      const session = createMockSession();

      mockedCreateFnAgent.mockImplementation(async (options: any) => {
        options.onText?.(JSON.stringify({
          insights: ["Insight A"],
          suggestedImprovements: ["Improve B"],
          summary: "Summary C",
        }));
        return { session };
      });
      mockedPromptWithFallback.mockResolvedValue(undefined);

      const service = new AgentReflectionService({ agentStore, taskStore, reflectionStore, rootDir: tempRoot });
      await service.generateReflection("agent-1", "post-task", {
        taskId: "FN-777",
        triggerDetail: "post-task reflection",
      });

      expect(reflectionStore.createReflection).toHaveBeenCalledWith(expect.objectContaining({
        trigger: "post-task",
        taskId: "FN-777",
        triggerDetail: "post-task reflection",
      }));
    });
  });

  describe("reflect_on_performance tool", () => {
    it("returns formatted text when reflection succeeds", async () => {
      const reflectionService = {
        generateReflection: vi.fn().mockResolvedValue(makeReflection({
          summary: "Reflection summary",
          insights: ["Insight 1"],
          suggestedImprovements: ["Improve 1"],
        })),
      } as any;

      const tool = createReflectOnPerformanceTool(reflectionService, "agent-1");
      const result = await (tool.execute as any)("tool-1", {}, {}, {}, undefined);

      const content = result.content[0];
      expect(content?.type).toBe("text");
      if (!content || content.type !== "text") {
        throw new Error("Expected text content");
      }

      expect(content.text).toContain("Summary: Reflection summary");
      expect(content.text).toContain("Insights:");
      expect(content.text).toContain("Suggested Improvements:");
    });

    it("returns no-data message when reflection returns null", async () => {
      const reflectionService = {
        generateReflection: vi.fn().mockResolvedValue(null),
      } as any;

      const tool = createReflectOnPerformanceTool(reflectionService, "agent-1");
      const result = await (tool.execute as any)("tool-1", {}, {}, {}, undefined);

      const content = result.content[0];
      expect(content?.type).toBe("text");
      if (!content || content.type !== "text") {
        throw new Error("Expected text content");
      }

      expect(content.text).toBe("No reflection data available — not enough history yet.");
    });

    it("passes focus_area as triggerDetail", async () => {
      const reflectionService = {
        generateReflection: vi.fn().mockResolvedValue(makeReflection()),
      } as any;

      const tool = createReflectOnPerformanceTool(reflectionService, "agent-1");
      await (tool.execute as any)("tool-1", { focus_area: "testing" }, {}, {}, undefined);

      expect(reflectionService.generateReflection).toHaveBeenCalledWith(
        "agent-1",
        "manual",
        { triggerDetail: "Agent-initiated reflection focused on: testing" },
      );
    });

    it("parameter schema accepts optional focus_area", () => {
      const required = (reflectOnPerformanceParams as { required?: string[] }).required;
      expect(required?.includes("focus_area") ?? false).toBe(false);
    });
  });

  afterEach(async () => {
    if (tempRoot) {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});
