// @vitest-environment node

import { describe, it, expect, vi } from "vitest";
import express from "express";
import type { TaskStore } from "@fusion/core";
import { createApiRoutes } from "../../routes.js";
import { request as REQUEST } from "../../test-request.js";

function createMockStore(): TaskStore {
  const now = "2026-05-01T00:00:00.000Z";
  return {
    getRootDir: vi.fn(() => process.cwd()),
    getTask: vi.fn().mockResolvedValue({
      id: "FN-001",
      description: "task",
      column: "in-review",
      dependencies: [],
      steps: [],
      currentStep: 0,
      log: [],
      createdAt: now,
      updatedAt: now,
    }),
    getAgentLogs: vi.fn().mockResolvedValue([]),
  } as unknown as TaskStore;
}

function buildApp(store: TaskStore) {
  const app = express();
  app.use(express.json());
  app.use("/api", createApiRoutes(store));
  return app;
}

describe("task review routes", () => {
  it("returns normalized reviewer-agent payload for direct mode", async () => {
    const store = createMockStore();
    vi.mocked(store.getTask).mockResolvedValue({
      ...(await store.getTask("FN-001")),
      log: [{ timestamp: "2026-05-01T10:00:00.000Z", action: "code review Step 2: REVISE" }],
    } as any);
    vi.mocked(store.getAgentLogs).mockResolvedValue([
      {
        timestamp: "2026-05-01T10:00:01.000Z",
        taskId: "FN-001",
        type: "text",
        text: "## Code Review:\n\n### Verdict: REVISE\n\n### Summary\nNeeds guard\n",
        agent: "reviewer",
      },
    ] as any);

    const res = await REQUEST(buildApp(store), "GET", "/api/tasks/FN-001/review");
    expect(res.status).toBe(200);
    expect(res.body.reviewState.source).toBe("reviewer-agent");
    expect(res.body.reviewState.items[0].reviewType).toBe("code");
  });

  it("returns exact empty payload/message when no feedback exists", async () => {
    const store = createMockStore();
    const res = await REQUEST(buildApp(store), "GET", "/api/tasks/FN-001/review");
    expect(res.status).toBe(200);
    expect(res.body.reviewState.items).toEqual([]);
    expect(res.body.emptyMessage).toBe("No reviewer feedback yet — this task has not produced reviewer-agent feedback in direct mode.");
  });

  it("falls back to task-log summary when reviewer output is incomplete", async () => {
    const store = createMockStore();
    vi.mocked(store.getTask).mockResolvedValue({
      ...(await store.getTask("FN-001")),
      log: [{ timestamp: "2026-05-01T10:00:00.000Z", action: "plan review Step 1: APPROVE" }],
    } as any);
    vi.mocked(store.getAgentLogs).mockResolvedValue([
      { timestamp: "2026-05-01T10:00:01.000Z", taskId: "FN-001", type: "text", text: "partial", agent: "reviewer" },
    ] as any);

    const res = await REQUEST(buildApp(store), "GET", "/api/tasks/FN-001/review");
    expect(res.status).toBe(200);
    expect(res.body.reviewState.items[0].summary).toBe("plan review Step 1: APPROVE");
    expect(res.body.reviewState.items[0].step).toBe(1);
  });
});
