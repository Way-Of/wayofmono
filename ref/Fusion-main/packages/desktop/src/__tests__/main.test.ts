import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock renderer module - must be hoisted before importing main
const rendererMocks = vi.hoisted(() => {
  const getRendererUrl = vi.fn(() => "file:///path/to/dist/client/index.html");
  return {
    isDevelopmentMode: vi.fn(() => false),
    getRendererUrl,
    getRendererFilePath: vi.fn(() => "/path/to/dist/client/index.html"),
    isUrlRenderer: vi.fn(() => false),
    IS_DEVELOPMENT: false,
    // DASHBOARD_URL is re-exported as getRendererUrl
    DASHBOARD_URL: getRendererUrl,
  };
});

vi.mock("../renderer.ts", () => rendererMocks);

const mocks = vi.hoisted(() => {
  const browserWindowInstance = {
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    on: vi.fn(),
    isVisible: vi.fn(() => true),
    show: vi.fn(),
    focus: vi.fn(),
    hide: vi.fn(),
  };

  const BrowserWindow = vi.fn(() => browserWindowInstance) as unknown as {
    (...args: unknown[]): typeof browserWindowInstance;
    getAllWindows: () => unknown[];
  };
  BrowserWindow.getAllWindows = vi.fn(() => []);

  const app = {
    whenReady: vi.fn(() => Promise.resolve()),
    getVersion: vi.fn(() => "0.1.0"),
    quit: vi.fn(),
    on: vi.fn(),
  };

  const ipcMain = {
    handle: vi.fn(),
    on: vi.fn(),
  };

  const trayInstance = {
    setImage: vi.fn(),
    setToolTip: vi.fn(),
    setContextMenu: vi.fn(),
    on: vi.fn(),
  };

  const Tray = vi.fn(() => trayInstance);
  const Menu = {
    buildFromTemplate: vi.fn(() => ({ id: "mock-menu" })),
    setApplicationMenu: vi.fn(),
  };
  const nativeImage = {
    createEmpty: vi.fn(() => ({ id: "mock-image" })),
    createFromPath: vi.fn(() => ({
      resize: vi.fn(() => ({ id: "resized-image" })),
    })),
  };

  const shell = {
    openExternal: vi.fn(() => Promise.resolve()),
  };

  const isDevelopmentMode = vi.fn(() => false);
  const getRendererUrl = vi.fn(() => "file:///path/to/dist/client/index.html");
  const getRendererFilePath = vi.fn(() => "/path/to/dist/client/index.html");
  const isUrlRenderer = vi.fn(() => false);

  return {
    app,
    BrowserWindow,
    ipcMain,
    trayInstance,
    Tray,
    Menu,
    nativeImage,
    shell,
    browserWindowInstance,
    isDevelopmentMode,
    getRendererUrl,
    getRendererFilePath,
    isUrlRenderer,
  };
});

vi.mock("electron", () => ({
  app: mocks.app,
  BrowserWindow: mocks.BrowserWindow,
  ipcMain: mocks.ipcMain,
  Tray: mocks.Tray,
  Menu: mocks.Menu,
  nativeImage: mocks.nativeImage,
  shell: mocks.shell,
}));

const mainDeps = vi.hoisted(() => {
  const startLocal = vi.fn(async () => ({ source: "embedded-local", state: "running", port: 4545 }));
  const stopLocal = vi.fn(async () => ({ source: "none", state: "stopped" }));
  const getStatus = vi.fn(() => ({ source: "none", state: "stopped" }));
  const getServerPort = vi.fn(() => 0);
  const loadDesktopLaunchMode = vi.fn(async () => "choose");
  const saveDesktopLaunchMode = vi.fn(async () => undefined);
  return {
    registerIpcHandlers: vi.fn(),
    buildAppMenu: vi.fn(),
    setupTray: vi.fn(),
    registerDeepLinkProtocol: vi.fn(),
    setupDeepLinkHandler: vi.fn(),
    setupAutoUpdater: vi.fn(),
    loadWindowState: vi.fn(async () => null),
    loadDesktopLaunchMode,
    saveDesktopLaunchMode,
    saveWindowState: vi.fn(),
    LocalRuntimeManager: vi.fn(() => ({ startLocal, stopLocal, getStatus, getServerPort })),
    startLocal,
  };
});

vi.mock("../ipc.js", () => ({ registerIpcHandlers: mainDeps.registerIpcHandlers }));
vi.mock("../menu.js", () => ({ buildAppMenu: mainDeps.buildAppMenu }));
vi.mock("../tray.js", () => ({ setupTray: mainDeps.setupTray }));
vi.mock("../deep-link.js", () => ({
  registerDeepLinkProtocol: mainDeps.registerDeepLinkProtocol,
  setupDeepLinkHandler: mainDeps.setupDeepLinkHandler,
}));
vi.mock("../native.js", () => ({
  DEFAULT_WINDOW_STATE: { width: 1280, height: 900, isMaximized: false },
  loadWindowState: mainDeps.loadWindowState,
  loadDesktopLaunchMode: mainDeps.loadDesktopLaunchMode,
  saveDesktopLaunchMode: mainDeps.saveDesktopLaunchMode,
  saveWindowState: mainDeps.saveWindowState,
  setupAutoUpdater: mainDeps.setupAutoUpdater,
  normalizeDesktopRemoteLaunch: vi.fn((settings) => {
    const active = settings.profiles.find((profile: { id: string }) => profile.id === settings.activeProfileId);
    return active ? { mode: "remote", profileId: active.id, serverBaseUrl: active.serverUrl.replace(/\/$/, ""), serverLabel: active.name, authToken: active.authToken ?? undefined } : null;
  }),
  buildRemoteShellHandoffUrl: vi.fn((launch) => `https://remote.example.com?shellKind=desktop&shellMode=remote&profileId=${launch.profileId}`),
}));
vi.mock("../local-runtime.js", () => ({
  LocalRuntimeManager: mainDeps.LocalRuntimeManager,
}));

vi.mock("../shell-settings.js", () => ({
  readShellSettings: vi.fn(async () => ({
    desktopMode: "remote",
    activeProfileId: "profile_1",
    profiles: [{ id: "profile_1", name: "Remote", serverUrl: "https://remote.example.com", authToken: "token" }],
  })),
}));

async function importMainModule() {
  return import("../main.ts");
}

describe("main process", () => {
  const originalDashboardUrl = process.env.FUSION_DASHBOARD_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.FUSION_DESKTOP_MODE;
    if (originalDashboardUrl === undefined) {
      delete process.env.FUSION_DASHBOARD_URL;
    } else {
      process.env.FUSION_DASHBOARD_URL = originalDashboardUrl;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    // Ensure we're in production mode for these tests
    rendererMocks.isDevelopmentMode.mockReturnValue(false);
    rendererMocks.getRendererUrl.mockReturnValue("file:///path/to/dist/client/index.html");
    rendererMocks.getRendererFilePath.mockReturnValue("/path/to/dist/client/index.html");
    rendererMocks.isUrlRenderer.mockReturnValue(false);
  });

  it("DASHBOARD_URL defaults to local file URL in production mode", async () => {
    delete process.env.FUSION_DASHBOARD_URL;

    const { DASHBOARD_URL } = await importMainModule();

    expect(DASHBOARD_URL()).toMatch(/^file:\/\/.*\/client\/index\.html$/);
  });

  it("DASHBOARD_URL uses env override in development mode", async () => {
    process.env.FUSION_DASHBOARD_URL = "http://localhost:5050";
    // Mock development mode to use the env var
    rendererMocks.isDevelopmentMode.mockReturnValue(true);
    rendererMocks.getRendererUrl.mockReturnValue("http://localhost:5050");
    rendererMocks.getRendererFilePath.mockReturnValue("");
    rendererMocks.isUrlRenderer.mockReturnValue(true);

    const { DASHBOARD_URL } = await importMainModule();

    expect(DASHBOARD_URL()).toBe("http://localhost:5050");
  });

  it("createMainWindow creates BrowserWindow with secure preferences", async () => {
    const { createMainWindow } = await importMainModule();

    createMainWindow();

    expect(mocks.BrowserWindow).toHaveBeenCalledTimes(1);
    const [options] = mocks.BrowserWindow.mock.calls[0] as [
      {
        webPreferences: {
          contextIsolation: boolean;
          nodeIntegration: boolean;
          preload: string;
        };
      },
    ];

    expect(options.webPreferences.contextIsolation).toBe(true);
    expect(options.webPreferences.nodeIntegration).toBe(false);
    expect(options.webPreferences.preload).toContain("preload.js");
  });

  it("createMainWindow loads the renderer URL in URL mode", async () => {
    rendererMocks.isUrlRenderer.mockReturnValue(true);
    rendererMocks.getRendererUrl.mockReturnValue("http://localhost:3000/index.html");
    rendererMocks.getRendererFilePath.mockReturnValue("");

    const { createMainWindow } = await importMainModule();

    createMainWindow();

    expect(mocks.browserWindowInstance.loadURL).toHaveBeenCalledWith("http://localhost:3000/index.html");
    expect(mocks.browserWindowInstance.loadFile).not.toHaveBeenCalled();
  });

  it("createMainWindow loads the renderer file in file mode (production)", async () => {
    rendererMocks.isUrlRenderer.mockReturnValue(false);
    rendererMocks.getRendererUrl.mockReturnValue("file:///path/to/dist/client/index.html");
    rendererMocks.getRendererFilePath.mockReturnValue("/path/to/dist/client/index.html");

    const { createMainWindow } = await importMainModule();

    createMainWindow();

    expect(mocks.browserWindowInstance.loadFile).toHaveBeenCalledWith("/path/to/dist/client/index.html");
    expect(mocks.browserWindowInstance.loadURL).not.toHaveBeenCalled();
  });

  it("exports initializeApp for lifecycle orchestration", async () => {
    const mainModule = await importMainModule();

    expect(typeof mainModule.initializeApp).toBe("function");
  });

  it("initializeApp starts local runtime when remembered mode is local", async () => {
    mainDeps.loadDesktopLaunchMode.mockResolvedValueOnce("local");
    const { initializeApp, getCurrentDesktopLaunchMode } = await importMainModule();

    await initializeApp();

    expect(mainDeps.startLocal).toHaveBeenCalledTimes(1);
    expect(getCurrentDesktopLaunchMode()).toBe("local");
  });

  it("initializeApp does not start local runtime for remembered choose mode", async () => {
    mainDeps.loadDesktopLaunchMode.mockResolvedValueOnce("choose");
    const { initializeApp } = await importMainModule();

    await initializeApp();

    expect(mainDeps.startLocal).not.toHaveBeenCalled();
  });

  it("initializeApp routes remembered remote mode to remote dashboard handoff URL", async () => {
    mainDeps.loadDesktopLaunchMode.mockResolvedValueOnce("remote");
    const { initializeApp, getCurrentDesktopLaunchMode } = await importMainModule();

    await initializeApp();

    expect(mainDeps.startLocal).not.toHaveBeenCalled();
    expect(mocks.browserWindowInstance.loadURL).toHaveBeenCalledWith(
      expect.stringContaining("shellMode=remote"),
    );
    expect(getCurrentDesktopLaunchMode()).toBe("remote");
  });

  it("initializeApp falls back to choose and persists when remembered local start fails", async () => {
    mainDeps.loadDesktopLaunchMode.mockResolvedValueOnce("local");
    mainDeps.startLocal.mockRejectedValueOnce(new Error("boom"));
    const { initializeApp, getCurrentDesktopLaunchMode } = await importMainModule();

    await initializeApp();

    expect(mainDeps.saveDesktopLaunchMode).toHaveBeenCalledWith("choose");
    expect(getCurrentDesktopLaunchMode()).toBe("choose");
  });

  it("initializeApp avoids duplicate local start when remembered mode and env flag are local", async () => {
    mainDeps.loadDesktopLaunchMode.mockResolvedValueOnce("local");
    process.env.FUSION_DESKTOP_MODE = "local";
    const { initializeApp } = await importMainModule();

    await initializeApp();

    expect(mainDeps.startLocal).toHaveBeenCalledTimes(1);
  });

  it("onDesktopModeChange persists the selected launch mode", async () => {
    const { initializeApp } = await importMainModule();

    await initializeApp();

    const options = mainDeps.registerIpcHandlers.mock.calls[0]?.[2] as
      | { onDesktopModeChange?: (mode: "local" | "remote") => Promise<void> }
      | undefined;
    await options?.onDesktopModeChange?.("remote");

    expect(mainDeps.saveDesktopLaunchMode).toHaveBeenCalledWith("remote");
  });

  it("createMainWindow registers close and closed handlers", async () => {
    const { createMainWindow } = await importMainModule();

    createMainWindow();

    expect(mocks.browserWindowInstance.on).toHaveBeenCalledWith("close", expect.any(Function));
    expect(mocks.browserWindowInstance.on).toHaveBeenCalledWith("closed", expect.any(Function));
  });

  it("importing main does not auto-start", async () => {
    await importMainModule();

    expect(mocks.app.whenReady).not.toHaveBeenCalled();
  });

  it("exports run for app entrypoint wiring", async () => {
    const mainModule = await importMainModule();

    expect(typeof mainModule.run).toBe("function");
  });
});
