import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { useGraphInteraction } from "../useGraphInteraction";

function createKeyEvent(
  key: string,
  options?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; target?: EventTarget | null },
) {
  return {
    key,
    ctrlKey: Boolean(options?.ctrlKey),
    metaKey: Boolean(options?.metaKey),
    shiftKey: Boolean(options?.shiftKey),
    target: options?.target ?? document.createElement("div"),
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent;
}

describe("useGraphInteraction", () => {
  it("starts with default pan/zoom", () => {
    const { result } = renderHook(() => useGraphInteraction());
    expect(result.current.zoom).toBe(1);
    expect(result.current.zoomPercent).toBe(100);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
  });

  it("clamps zoom between 0.1 and 3", () => {
    const { result } = renderHook(() => useGraphInteraction());

    act(() => {
      for (let i = 0; i < 100; i += 1) result.current.zoomOut();
    });
    expect(result.current.zoom).toBe(0.1);

    act(() => {
      for (let i = 0; i < 100; i += 1) result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(3);
  });

  it("keeps wheel zoom anchored to cursor position", () => {
    const { result } = renderHook(() => useGraphInteraction());

    act(() => {
      result.current.onWheelZoom(-120, { x: 200, y: 150 }, 800, 600);
    });

    expect(result.current.zoom).toBe(1.1);
    expect(result.current.pan.x).toBeCloseTo(-20, 5);
    expect(result.current.pan.y).toBeCloseTo(-15, 5);
  });

  it("supports pinch zoom with stationary midpoint", () => {
    const { result } = renderHook(() => useGraphInteraction());

    act(() => {
      result.current.onPointerDown(1, { x: 100, y: 100 });
      result.current.onPointerDown(2, { x: 200, y: 100 });
      result.current.onPointerMove(2, { x: 250, y: 100 }, 800, 600);
    });

    expect(result.current.zoom).toBe(1.5);
    expect(result.current.pan).toEqual({ x: -50, y: -50 });
  });

  it("applies animation state for fit and reset", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGraphInteraction());

    act(() => {
      result.current.fitToGraph(new Map([["A", { x: 0, y: 0 }]]), 800, 600);
    });
    expect(result.current.transitioning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(210);
    });
    expect(result.current.transitioning).toBe(false);

    act(() => {
      result.current.resetView();
    });
    expect(result.current.transitioning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(210);
    });
    expect(result.current.transitioning).toBe(false);
    vi.useRealTimers();
  });

  it("fits wide graph", () => {
    const { result } = renderHook(() => useGraphInteraction());
    act(() => {
      result.current.fitToGraph(new Map([
        ["A", { x: 0, y: 0 }],
        ["B", { x: 2000, y: 0 }],
      ]), 800, 600);
    });

    expect(result.current.zoom).toBeLessThan(1);
  });

  it("handles keyboard shortcuts for zoom in/out, reset, fit, and escape", () => {
    const { result } = renderHook(() => useGraphInteraction());
    const positions = new Map([
      ["A", { x: 0, y: 0 }],
      ["B", { x: 500, y: 200 }],
    ]);

    act(() => {
      result.current.handleKeyDown(createKeyEvent("=", { ctrlKey: true }), 800, 600, positions);
    });
    expect(result.current.zoom).toBe(1.2);

    act(() => {
      result.current.handleKeyDown(createKeyEvent("-", { ctrlKey: true }), 800, 600, positions);
    });
    expect(result.current.zoom).toBeCloseTo(1, 5);

    act(() => {
      result.current.handleKeyDown(createKeyEvent("F", { ctrlKey: true, shiftKey: true }), 800, 600, positions, { nodeWidth: 280, nodeHeight: 100 });
    });
    expect(result.current.zoom).toBeLessThan(1);

    act(() => {
      result.current.handleKeyDown(createKeyEvent("0", { ctrlKey: true }), 800, 600, positions);
    });
    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });

    act(() => {
      result.current.zoomIn();
      result.current.handleKeyDown(createKeyEvent("Escape"), 800, 600, positions);
    });
    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
  });

  it("does not run shortcuts when focused on editable targets", () => {
    const { result } = renderHook(() => useGraphInteraction());
    const input = document.createElement("input");
    const positions = new Map([["A", { x: 0, y: 0 }]]);

    act(() => {
      result.current.handleKeyDown(createKeyEvent("=", { ctrlKey: true, target: input }), 800, 600, positions);
    });

    expect(result.current.zoom).toBe(1);
  });

  it("resets when positions are empty", () => {
    const { result } = renderHook(() => useGraphInteraction());

    act(() => {
      result.current.zoomIn();
      result.current.onPointerDown(1, { x: 10, y: 10 });
      result.current.onPointerMove(1, { x: 110, y: 60 }, 800, 600);
      result.current.onPointerUp(1);
      result.current.fitToGraph(new Map(), 800, 600);
    });

    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
  });
});
