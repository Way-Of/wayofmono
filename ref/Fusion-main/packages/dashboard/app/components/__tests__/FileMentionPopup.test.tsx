import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileMentionPopup } from "../FileMentionPopup";
import type { FileSearchItem } from "../../hooks/useFileMention";

// Mock lucide-react
vi.mock("lucide-react", () => ({
  File: ({ size }: { size: number }) => (
    <span data-testid="file-icon">File(size={size})</span>
  ),
}));

describe("FileMentionPopup", () => {
  const defaultProps = {
    visible: true,
    position: { top: 100, left: 50 },
    files: [] as FileSearchItem[],
    selectedIndex: 0,
    onSelect: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when not visible", () => {
    const { container } = render(<FileMentionPopup {...defaultProps} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders loading state", () => {
    render(<FileMentionPopup {...defaultProps} loading={true} />);

    const loadingEl = screen.getByTestId("file-mention-loading");
    expect(loadingEl).toBeInTheDocument();
  });

  it("renders empty state when no files", () => {
    render(<FileMentionPopup {...defaultProps} loading={false} />);

    const emptyEl = screen.getByTestId("file-mention-empty");
    expect(emptyEl).toBeInTheDocument();
    expect(emptyEl).toHaveTextContent("No files found");
  });

  it("renders file list with correct items", () => {
    const files: FileSearchItem[] = [
      { path: "src/index.ts", name: "index.ts" },
      { path: "src/app.ts", name: "app.ts" },
    ];

    render(<FileMentionPopup {...defaultProps} files={files} loading={false} />);

    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("index.ts");
    expect(items[1]).toHaveTextContent("app.ts");
  });

  it("shows selected state on correct item", () => {
    const files: FileSearchItem[] = [
      { path: "src/index.ts", name: "index.ts" },
      { path: "src/app.ts", name: "app.ts" },
    ];

    render(<FileMentionPopup {...defaultProps} files={files} selectedIndex={1} loading={false} />);

    const items = screen.getAllByRole("option");
    expect(items[0]).not.toHaveClass("file-mention-popup-item--selected");
    expect(items[1]).toHaveClass("file-mention-popup-item--selected");
  });

  it("calls onSelect when item is clicked", () => {
    const files: FileSearchItem[] = [
      { path: "src/index.ts", name: "index.ts" },
    ];
    const onSelect = vi.fn();

    render(
      <FileMentionPopup {...defaultProps} files={files} onSelect={onSelect} loading={false} />,
    );

    const item = screen.getByRole("option");
    item.click();

    expect(onSelect).toHaveBeenCalledWith({ path: "src/index.ts", name: "index.ts" });
  });

  it("renders file icon for each item", () => {
    const files: FileSearchItem[] = [
      { path: "src/index.ts", name: "index.ts" },
    ];

    render(<FileMentionPopup {...defaultProps} files={files} loading={false} />);

    const icons = screen.getAllByTestId("file-icon");
    expect(icons).toHaveLength(1);
  });

  it("shows directory path for nested files", () => {
    const files: FileSearchItem[] = [
      { path: "src/components/Button.tsx", name: "Button.tsx" },
    ];

    render(<FileMentionPopup {...defaultProps} files={files} loading={false} />);

    const pathEl = screen.getByText("src/components/");
    expect(pathEl).toBeInTheDocument();
  });

  it("does not show directory path for root files", () => {
    const files: FileSearchItem[] = [
      { path: "app.ts", name: "app.ts" },
    ];

    render(<FileMentionPopup {...defaultProps} files={files} loading={false} />);

    const pathEl = screen.queryByText(/^src\//);
    expect(pathEl).not.toBeInTheDocument();
  });

  it("renders with correct position styles", () => {
    const { container } = render(
      <FileMentionPopup {...defaultProps} position={{ top: 200, left: 100 }} />,
    );

    const popup = container.firstChild as HTMLElement;
    expect(popup.style.top).toBe("200px");
    expect(popup.style.left).toBe("100px");
  });

  it("renders correct number of items for multiple files", () => {
    const files: FileSearchItem[] = [
      { path: "a.ts", name: "a.ts" },
      { path: "b.ts", name: "b.ts" },
      { path: "c.ts", name: "c.ts" },
    ];

    render(<FileMentionPopup {...defaultProps} files={files} loading={false} />);

    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(3);
  });
});