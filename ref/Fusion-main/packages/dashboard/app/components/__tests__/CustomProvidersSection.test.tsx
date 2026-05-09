import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CustomProvidersSection } from "../CustomProvidersSection";

const mockFetchCustomProviders = vi.fn();
const mockAddCustomProvider = vi.fn();
const mockUpdateCustomProvider = vi.fn();
const mockDeleteCustomProvider = vi.fn();

vi.mock("../../api", () => ({
  fetchCustomProviders: (...args: unknown[]) => mockFetchCustomProviders(...args),
  addCustomProvider: (...args: unknown[]) => mockAddCustomProvider(...args),
  updateCustomProvider: (...args: unknown[]) => mockUpdateCustomProvider(...args),
  deleteCustomProvider: (...args: unknown[]) => mockDeleteCustomProvider(...args),
}));

vi.mock("lucide-react", () => ({
  AlertCircle: () => <svg data-testid="icon-alert" />,
  ChevronRight: () => <svg data-testid="icon-chevron-right" />,
  Loader2: ({ className }: { className?: string }) => <svg data-testid="icon-loader" className={className} />,
  Pencil: () => <svg data-testid="icon-pencil" />,
  Plus: () => <svg data-testid="icon-plus" />,
  Trash2: () => <svg data-testid="icon-trash" />,
}));

describe("CustomProvidersSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    mockFetchCustomProviders.mockResolvedValue([]);
    mockAddCustomProvider.mockResolvedValue({
      id: "test-id",
      name: "Test Provider",
      apiType: "openai-compatible",
      baseUrl: "https://api.example.com",
    });
    mockUpdateCustomProvider.mockResolvedValue({
      id: "test-id",
      name: "Updated",
      apiType: "openai-compatible",
      baseUrl: "https://api.example.com",
    });
    mockDeleteCustomProvider.mockResolvedValue({ success: true });
  });

  it("renders collapsed disclosure by default", () => {
    render(<CustomProvidersSection />);
    expect(screen.getByRole("button", { name: /Advanced: Custom Providers/i })).toBeTruthy();
    expect(screen.queryByText("No custom providers configured.")).toBeNull();
  });

  it("loads providers when disclosure is expanded", async () => {
    render(<CustomProvidersSection />);

    fireEvent.click(screen.getByRole("button", { name: /Advanced: Custom Providers/i }));

    await waitFor(() => {
      expect(mockFetchCustomProviders).toHaveBeenCalledTimes(1);
      expect(screen.getByText("No custom providers configured.")).toBeTruthy();
    });
  });

  it("fetches providers on mount when embedded", async () => {
    render(<CustomProvidersSection embedded />);

    await waitFor(() => {
      expect(mockFetchCustomProviders).toHaveBeenCalledTimes(1);
    });
  });

  it("adds a provider and refreshes list", async () => {
    mockFetchCustomProviders
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: "test-id",
          name: "Test Provider",
          apiType: "openai-compatible",
          baseUrl: "https://api.example.com",
        },
      ]);

    render(<CustomProvidersSection embedded />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Add Custom Provider/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Custom Provider/i }));

    fireEvent.change(screen.getByLabelText("Provider name"), { target: { value: "Test Provider" } });
    fireEvent.change(screen.getByLabelText("Base URL"), { target: { value: "https://api.example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Provider" }));

    await waitFor(() => {
      expect(mockAddCustomProvider).toHaveBeenCalledWith({
        name: "Test Provider",
        apiType: "openai-compatible",
        baseUrl: "https://api.example.com",
      });
      expect(screen.getByText("Test Provider")).toBeTruthy();
    });
  });

  it("shows validation errors for empty name and invalid baseUrl", async () => {
    render(<CustomProvidersSection embedded />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Add Custom Provider/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Custom Provider/i }));
    fireEvent.click(screen.getByRole("button", { name: "Save Provider" }));

    await waitFor(() => {
      expect(screen.getByText("Provider name is required.")).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText("Provider name"), { target: { value: "Name" } });
    fireEvent.change(screen.getByLabelText("Base URL"), { target: { value: "ftp://example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Provider" }));

    await waitFor(() => {
      expect(screen.getByText("Base URL must be a valid http/https URL.")).toBeTruthy();
    });
  });

  it("edits an existing provider", async () => {
    mockFetchCustomProviders
      .mockResolvedValueOnce([
        {
          id: "test-id",
          name: "Test Provider",
          apiType: "openai-compatible",
          baseUrl: "https://api.example.com",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "test-id",
          name: "Updated Provider",
          apiType: "openai-compatible",
          baseUrl: "https://api.updated.example.com",
        },
      ]);

    render(<CustomProvidersSection embedded />);

    await waitFor(() => {
      expect(screen.getByLabelText("Edit Test Provider")).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText("Edit Test Provider"));
    fireEvent.change(screen.getByLabelText("Provider name"), { target: { value: "Updated Provider" } });
    fireEvent.change(screen.getByLabelText("Base URL"), { target: { value: "https://api.updated.example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(mockUpdateCustomProvider).toHaveBeenCalledWith("test-id", {
        name: "Updated Provider",
        apiType: "openai-compatible",
        baseUrl: "https://api.updated.example.com",
      });
      expect(screen.getByText("Updated Provider")).toBeTruthy();
    });
  });

  it("deletes provider after confirmation", async () => {
    mockFetchCustomProviders
      .mockResolvedValueOnce([
        {
          id: "test-id",
          name: "Test Provider",
          apiType: "openai-compatible",
          baseUrl: "https://api.example.com",
        },
      ])
      .mockResolvedValueOnce([]);

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<CustomProvidersSection embedded />);

    await waitFor(() => {
      expect(screen.getByLabelText("Delete Test Provider")).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText("Delete Test Provider"));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockDeleteCustomProvider).toHaveBeenCalledWith("test-id");
      expect(screen.getByText("No custom providers configured.")).toBeTruthy();
    });
  });

  it("shows load error when fetchCustomProviders fails", async () => {
    mockFetchCustomProviders.mockRejectedValueOnce(new Error("load failed"));
    render(<CustomProvidersSection />);

    fireEvent.click(screen.getByRole("button", { name: /Advanced: Custom Providers/i }));

    await waitFor(() => {
      expect(screen.getByText("load failed")).toBeTruthy();
    });
  });

  it("shows save error when addCustomProvider fails", async () => {
    mockAddCustomProvider.mockRejectedValueOnce(new Error("add failed"));
    render(<CustomProvidersSection embedded />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Add Custom Provider/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Custom Provider/i }));
    fireEvent.change(screen.getByLabelText("Provider name"), { target: { value: "Test Provider" } });
    fireEvent.change(screen.getByLabelText("Base URL"), { target: { value: "https://api.example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Provider" }));

    await waitFor(() => {
      expect(screen.getByText("add failed")).toBeTruthy();
    });
  });
});
