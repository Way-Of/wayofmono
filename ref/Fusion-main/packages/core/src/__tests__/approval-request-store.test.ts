import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Database } from "../db.js";
import { ApprovalRequestStore } from "../approval-request-store.js";
import {
  APPROVAL_REQUEST_AUDIT_EVENT_TYPES,
  APPROVAL_REQUEST_STATUSES,
  AGENT_PERMISSION_POLICY_ACTION_CATEGORIES,
  normalizeApprovalRequestActionCategory,
  isValidApprovalRequestTransition,
  type ApprovalRequest,
  type ApprovalRequestActorSnapshot,
} from "../types.js";

const REQUESTER: ApprovalRequestActorSnapshot = {
  actorId: "agent-1",
  actorType: "agent",
  actorName: "Executor",
};

const APPROVER: ApprovalRequestActorSnapshot = {
  actorId: "user:dashboard",
  actorType: "user",
  actorName: "Dashboard User",
};

describe("approval request domain contract", () => {
  it("exposes stable v1 status and audit-event vocabularies", () => {
    expect(APPROVAL_REQUEST_STATUSES).toEqual(["pending", "approved", "denied", "completed"]);
    expect(APPROVAL_REQUEST_AUDIT_EVENT_TYPES).toEqual(["created", "approved", "denied", "completed"]);
  });

  it("reuses shared action-category vocabulary for target actions", () => {
    expect(AGENT_PERMISSION_POLICY_ACTION_CATEGORIES.length).toBeGreaterThan(0);
  });

  it("normalizes legacy action-category aliases", () => {
    expect(normalizeApprovalRequestActionCategory("file_write")).toBe("file_write_delete");
    expect(normalizeApprovalRequestActionCategory("file_delete")).toBe("file_write_delete");
    expect(normalizeApprovalRequestActionCategory("command_execute")).toBe("command_execution");
    expect(normalizeApprovalRequestActionCategory("network_access")).toBe("network_api");
    expect(normalizeApprovalRequestActionCategory("task_mutation")).toBe("task_agent_mutation");
    expect(normalizeApprovalRequestActionCategory("agent_mutation")).toBe("task_agent_mutation");
  });

  it("enforces the lifecycle transition matrix", () => {
    expect(isValidApprovalRequestTransition("pending", "approved")).toBe(true);
    expect(isValidApprovalRequestTransition("pending", "denied")).toBe(true);
    expect(isValidApprovalRequestTransition("approved", "completed")).toBe(true);
    expect(isValidApprovalRequestTransition("pending", "completed")).toBe(false);
    expect(isValidApprovalRequestTransition("approved", "denied")).toBe(false);
    expect(isValidApprovalRequestTransition("denied", "approved")).toBe(false);
    expect(isValidApprovalRequestTransition("denied", "completed")).toBe(false);
    expect(isValidApprovalRequestTransition("completed", "approved")).toBe(false);
  });

  it("captures immutable actor snapshots and target-action context", () => {
    const request: ApprovalRequest = {
      id: "apr-001",
      status: "pending",
      requester: REQUESTER,
      targetAction: {
        category: AGENT_PERMISSION_POLICY_ACTION_CATEGORIES[0],
        action: "git commit",
        summary: "Create commit for task changes",
        resourceType: "repository",
        resourceId: "kb",
        context: { taskId: "FN-3546" },
      },
      taskId: "FN-3546",
      runId: "run-1",
      requestedAt: "2026-05-05T00:00:00.000Z",
      createdAt: "2026-05-05T00:00:00.000Z",
      updatedAt: "2026-05-05T00:00:00.000Z",
    };

    expect(request.requester.actorName).toBe("Executor");
    expect(request.targetAction.context).toEqual({ taskId: "FN-3546" });
  });
});

describe("ApprovalRequestStore", () => {
  let tempDir: string;
  let db: Database;
  let store: ApprovalRequestStore;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "kb-approval-request-test-"));
    db = new Database(tempDir, { inMemory: true });
    db.init();
    store = new ApprovalRequestStore(db);
  });

  afterEach(() => {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createSampleRequest(taskId = "FN-3546") {
    return store.create({
      requester: REQUESTER,
      targetAction: {
        category: AGENT_PERMISSION_POLICY_ACTION_CATEGORIES[0],
        action: "git commit",
        summary: "Commit current task changes",
        resourceType: "repository",
        resourceId: "kb",
        context: { branch: "fn/fn-3546" },
      },
      taskId,
      runId: "run-abc",
    });
  }

  it("creates request rows with full actor and target action payload", () => {
    const created = createSampleRequest();
    const fetched = store.get(created.id);

    expect(fetched).toBeTruthy();
    expect(fetched?.status).toBe("pending");
    expect(fetched?.requester).toEqual(REQUESTER);
    expect(fetched?.targetAction.context).toEqual({ branch: "fn/fn-3546" });
    expect(fetched?.taskId).toBe("FN-3546");
    expect(fetched?.runId).toBe("run-abc");
  });

  it("normalizes legacy category aliases on create/read", () => {
    const created = store.create({
      requester: REQUESTER,
      targetAction: {
        category: "file_write",
        action: "write",
        summary: "Write file",
        resourceType: "file",
        resourceId: "foo.ts",
      },
    });

    const fetched = store.get(created.id);
    expect(fetched?.targetAction.category).toBe("file_write_delete");
  });

  it("supports pending -> approved and approved -> completed with audit trail", () => {
    const created = createSampleRequest();
    const approved = store.decide(created.id, "approved", { actor: APPROVER, note: "Looks good" });
    const completed = store.markCompleted(created.id, { actor: REQUESTER, note: "Action executed" });

    expect(approved.status).toBe("approved");
    expect(approved.decidedAt).toBeTruthy();
    expect(completed.status).toBe("completed");
    expect(completed.completedAt).toBeTruthy();

    const history = store.getAuditHistory(created.id);
    expect(history.map((e) => e.eventType)).toEqual(["created", "approved", "completed"]);
    expect(history[1]?.note).toBe("Looks good");
  });

  it("supports pending -> denied", () => {
    const created = createSampleRequest();
    const denied = store.decide(created.id, "denied", { actor: APPROVER, note: "Not allowed" });

    expect(denied.status).toBe("denied");
    expect(denied.decidedAt).toBeTruthy();
    expect(store.getAuditHistory(created.id).map((e) => e.eventType)).toEqual(["created", "denied"]);
  });

  it("rejects invalid transitions", () => {
    const created = createSampleRequest();

    expect(() => store.markCompleted(created.id, { actor: REQUESTER })).toThrow(
      "Invalid approval request transition: pending -> completed",
    );

    store.decide(created.id, "approved", { actor: APPROVER });
    expect(() => store.decide(created.id, "denied", { actor: APPROVER })).toThrow(
      "Invalid approval request transition: approved -> denied",
    );
  });

  it("lists and filters approval requests", () => {
    const first = createSampleRequest("FN-100");
    const second = createSampleRequest("FN-200");
    store.decide(second.id, "approved", { actor: APPROVER });

    const pending = store.list({ status: "pending" });
    const approved = store.list({ status: "approved" });
    const byTask = store.list({ taskId: "FN-100" });

    expect(pending.map((r) => r.id)).toContain(first.id);
    expect(approved.map((r) => r.id)).toContain(second.id);
    expect(byTask.map((r) => r.id)).toEqual([first.id]);
  });

  it("findLatestByDedupeKey returns newest match across statuses", () => {
    vi.useFakeTimers();
    const dedupeKey = "agent-1|FN-100|write|file_write_delete|file|a.ts|write";

    vi.setSystemTime(new Date("2026-05-08T00:00:00.000Z"));
    const first = store.create({
      requester: REQUESTER,
      targetAction: {
        category: "file_write_delete",
        action: "write",
        summary: "write a.ts",
        resourceType: "file",
        resourceId: "a.ts",
        context: { approvalDedupeKey: dedupeKey },
      },
      taskId: "FN-100",
    });
    store.decide(first.id, "approved", { actor: APPROVER });

    vi.setSystemTime(new Date("2026-05-08T00:00:01.000Z"));
    const second = store.create({
      requester: REQUESTER,
      targetAction: {
        category: "file_write_delete",
        action: "write",
        summary: "write a.ts again",
        resourceType: "file",
        resourceId: "a.ts",
        context: { approvalDedupeKey: dedupeKey },
      },
      taskId: "FN-100",
    });

    const latest = store.findLatestByDedupeKey({ requesterActorId: REQUESTER.actorId, taskId: "FN-100", dedupeKey });
    expect(latest?.id).toBe(second.id);
    expect(latest?.status).toBe("pending");
    vi.useRealTimers();
  });

  it("findLatestByDedupeKey scopes by requester and task", () => {
    const dedupeKey = "shared-key";

    const mine = store.create({
      requester: REQUESTER,
      targetAction: {
        category: "command_execution",
        action: "bash",
        summary: "run command",
        resourceType: "command",
        resourceId: "pnpm test",
        context: { approvalDedupeKey: dedupeKey },
      },
      taskId: "FN-200",
    });

    store.create({
      requester: { ...REQUESTER, actorId: "agent-2" },
      targetAction: {
        category: "command_execution",
        action: "bash",
        summary: "other requester",
        resourceType: "command",
        resourceId: "pnpm lint",
        context: { approvalDedupeKey: dedupeKey },
      },
      taskId: "FN-200",
    });

    store.create({
      requester: REQUESTER,
      targetAction: {
        category: "command_execution",
        action: "bash",
        summary: "other task",
        resourceType: "command",
        resourceId: "pnpm build",
        context: { approvalDedupeKey: dedupeKey },
      },
      taskId: "FN-201",
    });

    const scoped = store.findLatestByDedupeKey({ requesterActorId: REQUESTER.actorId, taskId: "FN-200", dedupeKey });
    expect(scoped?.id).toBe(mine.id);
  });

  it("findLatestByDedupeKey returns null when no dedupe key matches", () => {
    createSampleRequest();

    const latest = store.findLatestByDedupeKey({ requesterActorId: REQUESTER.actorId, taskId: "FN-3546", dedupeKey: "missing" });
    expect(latest).toBeNull();
  });

  it("persists requests and audit history across restart/migration", () => {
    db.close();

    const diskDir = mkdtempSync(join(tmpdir(), "kb-approval-request-disk-"));
    try {
      const dbA = new Database(diskDir);
      dbA.init();
      const storeA = new ApprovalRequestStore(dbA);
      const created = storeA.create({
        requester: REQUESTER,
        targetAction: {
          category: AGENT_PERMISSION_POLICY_ACTION_CATEGORIES[0],
          action: "git push",
          summary: "Push branch",
          resourceType: "branch",
          resourceId: "fn/fn-3546",
        },
      });
      storeA.decide(created.id, "approved", { actor: APPROVER });
      dbA.close();

      const dbB = new Database(diskDir);
      dbB.init();
      const storeB = new ApprovalRequestStore(dbB);

      const fetched = storeB.get(created.id);
      expect(fetched?.status).toBe("approved");
      expect(storeB.getAuditHistory(created.id).map((e) => e.eventType)).toEqual(["created", "approved"]);
      dbB.close();
    } finally {
      rmSync(diskDir, { recursive: true, force: true });
    }

    db = new Database(tempDir, { inMemory: true });
    db.init();
    store = new ApprovalRequestStore(db);
  });
});
