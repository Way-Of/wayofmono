import { describe, expect, it } from "vitest";
import {
  buildBootstrapPrompt,
  buildMeshReplicatedTaskCreatePayload,
  taskMatchesReplicatedCreate,
  toReplicatedCreateInput,
} from "../mesh-task-replication.js";

describe("mesh-task-replication", () => {
  it("buildBootstrapPrompt matches task bootstrap format", () => {
    expect(buildBootstrapPrompt("FN-1", undefined, "desc")).toBe("# FN-1\n\ndesc\n");
    expect(buildBootstrapPrompt("FN-1", "Title", "desc")).toBe("# FN-1: Title\n\ndesc\n");
  });

  it("buildMeshReplicatedTaskCreatePayload includes canonical fields", () => {
    const payload = buildMeshReplicatedTaskCreatePayload({
      taskId: "FN-100",
      reservationId: "res-100",
      sourceNodeId: "node-a",
      createdAt: "2026-05-05T00:00:00.000Z",
      updatedAt: "2026-05-05T00:00:00.000Z",
      prompt: "# FN-100\n\nhello\n",
      createInput: { description: "hello" },
    });

    expect(payload).toEqual({
      replicationVersion: 1,
      reservationId: "res-100",
      taskId: "FN-100",
      sourceNodeId: "node-a",
      createdAt: "2026-05-05T00:00:00.000Z",
      updatedAt: "2026-05-05T00:00:00.000Z",
      prompt: "# FN-100\n\nhello\n",
      input: { description: "hello" },
    });
  });

  it("toReplicatedCreateInput preserves node targeting and source metadata", () => {
    const input = toReplicatedCreateInput({
      id: "FN-300",
      title: "Task",
      description: "hello",
      column: "triage",
      dependencies: [],
      breakIntoSubtasks: false,
      enabledWorkflowSteps: [],
      currentStep: 0,
      steps: [],
      log: [],
      createdAt: "2026-05-05T00:00:00.000Z",
      updatedAt: "2026-05-05T00:00:00.000Z",
      nodeId: "node-z",
      priority: "normal",
      sourceType: "agent",
      sourceAgentId: "agent-1",
      sourceRunId: "run-1",
      sourceSessionId: "session-1",
      sourceMessageId: "msg-1",
      sourceParentTaskId: "FN-100",
      sourceMetadata: { foo: "bar" },
    } as any);

    expect(input.nodeId).toBe("node-z");
    expect(input.source?.sourceType).toBe("agent");
    expect(input.source?.sourceAgentId).toBe("agent-1");
  });

  it("taskMatchesReplicatedCreate validates equivalence", () => {
    const existing = {
      id: "FN-200",
      title: undefined,
      description: "hello",
      column: "triage",
      dependencies: [],
      breakIntoSubtasks: false,
      enabledWorkflowSteps: [],
      priority: "normal",
      sourceType: "unknown",
      sourceAgentId: undefined,
      sourceRunId: undefined,
      sourceSessionId: undefined,
      sourceMessageId: undefined,
      sourceParentTaskId: undefined,
      sourceMetadata: undefined,
      steps: [],
      currentStep: 0,
      log: [],
      createdAt: "2026-05-05T00:00:00.000Z",
      updatedAt: "2026-05-05T00:00:00.000Z",
      prompt: "# FN-200\n\nhello\n",
    } as const;

    const payload = {
      replicationVersion: 1 as const,
      reservationId: "res-200",
      taskId: "FN-200",
      sourceNodeId: "node-a",
      createdAt: "2026-05-05T00:00:00.000Z",
      updatedAt: "2026-05-05T00:00:00.000Z",
      prompt: "# FN-200\n\nhello\n",
      input: { description: "hello", column: "triage" as const },
    };

    expect(taskMatchesReplicatedCreate(existing as any, payload)).toBe(true);
    expect(taskMatchesReplicatedCreate(existing as any, { ...payload, prompt: "# FN-200\n\nbye\n" })).toBe(false);
  });
});
