import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Task } from "@fusion/core";
import { DependencyGraph } from "../DependencyGraph";

const fitToGraph = vi.fn();
const zoomIn = vi.fn();
const zoomOut = vi.fn();
const resetView = vi.fn();
const handleKeyDown = vi.fn();

vi.mock("@fusion/dashboard/app/components/TaskCard", () => ({
  TaskCard: ({ task, onOpenDetail, disableDrag }: { task: Task; onOpenDetail: (task: Task) => void; disableDrag?: boolean }) => (
    <button data-testid={`task-${task.id}`} draggable={!disableDrag} onClick={() => onOpenDetail(task)}>{task.id}</button>
  ),
}));

vi.mock("../useGraphInteraction", () => ({
  useGraphInteraction: () => ({
    transform: "translate(0px, 0px) scale(1)",
    zoom: 1,
    transitioning: false,
    zoomIn,
    zoomOut,
    resetView,
    fitToGraph,
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
    onWheelZoom: vi.fn(),
    handleKeyDown,
  }),
}));

function createTask(id: string, column: Task["column"], dependencies: string[] = []): Task {
  return { id, description: id, column, dependencies, steps: [], currentStep: 0, log: [] } as Task;
}

describe("DependencyGraph", () => {
  beforeEach(() => {
    fitToGraph.mockReset();
    zoomIn.mockReset();
    zoomOut.mockReset();
    resetView.mockReset();
    handleKeyDown.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders empty state for empty list", () => {
    render(<DependencyGraph tasks={[]} onOpenTaskDetail={vi.fn()} />);
    expect(screen.getByText(/No active tasks/i)).toBeTruthy();
  });

  it("renders only triage/todo/in-progress/in-review nodes from mixed columns", () => {
    render(
      <DependencyGraph
        tasks={[
          createTask("A", "triage"),
          createTask("B", "todo"),
          createTask("C", "in-progress"),
          createTask("D", "in-review"),
          createTask("E", "done"),
          createTask("F", "archived"),
        ]}
        onOpenTaskDetail={vi.fn()}
      />,
    );

    expect(screen.getByTestId("graph-task-node-A")).toBeTruthy();
    expect(screen.getByTestId("graph-task-node-B")).toBeTruthy();
    expect(screen.getByTestId("graph-task-node-C")).toBeTruthy();
    expect(screen.getByTestId("graph-task-node-D")).toBeTruthy();
    expect(screen.queryByTestId("graph-task-node-E")).toBeNull();
    expect(screen.queryByTestId("graph-task-node-F")).toBeNull();
  });

  it("auto-fits on initial load with active tasks", () => {
    render(<DependencyGraph tasks={[createTask("A", "todo")]} onOpenTaskDetail={vi.fn()} />);
    expect(fitToGraph).toHaveBeenCalled();
  });

  it("forwards keyboard events to interaction hook", () => {
    render(<DependencyGraph tasks={[createTask("A", "todo")]} onOpenTaskDetail={vi.fn()} />);
    const viewport = document.querySelector(".dependency-graph__viewport");
    if (!viewport) throw new Error("missing viewport");
    fireEvent.keyDown(viewport, { key: "=", ctrlKey: true });
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it("sets viewport tabIndex for keyboard focus", () => {
    render(<DependencyGraph tasks={[createTask("A", "todo")]} onOpenTaskDetail={vi.fn()} />);
    const viewport = document.querySelector(".dependency-graph__viewport");
    expect(viewport?.getAttribute("tabindex")).toBe("0");
  });

  it("renders toolbar controls", () => {
    render(<DependencyGraph tasks={[createTask("A", "todo")]} onOpenTaskDetail={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fit to graph" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset view" })).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("fit-to-graph button triggers fitToGraph", () => {
    render(<DependencyGraph tasks={[createTask("A", "todo")]} onOpenTaskDetail={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Fit to graph" }));
    expect(fitToGraph).toHaveBeenCalled();
  });

  it("clicking a card triggers onOpenDetail exactly once", () => {
    const onOpenDetail = vi.fn();
    render(<DependencyGraph tasks={[createTask("A", "in-progress")]} onOpenDetail={onOpenDetail} />);
    fireEvent.click(screen.getByTestId("task-A"));
    expect(onOpenDetail).toHaveBeenCalledTimes(1);
    expect(onOpenDetail).toHaveBeenCalledWith(expect.objectContaining({ id: "A" }));
  });

  it("falls back to onOpenTaskDetail when onOpenDetail is not provided", () => {
    const onOpenTaskDetail = vi.fn();
    render(<DependencyGraph tasks={[createTask("A", "in-progress")]} onOpenTaskDetail={onOpenTaskDetail} />);
    fireEvent.click(screen.getByTestId("task-A"));
    expect(onOpenTaskDetail).toHaveBeenCalledWith("A");
  });
});
