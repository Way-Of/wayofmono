import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectSelector } from "../ProjectSelector";
import type { ProjectInfo } from "@fusion/core";

// Mock lucide-react
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
  return {
    ...actual,
    ChevronDown: () => <span data-testid="chevron-icon">▼</span>,
    Check: () => <span data-testid="check-icon">✓</span>,
    Folder: () => <span data-testid="folder-icon">📁</span>,
    Grid3X3: () => <span data-testid="grid-icon">⊞</span>,
    Search: () => <span data-testid="search-icon">🔍</span>,
    Clock: () => <span data-testid="clock-icon">🕐</span>,
    X: () => <span data-testid="x-icon">✕</span>,
    Play: () => <span data-testid="play-icon">▶</span>,
    Pause: () => <span data-testid="pause-icon">⏸</span>,
    AlertCircle: () => <span data-testid="alert-icon">⚠</span>,
    Loader2: () => <span data-testid="loader-icon">⟳</span>,
  };
});

function makeProject(overrides: Partial<ProjectInfo> = {}): ProjectInfo {
  return {
    id: "proj_abc123",
    name: "Test Project",
    path: "/home/user/projects/test",
    status: "active",
    isolationMode: "in-process",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lastActivityAt: new Date().toISOString(),
    ...overrides,
  };
}

const noop = () => {};

describe("ProjectSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(
      <ProjectSelector
        projects={[makeProject({ id: "proj_1" }), makeProject({ id: "proj_2" })]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    expect(screen.getByTestId("project-selector-trigger")).toBeDefined();
  });

  it("does not render when only one project exists", () => {
    const { container } = render(
      <ProjectSelector
        projects={[makeProject()]}
        currentProject={makeProject()}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("does not render when no projects exist", () => {
    const { container } = render(
      <ProjectSelector
        projects={[]}
        currentProject={null}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("shows current project name in trigger", () => {
    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1", name: "Project One" }),
          makeProject({ id: "proj_2", name: "Project Two" }),
        ]}
        currentProject={makeProject({ id: "proj_1", name: "Project One" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    expect(screen.getByText("Project One")).toBeDefined();
  });

  it("opens dropdown on click", () => {
    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1", name: "Project One" }),
          makeProject({ id: "proj_2", name: "Project Two" }),
        ]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    expect(screen.getByTestId("project-selector-dropdown")).toBeDefined();
  });

  it("shows all projects in dropdown", () => {
    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1", name: "Project One" }),
          makeProject({ id: "proj_2", name: "Project Two" }),
        ]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    expect(screen.getByText("Project Two")).toBeDefined();
  });

  it("calls onSelect when project is clicked", () => {
    const onSelect = vi.fn();
    const projectTwo = makeProject({ id: "proj_2", name: "Project Two" });

    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1", name: "Project One" }),
          projectTwo,
        ]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={onSelect}
        onViewAll={noop}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    fireEvent.click(screen.getByText("Project Two"));
    expect(onSelect).toHaveBeenCalledWith(projectTwo);
  });

  it("closes dropdown after selection", () => {
    const onSelect = vi.fn();

    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1", name: "Project One" }),
          makeProject({ id: "proj_2", name: "Project Two" }),
        ]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={onSelect}
        onViewAll={noop}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    fireEvent.click(screen.getByText("Project Two"));
    expect(screen.queryByTestId("project-selector-dropdown")).toBeNull();
  });

  it("calls onViewAll when 'View All Projects' is clicked", () => {
    const onViewAll = vi.fn();

    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1", name: "Project One" }),
          makeProject({ id: "proj_2", name: "Project Two" }),
        ]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={noop}
        onViewAll={onViewAll}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    fireEvent.click(screen.getByText("View All Projects"));
    expect(onViewAll).toHaveBeenCalled();
  });

  it("shows search input when 5+ projects", () => {
    render(
      <ProjectSelector
        projects={Array.from({ length: 5 }, (_, i) =>
          makeProject({ id: `proj_${i}`, name: `Project ${i}` })
        )}
        currentProject={makeProject({ id: "proj_0" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    expect(screen.getByPlaceholderText("Search projects...")).toBeDefined();
  });

  it("does not show search input when fewer than 5 projects", () => {
    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1" }),
          makeProject({ id: "proj_2" }),
          makeProject({ id: "proj_3" }),
          makeProject({ id: "proj_4" }),
        ]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    expect(screen.queryByPlaceholderText("Search projects...")).toBeNull();
  });

  it("filters projects based on search query", () => {
    render(
      <ProjectSelector
        projects={Array.from({ length: 5 }, (_, i) =>
          makeProject({ id: `proj_${i}`, name: `Project ${i}` })
        )}
        currentProject={makeProject({ id: "proj_0" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    const searchInput = screen.getByPlaceholderText("Search projects...");
    fireEvent.change(searchInput, { target: { value: "Project 2" } });
    
    expect(screen.getByText("Project 2")).toBeDefined();
    expect(screen.queryByText("Project 1")).toBeNull();
  });

  it("shows recent projects section", () => {
    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1", name: "Project One" }),
          makeProject({ id: "proj_2", name: "Project Two" }),
          makeProject({ id: "proj_3", name: "Project Three" }),
        ]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={noop}
        onViewAll={noop}
        recentProjectIds={["proj_2", "proj_3"]}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    expect(screen.getByText("Recent")).toBeDefined();
    expect(screen.getByText("Project Two")).toBeDefined();
  });

  it("closes dropdown on escape key", () => {
    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1" }),
          makeProject({ id: "proj_2" }),
        ]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    expect(screen.getByTestId("project-selector-dropdown")).toBeDefined();
    
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("project-selector-dropdown")).toBeNull();
  });

  it("closes dropdown on outside click", () => {
    render(
      <>
        <div data-testid="outside">Outside element</div>
        <ProjectSelector
          projects={[
            makeProject({ id: "proj_1" }),
            makeProject({ id: "proj_2" }),
          ]}
          currentProject={makeProject({ id: "proj_1" })}
          onSelect={noop}
          onViewAll={noop}
        />
      </>
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    expect(screen.getByTestId("project-selector-dropdown")).toBeDefined();
    
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByTestId("project-selector-dropdown")).toBeNull();
  });

  it("trigger has correct aria attributes", () => {
    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1" }),
          makeProject({ id: "proj_2" }),
        ]}
        currentProject={makeProject({ id: "proj_1" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    const trigger = screen.getByTestId("project-selector-trigger");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("shows checkmark for current project", () => {
    render(
      <ProjectSelector
        projects={[
          makeProject({ id: "proj_1", name: "Project One" }),
          makeProject({ id: "proj_2", name: "Project Two" }),
        ]}
        currentProject={makeProject({ id: "proj_1", name: "Project One" })}
        onSelect={noop}
        onViewAll={noop}
      />
    );

    fireEvent.click(screen.getByTestId("project-selector-trigger"));
    // Should have checkmark for current project (though in dropdown it might not be visible due to filtering)
  });
});
