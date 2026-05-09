import { describe, expect, it, vi } from "vitest";
import { TASK_EVALUATION_EVIDENCE_SOURCE_ORDER, computeOverallScore, createDatabase, EvalStore, runScheduledEvalBatch, type TaskDetail, type TaskEvaluationEvidenceBundle } from "@fusion/core";
import { HybridEvaluatorService, buildEvaluationPrompt, parseAiResponse, resolveEvaluatorModel } from "../evaluator.js";

function makeTask(overrides: Partial<TaskDetail> = {}): TaskDetail {
  return {
    id: "FN-101",
    description: "desc",
    column: "done",
    dependencies: [],
    steps: [],
    currentStep: 0,
    log: [{ timestamp: "1", action: "[timing] build in 50ms" }],
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T01:00:00.000Z",
    prompt: "prompt",
    ...overrides,
  } as TaskDetail;
}

function makeAiResponse(overrides: Partial<Record<string, unknown>> = {}): string {
  return JSON.stringify({
    categories: {
      agentPerformance: {
        score: 80,
        rationale: "Strong execution decisions.",
        evidence: [{ kind: "task", label: "status", value: "done", source: "task" }],
      },
      taskOutcomeQuality: {
        score: 90,
        rationale: "Shipped result is complete and correct.",
        evidence: [{ kind: "workflow", label: "tests", value: "pass", source: "workflow" }],
      },
      processCompliance: {
        score: 70,
        rationale: "Workflow mostly followed.",
        evidence: [{ kind: "review", label: "review", value: "approved", source: "review" }],
      },
    },
    overallRationale: "Solid result with complete verification.",
    followUpDrafts: [{
      title: "Investigate flaky verification command",
      description: "Investigate flaky verification command failures seen in workflow output.",
      reason: "Verification command failed repeatedly",
      evidenceRefs: ["workflow-1"],
    }],
    ...overrides,
  });
}

describe("evaluator", () => {
  it("resolves explicit complete model override before validator lane", () => {
    expect(resolveEvaluatorModel({ validatorProvider: "anthropic", validatorModelId: "claude" }, { provider: "openai", modelId: "gpt-4o" }))
      .toEqual({ provider: "openai", modelId: "gpt-4o" });
  });

  it("ignores partial override and falls back to validator lane", () => {
    expect(resolveEvaluatorModel({ validatorProvider: "anthropic", validatorModelId: "claude" }, { provider: "openai" }))
      .toEqual({ provider: "anthropic", modelId: "claude" });
  });

  it("parses strict AI JSON response with canonical categories", () => {
    const parsed = parseAiResponse(makeAiResponse());
    expect(parsed.overallRationale).toBe("Solid result with complete verification.");
    expect(parsed.categories.agentPerformance.score).toBe(80);
    expect(parsed.categories.taskOutcomeQuality.score).toBe(90);
    expect(parsed.categories.processCompliance.score).toBe(70);
  });

  it("throws on malformed AI JSON response", () => {
    expect(() => parseAiResponse("not-json")).toThrow(/not valid JSON/);
  });

  it("rejects invalid evaluator payloads (out of range, missing rationale/evidence, missing category)", () => {
    expect(() => parseAiResponse(makeAiResponse({
      categories: {
        agentPerformance: { score: 101, rationale: "x", evidence: [{ kind: "task", label: "l" }] },
        taskOutcomeQuality: { score: 90, rationale: "x", evidence: [{ kind: "task", label: "l" }] },
        processCompliance: { score: 80, rationale: "x", evidence: [{ kind: "task", label: "l" }] },
      },
    }))).toThrow(/agentPerformance score must be an integer in 0..100/);

    expect(() => parseAiResponse(makeAiResponse({
      categories: {
        agentPerformance: { score: 80, rationale: "", evidence: [{ kind: "task", label: "l" }] },
        taskOutcomeQuality: { score: 90, rationale: "x", evidence: [{ kind: "task", label: "l" }] },
        processCompliance: { score: 80, rationale: "x", evidence: [{ kind: "task", label: "l" }] },
      },
    }))).toThrow(/agentPerformance rationale is required/);

    expect(() => parseAiResponse(makeAiResponse({
      categories: {
        agentPerformance: { score: 80, rationale: "x", evidence: [] },
        taskOutcomeQuality: { score: 90, rationale: "x", evidence: [{ kind: "task", label: "l" }] },
        processCompliance: { score: 80, rationale: "x", evidence: [{ kind: "task", label: "l" }] },
      },
    }))).toThrow(/agentPerformance evidence is required/);

    expect(() => parseAiResponse(makeAiResponse({
      categories: {
        taskOutcomeQuality: { score: 90, rationale: "x", evidence: [{ kind: "task", label: "l" }] },
        processCompliance: { score: 80, rationale: "x", evidence: [{ kind: "task", label: "l" }] },
      },
    }))).toThrow(/missing category agentPerformance/);
  });

  it("builds prompt with deterministic signal bundle", () => {
    const task = makeTask();
    const prompt = buildEvaluationPrompt(task, { runId: "ER-1", startedAt: "2026-05-02T00:00:00.000Z" }, {
      taskId: task.id,
      column: "done",
      workflowSummary: { total: 0, passed: 0, failed: 0, pending: 0 },
      commitSummary: { commitCount: 0 },
      logSummary: { errorCount: 0, warningCount: 0, timingEntries: 1 },
      evidence: [],
    });
    expect(prompt).toContain("Deterministic signals");
    expect(prompt).toContain("## Evidence");
    expect(prompt).toContain("ER-1");
  });

  it("injects evidence bundle payload into prompt", () => {
    const task = makeTask();
    const bundle: TaskEvaluationEvidenceBundle = {
      taskId: task.id,
      runId: "ER-1",
      sourceOrder: TASK_EVALUATION_EVIDENCE_SOURCE_ORDER,
      taskMetadata: [{ id: "tm-1", source: "taskMetadata", label: "snapshot", taskId: task.id, runId: "ER-1" }],
      commits: [{ id: "commit-abc123", source: "commits", label: "subject", sha: "abc123", taskId: task.id, runId: "ER-1" }],
      workflow: [],
      reviews: [],
      documents: [],
      taskActivity: [],
      agentLogs: [],
      runAudit: [],
    };
    const prompt = buildEvaluationPrompt(task, { runId: "ER-1", startedAt: "2026-05-02T00:00:00.000Z" }, {
      taskId: task.id,
      column: "done",
      workflowSummary: { total: 0, passed: 0, failed: 0, pending: 0 },
      commitSummary: { commitCount: 0 },
      logSummary: { errorCount: 0, warningCount: 0, timingEntries: 1 },
      evidence: [],
    }, bundle);
    expect(prompt).toContain("## Evidence");
    expect(prompt).toContain("tm-1");
    expect(prompt).toContain("commit-abc123");
  });

  it("returns merged evaluation payload shape for persistence", async () => {
    const createTask = vi.fn(async () => ({ id: "FN-900" }));
    const service = new HybridEvaluatorService({
      cwd: process.cwd(),
      runPrompt: async () => makeAiResponse(),
      store: {
        listTasks: async () => [],
        createTask,
        getEvalStore: () => ({ listTaskResults: () => [] }),
      } as any,
      collectEvidence: async ({ task, runId }) => ({
        taskId: task.id,
        runId,
        sourceOrder: TASK_EVALUATION_EVIDENCE_SOURCE_ORDER,
        taskMetadata: [],
        commits: [],
        workflow: [],
        reviews: [],
        documents: [],
        taskActivity: [],
        agentLogs: [{ id: "agent-log-1", source: "agentLogs", label: "tool_result", taskId: task.id, runId, excerpt: "summary only" }],
        runAudit: [],
      }),
    });
    const result = await service.evaluateTask(makeTask(), { runId: "ER-1", startedAt: "2026-05-01T00:00:00.000Z" }, { taskEvaluationFollowUpPolicy: "create" });
    expect(result.status).toBe("scored");
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.categoryScores).toHaveLength(3);
    expect(result.overallScore).toBe(computeOverallScore(result.categoryScores ?? []));
    expect(result.categoryScores?.map((score) => score.category)).toEqual([
      "agentPerformance",
      "taskOutcomeQuality",
      "processCompliance",
    ]);
    expect((result.metadata as any).hybridEvaluation).toBeDefined();
    expect(result.evidenceBundle?.sourceOrder).toEqual(TASK_EVALUATION_EVIDENCE_SOURCE_ORDER);
    expect(result.evidenceBundle?.agentLogs[0]?.excerpt).toBe("summary only");
    expect((result.evidenceBundle?.agentLogs[0] as any)?.detail).toBeUndefined();
    expect(result.followUps?.[0]?.suggestionId).toMatch(/^efs-/);
    expect(result.followUps?.[0]?.policyMode).toBe("auto_create_qualified");
    expect(result.followUps?.[0]?.state).toBe("created");
    expect(result.followUps?.[0]?.createdTaskId).toBe("FN-900");
    expect(createTask).toHaveBeenCalledTimes(1);
  });

  it("persists-only in suggest mode without creating tasks", async () => {
    const createTask = vi.fn(async () => ({ id: "FN-created" }));
    const service = new HybridEvaluatorService({
      cwd: process.cwd(),
      runPrompt: async () => makeAiResponse(),
      store: {
        listTasks: async () => [],
        createTask,
        getEvalStore: () => ({ listTaskResults: () => [] }),
      } as any,
      collectEvidence: async ({ task, runId }) => ({
        taskId: task.id,
        runId,
        sourceOrder: TASK_EVALUATION_EVIDENCE_SOURCE_ORDER,
        taskMetadata: [],
        commits: [],
        workflow: [],
        reviews: [],
        documents: [],
        taskActivity: [],
        agentLogs: [],
        runAudit: [],
      }),
    });

    const result = await service.evaluateTask(makeTask(), { runId: "ER-suggest", startedAt: "2026-05-01T00:00:00.000Z" }, { taskEvaluationFollowUpPolicy: "suggest" });
    expect(result.followUps?.[0]?.policyMode).toBe("persist_only");
    expect(result.followUps?.[0]?.state).toBe("suggested");
    expect(createTask).not.toHaveBeenCalled();
  });

  it("integrates scheduled batch with evaluator and persists one result per run/task", async () => {
    const db = createDatabase("/tmp/fn-evaluator-integration", { inMemory: true });
    db.init();
    const evalStore = new EvalStore(db);
    const doneTask = makeTask({ executionCompletedAt: "2026-05-01T00:04:00.000Z" });

    const service = new HybridEvaluatorService({
      cwd: process.cwd(),
      runPrompt: async () => makeAiResponse(),
    });

    const mockStore = {
      listTasks: async () => [doneTask],
      getEvalStore: () => evalStore,
    };

    const run1 = await runScheduledEvalBatch({
      store: mockStore,
      projectId: "proj-1",
      startedAt: "2026-05-02T00:00:00.000Z",
      evaluator: async ({ task, run }) => service.evaluateTask(task as TaskDetail, { runId: run.id, startedAt: run.startedAt ?? "" }, {}),
    });

    const run2 = await runScheduledEvalBatch({
      store: mockStore,
      projectId: "proj-1",
      startedAt: "2026-05-02T00:00:00.000Z",
      evaluator: async ({ task, run }) => service.evaluateTask(task as TaskDetail, { runId: run.id, startedAt: run.startedAt ?? "" }, {}),
    });

    expect(run1.status).toBe("completed");
    expect(run2.tasksSelected).toBe(0);
    const all = evalStore.listTaskResults({ taskId: doneTask.id });
    expect(all).toHaveLength(1);
    expect(all[0]?.overallScore).toBeGreaterThanOrEqual(0);
    expect(all[0]?.overallScore).toBeLessThanOrEqual(100);
    expect(all[0]?.categoryScores).toHaveLength(3);
    expect(all[0]?.overallScore).toBe(computeOverallScore(all[0]?.categoryScores ?? []));
  });
});
