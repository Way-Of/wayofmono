import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock AgentStore ──────────────────────────────────────────────────

const mockGetAgent = vi.fn();
const mockUpdateAgentState = vi.fn();
const mockInit = vi.fn().mockResolvedValue(undefined);

// AgentStore mock — vi.fn() with mockImplementation works with `new` in vitest.
// We return a plain object from the constructor which becomes the instance.
vi.mock("@fusion/core", () => ({
  AgentStore: vi.fn().mockImplementation(() => ({
    init: mockInit,
    getAgent: mockGetAgent,
    updateAgentState: mockUpdateAgentState,
  })),
  AGENT_VALID_TRANSITIONS: {
    idle: ["active"],
    active: ["running", "paused"],
    running: ["active", "paused", "error"],
    paused: ["active"],
    error: ["active"],
  },
}));

// ── Mock project-context ─────────────────────────────────────────────

vi.mock("../project-context.js", () => ({
  resolveProject: vi.fn().mockResolvedValue({
    projectId: "test-project",
    projectPath: "/tmp/test-project",
    projectName: "test-project",
    isRegistered: true,
    store: {},
  }),
}));

// ── Spies ────────────────────────────────────────────────────────────

const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
  throw new Error("process.exit");
}) as any);

const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

// ── Import after mocks ───────────────────────────────────────────────

import { runAgentStop, runAgentStart } from "../agent.js";

function makeAgent(state: string) {
  return {
    id: "agent-test123",
    name: "test-agent",
    role: "executor" as const,
    state,
    taskId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {},
  };
}

// ── Tests ────────────────────────────────────────────────────────────

describe("runAgentStop", () => {
  beforeEach(() => {
    mockGetAgent.mockResolvedValue(makeAgent("running"));
    mockUpdateAgentState.mockResolvedValue(makeAgent("paused"));
    mockInit.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should stop a running agent", async () => {
    await runAgentStop("agent-test123");

    expect(mockUpdateAgentState).toHaveBeenCalledWith("agent-test123", "paused");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("✓ Agent agent-test123 stopped"));
  });

  it("should stop an active agent", async () => {
    mockGetAgent.mockResolvedValue(makeAgent("active"));

    await runAgentStop("agent-test123");

    expect(mockUpdateAgentState).toHaveBeenCalledWith("agent-test123", "paused");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("✓ Agent agent-test123 stopped"));
  });

  it("should report when agent is not found", async () => {
    mockGetAgent.mockResolvedValue(null);

    await expect(runAgentStop("agent-nonexistent")).rejects.toThrow("process.exit");
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("agent-nonexistent not found"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should report when agent is already paused", async () => {
    mockGetAgent.mockResolvedValue(makeAgent("paused"));

    await runAgentStop("agent-test123");

    // Should NOT call updateAgentState
    expect(mockUpdateAgentState).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("already paused"));
  });

  it("should reject stopping an idle agent (invalid transition)", async () => {
    mockGetAgent.mockResolvedValue(makeAgent("idle"));

    await expect(runAgentStop("agent-test123")).rejects.toThrow("process.exit");
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("cannot transition to 'paused'"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should reject stopping an error agent (invalid transition)", async () => {
    mockGetAgent.mockResolvedValue(makeAgent("error"));

    await expect(runAgentStop("agent-test123")).rejects.toThrow("process.exit");
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("cannot transition to 'paused'"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

describe("runAgentStart", () => {
  beforeEach(() => {
    mockGetAgent.mockResolvedValue(makeAgent("paused"));
    mockUpdateAgentState.mockResolvedValue(makeAgent("active"));
    mockInit.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should start a paused agent", async () => {
    await runAgentStart("agent-test123");

    expect(mockUpdateAgentState).toHaveBeenCalledWith("agent-test123", "active");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("✓ Agent agent-test123 started"));
  });

  it("should start an idle agent", async () => {
    mockGetAgent.mockResolvedValue(makeAgent("idle"));
    mockUpdateAgentState.mockResolvedValue(makeAgent("active"));

    await runAgentStart("agent-test123");

    expect(mockUpdateAgentState).toHaveBeenCalledWith("agent-test123", "active");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("✓ Agent agent-test123 started"));
  });

  it("should start an error agent", async () => {
    mockGetAgent.mockResolvedValue(makeAgent("error"));
    mockUpdateAgentState.mockResolvedValue(makeAgent("active"));

    await runAgentStart("agent-test123");

    expect(mockUpdateAgentState).toHaveBeenCalledWith("agent-test123", "active");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("✓ Agent agent-test123 started"));
  });

  it("should report when agent is not found", async () => {
    mockGetAgent.mockResolvedValue(null);

    await expect(runAgentStart("agent-nonexistent")).rejects.toThrow("process.exit");
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("agent-nonexistent not found"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should report when agent is already active", async () => {
    mockGetAgent.mockResolvedValue(makeAgent("active"));

    await runAgentStart("agent-test123");

    expect(mockUpdateAgentState).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("already running"));
  });

  it("should report when agent is already running", async () => {
    mockGetAgent.mockResolvedValue(makeAgent("running"));

    await runAgentStart("agent-test123");

    expect(mockUpdateAgentState).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("already running"));
  });
});
