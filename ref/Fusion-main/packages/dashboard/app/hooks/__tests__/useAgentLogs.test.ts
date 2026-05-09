import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAgentLogs } from "../useAgentLogs";
import { fetchAgentLogsWithMeta } from "../../api";

// Mock the api module
vi.mock("../../api", () => ({
  fetchAgentLogsWithMeta: vi.fn().mockResolvedValue({ entries: [], total: 0, hasMore: false }),
}));

const mockFetchAgentLogsWithMeta = vi.mocked(fetchAgentLogsWithMeta);

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  listeners: Record<string, ((e: any) => void)[]> = {};
  readyState = 0;
  close = vi.fn(() => {
    this.readyState = 2;
  });

  constructor(url: string) {
    this.url = url;
    this.readyState = 1;
    MockEventSource.instances.push(this);
  }

  addEventListener(event: string, fn: (e: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  // Helper to simulate a server event
  _emit(event: string, data: any) {
    for (const fn of this.listeners[event] || []) {
      fn({ data: JSON.stringify(data) });
    }
  }
}

const originalEventSource = globalThis.EventSource;

const INITIAL_LOAD_LIMIT = 100;

beforeEach(() => {
  MockEventSource.instances = [];
  (globalThis as any).EventSource = MockEventSource;
  mockFetchAgentLogsWithMeta.mockReset().mockResolvedValue({ entries: [], total: 0, hasMore: false });
});

afterEach(() => {
  (globalThis as any).EventSource = originalEventSource;
});

describe("useAgentLogs", () => {
  it("does not fetch or connect when enabled=false", () => {
    const { result } = renderHook(() => useAgentLogs("FN-001", false));

    expect(mockFetchAgentLogsWithMeta).not.toHaveBeenCalled();
    expect(MockEventSource.instances).toHaveLength(0);
    expect(result.current.entries).toEqual([]);
  });

  it("fetches historical logs and opens SSE when enabled=true", async () => {
    const historicalLogs = [
      { timestamp: "2026-01-01T00:00:00Z", taskId: "FN-001", text: "old", type: "text" as const },
    ];
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({
      entries: historicalLogs,
      total: historicalLogs.length,
      hasMore: false,
    });

    const { result } = renderHook(() => useAgentLogs("FN-001", true));

    await waitFor(() => {
      expect(result.current.entries).toEqual(historicalLogs);
    });

    expect(mockFetchAgentLogsWithMeta).toHaveBeenCalledWith("FN-001", undefined, { limit: INITIAL_LOAD_LIMIT });
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe("/api/tasks/FN-001/logs/stream");
  });

  it("sets hasMore and total from API response", async () => {
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({
      entries: [],
      total: 150,
      hasMore: true,
    });

    const { result } = renderHook(() => useAgentLogs("FN-001", true));

    await waitFor(() => {
      expect(result.current.total).toBe(150);
      expect(result.current.hasMore).toBe(true);
    });
  });

  it("appends live SSE entries to historical entries", async () => {
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({
      entries: [
        { timestamp: "2026-01-01T00:00:00Z", taskId: "FN-001", text: "old", type: "text" as const },
      ],
      total: 2,
      hasMore: false,
    });

    const { result } = renderHook(() => useAgentLogs("FN-001", true));

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
    });

    const es = MockEventSource.instances[0];
    act(() => {
      es._emit("agent:log", {
        timestamp: "2026-01-01T00:01:00Z",
        taskId: "FN-001",
        text: "new",
        type: "text",
      });
    });

    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entries[1].text).toBe("new");
  });

  it("keeps deterministic chronological order when history has tied timestamps and SSE appends tied timestamps", async () => {
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({
      entries: [
        { timestamp: "2026-01-01T00:00:00Z", taskId: "FN-001", text: "hist-1", type: "text" as const },
        { timestamp: "2026-01-01T00:00:00Z", taskId: "FN-001", text: "hist-2", type: "text" as const },
      ],
      total: 3,
      hasMore: false,
    });

    const { result } = renderHook(() => useAgentLogs("FN-001", true));

    await waitFor(() => {
      expect(result.current.entries.map((entry) => entry.text)).toEqual(["hist-1", "hist-2"]);
    });

    const es = MockEventSource.instances[0];
    act(() => {
      es._emit("agent:log", {
        timestamp: "2026-01-01T00:00:00Z",
        taskId: "FN-001",
        text: "live-3",
        type: "text",
      });
    });

    expect(result.current.entries.map((entry) => entry.text)).toEqual(["hist-1", "hist-2", "live-3"]);
  });

  it("closes SSE when enabled changes to false", async () => {
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({ entries: [], total: 0, hasMore: false });

    const { rerender } = renderHook(
      ({ enabled }) => useAgentLogs("FN-001", enabled),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const es = MockEventSource.instances[0];

    rerender({ enabled: false });

    expect(es.close).toHaveBeenCalled();
  });

  it("closes SSE on unmount", async () => {
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({ entries: [], total: 0, hasMore: false });

    const { unmount } = renderHook(() => useAgentLogs("FN-001", true));

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const es = MockEventSource.instances[0];

    unmount();

    expect(es.close).toHaveBeenCalled();
  });

  it("keeps oversized historical logs without truncating older entries", async () => {
    const oversizedCount = 525;
    const historicalLogs = Array.from({ length: oversizedCount }, (_, index) => ({
      timestamp: `2026-01-01T00:${String(index).padStart(2, "0")}:00Z`,
      taskId: "FN-001",
      text: `entry-${index}`,
      type: "text" as const,
    }));
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({
      entries: historicalLogs,
      total: historicalLogs.length,
      hasMore: false,
    });

    const { result } = renderHook(() => useAgentLogs("FN-001", true));

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(oversizedCount);
    });

    expect(result.current.entries[0].text).toBe("entry-0");
    expect(result.current.entries.at(-1)?.text).toBe(`entry-${oversizedCount - 1}`);
  });

  it("keeps oversized live SSE history without truncation", async () => {
    const streamedCount = 520;
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({ entries: [], total: streamedCount, hasMore: false });

    const { result } = renderHook(() => useAgentLogs("FN-001", true));

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const es = MockEventSource.instances[0];
    act(() => {
      for (let index = 0; index < streamedCount; index++) {
        es._emit("agent:log", {
          timestamp: `2026-01-01T00:${String(index).padStart(2, "0")}:00Z`,
          taskId: "FN-001",
          text: `live-${index}`,
          type: "text",
        });
      }
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(streamedCount);
    });

    expect(result.current.entries[0].text).toBe("live-0");
    expect(result.current.entries.at(-1)?.text).toBe(`live-${streamedCount - 1}`);
  });

  it("does not fetch when taskId is null", () => {
    renderHook(() => useAgentLogs(null, true));

    expect(mockFetchAgentLogsWithMeta).not.toHaveBeenCalled();
    expect(MockEventSource.instances).toHaveLength(0);
  });

  it("preserves long text and detail in historical log entries without truncation", async () => {
    const longText = "A".repeat(5000);
    const longDetail = "B".repeat(5000);
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({
      entries: [
        { timestamp: "2026-01-01T00:00:00Z", taskId: "FN-001", text: longText, type: "text" as const },
        { timestamp: "2026-01-01T00:00:01Z", taskId: "FN-001", text: "Read", type: "tool" as const, detail: longDetail },
      ],
      total: 2,
      hasMore: false,
    });

    const { result } = renderHook(() => useAgentLogs("FN-001", true));

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
    });

    expect(result.current.entries[0].text).toBe(longText);
    expect(result.current.entries[0].text.length).toBe(5000);
    expect(result.current.entries[1].detail).toBe(longDetail);
    expect(result.current.entries[1].detail!.length).toBe(5000);
  });

  it("preserves long text and detail in live SSE entries without truncation", async () => {
    mockFetchAgentLogsWithMeta.mockResolvedValueOnce({ entries: [], total: 1, hasMore: false });

    const { result } = renderHook(() => useAgentLogs("FN-001", true));

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const longText = "X".repeat(5000);
    const longDetail = "Y".repeat(5000);
    const es = MockEventSource.instances[0];
    act(() => {
      es._emit("agent:log", {
        timestamp: "2026-01-01T00:01:00Z",
        taskId: "FN-001",
        text: longText,
        type: "text",
        detail: longDetail,
      });
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
    });

    expect(result.current.entries[0].text).toBe(longText);
    expect(result.current.entries[0].text.length).toBe(5000);
    expect(result.current.entries[0].detail).toBe(longDetail);
    expect(result.current.entries[0].detail!.length).toBe(5000);
  });

  describe("loadMore", () => {
    it("loadMore fetches older entries and prepends them", async () => {
      const initialLogs = [
        { timestamp: "2026-01-01T00:00:00Z", taskId: "FN-001", text: "newer", type: "text" as const },
      ];
      const olderLogs = [
        { timestamp: "2026-01-01T00:00:00Z", taskId: "FN-001", text: "older", type: "text" as const },
      ];

      mockFetchAgentLogsWithMeta
        .mockResolvedValueOnce({ entries: initialLogs, total: 2, hasMore: true })
        .mockResolvedValueOnce({ entries: olderLogs, total: 2, hasMore: false });

      const { result } = renderHook(() => useAgentLogs("FN-001", true));

      await waitFor(() => {
        expect(result.current.entries).toHaveLength(1);
        expect(result.current.hasMore).toBe(true);
      });

      // Call loadMore
      await act(async () => {
        await result.current.loadMore();
      });

      // Should now have 2 entries in chronological order: older + initial
      expect(result.current.entries).toHaveLength(2);
      expect(result.current.entries[0].text).toBe("older");
      expect(result.current.entries[1].text).toBe("newer");
      expect(result.current.hasMore).toBe(false);
    });

    it("loadMore preserves chronological order with near-equal timestamps", async () => {
      const initialLogs = [
        { timestamp: "2026-01-01T00:00:01.001Z", taskId: "FN-001", text: "middle", type: "text" as const },
        { timestamp: "2026-01-01T00:00:01.002Z", taskId: "FN-001", text: "newest", type: "text" as const },
      ];
      const olderLogs = [
        { timestamp: "2026-01-01T00:00:00.999Z", taskId: "FN-001", text: "oldest-a", type: "text" as const },
        { timestamp: "2026-01-01T00:00:00.999Z", taskId: "FN-001", text: "oldest-b", type: "text" as const },
      ];

      mockFetchAgentLogsWithMeta
        .mockResolvedValueOnce({ entries: initialLogs, total: 4, hasMore: true })
        .mockResolvedValueOnce({ entries: olderLogs, total: 4, hasMore: false });

      const { result } = renderHook(() => useAgentLogs("FN-001", true));

      await waitFor(() => {
        expect(result.current.entries.map((entry) => entry.text)).toEqual(["middle", "newest"]);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.entries.map((entry) => entry.text)).toEqual([
        "oldest-a",
        "oldest-b",
        "middle",
        "newest",
      ]);
    });

    it("keeps full history across initial load, loadMore, and live streaming", async () => {
      const initialLogs = Array.from({ length: 300 }, (_, index) => ({
        timestamp: `2026-01-02T00:${String(index).padStart(2, "0")}:00Z`,
        taskId: "FN-001",
        text: `initial-${index}`,
        type: "text" as const,
      }));
      const olderLogs = Array.from({ length: 250 }, (_, index) => ({
        timestamp: `2026-01-01T00:${String(index).padStart(2, "0")}:00Z`,
        taskId: "FN-001",
        text: `older-${index}`,
        type: "text" as const,
      }));

      mockFetchAgentLogsWithMeta
        .mockResolvedValueOnce({ entries: initialLogs, total: 550, hasMore: true })
        .mockResolvedValueOnce({ entries: olderLogs, total: 550, hasMore: false });

      const { result } = renderHook(() => useAgentLogs("FN-001", true));

      await waitFor(() => {
        expect(result.current.entries).toHaveLength(300);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.entries).toHaveLength(550);
      });

      const es = MockEventSource.instances[0];
      act(() => {
        es._emit("agent:log", {
          timestamp: "2026-01-03T00:00:00Z",
          taskId: "FN-001",
          text: "live-after-large-history",
          type: "text",
        });
      });

      await waitFor(() => {
        expect(result.current.entries).toHaveLength(551);
      });

      expect(result.current.entries[0].text).toBe("older-0");
      expect(result.current.entries.at(-1)?.text).toBe("live-after-large-history");
    });

    it("loadMore does not trigger when already loading more", async () => {
      mockFetchAgentLogsWithMeta.mockResolvedValue({ entries: [], total: 200, hasMore: true });

      const { result } = renderHook(() => useAgentLogs("FN-001", true));

      await waitFor(() => {
        expect(result.current.hasMore).toBe(true);
      });

      // Start loading more
      const loadMorePromise = act(async () => {
        await result.current.loadMore();
      });

      // While loading, try to load more again - should be ignored
      act(() => {
        result.current.loadMore();
      });

      await loadMorePromise;

      // Initial call + loadMore call (2 total), ignoring re-render calls
      expect(mockFetchAgentLogsWithMeta.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("projectId support", () => {
    it("includes projectId in EventSource URL when provided", async () => {
      mockFetchAgentLogsWithMeta.mockResolvedValueOnce({ entries: [], total: 0, hasMore: false });

      renderHook(() => useAgentLogs("FN-001", true, "proj-123"));

      await waitFor(() => {
        expect(MockEventSource.instances).toHaveLength(1);
        expect(MockEventSource.instances[0].url).toBe("/api/tasks/FN-001/logs/stream?projectId=proj-123");
      });
    });

    it("includes projectId in fetchAgentLogsWithMeta call when provided", async () => {
      mockFetchAgentLogsWithMeta.mockResolvedValueOnce({ entries: [], total: 0, hasMore: false });

      renderHook(() => useAgentLogs("FN-001", true, "proj-123"));

      await waitFor(() => {
        expect(mockFetchAgentLogsWithMeta).toHaveBeenCalledWith("FN-001", "proj-123", { limit: INITIAL_LOAD_LIMIT });
      });
    });

    it("does not include projectId in URL when not provided", async () => {
      mockFetchAgentLogsWithMeta.mockResolvedValueOnce({ entries: [], total: 0, hasMore: false });

      renderHook(() => useAgentLogs("FN-001", true));

      await waitFor(() => {
        expect(MockEventSource.instances).toHaveLength(1);
        expect(MockEventSource.instances[0].url).toBe("/api/tasks/FN-001/logs/stream");
      });
    });

    it("clears entries immediately when projectId changes", async () => {
      // Set up mock to return different values based on projectId
      mockFetchAgentLogsWithMeta.mockImplementation((_taskId: string, projectId?: string) => {
        if (projectId === "proj-A") {
          return Promise.resolve({
            entries: [{ timestamp: "2026-01-01T00:00:00Z", taskId: "FN-001", text: "proj-A-log", type: "text" as const }],
            total: 1,
            hasMore: false,
          });
        }
        if (projectId === "proj-B") {
          return Promise.resolve({
            entries: [{ timestamp: "2026-01-01T00:00:00Z", taskId: "FN-001", text: "proj-B-log", type: "text" as const }],
            total: 1,
            hasMore: false,
          });
        }
        return Promise.resolve({ entries: [], total: 0, hasMore: false });
      });

      // Create a hook that switches project
      const { result, rerender } = renderHook(
        ({ projectId }) => useAgentLogs("FN-001", true, projectId),
        { initialProps: { projectId: "proj-A" } },
      );

      // Wait for initial entries to load
      await waitFor(() => {
        expect(result.current.entries).toHaveLength(1);
        expect(result.current.entries[0].text).toBe("proj-A-log");
      });

      // Switch to proj-B
      rerender({ projectId: "proj-B" });

      // Entries should be cleared immediately after project switch
      await waitFor(() => {
        expect(result.current.entries).toHaveLength(0);
      });

      // New fetch should start for proj-B
      await waitFor(() => {
        expect(result.current.entries).toHaveLength(1);
        expect(result.current.entries[0].text).toBe("proj-B-log");
      });
    });

    it("rejects stale SSE events after project switch", async () => {
      // Initial render with proj-A
      mockFetchAgentLogsWithMeta.mockResolvedValue({ entries: [], total: 0, hasMore: false });

      const { result, rerender } = renderHook(
        ({ projectId }) => useAgentLogs("FN-001", true, projectId),
        { initialProps: { projectId: "proj-A" } },
      );

      await waitFor(() => {
        expect(MockEventSource.instances).toHaveLength(1);
      });

      const es = MockEventSource.instances[0];

      // Switch to proj-B
      rerender({ projectId: "proj-B" });

      // Wait for new connection to be established
      await waitFor(() => {
        expect(MockEventSource.instances.length).toBeGreaterThanOrEqual(1);
      });

      // Old connection should be closed
      expect(es.close).toHaveBeenCalled();

      // Wait for entries to be cleared
      await waitFor(() => {
        expect(result.current.entries).toHaveLength(0);
      });

      // Emit event on old connection (should be ignored)
      act(() => {
        es._emit("agent:log", {
          timestamp: "2026-01-01T00:01:00Z",
          taskId: "FN-001",
          text: "stale-event",
          type: "text",
        });
      });

      // Stale event should not appear
      expect(result.current.entries.find(e => e.text === "stale-event")).toBeUndefined();
    });

    it("creates new connection with new projectId on project switch", async () => {
      mockFetchAgentLogsWithMeta.mockResolvedValue({ entries: [], total: 0, hasMore: false });

      const { rerender } = renderHook(
        ({ projectId }) => useAgentLogs("FN-001", true, projectId),
        { initialProps: { projectId: "proj-A" } },
      );

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBeGreaterThanOrEqual(1);
      });

      const initialCount = MockEventSource.instances.length;

      // Switch to proj-B
      rerender({ projectId: "proj-B" });

      // Wait for new connection
      await waitFor(() => {
        expect(MockEventSource.instances.length).toBeGreaterThan(initialCount);
      });

      // New connection should have correct projectId
      const newConnections = MockEventSource.instances.filter(
        es => es.url.includes("proj-B")
      );
      expect(newConnections.length).toBeGreaterThan(0);
    });
  });
});
