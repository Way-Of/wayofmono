import { useState, useEffect, useRef, useCallback } from "react";
import type { AgentLogEntry } from "@fusion/core";
import { fetchAgentLogsWithMeta } from "../api";
import { subscribeSse } from "../sse-bus";

export const MAX_LOG_ENTRIES = 500;
const INITIAL_LOAD_LIMIT = 100;

/**
 * Cap the total number of log entries to `MAX_LOG_ENTRIES`.
 *
 * This is a **whole-list cap** — it limits how many entries are kept
 * in memory, not the content of any individual entry. Tool-oriented
 * `detail` payloads may still be clipped server-side to keep the live
 * dashboard responsive when agents emit very large command results.
 */
function capLogEntries(entries: AgentLogEntry[]): AgentLogEntry[] {
  return entries.length > MAX_LOG_ENTRIES
    ? entries.slice(-MAX_LOG_ENTRIES)
    : entries;
}

export interface TaskLogState {
  entries: AgentLogEntry[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  total: number | null;
  clear: () => void;
  loadMore: () => Promise<void>;
}

export type LogStateMap = Record<string, TaskLogState>;

interface InitState {
  entries: AgentLogEntry[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  total: number | null;
}

/**
 * Hook that manages agent log fetching and live SSE streaming for multiple tasks.
 *
 * Features:
 * - **Pagination**: Initial load fetches 100 entries per task. Use `loadMore()` to fetch older entries per task.
 * - **Project-context isolation**: Prevents cross-project log bleed via context versioning.
 * - **Live streaming**: SSE events append new entries to the end of each task's list.
 *
 * For each task ID in the provided array:
 * 1. Fetches recent historical logs via GET /api/tasks/:id/logs?limit=100
 * 2. Opens an EventSource to /api/tasks/:id/logs/stream for live updates
 * 3. Merges historical + live entries in order
 *
 * When task IDs are added or removed, connections are opened/closed accordingly.
 * When the component unmounts, all EventSources are closed to prevent memory leaks.
 */
export function useMultiAgentLogs(taskIds: string[], projectId?: string): LogStateMap {
  // Store state per task
  const [stateMap, setStateMap] = useState<Record<string, InitState>>({});

  // Refs for state that needs to survive re-renders
  const unsubscribesRef = useRef<Record<string, () => void>>({});
  const initializingRef = useRef<Set<string>>(new Set());
  const cancelledRef = useRef<Record<string, boolean>>({});
  const pendingLiveEntriesRef = useRef<Record<string, AgentLogEntry[]>>({});
  const loadingMoreRef = useRef<Record<string, boolean>>({});

  // Track project context version to detect stale events after project switches.
  // Incremented whenever projectId changes, invalidating any in-flight SSE handlers.
  const projectContextVersionRef = useRef(0);

  // Track previous projectId to detect project switches
  const previousProjectIdRef = useRef<string | undefined>(projectId);

  // Detect project switch and clear all state immediately
  const projectSwitched = previousProjectIdRef.current !== projectId;
  if (projectSwitched) {
    previousProjectIdRef.current = projectId;
    projectContextVersionRef.current++;

    // Drop all existing SSE subscriptions and reset state
    for (const [taskId, unsub] of Object.entries(unsubscribesRef.current)) {
      cancelledRef.current[taskId] = true;
      unsub();
    }
    unsubscribesRef.current = {};
    initializingRef.current.clear();
    cancelledRef.current = {};
    pendingLiveEntriesRef.current = {};
    loadingMoreRef.current = {};

    // Clear all state immediately to prevent stale data visibility
    setStateMap({});
  }

  // Create clear function for a specific task
  const createClearFn = useCallback((taskId: string) => {
    return () => {
      setStateMap((prev) => {
        const current = prev[taskId];
        if (!current) return prev;
        pendingLiveEntriesRef.current[taskId] = [];
        return {
          ...prev,
          [taskId]: { ...current, entries: [] },
        };
      });
    };
  }, []);

  // Create loadMore function for a specific task
  const createLoadMoreFn = useCallback((taskId: string, currentEntries: AgentLogEntry[]) => {
    return async () => {
      if (loadingMoreRef.current[taskId]) return;
      if (!projectContextVersionRef.current) return;

      const contextVersionAtStart = projectContextVersionRef.current;
      loadingMoreRef.current[taskId] = true;

      // Update loading state
      setStateMap((prev) => {
        const current = prev[taskId];
        if (!current) return prev;
        return { ...prev, [taskId]: { ...current, loadingMore: true } };
      });

      try {
        const result = await fetchAgentLogsWithMeta(taskId, projectId, {
          limit: INITIAL_LOAD_LIMIT,
          offset: currentEntries.length,
        });

        // Reject stale response
        if (cancelledRef.current[taskId] ||
            projectContextVersionRef.current !== contextVersionAtStart) {
          return;
        }

        // Prepend older entries to the existing list
        setStateMap((prev) => {
          const current = prev[taskId];
          if (!current) return prev;
          const combined = [...current.entries, ...result.entries];
          return {
            ...prev,
            [taskId]: {
              ...current,
              entries: capLogEntries(combined),
              hasMore: result.hasMore,
              total: result.total,
              loadingMore: false,
            },
          };
        });
      } catch {
        // Silently fail on load more errors
        setStateMap((prev) => {
          const current = prev[taskId];
          if (!current) return prev;
          return { ...prev, [taskId]: { ...current, loadingMore: false } };
        });
      } finally {
        loadingMoreRef.current[taskId] = false;
      }
    };
  }, [projectId]);

  // Stable comparison of task IDs and projectId to prevent effect re-runs on every render
  const taskIdsKey = taskIds.join(",");
  const stableKey = [taskIdsKey, projectId ?? ""].join("|");

  // Main effect to manage connections
  useEffect(() => {
    const currentIds = new Set(taskIds);
    const subs = unsubscribesRef.current;
    const initializing = initializingRef.current;
    const cancelled = cancelledRef.current;

    // Capture context version at effect start - stale events will be rejected
    const contextVersionAtStart = projectContextVersionRef.current;

    // Track which task IDs need state initialization (not already in stateMap)
    const newTaskIds: string[] = [];
    for (const taskId of taskIds) {
      if (!stateMap[taskId]) {
        newTaskIds.push(taskId);
      }
    }

    // Only initialize state for new tasks that aren't already in stateMap
    if (newTaskIds.length > 0) {
      setStateMap((prev) => {
        const updates: Record<string, InitState> = {};
        for (const taskId of newTaskIds) {
          if (!prev[taskId]) {
            updates[taskId] = { entries: [], loading: true, loadingMore: false, hasMore: false, total: null };
          }
        }
        if (Object.keys(updates).length === 0) return prev;
        return { ...prev, ...updates };
      });
    }

    // Drop subscriptions for tasks no longer in the list
    const removedTaskIds: string[] = [];
    for (const [taskId, unsub] of Object.entries(subs)) {
      if (!currentIds.has(taskId)) {
        cancelled[taskId] = true;
        unsub();
        delete subs[taskId];
        initializing.delete(taskId);
        delete cancelled[taskId];
        delete pendingLiveEntriesRef.current[taskId];
        delete loadingMoreRef.current[taskId];
        removedTaskIds.push(taskId);
      }
    }

    // Only remove state for disconnected tasks if there are any
    if (removedTaskIds.length > 0) {
      setStateMap((prev) => {
        let hasChanges = false;
        for (const taskId of removedTaskIds) {
          if (taskId in prev) {
            hasChanges = true;
            break;
          }
        }
        if (!hasChanges) return prev;
        const newState: Record<string, InitState> = {};
        for (const [id, state] of Object.entries(prev)) {
          if (!removedTaskIds.includes(id)) {
            newState[id] = state;
          }
        }
        return newState;
      });
    }

    // Mark removed pending initializations as cancelled even if EventSource not created yet
    for (const taskId of Object.keys(cancelled)) {
      if (!currentIds.has(taskId)) {
        cancelled[taskId] = true;
        initializing.delete(taskId);
        delete pendingLiveEntriesRef.current[taskId];
        delete loadingMoreRef.current[taskId];
      }
    }

    // Initialize connections for current tasks
    for (const taskId of taskIds) {
      // Skip if already connected or currently initializing
      if (subs[taskId] || initializing.has(taskId)) continue;

      initializing.add(taskId);
      cancelled[taskId] = false;
      pendingLiveEntriesRef.current[taskId] = [];

      // Build SSE URL with optional projectId for multi-project support
      const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      subs[taskId] = subscribeSse(
        `/api/tasks/${taskId}/logs/stream${query}`,
        {
          events: {
            "agent:log": (e) => {
              if (cancelled[taskId] ||
                  projectContextVersionRef.current !== contextVersionAtStart) {
                return;
              }
              try {
                const entry: AgentLogEntry = JSON.parse(e.data);
                pendingLiveEntriesRef.current[taskId] = capLogEntries([
                  ...(pendingLiveEntriesRef.current[taskId] ?? []),
                  entry,
                ]);

                setStateMap((prev) => {
                  const current = prev[taskId];
                  if (!current) return prev;
                  return {
                    ...prev,
                    [taskId]: {
                      ...current,
                      entries: capLogEntries([...current.entries, entry]),
                      total: current.total !== null ? current.total + 1 : null,
                    },
                  };
                });
              } catch {
                // skip malformed events
              }
            },
          },
        },
      );

      // Fetch historical logs with projectId using pagination
      void fetchAgentLogsWithMeta(taskId, projectId, { limit: INITIAL_LOAD_LIMIT })
        .then((result) => {
          // Reject stale response from previous context
          if (cancelled[taskId] ||
              projectContextVersionRef.current !== contextVersionAtStart) {
            return;
          }

          const pendingLive = pendingLiveEntriesRef.current[taskId] ?? [];
          setStateMap((prev) => ({
            ...prev,
            [taskId]: {
              ...prev[taskId],
              entries: capLogEntries([...result.entries, ...pendingLive]),
              loading: false,
              hasMore: result.hasMore,
              total: result.total,
            },
          }));
        })
        .catch(() => {
          // Reject stale error from previous context
          if (cancelled[taskId] ||
              projectContextVersionRef.current !== contextVersionAtStart) {
            return;
          }

          const pendingLive = pendingLiveEntriesRef.current[taskId] ?? [];
          setStateMap((prev) => ({
            ...prev,
            [taskId]: {
              ...prev[taskId],
              entries: capLogEntries(pendingLive),
              loading: false,
              hasMore: false,
              total: null,
            },
          }));
        })
        .finally(() => {
          pendingLiveEntriesRef.current[taskId] = [];
          initializingRef.current.delete(taskId);
        });
    }

    // Update previous task IDs ref for cleanup comparison
    const initialTaskIds = [...taskIds];

    // Cleanup on effect re-run or unmount
    return () => {
      // Only drop subscriptions for tasks that were removed (not-in current taskIds)
      for (const taskId of initialTaskIds) {
        if (!currentIds.has(taskId)) {
          cancelledRef.current[taskId] = true;

          const unsub = unsubscribesRef.current[taskId];
          if (unsub) {
            unsub();
            delete unsubscribesRef.current[taskId];
          }

          initializingRef.current.delete(taskId);
        }
      }
    };
  }, [stableKey]); // Use stable key including projectId

  // Drop all subscriptions on unmount
  useEffect(() => {
    return () => {
      for (const taskId of Object.keys(cancelledRef.current)) {
        cancelledRef.current[taskId] = true;
      }

      for (const unsub of Object.values(unsubscribesRef.current)) {
        unsub();
      }

      unsubscribesRef.current = {};
      initializingRef.current.clear();
      cancelledRef.current = {};
      pendingLiveEntriesRef.current = {};
      loadingMoreRef.current = {};
    };
  }, []);

  // Build result map
  const result: LogStateMap = {};
  for (const taskId of taskIds) {
    const state = stateMap[taskId];
    const entries = state?.entries ?? [];
    result[taskId] = {
      entries,
      loading: state?.loading ?? true,
      loadingMore: state?.loadingMore ?? false,
      hasMore: state?.hasMore ?? false,
      total: state?.total ?? null,
      clear: createClearFn(taskId),
      loadMore: createLoadMoreFn(taskId, entries),
    };
  }

  return result;
}
