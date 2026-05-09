import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { AiSessionSummary } from "../api";

const CHANNEL_NAME = "fusion:ai-session-sync";
const STORAGE_FALLBACK_KEY = "fusion:ai-session-sync";
const HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_STALE_THRESHOLD_MS = 60_000;

type SessionStatus = AiSessionSummary["status"];
type SessionType = AiSessionSummary["type"];

export interface SessionSyncState {
  sessionId: string;
  status: SessionStatus;
  needsInput: boolean;
  lastEventTimestamp: number;
  owningTabId: string | null;
  type?: SessionType;
  title?: string;
  projectId?: string | null;
  updatedAt?: string;
}

export interface ActiveTabState {
  sessionId: string;
  tabId: string;
  lastHeartbeatTimestamp: number;
  lastLockTimestamp: number;
  stale: boolean;
}

interface StorageFallbackEnvelope {
  id: string;
  message: AiSessionSyncMessage;
}

interface StoreSnapshot {
  tabId: string;
  sessions: Map<string, SessionSyncState>;
  activeTabMap: Map<string, ActiveTabState>;
}

interface SessionUpdatePayload {
  sessionId: string;
  status: SessionStatus;
  needsInput?: boolean;
  timestamp?: number;
  owningTabId?: string | null;
  type?: SessionType;
  title?: string;
  projectId?: string | null;
  updatedAt?: string;
}

interface SessionCompletedPayload {
  sessionId: string;
  status?: Extract<SessionStatus, "complete" | "error">;
  timestamp?: number;
}

interface TabMessageBase {
  tabId: string;
  timestamp: number;
  senderTabId?: string;
}

type AiSessionSyncMessage =
  | ({
      type: "session:updated";
      sessionId: string;
      status: SessionStatus;
      needsInput?: boolean;
      owningTabId?: string | null;
      sessionType?: SessionType;
      title?: string;
      projectId?: string | null;
      updatedAt?: string;
      timestamp: number;
    } & Partial<TabMessageBase>)
  | ({
      type: "session:completed";
      sessionId: string;
      status?: Extract<SessionStatus, "complete" | "error">;
      timestamp: number;
    } & Partial<TabMessageBase>)
  | ({
      type: "tab:active";
      sessionId: string;
    } & TabMessageBase)
  | ({
      type: "tab:inactive";
      sessionId: string;
    } & TabMessageBase)
  | ({
      type: "tab:heartbeat";
    } & TabMessageBase)
  | ({
      type: "sync:request";
    } & TabMessageBase)
  | ({
      type: "sync:response";
      tabId: string;
      sessions: SessionSyncState[];
      locks?: Array<{ sessionId: string; tabId: string; timestamp: number }>;
      heartbeats?: Array<{ tabId: string; timestamp: number }>;
      timestamp: number;
      senderTabId?: string;
    } & Partial<TabMessageBase>);

function now(): number {
  return Date.now();
}

function createTabId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseMessage(raw: unknown): AiSessionSyncMessage | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as { type?: unknown; timestamp?: unknown };
  if (typeof candidate.type !== "string") {
    return null;
  }

  if (typeof candidate.timestamp !== "number" || !Number.isFinite(candidate.timestamp)) {
    return null;
  }

  return raw as AiSessionSyncMessage;
}

export class AiSessionSyncStore {
  private readonly tabId: string;
  private readonly listeners = new Set<() => void>();
  private readonly sessionStates = new Map<string, SessionSyncState>();
  private readonly ownershipBySession = new Map<string, { tabId: string; timestamp: number }>();
  private readonly heartbeatByTab = new Map<string, number>();
  private readonly ownedSessions = new Map<string, string>();

  private snapshot: StoreSnapshot;
  private channel: BroadcastChannel | null = null;
  private usingStorageFallback = false;
  private cleanupStorageListener: (() => void) | null = null;
  private cleanupBeforeUnload: (() => void) | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private staleSweepInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.tabId = createTabId();
    this.snapshot = {
      tabId: this.tabId,
      sessions: new Map(),
      activeTabMap: new Map(),
    };

    if (!this.isBrowser()) {
      return;
    }

    this.initializeTransport();
    this.startHeartbeat();
    this.startStaleSweep();
    this.setupBeforeUnloadCleanup();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): StoreSnapshot {
    return this.snapshot;
  }

  requestSync(): void {
    this.publish({
      type: "sync:request",
      tabId: this.tabId,
      timestamp: now(),
    });
  }

  broadcastUpdate(payload: SessionUpdatePayload): void {
    const timestamp = payload.timestamp ?? now();

    this.applySessionUpdate(
      {
        sessionId: payload.sessionId,
        status: payload.status,
        needsInput: payload.needsInput ?? payload.status === "awaiting_input",
        owningTabId: payload.owningTabId,
        type: payload.type,
        title: payload.title,
        projectId: payload.projectId,
        updatedAt: payload.updatedAt,
      },
      timestamp,
    );

    this.publish({
      type: "session:updated",
      sessionId: payload.sessionId,
      status: payload.status,
      needsInput: payload.needsInput,
      owningTabId: payload.owningTabId,
      sessionType: payload.type,
      title: payload.title,
      projectId: payload.projectId,
      updatedAt: payload.updatedAt,
      timestamp,
    });
  }

  broadcastCompleted(payload: SessionCompletedPayload): void {
    const status = payload.status ?? "complete";
    const timestamp = payload.timestamp ?? now();

    this.applySessionUpdate(
      {
        sessionId: payload.sessionId,
        status,
        needsInput: false,
        owningTabId: null,
      },
      timestamp,
    );

    this.ownershipBySession.delete(payload.sessionId);
    this.ownedSessions.delete(payload.sessionId);
    this.emit();

    this.publish({
      type: "session:completed",
      sessionId: payload.sessionId,
      status,
      timestamp,
    });
  }

  broadcastLock(sessionId: string, tabId: string): void {
    const timestamp = now();

    this.applyTabOwnership(sessionId, tabId, timestamp);
    this.ownedSessions.set(sessionId, tabId);

    this.publish({
      type: "tab:active",
      tabId,
      sessionId,
      timestamp,
    });
  }

  broadcastUnlock(sessionId: string, tabId: string): void {
    const timestamp = now();
    this.releaseTabOwnership(sessionId, tabId, timestamp);
    this.ownedSessions.delete(sessionId);

    this.publish({
      type: "tab:inactive",
      tabId,
      sessionId,
      timestamp,
    });
  }

  broadcastHeartbeat(tabId: string): void {
    const timestamp = now();
    this.updateHeartbeat(tabId, timestamp);

    this.publish({
      type: "tab:heartbeat",
      tabId,
      timestamp,
    });
  }

  destroy(): void {
    this.cleanupStorageListener?.();
    this.cleanupStorageListener = null;

    this.cleanupBeforeUnload?.();
    this.cleanupBeforeUnload = null;

    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.staleSweepInterval) {
      clearInterval(this.staleSweepInterval);
      this.staleSweepInterval = null;
    }
  }

  reset(): void {
    this.sessionStates.clear();
    this.ownershipBySession.clear();
    this.heartbeatByTab.clear();
    this.ownedSessions.clear();

    this.snapshot = {
      tabId: this.tabId,
      sessions: new Map(),
      activeTabMap: new Map(),
    };

    this.emit();
  }

  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  private initializeTransport(): void {
    if (typeof BroadcastChannel !== "undefined") {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<unknown>) => {
          const parsed = parseMessage(event.data);
          if (parsed) {
            this.handleIncomingMessage(parsed);
          }
        };
        this.usingStorageFallback = false;
        return;
      } catch {
        // Fall back to localStorage below.
      }
    }

    this.usingStorageFallback = true;
    const storageHandler = (event: StorageEvent) => {
      if (event.key !== STORAGE_FALLBACK_KEY || !event.newValue) {
        return;
      }

      try {
        const parsedEnvelope = JSON.parse(event.newValue) as StorageFallbackEnvelope;
        const parsedMessage = parseMessage(parsedEnvelope.message);
        if (parsedMessage) {
          this.handleIncomingMessage(parsedMessage);
        }
      } catch {
        // Ignore malformed fallback payloads.
      }
    };

    window.addEventListener("storage", storageHandler);
    this.cleanupStorageListener = () => {
      window.removeEventListener("storage", storageHandler);
    };
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const timestamp = now();
      this.updateHeartbeat(this.tabId, timestamp);

      this.publish({
        type: "tab:heartbeat",
        tabId: this.tabId,
        timestamp,
      });
    }, HEARTBEAT_INTERVAL_MS);
  }

  private startStaleSweep(): void {
    this.staleSweepInterval = setInterval(() => {
      this.emit();
    }, 10_000);
  }

  private setupBeforeUnloadCleanup(): void {
    const handleBeforeUnload = () => {
      for (const [sessionId, owningTabId] of this.ownedSessions.entries()) {
        const timestamp = now();
        this.publish({
          type: "tab:inactive",
          tabId: owningTabId,
          sessionId,
          timestamp,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    this.cleanupBeforeUnload = () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }

  private publish(message: AiSessionSyncMessage): void {
    const withSender: AiSessionSyncMessage = {
      ...message,
      senderTabId: this.tabId,
    };

    if (this.channel) {
      this.channel.postMessage(withSender);
      return;
    }

    if (!this.usingStorageFallback) {
      return;
    }

    try {
      const envelope: StorageFallbackEnvelope = {
        id: `${withSender.type}-${withSender.timestamp}-${Math.random().toString(36).slice(2, 8)}`,
        message: withSender,
      };
      window.localStorage.setItem(STORAGE_FALLBACK_KEY, JSON.stringify(envelope));
    } catch {
      // Ignore fallback write failures.
    }
  }

  private handleIncomingMessage(message: AiSessionSyncMessage): void {
    switch (message.type) {
      case "session:updated": {
        this.applySessionUpdate(
          {
            sessionId: message.sessionId,
            status: message.status,
            needsInput: message.needsInput,
            owningTabId: message.owningTabId,
            type: message.sessionType,
            title: message.title,
            projectId: message.projectId,
            updatedAt: message.updatedAt,
          },
          message.timestamp,
        );
        return;
      }

      case "session:completed": {
        this.applySessionUpdate(
          {
            sessionId: message.sessionId,
            status: message.status ?? "complete",
            needsInput: false,
            owningTabId: null,
          },
          message.timestamp,
        );
        this.ownershipBySession.delete(message.sessionId);
        this.emit();
        return;
      }

      case "tab:active": {
        this.applyTabOwnership(message.sessionId, message.tabId, message.timestamp);
        return;
      }

      case "tab:inactive": {
        this.releaseTabOwnership(message.sessionId, message.tabId, message.timestamp);
        return;
      }

      case "tab:heartbeat": {
        this.updateHeartbeat(message.tabId, message.timestamp);
        return;
      }

      case "sync:request": {
        if (message.tabId === this.tabId) {
          return;
        }

        const sessions = [...this.sessionStates.values()].map((session) => {
          const ownership = this.ownershipBySession.get(session.sessionId);
          return {
            ...session,
            owningTabId: ownership?.tabId ?? session.owningTabId ?? null,
          };
        });

        const locks = [...this.ownershipBySession.entries()].map(([sessionId, lock]) => ({
          sessionId,
          tabId: lock.tabId,
          timestamp: lock.timestamp,
        }));

        const heartbeats = [...this.heartbeatByTab.entries()].map(([tabId, timestamp]) => ({
          tabId,
          timestamp,
        }));

        this.publish({
          type: "sync:response",
          tabId: message.tabId,
          sessions,
          locks,
          heartbeats,
          timestamp: now(),
        });
        return;
      }

      case "sync:response": {
        if (message.tabId !== this.tabId) {
          return;
        }

        for (const session of message.sessions) {
          this.applySessionUpdate(
            {
              sessionId: session.sessionId,
              status: session.status,
              needsInput: session.needsInput,
              owningTabId: session.owningTabId,
              type: session.type,
              title: session.title,
              projectId: session.projectId,
              updatedAt: session.updatedAt,
            },
            session.lastEventTimestamp,
            false,
          );
        }

        for (const lock of message.locks ?? []) {
          this.applyTabOwnership(lock.sessionId, lock.tabId, lock.timestamp, false);
        }

        for (const heartbeat of message.heartbeats ?? []) {
          this.updateHeartbeat(heartbeat.tabId, heartbeat.timestamp, false);
        }

        this.emit();
        return;
      }

      default:
        return;
    }
  }

  private applySessionUpdate(
    update: {
      sessionId: string;
      status: SessionStatus;
      needsInput?: boolean;
      owningTabId?: string | null;
      type?: SessionType;
      title?: string;
      projectId?: string | null;
      updatedAt?: string;
    },
    timestamp: number,
    shouldEmit = true,
  ): void {
    const existing = this.sessionStates.get(update.sessionId);
    if (existing && timestamp < existing.lastEventTimestamp) {
      return;
    }

    const ownership = this.ownershipBySession.get(update.sessionId);

    const nextState: SessionSyncState = {
      sessionId: update.sessionId,
      status: update.status,
      needsInput: update.needsInput ?? update.status === "awaiting_input",
      lastEventTimestamp: timestamp,
      owningTabId: update.owningTabId ?? ownership?.tabId ?? existing?.owningTabId ?? null,
      type: update.type ?? existing?.type,
      title: update.title ?? existing?.title,
      projectId: update.projectId ?? existing?.projectId,
      updatedAt: update.updatedAt ?? new Date(timestamp).toISOString(),
    };

    this.sessionStates.set(update.sessionId, nextState);

    if (update.owningTabId !== undefined) {
      if (update.owningTabId) {
        this.applyTabOwnership(update.sessionId, update.owningTabId, timestamp, false);
      } else {
        this.ownershipBySession.delete(update.sessionId);
      }
    }

    if (shouldEmit) {
      this.emit();
    }
  }

  private applyTabOwnership(sessionId: string, tabId: string, timestamp: number, shouldEmit = true): void {
    const existing = this.ownershipBySession.get(sessionId);
    if (existing && timestamp < existing.timestamp) {
      return;
    }

    this.ownershipBySession.set(sessionId, { tabId, timestamp });
    this.updateHeartbeat(tabId, timestamp, false);

    const existingSession = this.sessionStates.get(sessionId);
    if (existingSession && timestamp >= existingSession.lastEventTimestamp) {
      this.sessionStates.set(sessionId, {
        ...existingSession,
        owningTabId: tabId,
        lastEventTimestamp: timestamp,
      });
    }

    if (shouldEmit) {
      this.emit();
    }
  }

  private releaseTabOwnership(sessionId: string, tabId: string, timestamp: number, shouldEmit = true): void {
    const existing = this.ownershipBySession.get(sessionId);
    if (!existing) {
      return;
    }

    if (existing.tabId !== tabId || timestamp < existing.timestamp) {
      return;
    }

    this.ownershipBySession.delete(sessionId);

    const existingSession = this.sessionStates.get(sessionId);
    if (existingSession && timestamp >= existingSession.lastEventTimestamp) {
      this.sessionStates.set(sessionId, {
        ...existingSession,
        owningTabId: null,
        lastEventTimestamp: timestamp,
      });
    }

    if (shouldEmit) {
      this.emit();
    }
  }

  private updateHeartbeat(tabId: string, timestamp: number, shouldEmit = true): void {
    const previous = this.heartbeatByTab.get(tabId);
    if (previous !== undefined && timestamp < previous) {
      return;
    }

    this.heartbeatByTab.set(tabId, timestamp);

    if (shouldEmit) {
      this.emit();
    }
  }

  private emit(): void {
    const currentTime = now();
    const sessionsSnapshot = new Map<string, SessionSyncState>();

    for (const [sessionId, session] of this.sessionStates.entries()) {
      const ownership = this.ownershipBySession.get(sessionId);
      sessionsSnapshot.set(sessionId, {
        ...session,
        owningTabId: ownership?.tabId ?? session.owningTabId ?? null,
      });
    }

    const activeTabMap = new Map<string, ActiveTabState>();
    for (const [sessionId, ownership] of this.ownershipBySession.entries()) {
      const heartbeat = this.heartbeatByTab.get(ownership.tabId) ?? ownership.timestamp;
      const stale = currentTime - heartbeat > HEARTBEAT_STALE_THRESHOLD_MS;
      activeTabMap.set(sessionId, {
        sessionId,
        tabId: ownership.tabId,
        lastHeartbeatTimestamp: heartbeat,
        lastLockTimestamp: ownership.timestamp,
        stale,
      });
    }

    this.snapshot = {
      tabId: this.tabId,
      sessions: sessionsSnapshot,
      activeTabMap,
    };

    for (const listener of this.listeners) {
      listener();
    }
  }
}

const aiSessionSyncStore = new AiSessionSyncStore();

export function useAiSessionSync(): {
  tabId: string;
  sessions: Map<string, SessionSyncState>;
  activeTabMap: Map<string, ActiveTabState>;
  broadcastUpdate: (payload: SessionUpdatePayload) => void;
  broadcastCompleted: (payload: SessionCompletedPayload) => void;
  broadcastLock: (sessionId: string, tabId: string) => void;
  broadcastUnlock: (sessionId: string, tabId: string) => void;
  broadcastHeartbeat: (tabId: string) => void;
  requestSync: () => void;
} {
  const snapshot = useSyncExternalStore(
    (listener) => aiSessionSyncStore.subscribe(listener),
    () => aiSessionSyncStore.getSnapshot(),
    () => aiSessionSyncStore.getSnapshot(),
  );

  useEffect(() => {
    aiSessionSyncStore.requestSync();
  }, []);

  const broadcastUpdate = useCallback((payload: SessionUpdatePayload) => {
    aiSessionSyncStore.broadcastUpdate(payload);
  }, []);

  const broadcastCompleted = useCallback((payload: SessionCompletedPayload) => {
    aiSessionSyncStore.broadcastCompleted(payload);
  }, []);

  const broadcastLock = useCallback((sessionId: string, tabId: string) => {
    aiSessionSyncStore.broadcastLock(sessionId, tabId);
  }, []);

  const broadcastUnlock = useCallback((sessionId: string, tabId: string) => {
    aiSessionSyncStore.broadcastUnlock(sessionId, tabId);
  }, []);

  const broadcastHeartbeat = useCallback((tabId: string) => {
    aiSessionSyncStore.broadcastHeartbeat(tabId);
  }, []);

  const requestSync = useCallback(() => {
    aiSessionSyncStore.requestSync();
  }, []);

  return {
    tabId: snapshot.tabId,
    sessions: snapshot.sessions,
    activeTabMap: snapshot.activeTabMap,
    broadcastUpdate,
    broadcastCompleted,
    broadcastLock,
    broadcastUnlock,
    broadcastHeartbeat,
    requestSync,
  };
}

export function __resetAiSessionSyncStoreForTests(): void {
  aiSessionSyncStore.reset();
}

export function __destroyAiSessionSyncStoreForTests(): void {
  aiSessionSyncStore.destroy();
}
