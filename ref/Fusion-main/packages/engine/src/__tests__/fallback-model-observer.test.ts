import { describe, expect, it, vi, beforeEach } from "vitest";
import { createFallbackModelObserver } from "../fallback-model-observer.js";
import { notifyFallbackUsed } from "../notifier.js";

vi.mock("../notifier.js", () => ({
  notifyFallbackUsed: vi.fn().mockResolvedValue(undefined),
}));

describe("createFallbackModelObserver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs fallback activity, appends agent log, and dispatches a notification", async () => {
    const store = {
      logEntry: vi.fn().mockResolvedValue(undefined),
      appendAgentLog: vi.fn().mockResolvedValue(undefined),
    };

    const observer = createFallbackModelObserver({
      agent: "Executor Agent",
      label: "executor",
      store,
      taskId: "FN-123",
      taskTitle: "Fix Codex auth",
    });

    await observer({
      primaryModel: "openai-codex/gpt-5.3-codex",
      fallbackModel: "zai/glm-5.1",
      triggerPoint: "prompt-time",
      timestamp: "2026-05-03T22:00:00.000Z",
    });

    const expectedMessage =
      "[fallback] executor switched from openai-codex/gpt-5.3-codex to zai/glm-5.1 (prompt-time)";

    expect(store.logEntry).toHaveBeenCalledWith("FN-123", expectedMessage);
    expect(store.appendAgentLog).toHaveBeenCalledWith(
      "FN-123",
      expectedMessage,
      "text",
      undefined,
      "Executor Agent",
    );
    expect(notifyFallbackUsed).toHaveBeenCalledWith({
      primaryModel: "openai-codex/gpt-5.3-codex",
      fallbackModel: "zai/glm-5.1",
      triggerPoint: "prompt-time",
      taskId: "FN-123",
      taskTitle: "Fix Codex auth",
      timestamp: "2026-05-03T22:00:00.000Z",
    });
  });

  it("swallows logging failures and still dispatches a notification", async () => {
    const store = {
      logEntry: vi.fn().mockRejectedValue(new Error("log failed")),
      appendAgentLog: vi.fn().mockRejectedValue(new Error("append failed")),
    };

    const observer = createFallbackModelObserver({
      agent: "Merger Agent",
      label: "merge verification",
      store,
    });

    await expect(observer({
      primaryModel: "openai-codex/gpt-5.3-codex",
      fallbackModel: "zai/glm-5.1",
      triggerPoint: "session-creation",
      taskId: "FN-456",
      taskTitle: "Merge verification",
    })).resolves.toBeUndefined();

    expect(notifyFallbackUsed).toHaveBeenCalledWith({
      primaryModel: "openai-codex/gpt-5.3-codex",
      fallbackModel: "zai/glm-5.1",
      triggerPoint: "session-creation",
      taskId: "FN-456",
      taskTitle: "Merge verification",
      timestamp: undefined,
    });
  });
});
