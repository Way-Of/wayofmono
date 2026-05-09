import type { Task } from "@fusion/core";
import type { PluginContext } from "@fusion/plugin-sdk";
import { notificationCard } from "./cards.js";
import { diffSnapshots } from "./notifications/diff.js";
import { pruneMissing, readSnapshot, writeSnapshot } from "./notifications/store.js";
import type { NotificationEvent } from "./notifications/types.js";
import type { PluginDb } from "./index.js";
import { getNotifyColumns, getPollingIntervalMs } from "./settings.js";
import type { GlassesTransport } from "./transport.js";

export interface NotifierDeps {
  taskStore: PluginContext["taskStore"];
  db: PluginDb;
  transport: GlassesTransport;
  settings: PluginContext["settings"];
  logger?: PluginContext["logger"];
  pluginId: string;
  now?: () => Date;
  setIntervalImpl?: typeof setInterval;
  clearIntervalImpl?: typeof clearInterval;
}

export interface Notifier {
  start(): void;
  stop(): Promise<void>;
  pollOnce(): Promise<NotificationEvent[]>;
  peekPending(limit?: number): NotificationEvent[];
  drainPending(limit?: number): NotificationEvent[];
  ack(taskIds: ReadonlySet<string>): number;
  lastPolledAt(): string | null;
  getLastPollTime(): string | null;
}

const PENDING_CAP = 200;

export function createNotifier(deps: NotifierDeps): Notifier {
  const setIntervalImpl = deps.setIntervalImpl ?? setInterval;
  const clearIntervalImpl = deps.clearIntervalImpl ?? clearInterval;

  let timer: ReturnType<typeof setInterval> | undefined;
  let inFlight = false;
  let running = false;
  let stopped = false;
  let inFlightPromise: Promise<NotificationEvent[]> | null = null;
  let pending: NotificationEvent[] = [];
  let lastPollIso: string | null = null;

  const nowIso = () => (deps.now?.() ?? new Date()).toISOString();

  const bounded = (items: NotificationEvent[]) => {
    if (items.length <= PENDING_CAP) return items;
    return items.slice(items.length - PENDING_CAP);
  };

  const performPoll = async (): Promise<NotificationEvent[]> => {
    if (stopped) return [];
    if (inFlight) {
      deps.logger?.debug?.("skip overlapping poll", { pluginId: deps.pluginId });
      return [];
    }

    inFlight = true;
    try {
      const tasks = (await deps.taskStore.listTasks({ includeArchived: false })) as Task[];
      const snapshot = readSnapshot(deps.db);
      const notifyOnColumns = new Set(getNotifyColumns(deps.settings));
      const events = diffSnapshots(snapshot, tasks, { notifyOnColumns, alsoNotifyOnDone: false });
      const taskMap = new Map(tasks.map((task) => [task.id, task] as const));

      for (const event of events) {
        const task = taskMap.get(event.taskId);
        if (!task) continue;
        try {
          await deps.transport.pushCard(notificationCard(task, event.reason));
        } catch (err) {
          deps.logger?.error?.("failed to push notification card", { err, pluginId: deps.pluginId, taskId: task.id });
        }
      }

      pending = bounded([...pending, ...events]);
      writeSnapshot(
        deps.db,
        tasks.map((task) => ({ taskId: task.id, lastColumn: task.column, updatedAt: task.updatedAt })),
      );
      pruneMissing(deps.db, new Set(tasks.map((task) => task.id)));
      lastPollIso = nowIso();
      return events;
    } catch (err) {
      deps.logger?.error?.("notifier poll failed", { err, pluginId: deps.pluginId });
      return [];
    } finally {
      inFlight = false;
    }
  };

  return {
    start() {
      if (running) return;
      running = true;
      stopped = false;
      void this.pollOnce();
      const intervalMs = Math.max(5000, getPollingIntervalMs(deps.settings));
      timer = setIntervalImpl(() => {
        if (stopped) return;
        void this.pollOnce();
      }, intervalMs);
    },

    async stop() {
      if (!running && !timer) return;
      stopped = true;
      running = false;
      if (timer) {
        clearIntervalImpl(timer);
        timer = undefined;
      }
      if (inFlightPromise) {
        await inFlightPromise.catch(() => undefined);
      }
    },

    pollOnce() {
      const poll = performPoll();
      inFlightPromise = poll;
      return poll.finally(() => {
        if (inFlightPromise === poll) inFlightPromise = null;
      });
    },

    peekPending(limit = 50) {
      const max = Math.max(0, Math.floor(limit));
      return pending.slice(0, max);
    },

    drainPending(limit = 50) {
      const max = Math.max(0, Math.floor(limit));
      const drained = pending.slice(0, max);
      pending = pending.slice(drained.length);
      return drained;
    },

    ack(taskIds: ReadonlySet<string>) {
      const before = pending.length;
      pending = pending.filter((event) => !taskIds.has(event.taskId));
      return before - pending.length;
    },

    lastPolledAt() {
      return lastPollIso;
    },

    getLastPollTime() {
      return lastPollIso;
    },
  };
}
