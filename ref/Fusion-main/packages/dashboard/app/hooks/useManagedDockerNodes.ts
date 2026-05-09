import { useCallback, useEffect, useRef, useState } from "react";
import type { ManagedDockerNodeInput } from "@fusion/core";
import type { ContainerStatusInfo, ManagedDockerNodeInfo } from "../api";
import {
  createManagedDockerNode,
  fetchDockerNodeLogs,
  fetchManagedDockerNodeContainerStatus,
  fetchManagedDockerNodes,
} from "../api";

export interface UseManagedDockerNodesResult {
  dockerNodes: ManagedDockerNodeInfo[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getContainerStatus: (id: string) => Promise<ContainerStatusInfo>;
  getLogs: (id: string, options?: { tail?: number }) => Promise<string>;
  create: (input: ManagedDockerNodeInput) => Promise<ManagedDockerNodeInfo>;
}

const POLL_INTERVAL_MS = 15000;
const VISIBILITY_REFRESH_DEBOUNCE_MS = 1000;

export function useManagedDockerNodes(): UseManagedDockerNodesResult {
  const [dockerNodes, setDockerNodes] = useState<ManagedDockerNodeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastVisibilityRefreshRef = useRef<number>(0);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchManagedDockerNodes();
      setDockerNodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch managed Docker nodes");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchManagedDockerNodes();
        if (!cancelled) {
          setDockerNodes(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch managed Docker nodes");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const now = Date.now();
      if (now - lastVisibilityRefreshRef.current < VISIBILITY_REFRESH_DEBOUNCE_MS) {
        return;
      }

      lastVisibilityRefreshRef.current = now;
      void refresh();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  useEffect(() => {
    if (loading) {
      return;
    }

    intervalRef.current = setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [loading, refresh]);

  const getContainerStatus = useCallback(async (id: string): Promise<ContainerStatusInfo> => {
    return fetchManagedDockerNodeContainerStatus(id);
  }, []);

  const getLogs = useCallback(async (id: string, options?: { tail?: number }): Promise<string> => {
    const result = await fetchDockerNodeLogs(id, options);
    return result.logs;
  }, []);

  const create = useCallback(async (input: ManagedDockerNodeInput): Promise<ManagedDockerNodeInfo> => {
    const created = await createManagedDockerNode(input);
    const normalized = {
      ...created,
      nodeId: created.nodeId ?? undefined,
      containerId: created.containerId ?? undefined,
      status: created.status,
      hostConfig: {
        type: created.hostConfig.host || created.hostConfig.context ? "remote" : "local",
        host: created.hostConfig.host,
        context: created.hostConfig.context,
      },
      reachableUrl: created.reachableUrl ?? undefined,
      volumeMounts: created.volumeMounts.map((mount) => ({
        hostPath: mount.hostPath,
        containerPath: mount.containerPath,
        readOnly: mount.mode === "ro" ? true : undefined,
      })),
      persistentStorage: created.persistentStorage,
      resourceSizing: {
        cpuLimit: created.resourceSizing.cpus !== undefined ? String(created.resourceSizing.cpus) : undefined,
        memoryLimit: created.resourceSizing.memoryMB !== undefined ? `${created.resourceSizing.memoryMB}MB` : undefined,
      },
      errorMessage: created.errorMessage ?? undefined,
    } satisfies ManagedDockerNodeInfo;
    setDockerNodes((previous) => [...previous, normalized]);
    return normalized;
  }, []);

  return {
    dockerNodes,
    loading,
    error,
    refresh,
    getContainerStatus,
    getLogs,
    create,
  };
}
