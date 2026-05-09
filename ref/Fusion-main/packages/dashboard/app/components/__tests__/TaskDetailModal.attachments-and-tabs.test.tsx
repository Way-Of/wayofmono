import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  makeTask,
  noop,
  noopDelete,
  noopMerge,
  noopMove,
  noopOpenDetail,
  mockConfirm,
  mockUsePluginUiSlots,
  expectBaseRule,
  getCssRuleBlock,
  readDashboardStylesSource,
  setupTaskDetailModalHooks,
} from "./TaskDetailModal.test-helpers";
import { TaskDetailModal, TaskDetailContent } from "../TaskDetailModal";

setupTaskDetailModalHooks();

describe("TaskDetailModal", () => {
  describe("paste image upload", () => {
    it("uploads an image when pasting clipboard image data", async () => {
      const { uploadAttachment } = await import("../../api");
      const mockUpload = vi.mocked(uploadAttachment);
      const mockAttachment = {
        filename: "abc123.png",
        originalName: "image.png",
        size: 1024,
        mimeType: "image/png",
        createdAt: "2026-01-01T00:00:00Z",
      };
      mockUpload.mockResolvedValueOnce(mockAttachment);
      const addToast = vi.fn();

      render(
        <TaskDetailModal
          task={makeTask()}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={addToast}
        />,
      );

      const imageFile = new File(["fake-image"], "image.png", { type: "image/png" });
      const pasteEvent = new Event("paste", { bubbles: true }) as any;
      pasteEvent.clipboardData = {
        items: [
          {
            type: "image/png",
            getAsFile: () => imageFile,
          },
        ],
      };

      await act(async () => {
        document.dispatchEvent(pasteEvent);
      });

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith("FN-099", imageFile, undefined);
        expect(addToast).toHaveBeenCalledWith("Screenshot attached", "success");
      });
    });

    it("does not intercept paste events without image data", async () => {
      const { uploadAttachment } = await import("../../api");
      const mockUpload = vi.mocked(uploadAttachment);
      mockUpload.mockClear();

      render(
        <TaskDetailModal
          task={makeTask()}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      const pasteEvent = new Event("paste", { bubbles: true }) as any;
      pasteEvent.clipboardData = {
        items: [
          {
            type: "text/plain",
            getAsFile: () => null,
          },
        ],
      };

      await act(async () => {
        document.dispatchEvent(pasteEvent);
      });

      expect(mockUpload).not.toHaveBeenCalled();
    });

    it("shows uploading state during paste upload", async () => {
      const { uploadAttachment } = await import("../../api");
      const mockUpload = vi.mocked(uploadAttachment);
      let resolveUpload!: (value: any) => void;
      mockUpload.mockResolvedValueOnce(
        new Promise((resolve) => {
          resolveUpload = resolve;
        }) as any,
      );

      render(
        <TaskDetailModal
          task={makeTask()}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      const imageFile = new File(["fake"], "shot.png", { type: "image/png" });
      const pasteEvent = new Event("paste", { bubbles: true }) as any;
      pasteEvent.clipboardData = {
        items: [{ type: "image/png", getAsFile: () => imageFile }],
      };

      act(() => {
        document.dispatchEvent(pasteEvent);
      });

      // While uploading, button should show "Uploading…"
      await waitFor(() => {
        expect(screen.getByText("Uploading…")).toBeTruthy();
      });

      await act(async () => {
        resolveUpload({
          filename: "x.png",
          originalName: "shot.png",
          size: 100,
          mimeType: "image/png",
          createdAt: "2026-01-01T00:00:00Z",
        });
      });

      await waitFor(() => {
        expect(screen.getByText("Attach Screenshot")).toBeTruthy();
      });
    });
  });

  describe("drag and drop image upload", () => {
    it("uploads an image when dropped onto the modal", async () => {
      const { uploadAttachment } = await import("../../api");
      const mockUpload = vi.mocked(uploadAttachment);
      const mockAttachment = {
        filename: "drop123.png",
        originalName: "dropped.png",
        size: 2048,
        mimeType: "image/png",
        createdAt: "2026-01-01T00:00:00Z",
      };
      mockUpload.mockResolvedValueOnce(mockAttachment);
      const addToast = vi.fn();

      const { container } = render(
        <TaskDetailModal
          task={makeTask()}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={addToast}
        />,
      );

      const modal = container.querySelector(".task-detail-content")!;
      const imageFile = new File(["fake-image"], "dropped.png", { type: "image/png" });

      await act(async () => {
        fireEvent.drop(modal, {
          dataTransfer: {
            files: [imageFile],
          },
        });
      });

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith("FN-099", imageFile, undefined);
        expect(addToast).toHaveBeenCalledWith("Screenshot attached", "success");
      });
    });
  });

  it("renders (no dependencies) when dependencies is empty", () => {
    render(
      <TaskDetailModal
        task={makeTask({ dependencies: [] })}
        onClose={noop}
        onMoveTask={noopMove}
        onDeleteTask={noopDelete}
        onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
        addToast={noop}
      />,
    );

    expect(screen.getByText("(no dependencies)")).toBeTruthy();
  });

  it("renders dependency list when dependencies exist", () => {
    const allTasks: Task[] = [
      { id: "FN-001", title: "First dependency", description: "Desc 1", column: "todo" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "", updatedAt: "" },
      { id: "FN-002", title: "Second dependency", description: "Desc 2", column: "todo" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "", updatedAt: "" },
    ];

    render(
      <TaskDetailModal
        task={makeTask({ dependencies: ["FN-001", "FN-002"] })}
        tasks={allTasks}
        onClose={noop}
        onMoveTask={noopMove}
        onDeleteTask={noopDelete}
        onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
        addToast={noop}
      />,
    );

    // Check that dependency IDs are rendered
    const depIds = document.querySelectorAll(".detail-dep-id");
    expect(depIds).toHaveLength(2);
    expect(depIds[0].textContent).toBe("FN-001");
    expect(depIds[1].textContent).toBe("FN-002");

    // Check that dependency labels (titles) are rendered
    const depLabels = document.querySelectorAll(".detail-dep-label");
    expect(depLabels).toHaveLength(2);
    expect(depLabels[0].textContent).toBe("First dependency");
    expect(depLabels[1].textContent).toBe("Second dependency");

    expect(screen.queryByText("(no dependencies)")).toBeNull();
  });

  it("can add a dependency via the dropdown", async () => {
    const { updateTask } = await import("../../api");
    const allTasks: Task[] = [
      { id: "FN-001", description: "Dep 1", column: "todo" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "", updatedAt: "" },
      { id: "FN-099", description: "Self", column: "in-progress" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "", updatedAt: "" },
    ];

    render(
      <TaskDetailModal
        task={makeTask({ dependencies: [] })}
        tasks={allTasks}
        onClose={noop}
        onMoveTask={noopMove}
        onDeleteTask={noopDelete}
        onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
        addToast={noop}
      />,
    );

    fireEvent.click(screen.getByText("Add Dependency"));
    // Should show KB-001 in the dropdown but not KB-099 (self is excluded)
    const dropdown = document.querySelector(".dep-dropdown")!;
    expect(dropdown).toBeTruthy();
    expect(dropdown.textContent).toContain("FN-001");
    expect(dropdown.querySelectorAll(".dep-dropdown-item")).toHaveLength(1);

    fireEvent.click(screen.getByText("FN-001"));

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith("FN-099", { dependencies: ["FN-001"] }, undefined);
    });
  });

  it("can remove a dependency", async () => {
    const { updateTask } = await import("../../api");

    render(
      <TaskDetailModal
        task={makeTask({ dependencies: ["FN-001", "FN-002"] })}
        onClose={noop}
        onMoveTask={noopMove}
        onDeleteTask={noopDelete}
        onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
        addToast={noop}
      />,
    );

    const removeButtons = screen.getAllByTitle(/Remove dependency/);
    fireEvent.click(removeButtons[0]); // Remove KB-001

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith("FN-099", { dependencies: ["FN-002"] }, undefined);
    });
  });

  it("wraps in-review PR content in a spaced detail section after dependencies", () => {
    const { container } = render(
      <TaskDetailModal
        task={makeTask({ column: "in-review", status: "creating-pr", dependencies: ["FN-001"] })}
        onClose={noop}
        onMoveTask={noopMove}
        onDeleteTask={noopDelete}
        onMergeTask={noopMerge}
        onOpenDetail={noopOpenDetail}
        addToast={noop}
      />,
    );

    const depsSection = container.querySelector(".detail-deps");
    const prSection = container.querySelector(".detail-pr-section");

    expect(depsSection).toBeTruthy();
    expect(prSection).toBeTruthy();
    expect(depsSection?.nextElementSibling).toBe(prSection);
    expect(prSection?.querySelector(".pr-section")).toBeTruthy();
  });

  it("defines tokenized margin on detail-pr-section spacing contract", () => {
    const css = readDashboardStylesSource();
    expectBaseRule(css, ".detail-pr-section", "margin-top: var(--space-lg);");
  });

  it("activity list does not have nested scroll constraints", () => {
    const { container } = render(
      <TaskDetailModal
        task={makeTask({
          log: [
            { timestamp: "2026-01-01T00:00:00Z", action: "Created task" },
            { timestamp: "2026-01-01T00:01:00Z", action: "Started work" },
            { timestamp: "2026-01-01T00:02:00Z", action: "Completed step 1" },
          ],
        })}
        onClose={noop}
        onMoveTask={noopMove}
        onDeleteTask={noopDelete}
        onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
        addToast={noop}
      />,
    );

    // Click Logs tab — Activity is the default subview
    fireEvent.click(screen.getByText("Logs"));

    const activityList = container.querySelector(".detail-activity-list");
    expect(activityList).toBeTruthy();
    const style = (activityList as HTMLElement).style;
    expect(style.overflowY).not.toBe("auto");
    expect(style.maxHeight).toBe("");
  });

  it("renders dependency dropdown items sorted newest-first by createdAt", () => {
    const allTasks: Task[] = [
      { id: "FN-001", description: "Oldest", column: "todo" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
      { id: "FN-003", description: "Newest", column: "todo" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "2026-03-01T00:00:00Z", updatedAt: "2026-03-01T00:00:00Z" },
      { id: "FN-002", description: "Middle", column: "todo" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "2026-02-01T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z" },
      { id: "FN-099", description: "Self", column: "in-progress" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "2026-03-15T00:00:00Z", updatedAt: "2026-03-15T00:00:00Z" },
    ];

    render(
      <TaskDetailModal
        task={makeTask({ dependencies: [] })}
        tasks={allTasks}
        onClose={noop}
        onMoveTask={noopMove}
        onDeleteTask={noopDelete}
        onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
        addToast={noop}
      />,
    );

    fireEvent.click(screen.getByText("Add Dependency"));
    const items = document.querySelectorAll(".dep-dropdown-item");
    expect(items).toHaveLength(3);

    const ids = Array.from(items).map((el) => el.querySelector(".dep-dropdown-id")?.textContent);
    expect(ids).toEqual(["FN-003", "FN-002", "FN-001"]);
  });

  it("renders tasks with identical createdAt sorted newest-ID-first in dependency dropdown", () => {
    const allTasks: Task[] = [
      { id: "FN-001", description: "First", column: "todo" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
      { id: "FN-002", description: "Second", column: "todo" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
      { id: "FN-003", description: "Third", column: "todo" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
      { id: "FN-099", description: "Self", column: "in-progress" as Column, dependencies: [], steps: [], currentStep: 0, log: [], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
    ];

    render(
      <TaskDetailModal
        task={makeTask({ dependencies: [] })}
        tasks={allTasks}
        onClose={noop}
        onMoveTask={noopMove}
        onDeleteTask={noopDelete}
        onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
        addToast={noop}
      />,
    );

    fireEvent.click(screen.getByText("Add Dependency"));
    const items = document.querySelectorAll(".dep-dropdown-item");
    expect(items).toHaveLength(3);

    const ids = Array.from(items).map((el) => el.querySelector(".dep-dropdown-id")?.textContent);
    expect(ids).toEqual(["FN-003", "FN-002", "FN-001"]);
  });

  describe("tab toggle", () => {
    it("defaults to the Definition tab", () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({ prompt: "# Hello\n\nContent" })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      expect(screen.getByText("Definition")).toBeTruthy();
      expect(screen.getByText("Logs")).toBeTruthy();
      // Activity and Agent Log are subviews inside the Logs tab, not top-level tabs
      // They should NOT be visible on the Definition tab
      expect(screen.queryByText("Activity")).toBeNull();
      expect(screen.queryByText("Agent Log")).toBeNull();
      // Definition content should be visible
      expect(container.querySelector(".markdown-body")).toBeTruthy();
      // Activity section should NOT be visible initially
      expect(container.querySelector(".detail-activity")).toBeNull();
      // Agent log viewer should not be visible
      expect(container.querySelector("[data-testid='agent-log-viewer']")).toBeNull();

      // After clicking Logs tab, the subview toggle buttons should appear
      fireEvent.click(screen.getByText("Logs"));
      const logSubviewToggle = container.querySelector(".log-subview-toggle");
      expect(logSubviewToggle).toBeTruthy();
      expect(logSubviewToggle!.textContent).toContain("Activity");
      expect(logSubviewToggle!.textContent).toContain("Agent Log");
    });

    it("switches to Activity subview via Logs tab and shows activity feed", () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({
            prompt: "# Hello\n\nContent",
            log: [
              { timestamp: "2026-01-01T00:00:00Z", action: "Created task" },
            ],
          })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Click Logs tab — Activity is the default subview
      fireEvent.click(screen.getByText("Logs"));

      // Activity section should be visible
      expect(container.querySelector(".detail-activity")).toBeTruthy();
      // Activity list should be visible
      expect(container.querySelector(".detail-activity-list")).toBeTruthy();
      // Definition content should be hidden
      expect(container.querySelector(".markdown-body")).toBeNull();
    });

    it("Activity subview renders log entries correctly", () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({
            log: [
              { timestamp: "2026-01-01T00:00:00Z", action: "Created task" },
              { timestamp: "2026-01-01T00:01:00Z", action: "Started work", outcome: "Success" },
              { timestamp: "2026-01-01T00:02:00Z", action: "Completed step 1" },
            ],
          })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Click Logs tab — Activity is the default subview
      fireEvent.click(screen.getByText("Logs"));

      const activityList = container.querySelector(".detail-activity-list");
      expect(activityList).toBeTruthy();

      // Check log entries are rendered (in reverse order - newest first)
      const logEntries = container.querySelectorAll(".detail-log-entry");
      expect(logEntries).toHaveLength(3);

      // Most recent entry should be first
      expect(logEntries[0].textContent).toContain("Completed step 1");
      expect(logEntries[1].textContent).toContain("Started work");
      expect(logEntries[1].textContent).toContain("Success"); // outcome
      expect(logEntries[2].textContent).toContain("Created task");
    });

    it("Activity subview keeps action/outcome rendering intact", () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({
            log: [
              { timestamp: "2026-01-01T00:01:00Z", action: "Started work", outcome: "Step completed successfully" },
              { timestamp: "2026-01-01T00:00:00Z", action: "Created task" },
            ],
          })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      fireEvent.click(screen.getByText("Logs"));

      const actions = container.querySelectorAll(".detail-log-action");
      const outcomes = container.querySelectorAll(".detail-log-outcome");
      expect(actions).toHaveLength(2);
      expect(outcomes).toHaveLength(1);
      expect(Array.from(actions).map((entry) => entry.textContent)).toEqual(["Created task", "Started work"]);
      expect(outcomes[0].textContent).toBe("Step completed successfully");
    });

    it("Activity timeline CSS keeps action/outcome high-contrast and timestamp secondary", () => {
      const stylesCssText = readDashboardStylesSource();
      expect(stylesCssText).toContain(".detail-log-action");

      const actionRule = getCssRuleBlock(stylesCssText, ".detail-log-action");
      const outcomeRule = getCssRuleBlock(stylesCssText, ".detail-log-outcome");
      const timestampRule = getCssRuleBlock(stylesCssText, ".detail-log-timestamp");

      expect(actionRule).toContain("color: var(--text);");
      expect(outcomeRule).toContain("color: var(--text);");
      expect(outcomeRule).toContain("background: var(--surface);");
      expect(timestampRule).toContain("color: var(--text-muted);");
      expect(timestampRule).not.toContain("color: var(--text);");
    });

    it("Activity subview shows empty state when no logs", () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({ log: [] })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Click Logs tab — Activity is the default subview
      fireEvent.click(screen.getByText("Logs"));

      // Activity section should be visible
      expect(container.querySelector(".detail-activity")).toBeTruthy();
      // Empty state should be shown
      expect(container.querySelector(".detail-log-empty")).toBeTruthy();
      expect(screen.getByText("(no activity)")).toBeTruthy();
      // Activity list should NOT be present when empty
      expect(container.querySelector(".detail-activity-list")).toBeNull();
    });

    it("can switch between all tabs and Logs subviews", () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({
            prompt: "# Hello\n\nContent",
            log: [{ timestamp: "2026-01-01T00:00:00Z", action: "Test" }],
          })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Start on Definition tab
      expect(container.querySelector(".markdown-body")).toBeTruthy();
      expect(container.querySelector(".detail-activity")).toBeNull();

      // Switch to Logs tab (Activity subview is default)
      fireEvent.click(screen.getByText("Logs"));
      expect(container.querySelector(".detail-activity")).toBeTruthy();
      expect(container.querySelector(".markdown-body")).toBeNull();

      // Switch to Agent Log subview within Logs tab
      fireEvent.click(screen.getByText("Agent Log"));
      expect(container.querySelector("[data-testid='agent-log-viewer']")).toBeTruthy();
      expect(container.querySelector(".detail-activity")).toBeNull();

      // Switch back to Activity subview within Logs tab
      fireEvent.click(screen.getByText("Activity"));
      expect(container.querySelector(".detail-activity")).toBeTruthy();
      expect(container.querySelector("[data-testid='agent-log-viewer']")).toBeNull();

      // Switch to Comments tab
      fireEvent.click(screen.getByText("Comments"));
      expect(screen.getByPlaceholderText(/Add a comment/)).toBeTruthy();
      expect(container.querySelector(".detail-activity")).toBeNull();

      // Switch back to Definition tab
      fireEvent.click(screen.getByText("Definition"));
      expect(container.querySelector(".markdown-body")).toBeTruthy();
      expect(container.querySelector(".detail-activity")).toBeNull();

    });

    it("switches to Agent Log subview via Logs tab and back", async () => {
      const { useAgentLogs } = await import("../../hooks/useAgentLogs");
      const mockUseAgentLogs = vi.mocked(useAgentLogs);

      const { container } = render(
        <TaskDetailModal
          task={makeTask({ prompt: "# Hello\n\nContent" })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Click Logs tab, then Agent Log subview
      fireEvent.click(screen.getByText("Logs"));
      fireEvent.click(screen.getByText("Agent Log"));

      // Agent log viewer should appear
      expect(container.querySelector("[data-testid='agent-log-viewer']")).toBeTruthy();
      // Definition content should be hidden
      expect(container.querySelector(".markdown-body")).toBeNull();

      // Click Definition tab to go back
      fireEvent.click(screen.getByText("Definition"));

      // Definition content should reappear
      expect(container.querySelector(".markdown-body")).toBeTruthy();
      expect(container.querySelector("[data-testid='agent-log-viewer']")).toBeNull();
    });

    it("passes enabled=true to useAgentLogs only when Logs → Agent Log subview is active", async () => {
      const { useAgentLogs } = await import("../../hooks/useAgentLogs");
      const mockUseAgentLogs = vi.mocked(useAgentLogs);
      mockUseAgentLogs.mockClear();

      const { rerender } = render(
        <TaskDetailModal
          task={makeTask()}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Default: Definition tab active → enabled should be false
      const initialCall = mockUseAgentLogs.mock.calls[mockUseAgentLogs.mock.calls.length - 1];
      expect(initialCall[1]).toBe(false);

      // Switch to Logs tab (Activity subview is default) — enabled should still be false
      fireEvent.click(screen.getByText("Logs"));
      const afterLogsClick = mockUseAgentLogs.mock.calls[mockUseAgentLogs.mock.calls.length - 1];
      expect(afterLogsClick[1]).toBe(false);

      // Switch to Agent Log subview — enabled should become true
      fireEvent.click(screen.getByText("Agent Log"));
      const afterAgentLog = mockUseAgentLogs.mock.calls[mockUseAgentLogs.mock.calls.length - 1];
      expect(afterAgentLog[1]).toBe(true);
    });

    it("switches to Comments tab", async () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({ prompt: "# Hello\n\nContent" })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Click Comments tab
      fireEvent.click(screen.getByText("Comments"));

      // Comments content should appear
      const headings = screen.getAllByText("Comments");
      expect(headings.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByPlaceholderText(/Add a comment/)).toBeTruthy();
      // Definition content should be hidden
      expect(container.querySelector(".markdown-body")).toBeNull();
    });

    it("shows correct top-level tabs including Logs", async () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask()}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // For an in-progress task (no workflow steps, no merge commit), the
      // top-level tabs are: Definition, Logs, Changes, Review, Comments,
      // Documents, Model, Workflow, Stats, Routing.
      const tabTexts = ["Definition", "Logs", "Changes", "Review", "Comments", "Documents", "Model", "Workflow", "Stats", "Routing"];
      const tabs = screen.getAllByRole("button").filter((b) =>
        tabTexts.includes(b.textContent || "")
      );
      expect(tabs.length).toBe(10);
      expect(tabs[0].textContent).toBe("Definition");
      expect(tabs[1].textContent).toBe("Logs");
      expect(tabs[2].textContent).toBe("Changes");
      expect(tabs[3].textContent).toBe("Review");
      expect(tabs[4].textContent).toBe("Comments");
      expect(tabs[5].textContent).toBe("Documents");
      expect(tabs[6].textContent).toBe("Model");
      expect(tabs[7].textContent).toBe("Workflow");
      expect(tabs[8].textContent).toBe("Stats");
      expect(tabs[9].textContent).toBe("Routing");

      // Activity and Agent Log are NOT top-level tabs (they are subviews inside Logs)
      expect(container.querySelectorAll(".detail-tab").length).toBe(10);
      // Workflow tab should always appear even when no workflow steps are configured
      expect(screen.getByText("Workflow")).toBeInTheDocument();
      // Commits tab should NOT appear for non-done tasks
      expect(screen.queryByText("Commits")).toBeNull();
    });
  });

  describe("Agent Log full-height layout", () => {
    it("applies detail-body--agent-log class when Logs → Agent Log subview is active", () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({ prompt: "# Hello\n\nContent" })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Initially, detail-body should NOT have the agent-log modifier
      expect(container.querySelector(".detail-body--agent-log")).toBeNull();

      // Switch to Logs tab, then Agent Log subview
      fireEvent.click(screen.getByText("Logs"));
      expect(container.querySelector(".detail-body--agent-log")).toBeNull(); // Activity subview default

      fireEvent.click(screen.getByText("Agent Log"));

      // detail-body should now have the agent-log modifier class
      expect(container.querySelector(".detail-body--agent-log")).toBeTruthy();

      // Switch back to Definition tab
      fireEvent.click(screen.getByText("Definition"));

      // modifier class should be removed
      expect(container.querySelector(".detail-body--agent-log")).toBeNull();
    });

    it("wraps AgentLogViewer in detail-section--agent-log class", () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({ prompt: "# Hello\n\nContent" })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Switch to Logs tab, then Agent Log subview
      fireEvent.click(screen.getByText("Logs"));
      fireEvent.click(screen.getByText("Agent Log"));

      // The section wrapping AgentLogViewer should have the full-height class
      const section = container.querySelector(".detail-section--agent-log");
      expect(section).toBeTruthy();
      expect(section!.querySelector("[data-testid='agent-log-viewer']")).toBeTruthy();
    });

    it("does not apply detail-body--agent-log when editing", () => {
      const { container } = render(
        <TaskDetailModal
          task={makeTask({ column: "triage", prompt: "# Hello\n\nContent" })}
          onClose={noop}
          onMoveTask={noopMove}
          onDeleteTask={noopDelete}
          onMergeTask={noopMerge}
          onOpenDetail={noopOpenDetail}
          addToast={noop}
        />,
      );

      // Switch to Logs tab, then Agent Log subview first
      fireEvent.click(screen.getByText("Logs"));
      fireEvent.click(screen.getByText("Agent Log"));
      expect(container.querySelector(".detail-body--agent-log")).toBeTruthy();

      // Now enter edit mode via the pencil button in the header
      const editBtn = screen.getByLabelText("Edit task");
      fireEvent.click(editBtn);

      // The detail-body--agent-log class should be removed while editing
      expect(container.querySelector(".detail-body--agent-log")).toBeNull();
    });
  });


});
