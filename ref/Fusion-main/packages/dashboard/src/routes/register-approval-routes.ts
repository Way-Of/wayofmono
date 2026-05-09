import { AgentStore, ApprovalRequestStore, type ApprovalRequestActorSnapshot, type ApprovalRequestStatus } from "@fusion/core";
import { ApiError, badRequest, conflict, notFound } from "../api-error.js";
import type { ApiRoutesContext } from "./types.js";

const DEFAULT_ACTOR: ApprovalRequestActorSnapshot = {
  actorId: "user",
  actorType: "user",
  actorName: "User",
};

function parseOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw badRequest(`${field} must be a string`);
  return value;
}

function parseOptionalInt(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 0) throw badRequest(`${field} must be a non-negative integer`);
  return n;
}

function parseStatus(value: unknown): ApprovalRequestStatus | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === "pending" || value === "approved" || value === "denied" || value === "completed") return value;
  throw badRequest("status must be one of: pending, approved, denied, completed");
}

async function resumeAfterDecision(params: {
  scopedStore: import("@fusion/core").TaskStore;
  request: import("@fusion/core").ApprovalRequest;
  runtimeLogger: ApiRoutesContext["runtimeLogger"];
}): Promise<void> {
  const { scopedStore, request, runtimeLogger } = params;

  try {
    if (request.taskId) {
      const task = await scopedStore.getTask(request.taskId);
      if (task?.paused && task.pausedByAgentId === request.requester.actorId) {
        await scopedStore.pauseTask(request.taskId, false, undefined);
      }
    }
  } catch (error) {
    runtimeLogger.warn("Failed to unpause task after approval decision", {
      requestId: request.id,
      taskId: request.taskId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    const agentStore = new AgentStore({ rootDir: scopedStore.getFusionDir() });
    await agentStore.init();
    const agent = await agentStore.getAgent(request.requester.actorId);
    if (agent?.state === "paused" && agent.pauseReason === "awaiting-approval") {
      await agentStore.updateAgentState(agent.id, "idle");
      await agentStore.updateAgent(agent.id, { pauseReason: undefined });
    }
  } catch (error) {
    runtimeLogger.warn("Failed to unpause agent after approval decision", {
      requestId: request.id,
      agentId: request.requester.actorId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function registerApprovalRoutes(ctx: ApiRoutesContext): void {
  const { router, getProjectContext, rethrowAsApiError, runtimeLogger } = ctx;

  router.get("/approval-requests", async (req, res) => {
    try {
      const { store: scopedStore } = await getProjectContext(req);
      const approvalStore = new ApprovalRequestStore(scopedStore.getDatabase());
      const requests = approvalStore.list({
        status: parseStatus(req.query.status),
        requesterActorId: parseOptionalString(req.query.requesterActorId, "requesterActorId"),
        taskId: parseOptionalString(req.query.taskId, "taskId"),
        runId: parseOptionalString(req.query.runId, "runId"),
        limit: parseOptionalInt(req.query.limit, "limit"),
        offset: parseOptionalInt(req.query.offset, "offset"),
      });
      res.json(requests);
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      rethrowAsApiError(err);
    }
  });

  router.get("/approval-requests/:id", async (req, res) => {
    try {
      const { store: scopedStore } = await getProjectContext(req);
      const approvalStore = new ApprovalRequestStore(scopedStore.getDatabase());
      const requestId = String(req.params.id);
      const request = approvalStore.get(requestId);
      if (!request) throw notFound("Approval request not found");
      res.json(request);
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      rethrowAsApiError(err);
    }
  });

  router.get("/approval-requests/:id/audit", async (req, res) => {
    try {
      const { store: scopedStore } = await getProjectContext(req);
      const approvalStore = new ApprovalRequestStore(scopedStore.getDatabase());
      const requestId = String(req.params.id);
      const request = approvalStore.get(requestId);
      if (!request) throw notFound("Approval request not found");
      res.json(approvalStore.getAuditHistory(requestId));
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      rethrowAsApiError(err);
    }
  });

  const decideHandler = (status: "approved" | "denied") => async (req: import("express").Request, res: import("express").Response) => {
    try {
      const body = (req.body ?? {}) as { actor?: ApprovalRequestActorSnapshot; note?: string };
      const { store: scopedStore } = await getProjectContext(req);
      const approvalStore = new ApprovalRequestStore(scopedStore.getDatabase());
      const requestId = String(req.params.id);
      const existing = approvalStore.get(requestId);
      if (!existing) throw notFound("Approval request not found");

      const actor = body.actor ?? DEFAULT_ACTOR;
      if (!actor || typeof actor.actorId !== "string" || typeof actor.actorType !== "string" || typeof actor.actorName !== "string") {
        throw badRequest("actor must include actorId, actorType, and actorName");
      }
      if (body.note !== undefined && typeof body.note !== "string") {
        throw badRequest("note must be a string");
      }

      let updated;
      try {
        updated = approvalStore.decide(requestId, status, { actor, note: body.note });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("Invalid approval request transition")) {
          throw conflict(message);
        }
        throw error;
      }

      await resumeAfterDecision({ scopedStore, request: updated, runtimeLogger });
      res.json(updated);
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      rethrowAsApiError(err);
    }
  };

  router.post("/approval-requests/:id/approve", decideHandler("approved"));
  router.post("/approval-requests/:id/deny", decideHandler("denied"));
}
