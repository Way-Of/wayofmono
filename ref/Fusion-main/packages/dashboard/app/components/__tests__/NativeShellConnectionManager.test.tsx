import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NativeShellConnectionManager } from "../NativeShellConnectionManager";

function createShellApi() {
  return {
    getState: vi.fn(),
    listProfiles: vi.fn(),
    saveProfile: vi.fn(async (input?: { id?: string }) => ({
      id: input?.id ?? "p2",
      name: "Prod",
      serverUrl: "https://fusion.example.com",
      createdAt: "",
      updatedAt: "",
    })),
    deleteProfile: vi.fn(async () => undefined),
    setActiveProfile: vi.fn(async () => ({ host: "mobile-shell", activeProfileId: "p1", profiles: [] })),
    setDesktopMode: vi.fn(async () => ({ host: "desktop-shell", desktopMode: "remote", activeProfileId: null, profiles: [] })),
    startQrScan: vi.fn(async () => ({ serverUrl: "https://qr.example.com", authToken: "token" })),
    openConnectionManager: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
  };
}

describe("NativeShellConnectionManager", () => {
  it("switches desktop mode", async () => {
    const shellApi = createShellApi();
    render(
      <NativeShellConnectionManager
        open={true}
        shellApi={shellApi}
        shellState={{ host: "desktop-shell", desktopMode: "remote", activeProfileId: null, profiles: [] }}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Local"));
    await waitFor(() => expect(shellApi.setDesktopMode).toHaveBeenCalledWith("local"));
  });

  it("shows active profile indicator and requires delete confirmation", async () => {
    const shellApi = createShellApi();
    render(
      <NativeShellConnectionManager
        open={true}
        shellApi={shellApi}
        shellState={{ host: "mobile-shell", activeProfileId: "p1", profiles: [{ id: "p1", name: "Prod", serverUrl: "https://fusion.example.com", authToken: null, createdAt: "", updatedAt: "" }] }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Delete Prod"));
    expect(screen.getByRole("alertdialog", { name: "Delete server confirmation" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(shellApi.deleteProfile).toHaveBeenCalledWith("p1");
    });
  });

  it("edits and saves active profile", async () => {
    const shellApi = createShellApi();
    render(
      <NativeShellConnectionManager
        open={true}
        shellApi={shellApi}
        shellState={{ host: "mobile-shell", activeProfileId: "p1", profiles: [{ id: "p1", name: "Prod", serverUrl: "https://fusion.example.com", authToken: null, createdAt: "", updatedAt: "" }] }}
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("https://fusion.example.com"), { target: { value: "https://next.example.com" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(shellApi.saveProfile).toHaveBeenCalledWith(expect.objectContaining({ id: "p1", serverUrl: "https://next.example.com" }));
      expect(shellApi.setActiveProfile).toHaveBeenCalledWith("p1");
    });
  });

  it("supports empty-state recovery and QR import", async () => {
    const shellApi = createShellApi();
    render(
      <NativeShellConnectionManager
        open={true}
        shellApi={shellApi}
        shellState={{ host: "mobile-shell", activeProfileId: null, profiles: [] }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("No remote servers saved yet.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByText("Scan QR")[0]!);

    await waitFor(() => {
      expect(shellApi.startQrScan).toHaveBeenCalled();
      expect(screen.getByDisplayValue("https://qr.example.com")).toBeInTheDocument();
    });
  });
});
