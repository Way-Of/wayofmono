import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import type { Task } from "@fusion/core";
import { DependencyGraph } from "../DependencyGraph";
import { GraphTaskNode } from "../GraphTaskNode";
import { useGraphInteraction } from "../useGraphInteraction";

vi.mock("@fusion/dashboard/app/components/TaskCard", () => ({
  TaskCard: ({ task, onOpenDetail }: { task: Task; onOpenDetail: (task: Task) => void }) => (
    <button data-testid={`task-${task.id}`} onClick={() => onOpenDetail(task)}>
      {task.id} {task.column === "in-progress" ? "Executing" : "Idle"}
    </button>
  ),
}));

function createTask(id: string, column: Task["column"] = "todo", dependencies: string[] = []): Task {
  return {
    id,
    description: id,
    column,
    dependencies,
    steps: [{ name: "one", status: "in-progress" }],
    currentStep: 0,
    status: column === "in-progress" ? "executing" : "queued",
    log: [],
  } as Task;
}

afterEach(() => {
  cleanup();
});

describe("dependency graph interactions", () => {
  it("supports pan and zoom via interaction hook", () => {
    const { result } = renderHook(() => useGraphInteraction());

    act(() => {
      result.current.onPointerDown(1, { x: 10, y: 10 });
      result.current.onPointerMove(1, { x: 110, y: 60 }, 800, 600);
      result.current.zoomIn();
    });

    expect(result.current.pan).toEqual({ x: 100, y: 50 });
    expect(result.current.zoom).toBeGreaterThan(1);
  });

  it("fit-to-graph computes bounds from actual node positions", () => {
    const { result } = renderHook(() => useGraphInteraction());
    const positions = new Map([
      ["A", { x: 0, y: 0 }],
      ["B", { x: 1000, y: 400 }],
    ]);

    act(() => {
      result.current.fitToGraph(positions, 800, 600, { nodeWidth: 200, nodeHeight: 100, xGap: 40, yGap: 40 });
    });

    expect(result.current.zoom).toBeCloseTo(0.6, 3);
    expect(result.current.pan.x).toBeCloseTo(40, 3);
    expect(result.current.pan.y).toBeCloseTo(150, 3);
  });

  it("clicking a node opens task detail", () => {
    const onOpenDetail = vi.fn();
    render(<DependencyGraph tasks={[createTask("A", "in-progress")]} onOpenDetail={onOpenDetail} />);

    fireEvent.click(screen.getByTestId("task-A"));
    expect(onOpenDetail).toHaveBeenCalledTimes(1);
    expect(onOpenDetail).toHaveBeenCalledWith(expect.objectContaining({ id: "A" }));
    expect(screen.getAllByText(/Executing/).length).toBeGreaterThan(0);
  });

  it("dragging a node updates its position", () => {
    const onNodePositionChange = vi.fn();

    render(
      <GraphTaskNode
        task={createTask("A")}
        position={{ x: 0, y: 0 }}
        scale={1}
        isHighlighted={false}
        isDimmed={false}
        onNodePositionChange={onNodePositionChange}
        onNodeDragStateChange={vi.fn()}
        projectId="p1"
        onOpenDetail={vi.fn()}
        addToast={vi.fn()}
        onUpdateTask={vi.fn()}
        onArchiveTask={vi.fn()}
        onUnarchiveTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onRetryTask={vi.fn()}
        onOpenDetailWithTab={vi.fn()}
        onMoveTask={vi.fn()}
        onOpenMission={vi.fn()}
        taskStuckTimeoutMs={1_000}
        lastFetchTimeMs={Date.now()}
        workflowStepNameLookup={new Map()}
      />,
    );

    const node = screen.getByTestId("graph-task-node-A");
    fireEvent.pointerDown(node, { pointerId: 1, clientX: 10, clientY: 10, isPrimary: true });
    fireEvent.pointerMove(node, { pointerId: 1, clientX: 25, clientY: 30, isPrimary: true });

    expect(onNodePositionChange).toHaveBeenCalled();
  });

  it("highlights upstream/downstream chain on hover", () => {
    render(
      <DependencyGraph
        tasks={[createTask("A"), createTask("B", "todo", ["A"]), createTask("C", "todo", ["B"]), createTask("D")]}
        onOpenDetail={vi.fn()}
      />,
    );

    fireEvent.mouseEnter(screen.getByTestId("graph-task-node-C"));
    expect(screen.getByTestId("graph-task-node-A").className).toContain("graph-task-node--highlighted");
    expect(screen.getByTestId("graph-task-node-D").className).toContain("graph-task-node--dimmed");
  });
});
