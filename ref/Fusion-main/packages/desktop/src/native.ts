import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  app,
  BrowserWindow,
  dialog,
  Notification,
  type OpenDialogOptions,
  type SaveDialogOptions,
} from "electron";
import { autoUpdater } from "electron-updater";

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

export type DesktopLaunchMode = "choose" | "local" | "remote";

export interface DesktopRemoteProfileLike {
  id: string;
  name: string;
  serverUrl: string;
  authToken?: string | null;
}

export interface DesktopShellSettingsLike {
  desktopMode: "local" | "remote" | null;
  activeProfileId: string | null;
  profiles: DesktopRemoteProfileLike[];
}

export interface NormalizedDesktopRemoteLaunch {
  mode: "remote";
  profileId: string;
  serverBaseUrl: string;
  serverLabel?: string;
  authToken?: string;
}

export const SHELL_HANDOFF_QUERY = {
  shellKind: "shellKind",
  shellMode: "shellMode",
  profileId: "profileId",
  serverBaseUrl: "serverBaseUrl",
  serverLabel: "serverLabel",
  token: "token",
  canOpenConnectionManager: "shellCanOpenConnectionManager",
} as const;

export const DEFAULT_WINDOW_STATE: WindowState = {
  width: 1280,
  height: 900,
  isMaximized: false,
};

interface DesktopNotificationOptions {
  silent?: boolean;
  onClick?: () => void;
}

function generateSettingsExportFilename(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `fusion-settings-${year}-${month}-${day}-${hours}${minutes}${seconds}.json`;
}

function getWindowStatePath(): string {
  return join(app.getPath("userData"), "window-state.json");
}

function getDesktopLaunchModePath(): string {
  return join(app.getPath("userData"), "desktop-launch-mode.json");
}

function isValidWindowState(value: unknown): value is WindowState {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WindowState>;
  const hasValidPosition =
    (candidate.x === undefined || typeof candidate.x === "number") &&
    (candidate.y === undefined || typeof candidate.y === "number");

  return (
    hasValidPosition &&
    typeof candidate.width === "number" &&
    Number.isFinite(candidate.width) &&
    typeof candidate.height === "number" &&
    Number.isFinite(candidate.height) &&
    typeof candidate.isMaximized === "boolean"
  );
}

export async function showExportSettingsDialog(parentWindow?: BrowserWindow): Promise<string | null> {
  const filename = generateSettingsExportFilename();
  const defaultPath = join(app.getPath("documents"), filename);
  const dialogOptions: SaveDialogOptions = {
    title: "Export Fusion Settings",
    defaultPath,
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  };

  const result = parentWindow
    ? await dialog.showSaveDialog(parentWindow, dialogOptions)
    : await dialog.showSaveDialog(dialogOptions);

  if (result.canceled || !result.filePath) {
    return null;
  }

  return result.filePath;
}

export async function showImportSettingsDialog(parentWindow?: BrowserWindow): Promise<string | null> {
  const dialogOptions: OpenDialogOptions = {
    title: "Import Fusion Settings",
    properties: ["openFile"],
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  };

  const result = parentWindow
    ? await dialog.showOpenDialog(parentWindow, dialogOptions)
    : await dialog.showOpenDialog(dialogOptions);

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0] ?? null;
}

export function showDesktopNotification(
  title: string,
  body: string,
  options: DesktopNotificationOptions = {},
): void {
  if (!Notification.isSupported()) {
    console.warn("[desktop/native] Notifications are not supported in this environment");
    return;
  }

  try {
    const notification = new Notification({
      title,
      body,
      silent: options.silent,
    });

    if (options.onClick) {
      notification.on("click", options.onClick);
    }

    notification.show();
  } catch (error) {
    console.error("[desktop/native] Failed to display desktop notification", error);
  }
}

export function setupAutoUpdater(mainWindow?: BrowserWindow): void {
  try {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("update-available", (info) => {
      showDesktopNotification("Fusion Update Available", "Update available — downloading in background", {
        silent: true,
      });
      mainWindow?.webContents.send("update-available", info);
    });

    autoUpdater.on("update-downloaded", (info) => {
      showDesktopNotification("Fusion Update Ready", "Update ready — will install on quit", {
        silent: true,
      });
      mainWindow?.webContents.send("update-downloaded", info);
    });

    autoUpdater.on("error", (error) => {
      console.error("[desktop/native] Auto-updater error", error);
    });

    void autoUpdater.checkForUpdates().catch((error) => {
      console.error("[desktop/native] Auto-updater check failed", error);
    });
  } catch (error) {
    console.error("[desktop/native] Auto-updater unavailable", error);
  }
}

function normalizeServerBaseUrl(serverUrl: string): string | null {
  try {
    const parsed = new URL(serverUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function normalizeDesktopRemoteLaunch(settings: DesktopShellSettingsLike): NormalizedDesktopRemoteLaunch | null {
  if (settings.desktopMode !== "remote" || !settings.activeProfileId) {
    return null;
  }

  const activeProfile = settings.profiles.find((profile) => profile.id === settings.activeProfileId);
  if (!activeProfile) {
    return null;
  }

  const serverBaseUrl = normalizeServerBaseUrl(activeProfile.serverUrl);
  if (!serverBaseUrl) {
    return null;
  }

  return {
    mode: "remote",
    profileId: activeProfile.id,
    serverBaseUrl,
    ...(activeProfile.name ? { serverLabel: activeProfile.name } : {}),
    ...(activeProfile.authToken ? { authToken: activeProfile.authToken } : {}),
  };
}

export function buildRemoteShellHandoffUrl(launch: NormalizedDesktopRemoteLaunch): string {
  const url = new URL(launch.serverBaseUrl);
  url.searchParams.set(SHELL_HANDOFF_QUERY.shellKind, "desktop");
  url.searchParams.set(SHELL_HANDOFF_QUERY.shellMode, "remote");
  url.searchParams.set(SHELL_HANDOFF_QUERY.profileId, launch.profileId);
  url.searchParams.set(SHELL_HANDOFF_QUERY.serverBaseUrl, launch.serverBaseUrl);
  if (launch.serverLabel) {
    url.searchParams.set(SHELL_HANDOFF_QUERY.serverLabel, launch.serverLabel);
  }
  if (launch.authToken) {
    url.searchParams.set(SHELL_HANDOFF_QUERY.token, launch.authToken);
  }
  url.searchParams.set(SHELL_HANDOFF_QUERY.canOpenConnectionManager, "1");
  return url.toString();
}

function isValidDesktopLaunchMode(value: unknown): value is DesktopLaunchMode {
  return value === "choose" || value === "local" || value === "remote";
}

export async function loadDesktopLaunchMode(): Promise<DesktopLaunchMode> {
  const launchModePath = getDesktopLaunchModePath();

  try {
    const raw = await readFile(launchModePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && "mode" in parsed) {
      const mode = (parsed as { mode?: unknown }).mode;
      if (isValidDesktopLaunchMode(mode)) {
        return mode;
      }
    }

    return "choose";
  } catch {
    return "choose";
  }
}

export async function saveDesktopLaunchMode(mode: DesktopLaunchMode): Promise<void> {
  const launchModePath = getDesktopLaunchModePath();
  const tempPath = `${launchModePath}.tmp`;

  await writeFile(tempPath, JSON.stringify({ mode }, null, 2), "utf-8");
  await rename(tempPath, launchModePath);
}

export async function loadWindowState(): Promise<WindowState | null> {
  const statePath = getWindowStatePath();

  try {
    const raw = await readFile(statePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);

    if (!isValidWindowState(parsed)) {
      return null;
    }

    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    return null;
  }
}

export function saveWindowState(mainWindow: BrowserWindow): void {
  if (mainWindow.isDestroyed()) {
    return;
  }

  const bounds = mainWindow.getBounds();
  const state: WindowState = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: mainWindow.isMaximized(),
  };

  const statePath = getWindowStatePath();
  const tempPath = `${statePath}.tmp`;

  void writeFile(tempPath, JSON.stringify(state, null, 2), "utf-8")
    .then(() => rename(tempPath, statePath))
    .catch((error) => {
      console.error("[desktop/native] Failed to save window state", error);
    });
}
