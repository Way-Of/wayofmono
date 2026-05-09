import { describe, expect, it, vi } from "vitest";
import * as core from "@fusion/core";
import { collectTaskEvaluationEvidence } from "../evaluator-evidence.js";

const truncationMarker = core.EVIDENCE_EXCERPT_TRUNCATION_MARKER;

function makeTask(overrides: Record<string, unknown> = {}): core.TaskDetail {
  return {
    id: "FN-1",
    description: "desc",
    column: "done",
    dependencies: [],
    steps: [],
    currentStep: 0,
    log: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T01:00:00.000Z",
    prompt: "prompt",
    ...overrides,
  } as core.TaskDetail;
}

function makeStore(overrides: Partial<core.TaskStore> = {}): core.TaskStore {
  return {
    getTaskDocuments: vi.fn().mockResolvedValue([]),
    getAgentLogs: vi.fn().mockResolvedValue([]),
    getRunAuditEvents: vi.fn().mockReturnValue([]),
    ...overrides,
  } as unknown as core.TaskStore;
}

describe("collectTaskEvaluationEvidence", () => {
  it("collects fixed source groups with bounded excerpts", async () => {
    const store = makeStore({
      getTaskDocuments: vi.fn().mockResolvedValue([{ key: "plan", content: "x".repeat(900), revision: 1, author: "agent", updatedAt: "2026-01-01T00:01:00.000Z" }]),
      getAgentLogs: vi.fn().mockResolvedValue([{ timestamp: "2026-01-01T00:01:30.000Z", taskId: "FN-1", text: "run", type: "tool_result", detail: "ok" }]),
      getRunAuditEvents: vi.fn().mockReturnValue([{ id: "ra-1", timestamp: "2026-01-01T00:01:31.000Z", runId: "ER-1", agentId: "executor", taskId: "FN-1", domain: "git", mutationType: "git:commit", target: "HEAD" }]),
    });
    const task = makeTask({ summary: "summary", log: [{ timestamp: "2026-01-01T00:01:29.000Z", action: "Review step", outcome: "APPROVE" }] });

    const evidence = await collectTaskEvaluationEvidence({ store, task, runId: "ER-1", cwd: process.cwd() });

    expect(evidence.sourceOrder).toEqual(core.TASK_EVALUATION_EVIDENCE_SOURCE_ORDER);
    expect(evidence.documents[0]?.excerpt?.length).toBeLessThanOrEqual(500);
    expect(evidence.documents[0]?.truncated).toBe(true);
    expect(evidence.documents[0]?.excerpt?.endsWith(truncationMarker)).toBe(true);
    expect(evidence.taskMetadata[0]?.references?.executionCompletedAt).toBeUndefined();
    expect(evidence.taskMetadata[0]?.retryMetrics?.mergeRetries).toBe(0);
  });

  it("gracefully handles absent optional sources", async () => {
    const evidence = await collectTaskEvaluationEvidence({
      store: makeStore(),
      task: makeTask({ workflowStepResults: undefined, log: undefined }),
      runId: "ER-2",
      cwd: process.cwd(),
    });

    expect(evidence.workflow).toEqual([]);
    expect(evidence.reviews).toEqual([]);
    expect(evidence.agentLogs).toEqual([]);
    expect(evidence.runAudit).toEqual([]);
  });

  it("handles git read failures by returning empty commit evidence", async () => {
    const spy = vi.spyOn(core, "runCommandAsync").mockResolvedValue({
      stdout: "",
      stderr: "timeout",
      exitCode: 1,
      signal: null,
      bufferExceeded: false,
      timedOut: true,
    });

    const evidence = await collectTaskEvaluationEvidence({
      store: makeStore(),
      task: makeTask({ mergeDetails: { commitSha: "abc" } }),
      runId: "ER-3",
      cwd: process.cwd(),
    });

    expect(evidence.commits).toEqual([]);
    spy.mockRestore();
  });

  it("caps agent logs and run-audit/task-activity to configured limits", async () => {
    const agentLogs = Array.from({ length: 30 }, (_, i) => ({
      timestamp: `2026-01-01T00:00:${String(i).padStart(2, "0")}.000Z`,
      taskId: "FN-1",
      text: `entry-${i}`,
      type: "text" as const,
    }));
    const runAudit = Array.from({ length: 30 }, (_, i) => ({
      id: `ra-${i}`,
      timestamp: `2026-01-01T00:01:${String(i).padStart(2, "0")}.000Z`,
      runId: "ER-4",
      agentId: "executor",
      taskId: "FN-1",
      domain: "git",
      mutationType: `mutation-${i}`,
      target: `target-${i}`,
    }));
    const taskLog = Array.from({ length: 30 }, (_, i) => ({
      timestamp: `2026-01-01T00:02:${String(i).padStart(2, "0")}.000Z`,
      action: `action-${i}`,
      outcome: "ok",
    }));

    const evidence = await collectTaskEvaluationEvidence({
      store: makeStore({
        getAgentLogs: vi.fn().mockResolvedValue(agentLogs),
        getRunAuditEvents: vi.fn().mockReturnValue(runAudit),
      }),
      task: makeTask({ log: taskLog }),
      runId: "ER-4",
      cwd: process.cwd(),
    });

    expect(evidence.agentLogs).toHaveLength(core.EVIDENCE_LIMITS.agentLogs);
    expect(evidence.runAudit).toHaveLength(core.EVIDENCE_LIMITS.runAudit);
    expect(evidence.taskActivity).toHaveLength(core.EVIDENCE_LIMITS.taskActivity);
    expect(evidence.agentLogs[0]?.excerpt).toContain("entry-5");
    expect(evidence.agentLogs.at(-1)?.excerpt).toContain("entry-29");
  });

  it("truncates task metadata summary when oversized", async () => {
    const evidence = await collectTaskEvaluationEvidence({
      store: makeStore(),
      task: makeTask({
        summary: "s".repeat(700),
        mergeRetries: 2,
        workflowStepRetries: 3,
        stuckKillCount: 1,
        postReviewFixCount: 4,
        recoveryRetryCount: 5,
        taskDoneRetryCount: 6,
        verificationFailureCount: 7,
        mergeConflictBounceCount: 8,
      }),
      runId: "ER-5",
      cwd: process.cwd(),
    });

    expect(evidence.taskMetadata[0]?.retryMetrics).toEqual({
      mergeRetries: 2,
      workflowStepRetries: 3,
      stuckKillCount: 1,
      postReviewFixCount: 4,
      recoveryRetryCount: 5,
      taskDoneRetryCount: 6,
      verificationFailureCount: 7,
      mergeConflictBounceCount: 8,
    });

    const summary = evidence.taskMetadata[0]?.summary ?? "";
    expect(summary.length).toBeLessThanOrEqual(500);
    expect(summary.endsWith(truncationMarker)).toBe(true);
    expect(evidence.taskMetadata[0]?.truncated).toBe(true);
  });
});
