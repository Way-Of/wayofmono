import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEvals } from "../useEvals";

const mockListEvals = vi.fn();
const mockGetEval = vi.fn();
const mockListEvalRuns = vi.fn();

vi.mock("../../api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api")>();
  return {
    ...actual,
    listEvals: (...args: unknown[]) => mockListEvals(...args),
    getEval: (...args: unknown[]) => mockGetEval(...args),
    listEvalRuns: (...args: unknown[]) => mockListEvalRuns(...args),
  };
});

describe("useEvals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mockListEvals.mockResolvedValue({ results: [], count: 0 });
    mockListEvalRuns.mockResolvedValue({ runs: [] });
    mockGetEval.mockResolvedValue({ result: { id: "ER-1", runId: "RUN-1", taskId: "FN-1", taskSnapshot: { title: "Task" }, categoryScores: [], evidence: [], followUps: [], createdAt: new Date().toISOString() } });
  });

  it("propagates filters and normalizes list/detail payloads", async () => {
    mockListEvals.mockResolvedValue({
      items: [{ evalId: "ER-1", batchId: "RUN-1", taskSnapshot: { taskId: "FN-1", title: "Task One" }, overallScore: 0.72, maxScore: 1, scores: { categories: [{ category: "quality", score: 0.8, maxScore: 1 }] }, timestamp: "2026-05-01T00:00:00.000Z" }],
      count: 1,
    });
    mockGetEval.mockResolvedValue({
      result: { id: "ER-1", runId: "RUN-1", taskId: "FN-1", taskSnapshot: { title: "Task One" }, categoryScores: [], details: { evidence: [{ label: "Task", source: "task" }] }, recommendations: { followUps: [{ id: "FU-1", title: "Follow up", description: "d", reason: "r", suggestedState: "suggested", evidence: [] }] }, rationale: "because", createdAt: "2026-05-01T00:00:00.000Z" },
    });

    const { result } = renderHook(() => useEvals({ projectId: "p1" }));

    await waitFor(() => {
      expect(result.current.results[0]).toMatchObject({ id: "ER-1", runId: "RUN-1", taskId: "FN-1", taskTitle: "Task One" });
    });

    act(() => result.current.setFilters((prev) => ({ ...prev, q: "fn-1", runId: "RUN-1", scoreMin: "0.5", scoreMax: "1" })));

    await waitFor(() => {
      expect(mockListEvals).toHaveBeenLastCalledWith({ q: "fn-1", runId: "RUN-1", scoreMin: 0.5, scoreMax: 1, limit: 100, offset: 0 }, "p1");
    });

    act(() => result.current.setSelectedEvalId("ER-1"));
    await waitFor(() => {
      expect(result.current.selectedEval).toMatchObject({ id: "ER-1", rationale: "because" });
      expect(result.current.selectedEval?.evidence).toHaveLength(1);
      expect(result.current.selectedEval?.followUps).toHaveLength(1);
    });
  });

  it("clears selection when refreshed list no longer contains selected eval", async () => {
    mockListEvals
      .mockResolvedValueOnce({ results: [{ id: "ER-1", runId: "RUN-1", taskId: "FN-1", taskSnapshot: { title: "A" }, categoryScores: [], evidence: [], followUps: [], createdAt: "2026-05-01T00:00:00.000Z" }], count: 1 })
      .mockResolvedValueOnce({ results: [], count: 0 });

    const { result } = renderHook(() => useEvals({ projectId: "p1" }));

    await waitFor(() => expect(result.current.results).toHaveLength(1));
    act(() => result.current.setSelectedEvalId("ER-1"));
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.selectedEvalId).toBeNull();
  });

  it("ignores stale responses from older requests", async () => {
    let firstResolve: ((value: unknown) => void) | null = null;
    mockListEvals
      .mockReturnValueOnce(new Promise((resolve) => { firstResolve = resolve; }))
      .mockResolvedValueOnce({ results: [{ id: "ER-NEW", runId: "RUN-2", taskId: "FN-2", taskSnapshot: { title: "New" }, categoryScores: [], evidence: [], followUps: [], createdAt: "2026-05-02T00:00:00.000Z" }], count: 1 });

    const { result } = renderHook(() => useEvals({ projectId: "p1" }));

    act(() => {
      void result.current.refresh();
    });
    await act(async () => {
      await result.current.refresh();
    });
    await act(async () => {
      firstResolve?.({ results: [{ id: "ER-OLD", runId: "RUN-1", taskId: "FN-1", taskSnapshot: { title: "Old" }, categoryScores: [], evidence: [], followUps: [], createdAt: "2026-05-01T00:00:00.000Z" }], count: 1 });
      await Promise.resolve();
    });

    expect(result.current.results[0]?.id).toBe("ER-NEW");
  });

  it("registers 15-second polling interval", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    const { unmount } = renderHook(() => useEvals({ projectId: "p1" }));

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 15_000);
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it("surfaces API errors in error state", async () => {
    mockListEvals.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useEvals({ projectId: "p1" }));

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
      expect(result.current.loading).toBe(false);
    });
  });
});
