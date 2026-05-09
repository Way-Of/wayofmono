import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const contextBridge = {
    exposeInMainWorld: vi.fn(),
  };

  const ipcRenderer = {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  };

  return { contextBridge, ipcRenderer };
});

vi.mock("electron", () => ({
  contextBridge: mocks.contextBridge,
  ipcRenderer: mocks.ipcRenderer,
}));

async function importPreloadModule() {
  await import("../preload.ts");
}

function getExposed<T = unknown>(name: string): T | undefined {
  return mocks.contextBridge.exposeInMainWorld.mock.calls.find(([key]) => key === name)?.[1] as T | undefined;
}

describe("preload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("exposes electronAPI and fusionShell", async () => {
    await importPreloadModule();

    expect(getExposed("electronAPI")).toBeTruthy();
    expect(getExposed("fusionAPI")).toBeTruthy();
    expect(getExposed("fusionShell")).toBeTruthy();
  });

  it("electronAPI delegates getServerPort to IPC", async () => {
    await importPreloadModule();
    const api = getExposed<{ getServerPort: () => Promise<number | undefined> }>("electronAPI");

    await api?.getServerPort();

    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("app:getServerPort");
  });

  it("electronAPI launch mode methods delegate to IPC", async () => {
    await importPreloadModule();
    const api = getExposed<{
      getDesktopLaunchMode: () => Promise<string>;
      getDesktopLaunchContext: () => Promise<unknown>;
      setDesktopLaunchMode: (mode: "choose" | "local" | "remote") => Promise<string>;
      openConnectionManager: () => Promise<void>;
    }>("electronAPI");

    await api?.getDesktopLaunchMode();
    await api?.getDesktopLaunchContext();
    await api?.setDesktopLaunchMode("local");
    await api?.openConnectionManager();

    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("desktopLaunchMode:getMode");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("desktopLaunchMode:getContext");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("desktopLaunchMode:setMode", "local");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:openConnectionManager");
  });

  it("fusionShell delegates connection-management methods to IPC", async () => {
    await importPreloadModule();
    const shell = getExposed<{
      getState: () => Promise<unknown>;
      listProfiles: () => Promise<unknown>;
      saveProfile: (profile: { name: string; serverUrl: string; authToken?: string | null }) => Promise<unknown>;
      deleteProfile: (profileId: string) => Promise<void>;
      setActiveProfile: (profileId: string | null) => Promise<unknown>;
      getDesktopModeState: () => Promise<unknown>;
      setDesktopMode: (mode: "local" | "remote") => Promise<unknown>;
      startQrScan: () => Promise<unknown>;
      openConnectionManager: () => Promise<void>;
      subscribe: (listener: (state: unknown) => void) => () => void;
    }>("fusionShell");

    await shell?.getState();
    await shell?.listProfiles();
    await shell?.saveProfile({ name: "Prod", serverUrl: "https://fusion.example.com", authToken: "token" });
    await shell?.deleteProfile("p1");
    await shell?.setActiveProfile("p1");
    await shell?.getDesktopModeState();
    await shell?.setDesktopMode("local");
    await shell?.startQrScan();
    await shell?.openConnectionManager();

    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:getState");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:listProfiles");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:saveProfile", {
      name: "Prod",
      serverUrl: "https://fusion.example.com",
      authToken: "token",
    });
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:deleteProfile", "p1");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:setActiveProfile", "p1");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:getDesktopModeState");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:setDesktopMode", "local");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:startQrScan");
    expect(mocks.ipcRenderer.invoke).toHaveBeenCalledWith("shell:openConnectionManager");

    const unsubscribe = shell?.subscribe(() => undefined);
    expect(mocks.ipcRenderer.on).toHaveBeenCalledWith("shell:state", expect.any(Function));

    unsubscribe?.();

    expect(mocks.ipcRenderer.removeListener).toHaveBeenCalledWith("shell:state", expect.any(Function));
  });
});
