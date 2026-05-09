import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildMobileShellHandoff } from "../plugins/shell-handoff.js";

const state = {
  activeProfileId: null as string | null,
  profiles: [] as Array<{ id: string; name: string; serverUrl: string; authToken?: string | null; createdAt: string; updatedAt: string; lastUsedAt?: string | null }>,
};

vi.mock("../plugins/connection-profiles.js", () => ({
  loadShellProfiles: vi.fn(async () => state),
  listShellProfiles: vi.fn(async () => state.profiles),
  saveShellProfile: vi.fn(async (profile: { name: string; serverUrl: string; authToken?: string | null }) => {
    const saved = {
      id: "p1",
      name: profile.name,
      serverUrl: profile.serverUrl,
      authToken: profile.authToken ?? null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      lastUsedAt: null,
    };
    state.profiles = [saved];
    return saved;
  }),
  deleteShellProfile: vi.fn(async () => {
    state.profiles = [];
    state.activeProfileId = null;
  }),
  setActiveShellProfile: vi.fn(async (profileId: string | null) => {
    state.activeProfileId = profileId;
    return state;
  }),
}));

describe("MobileNativeShellBridge", () => {
  const scanner = { scanConnection: vi.fn(async () => ({ serverUrl: "https://fusion.example.com", authToken: null })) };

  beforeEach(() => {
    state.activeProfileId = null;
    state.profiles = [];
    scanner.scanConnection.mockClear();
    vi.resetModules();
  });

  it("emits state updates to subscribers", async () => {
    const { MobileNativeShellBridge } = await import("../plugins/native-shell.js");
    const bridge = new MobileNativeShellBridge(scanner as never);
    const listener = vi.fn();

    const unsubscribe = bridge.subscribe(listener);
    await bridge.saveProfile({ name: "Prod", serverUrl: "https://fusion.example.com" });

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("dispatches shell open manager event", async () => {
    const { MobileNativeShellBridge } = await import("../plugins/native-shell.js");
    const bridge = new MobileNativeShellBridge(scanner as never);
    const listener = vi.fn();
    const originalWindow = (globalThis as { window?: Window }).window;
    const mockWindow = new EventTarget() as Window;
    (globalThis as { window?: Window }).window = mockWindow;
    mockWindow.addEventListener("shell:open-connection-manager", listener as EventListener);

    await bridge.openConnectionManager();

    expect(listener).toHaveBeenCalledTimes(1);
    (globalThis as { window?: Window }).window = originalWindow;
  });

  it("returns state and listProfiles from persisted storage", async () => {
    const { MobileNativeShellBridge } = await import("../plugins/native-shell.js");
    const bridge = new MobileNativeShellBridge(scanner as never);

    const profile = await bridge.saveProfile({ name: "Prod", serverUrl: "https://fusion.example.com" });
    await bridge.setActiveProfile(profile.id);

    const stateSnapshot = await bridge.getState();
    const profiles = await bridge.listProfiles();

    expect(stateSnapshot.host).toBe("mobile-shell");
    expect(stateSnapshot.activeProfileId).toBe(profile.id);
    expect(profiles).toHaveLength(1);
    expect(profiles[0]?.id).toBe(profile.id);
  });

  it("supports QR onboarding handoff with optional auth token", async () => {
    scanner.scanConnection.mockResolvedValueOnce({ serverUrl: "https://fusion.example.com", authToken: "token-123" });
    const { MobileNativeShellBridge } = await import("../plugins/native-shell.js");
    const bridge = new MobileNativeShellBridge(scanner as never);

    const scan = await bridge.startQrScan();
    const saved = await bridge.saveProfile({ name: "QR Remote", serverUrl: scan.serverUrl, authToken: scan.authToken ?? null });
    const state = await bridge.setActiveProfile(saved.id);
    const handoff = buildMobileShellHandoff(state);

    expect(scan).toEqual({ serverUrl: "https://fusion.example.com", authToken: "token-123" });
    expect(handoff.kind).toBe("remote-launch");
    if (handoff.kind === "remote-launch") {
      const url = new URL(handoff.url);
      expect(url.searchParams.get("profileId")).toBe(saved.id);
      expect(url.searchParams.get("token")).toBe("token-123");
    }
  });

  it("rejects desktop mode switch", async () => {
    const { MobileNativeShellBridge } = await import("../plugins/native-shell.js");
    const bridge = new MobileNativeShellBridge(scanner as never);

    await expect(bridge.setDesktopMode("local")).rejects.toThrow("Desktop mode is not supported");
  });
});
