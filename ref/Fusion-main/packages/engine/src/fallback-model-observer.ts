import { notifyFallbackUsed } from "./notifier.js";
import type { FallbackModelUsedPayload } from "./pi.js";

type FallbackLogStore = {
  logEntry?(taskId: string, action: string): Promise<unknown>;
  appendAgentLog?(
    taskId: string,
    text: string,
    type: "text" | "thinking" | "tool" | "tool_result" | "tool_error",
    detail?: string,
    agent?: string,
  ): Promise<unknown>;
};

type FallbackModelObserverOptions = {
  agent: string;
  label: string;
  store?: FallbackLogStore;
  taskId?: string;
  taskTitle?: string;
};

function buildFallbackLogMessage(
  label: string,
  payload: FallbackModelUsedPayload,
): string {
  return `[fallback] ${label} switched from ${payload.primaryModel} to ${payload.fallbackModel} (${payload.triggerPoint})`;
}

export function createFallbackModelObserver(options: FallbackModelObserverOptions) {
  return async (payload: FallbackModelUsedPayload): Promise<void> => {
    const taskId = options.taskId ?? payload.taskId;
    const taskTitle = options.taskTitle ?? payload.taskTitle;
    const message = buildFallbackLogMessage(options.label, payload);

    if (taskId && options.store?.logEntry) {
      await options.store.logEntry(taskId, message).catch(() => undefined);
    }
    if (taskId && options.store?.appendAgentLog) {
      await options.store.appendAgentLog(taskId, message, "text", undefined, options.agent).catch(() => undefined);
    }

    await notifyFallbackUsed({
      primaryModel: payload.primaryModel,
      fallbackModel: payload.fallbackModel,
      triggerPoint: payload.triggerPoint,
      taskId,
      taskTitle,
      timestamp: payload.timestamp,
    });
  };
}
