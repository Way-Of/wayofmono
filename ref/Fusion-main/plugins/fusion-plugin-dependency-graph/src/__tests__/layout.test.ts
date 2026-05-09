import { describe, expect, it } from "vitest";
import type { GraphData } from "../types";
import { computeAutoLayout } from "../layout";

function graph(nodeIds: string[], edges: Array<{ source: string; target: string }> = []): GraphData {
  return {
    nodes: nodeIds.map((id) => ({ task: { id } as never })),
    edges,
  };
}

describe("computeAutoLayout", () => {
  it("returns empty map for empty graph", () => {
    expect(computeAutoLayout({ nodes: [], edges: [] }).size).toBe(0);
  });

  it("positions single node", () => {
    const positions = computeAutoLayout(graph(["A"]));
    expect(positions.has("A")).toBe(true);
  });

  it("places linear chain in increasing depth", () => {
    const positions = computeAutoLayout(graph(["A", "B", "C"], [
      { source: "A", target: "B" },
      { source: "B", target: "C" },
    ]));

    expect((positions.get("C")?.y ?? 0)).toBeLessThan(positions.get("B")?.y ?? 0);
    expect((positions.get("B")?.y ?? 0)).toBeLessThan(positions.get("A")?.y ?? 0);
  });

  it("spreads wide layer horizontally", () => {
    const positions = computeAutoLayout(graph(["A", "B", "C"]));
    const xs = [positions.get("A")?.x, positions.get("B")?.x, positions.get("C")?.x].filter((x): x is number => x !== undefined);
    expect(new Set(xs).size).toBe(3);
  });

  it("handles diamond dependencies", () => {
    const positions = computeAutoLayout(graph(["A", "B", "C", "D"], [
      { source: "A", target: "B" },
      { source: "A", target: "C" },
      { source: "B", target: "D" },
      { source: "C", target: "D" },
    ]));

    expect((positions.get("D")?.y ?? 0)).toBeLessThan(positions.get("B")?.y ?? 0);
    expect((positions.get("D")?.y ?? 0)).toBeLessThan(positions.get("C")?.y ?? 0);
    expect((positions.get("B")?.y ?? 0)).toBeLessThan(positions.get("A")?.y ?? 0);
    expect((positions.get("C")?.y ?? 0)).toBeLessThan(positions.get("A")?.y ?? 0);
  });

  it("handles cycles without crashing", () => {
    const positions = computeAutoLayout(graph(["A", "B"], [
      { source: "A", target: "B" },
      { source: "B", target: "A" },
    ]));

    expect(positions.size).toBe(2);
  });

  it("respects custom spacing options", () => {
    const positions = computeAutoLayout(graph(["A", "B"]), {
      nodeWidth: 200,
      nodeHeight: 120,
      horizontalGap: 100,
      verticalGap: 20,
    });
    expect(Math.abs((positions.get("A")?.x ?? 0) - (positions.get("B")?.x ?? 0))).toBe(300);
  });
});
