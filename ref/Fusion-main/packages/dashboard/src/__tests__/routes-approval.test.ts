import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { get, request } from "../test-request.js";

const state = {
  requests: new Map<string, any>(),
  audits: new Map<string, any[]>(),
  task: { id: "FN-1", paused: true, pausedByAgentId: "agent-1" },
  agent: { id: "agent-1", state: "paused", pauseReason: "awaiting-approval" },
};

class MockApprovalRequestStore {
  constructor(_: unknown) {}
  list(input: any = {}) {
    let rows = [...state.requests.values()];
    if (input.status) rows = rows.filter((r) => r.status === input.status);
    if (input.requesterActorId) rows = rows.filter((r) => r.requester.actorId === input.requesterActorId);
    if (input.taskId) rows = rows.filter((r) => r.taskId === input.taskId);
    return rows;
  }
  get(id: string) {
    return state.requests.get(id) ?? null;
  }
  decide(id: string, status: "approved" | "denied") {
    const req = state.requests.get(id);
    if (!req) throw new Error("Approval request not found");
    if (req.status !== "pending") throw new Error(`Invalid approval request transition: ${req.status} -> ${status}`);
    req.status = status;
    state.audits.set(id, [...(state.audits.get(id) ?? []), { event: status }]);
    return req;
  }
  getAuditHistory(id: string) {
    return state.audits.get(id) ?? [];
  }
}

const updateAgent = vi.fn(async (_id: string, updates: any) => ({ ...state.agent, ...updates }));

class MockAgentStore {
  constructor(_: unknown) {}
  async init() {}
  async getAgent(id: string) {
    return id === state.agent.id ? state.agent : null;
  }
  async updateAgentState(id: string, nextState: string) {
    if (id === state.agent.id) state.agent = { ...state.agent, state: nextState };
  }
  async updateAgent(id: string, updates: any) {
    if (id === state.agent.id) state.agent = { ...state.agent, ...updates };
    return updateAgent(id, updates);
  }
}

vi.mock("@fusion/core", () => ({
  ApprovalRequestStore: MockApprovalRequestStore,
  AgentStore: MockAgentStore,
}));

describe("approval routes", async () => {
  const { registerApprovalRoutes } = await import("../routes/register-approval-routes.js");

  function createApp() {
    const router = express.Router();
    router.use(express.json());
    registerApprovalRoutes({
      router,
      runtimeLogger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } as any,
      getProjectContext: async () => ({
        store: {
          getDatabase: () => ({}),
          getFusionDir: () => "/tmp/fusion",
          getTask: async () => state.task,
          pauseTask: async (_id: string, paused: boolean) => {
            state.task = { ...state.task, paused, pausedByAgentId: paused ? state.task.pausedByAgentId : undefined };
          },
        },
        engine: undefined,
        projectId: "p1",
      }),
      rethrowAsApiError: (e: unknown) => {
        throw e;
      },
    } as any);
    const app = express();
    app.use("/api", router);
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err?.statusCode ?? 500;
      res.status(status).json({ error: err?.message ?? String(err) });
    });
    return app;
  }

  beforeEach(() => {
    updateAgent.mockClear();
    state.task = { id: "FN-1", paused: true, pausedByAgentId: "agent-1" };
    state.agent = { id: "agent-1", state: "paused", pauseReason: "awaiting-approval" };
    state.requests = new Map([
      ["apr-1", { id: "apr-1", status: "pending", requester: { actorId: "agent-1" }, taskId: "FN-1" }],
      ["apr-2", { id: "apr-2", status: "denied", requester: { actorId: "agent-1" }, taskId: "FN-1" }],
    ]);
    state.audits = new Map([["apr-1", [{ event: "created" }]]]);
  });

  it("lists and filters requests", async () => {
    const app = createApp();
    const res = await get(app, "/api/approval-requests?status=pending");
    expect(res.status).toBe(200);
    expect((res.body as any[]).map((r) => r.id)).toEqual(["apr-1"]);
  });

  it("returns 404 for missing request", async () => {
    const app = createApp();
    const res = await get(app, "/api/approval-requests/missing");
    expect(res.status).toBe(404);
  });

  it("returns audit history", async () => {
    const app = createApp();
    const res = await get(app, "/api/approval-requests/apr-1/audit");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ event: "created" }]);
  });

  it("approves and unpauses task/agent", async () => {
    const app = createApp();
    const res = await request(app, "POST", "/api/approval-requests/apr-1/approve", JSON.stringify({}));
    expect(res.status).toBe(200);
    expect((res.body as any).status).toBe("approved");
    expect(state.task.paused).toBe(false);
    expect(updateAgent).toHaveBeenCalledWith("agent-1", { pauseReason: undefined });
  });

  it("denies and unpauses task/agent", async () => {
    const app = createApp();
    const res = await request(app, "POST", "/api/approval-requests/apr-1/deny", JSON.stringify({}));
    expect(res.status).toBe(200);
    expect((res.body as any).status).toBe("denied");
    expect(state.task.paused).toBe(false);
  });

  it("no-ops when task already unpaused", async () => {
    state.task.paused = false;
    const app = createApp();
    const res = await request(app, "POST", "/api/approval-requests/apr-1/deny", JSON.stringify({}));
    expect(res.status).toBe(200);
  });

  it("returns 409 for invalid transition", async () => {
    const app = createApp();
    const res = await request(app, "POST", "/api/approval-requests/apr-2/approve", JSON.stringify({}));
    expect(res.status).toBe(409);
  });
});
