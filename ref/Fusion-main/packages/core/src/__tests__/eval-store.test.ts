import { beforeEach, describe, expect, it } from "vitest";
import { createDatabase, type Database } from "../db.js";
import { EvalLifecycleError, EvalStore } from "../eval-store.js";
import {
  EVIDENCE_EXCERPT_TRUNCATION_MARKER,
  EVIDENCE_LIMITS,
  TASK_EVALUATION_EVIDENCE_SOURCE_ORDER,
  buildEvalFollowUpSuggestionId,
} from "../eval-types.js";

let db: Database;
let store: EvalStore;

beforeEach(() => {
  db = createDatabase("/tmp/fn-eval-store-test", { inMemory: true });
  db.init();
  store = new EvalStore(db);
});

describe("EvalStore", () => {
  it("creates and lists runs with deterministic ordering", () => {
    const runA = store.createRun({ projectId: "p1", scope: "completed-since-last", requestedTaskIds: ["FN-1"] });
    const runB = store.createRun({ projectId: "p1", scope: "completed-since-last", requestedTaskIds: ["FN-2"] });

    const runs = store.listRuns({ projectId: "p1" });
    const expectedOrder = [runA, runB]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
      .map((run) => run.id);
    expect(runs.map((run) => run.id)).toEqual(expectedOrder);
  });

  it("enforces active run conflict for scheduled trigger", () => {
    store.createRun({ projectId: "p1", scope: "window", trigger: "schedule" });
    expect(() => store.createRun({ projectId: "p1", scope: "window", trigger: "schedule" })).toThrow(EvalLifecycleError);
  });

  it("enforces terminal immutability", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    store.updateRun(run.id, { status: "completed" });
    expect(() => store.updateRun(run.id, { summary: "late change" })).toThrow(EvalLifecycleError);
  });

  it("creates results and preserves task snapshot after tasks row deletion", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    const result = store.createTaskResult(run.id, {
      taskId: "FN-123",
      taskSnapshot: { taskId: "FN-123", title: "Snapshot title", status: "done", summary: "task summary" },
      status: "scored",
      overallScore: 80,
      categoryScores: [{
        category: "agentPerformance",
        deterministicScore: 78,
        aiScore: 82,
        finalScore: 79,
        weight: 0.3,
        band: "strong",
        rationale: "handled execution well",
        evidence: [{ type: "task_log", ref: "log:1" }],
      }, {
        category: "taskOutcomeQuality",
        deterministicScore: 80,
        aiScore: 80,
        finalScore: 80,
        weight: 0.45,
        band: "strong",
        rationale: "good",
        evidence: [{ type: "test", ref: "test:all" }],
      }, {
        category: "processCompliance",
        deterministicScore: 72,
        aiScore: 76,
        finalScore: 73,
        weight: 0.25,
        band: "acceptable",
        rationale: "mostly compliant",
        evidence: [{ type: "other", ref: "workflow:review" }],
      }],
      evidence: [{ type: "task_log", ref: "log:1" }],
      deterministicSignals: [{ signalId: "s1", kind: "test", name: "tests-pass", passed: true }],
      followUps: [{
        suggestionId: buildEvalFollowUpSuggestionId("FN-123 missing tests"),
        dedupeKey: "fn-123:missing-tests",
        title: "Add regression tests for merged behavior",
        description: "Investigate uncovered behavior and add targeted regression tests.",
        priority: "high",
        severity: "weak",
        rationale: "Outcome quality signals showed verification gaps.",
        evidenceRefs: [{ evidenceId: "workflow-1", source: "workflow", note: "verification failure" }],
        recommendation: { shouldCreate: true, reason: "Actionable and high confidence", policyQualified: true },
        state: "suggested",
        policyMode: "persist_only",
      }],
    });

    db.prepare("DELETE FROM tasks WHERE id = ?").run("FN-123");

    const fetched = store.getTaskResult(result.id);
    expect(fetched?.taskSnapshot.title).toBe("Snapshot title");
    expect(fetched?.taskId).toBe("FN-123");
    expect(fetched?.categoryScores).toHaveLength(3);
    expect(fetched?.categoryScores[0]?.category).toBe("agentPerformance");
    expect(fetched?.categoryScores[0]?.deterministicScore).toBe(78);
    expect(fetched?.categoryScores[1]?.weight).toBe(0.45);
    expect(fetched?.categoryScores[2]?.band).toBe("acceptable");
    expect(fetched?.followUps[0]?.suggestionId).toMatch(/^efs-/);
    expect(fetched?.followUps[0]?.recommendation.policyQualified).toBe(true);
  });

  it("persists run window boundaries and evaluated task rollups", () => {
    const run = store.createRun({
      projectId: "p1",
      trigger: "schedule",
      scope: "completed-since-last",
      window: { since: "2026-05-01T00:00:00.000Z", until: "2026-05-02T00:00:00.000Z", baselineRunId: "ER-BASE" },
      requestedTaskIds: ["FN-1", "FN-2"],
    });

    const updated = store.updateRun(run.id, {
      status: "running",
      evaluatedTaskIds: ["FN-1", "FN-2"],
      counts: { totalTasks: 2, scoredTasks: 1, skippedTasks: 1, erroredTasks: 0 },
    });

    expect(updated?.window.since).toBe("2026-05-01T00:00:00.000Z");
    expect(updated?.evaluatedTaskIds).toEqual(["FN-1", "FN-2"]);
    expect(updated?.counts.scoredTasks).toBe(1);
  });

  it("deduplicates per runId/taskId via upsert semantics", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    const first = store.createTaskResult(run.id, {
      taskId: "FN-dup",
      taskSnapshot: { taskId: "FN-dup", title: "A" },
      status: "scored",
      overallScore: 20,
    });
    const second = store.createTaskResult(run.id, {
      taskId: "FN-dup",
      taskSnapshot: { taskId: "FN-dup", title: "B" },
      status: "scored",
      overallScore: 90,
    });

    const rows = store.listTaskResults({ runId: run.id, taskId: "FN-dup" });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.overallScore).toBe(90);
    expect(rows[0]?.taskSnapshot.title).toBe("B");
    expect(second.id).toBe(first.id);
  });

  it("persists evidence bundles via metadata and preserves stable source ordering", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    const created = store.createTaskResult(run.id, {
      taskId: "FN-evidence",
      taskSnapshot: { taskId: "FN-evidence", title: "Evidence task" },
      status: "scored",
      evidenceBundle: {
        taskId: "FN-evidence",
        runId: run.id,
        sourceOrder: [...TASK_EVALUATION_EVIDENCE_SOURCE_ORDER],
        taskMetadata: [{ id: "tm-1", source: "taskMetadata", label: "task snapshot", taskId: "FN-evidence", runId: run.id }],
        commits: [{ id: "c-1", source: "commits", label: "commit", sha: "abc123", taskId: "FN-evidence", runId: run.id }],
        workflow: [],
        reviews: [],
        documents: [],
        taskActivity: [],
        agentLogs: [],
        runAudit: [],
      },
    });

    const fetched = store.getTaskResult(created.id);
    expect(fetched?.evidenceBundle?.sourceOrder).toEqual(TASK_EVALUATION_EVIDENCE_SOURCE_ORDER);
    expect(fetched?.evidenceBundle?.taskMetadata[0]?.id).toBe("tm-1");
    expect(fetched?.metadata?.__taskEvaluationEvidenceBundle).toBeDefined();
  });

  it("rejects evidence bundles that exceed per-source limits", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    expect(() => store.createTaskResult(run.id, {
      taskId: "FN-over-limit",
      taskSnapshot: { taskId: "FN-over-limit" },
      status: "scored",
      evidenceBundle: {
        taskId: "FN-over-limit",
        runId: run.id,
        sourceOrder: [...TASK_EVALUATION_EVIDENCE_SOURCE_ORDER],
        taskMetadata: [],
        commits: Array.from({ length: EVIDENCE_LIMITS.commits + 1 }, (_, i) => ({
          id: `c-${i}`,
          source: "commits" as const,
          label: `commit ${i}`,
          sha: `${i}`,
          taskId: "FN-over-limit",
          runId: run.id,
        })),
        workflow: [],
        reviews: [],
        documents: [],
        taskActivity: [],
        agentLogs: [],
        runAudit: [],
      },
    })).toThrow(/commits exceeds limit/);
  });

  it("truncates overlong evidence excerpts to bounded persisted size", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    const result = store.createTaskResult(run.id, {
      taskId: "FN-truncate",
      taskSnapshot: { taskId: "FN-truncate" },
      status: "scored",
      evidenceBundle: {
        taskId: "FN-truncate",
        runId: run.id,
        sourceOrder: [...TASK_EVALUATION_EVIDENCE_SOURCE_ORDER],
        taskMetadata: [{
          id: "tm-1",
          source: "taskMetadata",
          label: "summary",
          taskId: "FN-truncate",
          runId: run.id,
          excerpt: "x".repeat(800),
        }],
        commits: [],
        workflow: [],
        reviews: [],
        documents: [],
        taskActivity: [],
        agentLogs: [],
        runAudit: [],
      },
    });

    const fetched = store.getTaskResult(result.id);
    const excerpt = fetched?.evidenceBundle?.taskMetadata[0]?.excerpt ?? "";
    expect(excerpt.length).toBeLessThanOrEqual(500);
    expect(excerpt.endsWith(EVIDENCE_EXCERPT_TRUNCATION_MARKER)).toBe(true);
    expect(fetched?.evidenceBundle?.taskMetadata[0]?.truncated).toBe(true);
  });

  it("rejects evidence bundles with incorrect sourceOrder", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    expect(() => store.createTaskResult(run.id, {
      taskId: "FN-wrong-order",
      taskSnapshot: { taskId: "FN-wrong-order" },
      status: "scored",
      evidenceBundle: {
        taskId: "FN-wrong-order",
        runId: run.id,
        sourceOrder: ["commits", "taskMetadata", "workflow", "reviews", "documents", "taskActivity", "agentLogs", "runAudit"],
        taskMetadata: [],
        commits: [],
        workflow: [],
        reviews: [],
        documents: [],
        taskActivity: [],
        agentLogs: [],
        runAudit: [],
      },
    })).toThrow(/sourceOrder must match/);
  });

  it("persists suppression metadata for dedupe/noise control", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    const result = store.createTaskResult(run.id, {
      taskId: "FN-suppressed",
      taskSnapshot: { taskId: "FN-suppressed" },
      status: "scored",
      followUps: [{
        suggestionId: "efs-suppress-1",
        dedupeKey: "dedupe:1",
        title: "Investigate flaky verification command",
        description: "Identify root cause and stabilize verification.",
        priority: "normal",
        severity: "acceptable",
        rationale: "Same recommendation already exists in open triage task.",
        evidenceRefs: [{ evidenceId: "task-activity-2", source: "taskActivity" }],
        recommendation: { shouldCreate: false, reason: "Duplicate of existing task", policyQualified: false },
        state: "suppressed",
        policyMode: "auto_create_qualified",
        suppressedReason: "duplicate_open_task",
        matchedTaskId: "FN-existing",
      }],
    });

    const fetched = store.getTaskResult(result.id);
    expect(fetched?.followUps[0]?.state).toBe("suppressed");
    expect(fetched?.followUps[0]?.suppressedReason).toBe("duplicate_open_task");
    expect(fetched?.followUps[0]?.matchedTaskId).toBe("FN-existing");
  });

  it("round-trips optional empty evidence source groups", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    const result = store.createTaskResult(run.id, {
      taskId: "FN-empty-sources",
      taskSnapshot: { taskId: "FN-empty-sources" },
      status: "scored",
      evidenceBundle: {
        taskId: "FN-empty-sources",
        runId: run.id,
        sourceOrder: [...TASK_EVALUATION_EVIDENCE_SOURCE_ORDER],
        taskMetadata: [],
        commits: [],
        workflow: [],
        reviews: [],
        documents: [],
        taskActivity: [],
        agentLogs: [],
        runAudit: [],
      },
    });

    const fetched = store.getTaskResult(result.id);
    expect(fetched?.evidenceBundle?.commits).toEqual([]);
    expect(fetched?.evidenceBundle?.runAudit).toEqual([]);
  });

  it("appends run events with sequential ordering", () => {
    const run = store.createRun({ projectId: "p1", scope: "window" });
    const evt1 = store.appendRunEvent(run.id, { type: "info", message: "started" });
    const evt2 = store.appendRunEvent(run.id, { type: "task_evaluated", message: "scored", taskId: "FN-1" });

    const events = store.listRunEvents(run.id);
    expect(events.map((event) => event.id)).toEqual([evt1.id, evt2.id]);
    expect(events.map((event) => event.seq)).toEqual([1, 2]);
  });
});
