import { useState, useEffect, useCallback, useRef } from "react";
import type { ActivityFeedEntry } from "../api";
import { fetchActivityFeed, fetchActivityLog } from "../api";

export interface UseActivityLogResult {
  /** Activity log entries */
  entries: ActivityFeedEntry[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually refresh activity log */
  refresh: () => Promise<void>;
  /** Clear all entries from state */
  clear: () => void;
  /** Whether there are more entries to load */
  hasMore: boolean;
  /** Load more (older) entries */
  loadMore: () => Promise<void>;
}

const POLL_INTERVAL_MS = 5000; // 5 seconds

export interface UseActivityLogOptions {
  /** Filter by project ID (used with unified central feed) */
  projectId?: string;
  /** Filter by event type */
  type?: ActivityFeedEntry["type"];
  /** Number of entries to fetch per page */
  limit?: number;
  /** Whether to auto-refresh */
  autoRefresh?: boolean;
  /**
   * When true, fetch from the unified central activity feed (/api/activity-feed).
   * When false (default), fetch from the per-project activity log (/api/activity).
   *
   * Set to true when the modal operates in a multi-project context (projects
   * list provided) so it reads from the unified feed. Default (false) reads
   * from the per-project log which is always populated with task events.
   */
  useCentralFeed?: boolean;
}

/**
 * Hook for fetching and managing the activity log.
 * Automatically polls for updates every 5 seconds when enabled.
 * Supports filtering by project and event type.
 *
 * Data source selection:
 * - Default (single-project): reads from per-project activity log (/api/activity)
 *   which is always populated with task lifecycle events for the current project.
 * - Multi-project (useCentralFeed=true): reads from unified activity feed
 *   (/api/activity-feed) which aggregates activity across all registered projects.
 */
export function useActivityLog(options: UseActivityLogOptions = {}): UseActivityLogResult {
  const { projectId, type, limit = 50, autoRefresh = true, useCentralFeed = false } = options;

  const [entries, setEntries] = useState<ActivityFeedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimestampRef = useRef<string | undefined>(undefined);

  /**
   * Fetch entries using the appropriate data source.
   *
   * Per-project log (/api/activity) — the default — reads directly from the
   * project's own SQLite database and always contains task lifecycle events.
   *
   * Unified feed (/api/activity-feed) reads from the central database and
   * supports cross-project aggregation.
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: ActivityFeedEntry[];

      if (useCentralFeed) {
        data = await fetchActivityFeed({ limit, projectId, type });
      } else {
        // Per-project: fetchActivityLog returns ActivityLogEntry[] which is a
        // subset of ActivityFeedEntry (missing projectId/projectName). Map to
        // the full shape so downstream consumers see a uniform interface.
        const logEntries = await fetchActivityLog({ limit, type, projectId });
        data = logEntries.map((entry) => ({
          ...entry,
          projectId: projectId ?? "",
          projectName: "",
        }));
      }

      setEntries(data);
      setHasMore(data.length === limit);

      if (data.length > 0) {
        lastTimestampRef.current = data[data.length - 1].timestamp;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity log");
    } finally {
      setLoading(false);
    }
  }, [limit, projectId, type, useCentralFeed]);

  const loadMore = useCallback(async () => {
    if (!lastTimestampRef.current) return;

    try {
      setLoading(true);

      let data: ActivityFeedEntry[];

      if (useCentralFeed) {
        data = await fetchActivityFeed({
          limit,
          projectId,
          type,
          since: lastTimestampRef.current,
        });
      } else {
        const logEntries = await fetchActivityLog({
          limit,
          type,
          since: lastTimestampRef.current,
          projectId,
        });
        data = logEntries.map((entry) => ({
          ...entry,
          projectId: projectId ?? "",
          projectName: "",
        }));
      }

      setEntries((prev) => [...prev, ...data]);
      setHasMore(data.length === limit);

      if (data.length > 0) {
        lastTimestampRef.current = data[data.length - 1].timestamp;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more entries");
    } finally {
      setLoading(false);
    }
  }, [limit, projectId, type, useCentralFeed]);

  const clear = useCallback(() => {
    setEntries([]);
    setHasMore(false);
    lastTimestampRef.current = undefined;
  }, []);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = setInterval(() => {
      refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refresh]);

  return {
    entries,
    loading,
    error,
    refresh,
    clear,
    hasMore,
    loadMore,
  };
}
