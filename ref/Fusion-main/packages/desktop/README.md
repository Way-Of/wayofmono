# @fusion/desktop

Electron desktop shell for Fusion.

This package provides a native Electron wrapper around the existing Fusion dashboard web UI. The desktop shell presents native desktop affordances including a system tray and application menu, with an embedded renderer for production deployments.

## Running the Desktop Shell

### Hot-reload development workflow

Run a single command from the workspace root:

```bash
pnpm --filter @fusion/desktop dev
```

This command now orchestrates the full desktop dev loop:

1. Bundles Electron `main.ts` and `preload.ts` to `packages/desktop/dist`
2. Starts the dashboard Vite renderer dev server (`@fusion/dashboard dev:serve`)
3. Waits for renderer readiness
4. Launches Electron with `--dev` and live renderer reload

By default it uses `http://localhost:5173`. Override with `FUSION_DASHBOARD_URL`.

### Production-style desktop launch (from CLI)

```bash
fn desktop
```

`fn desktop` builds desktop artifacts, starts an embedded dashboard server on an ephemeral port, and launches Electron with embedded renderer assets.

Useful flags:

- `fn desktop --dev` — use dev renderer URL (`FUSION_DASHBOARD_URL` or `http://localhost:5173`)
- `fn desktop --paused` — start with engine paused

## Renderer Architecture

The desktop uses a dual-mode renderer strategy:

### Production Mode (default)
- Loads embedded dashboard assets from `dist/client/` (bundled at build time)
- Uses `window.loadFile()` to load `dist/client/index.html`
- Renderer connects to the embedded API server via IPC (`getServerPort()`)

### Development Mode (`--dev` or `NODE_ENV=development`)
- Loads renderer from `FUSION_DASHBOARD_URL` (defaults to `http://localhost:5173`)
- Uses `window.loadURL()` for live reload support
- Renderer connects to the dev API server

### Renderer Resolution (`src/renderer.ts`)

```typescript
isDevelopmentMode()  // Checks NODE_ENV or --dev flag
isUrlRenderer()     // true in dev mode, false in production
getRendererUrl()     // Returns URL or file:// path
getRendererFilePath() // Returns absolute file path for loadFile()
```

## First-run Shell Onboarding (Desktop)

Desktop boots through a shell-owned mode chooser before mounting the dashboard app when the user has not completed mode selection yet.

- **First run choice:** users choose **Local Fusion (bundled runtime)** or **Remote connection path**.
- **Mode contract:** `desktopMode` is `"local" | "remote" | null` and `hasCompletedModeSelection` determines whether the renderer treats startup as first-run. IPC also exposes a renderer-safe `{ isFirstRun, desktopMode }` shape via `shell:getDesktopModeState`.
- **Desktop mode restore:** launch mode is stored in `app.getPath("userData")/desktop-launch-mode.json` as `{ "mode": "choose" | "local" | "remote" }` and reused on relaunch.
- **Restore rules:** `choose` keeps chooser-first startup behavior, `local` attempts to start the embedded local runtime on launch, and `remote` skips embedded runtime startup.
- **Failure fallback:** if remembered `local` restore fails, the shell stops partial runtime state, falls back to `choose`, and persists that fallback to avoid broken relaunch loops.
- **Remote profiles:** multiple saved profiles are supported (`name`, `serverUrl`, optional `authToken`) and can be created/edited/switched/deleted from the dashboard connection manager.
- **Delete fallback:** if the active profile is deleted, desktop shell settings automatically select the first remaining profile; deleting the final profile leaves a valid empty payload (`activeProfileId: null`, `profiles: []`).
- **Storage boundary:** shell connection state is stored only in desktop-local app data at `app.getPath("userData")/shell-connections.json` and is not written to `.fusion/config.json` or dashboard project storage keys.

### Production vs dev bootstrap behavior

- **Production (`fn desktop`)**: renderer mounts `DesktopShellBootstrap`, which resolves shell mode via preload/IPC and either renders the chooser or mounts the dashboard shell. In remote mode, the dashboard shell opens the native connection onboarding/manager flow instead of the local runtime path.
- **Dev (`pnpm --filter @fusion/desktop dev`)**: same mode bootstrap flow runs; only the renderer source (Vite URL vs bundled file) changes.

## IPC Channel Reference

`src/ipc.ts` registers renderer ↔ main process bridges used by `window.electronAPI` (desktop renderer transport/window controls) and `window.fusionShell` (shared shell connection contract for dashboard code).

### Renderer → Main (`ipcRenderer.invoke`)

| Channel | Direction | Parameters | Returns |
|---|---|---|---|
| `window:minimize` | renderer → main | none | `Promise<void>` |
| `window:maximize` | renderer → main | none | `Promise<boolean>` (new maximized state) |
| `window:close` | renderer → main | none | `Promise<void>` |
| `window:isMaximized` | renderer → main | none | `Promise<boolean>` |
| `app:getSystemInfo` | renderer → main | none | `Promise<{ platform; arch; electronVersion; nodeVersion; appVersion; }>` |
| `app:checkForUpdates` | renderer → main | none | `Promise<{ status: "checking" } \| { status: "error"; error: string }>` |
| `app:getServerPort` | renderer → main | none | `Promise<number \| undefined>` (external CLI port when present; otherwise embedded local runtime port when running) |
| `desktopRuntime:getStatus` | renderer → main | none | `Promise<DesktopRuntimeStatus>` |
| `desktopRuntime:startLocal` | renderer → main | none | `Promise<DesktopRuntimeStatus>` |
| `desktopRuntime:stopLocal` | renderer → main | none | `Promise<DesktopRuntimeStatus>` |
| `desktopLaunchMode:getMode` | renderer → main | none | `Promise<"choose" \| "local" \| "remote">` |
| `desktopLaunchMode:setMode` | renderer → main | `mode: "choose" \| "local" \| "remote"` | `Promise<"choose" \| "local" \| "remote">` |
| `tray:updateStatus` | renderer → main | `status: "running" \| "paused" \| "stopped"` | `Promise<void>` |
| `native:showExportDialog` | renderer → main | none | `Promise<string \| null>` |
| `native:showImportDialog` | renderer → main | none | `Promise<string \| null>` |

### Main → Renderer Events (`ipcRenderer.on`)

| Channel | Direction | Payload |
|---|---|---|
| `deep-link` | main → renderer | `DeepLinkResult` (`{ type, id, raw }`) |
| `update-available` | main → renderer | update info object (includes `version`) |
| `update-downloaded` | main → renderer | no payload is currently forwarded by preload |

## Local Bundled Runtime Lifecycle

Desktop local mode uses an in-process runtime manager (`src/local-runtime.ts`) that mirrors the CLI desktop server pattern:

- creates `TaskStore`, calls `init()` and `watch()`
- creates the dashboard server with `createServer(store)`
- listens on an ephemeral port (`0`, never `4040`)
- reports runtime status as:
  - `source`: `"embedded-local" | "external-cli" | "none"`
  - `state`: `"stopped" | "starting" | "running" | "error"`
  - optional `port`, `baseUrl`, and `error`
- keeps shutdown idempotent and exact-once for embedded server close and store close

### Runtime source rules

- **external-cli**: when `FUSION_SERVER_PORT` is provided (for example by `fn desktop`), Electron treats the server as CLI-owned and does **not** start an embedded server. `desktopRuntime:stopLocal` is a no-op in this state and never kills the CLI-owned server.
- **embedded-local**: when started inside Electron via runtime IPC or startup env activation.
- **none**: no active runtime.

### Activation rules

- Desktop does **not** auto-start embedded local runtime by default.
- Embedded local runtime starts at launch only when `FUSION_DESKTOP_MODE=local` is set.
- Future onboarding/connection flows can start/stop embedded local runtime explicitly over IPC.

## Main Process Lifecycle

`src/main.ts` orchestrates module startup in this order:

1. `loadWindowState()`
2. `loadDesktopLaunchMode()`
3. Restore launch mode behavior (`local` attempts embedded runtime start; `remote`/`choose` skip)
4. `createMainWindow(state)`
5. `buildAppMenu({ mainWindow, appName: "Fusion" })`
6. `setupTray(mainWindow, tray)`
7. `registerIpcHandlers(mainWindow, tray)`
8. `registerDeepLinkProtocol()`
9. `setupDeepLinkHandler(mainWindow)`
10. `setupAutoUpdater(mainWindow)`
11. `mainWindow.maximize()` when restored state was maximized

### Window state and close-to-tray behavior

- Startup restores width/height from persisted state (fallback: `DEFAULT_WINDOW_STATE`).
- Position (`x`, `y`) is restored only when both values are present.
- On window close:
  - state is saved via `saveWindowState(mainWindow)`
  - if app is **not quitting**, close is prevented and the window hides to tray
  - if app **is quitting**, close proceeds normally

### Quit cleanup

- `before-quit` sets `app.isQuitting = true`
- Tray instance is destroyed (`tray.destroy()`)
- `mainWindow` is nulled on `closed` for clean re-creation on macOS `activate`

## Preload APIs (`window.electronAPI` and `window.fusionShell`)

`src/preload.ts` exposes safe, context-isolated bridges:

- `window.electronAPI`
  - Window control: `minimize()`, `maximize()`, `close()`, `isMaximized()`
  - App/system: `getSystemInfo()`, `checkForUpdates()`, `getServerPort()`
  - Desktop runtime: `getDesktopRuntimeStatus()`, `startDesktopLocalRuntime()`, `stopDesktopLocalRuntime()`
  - Desktop launch mode: `getDesktopLaunchMode()`, `setDesktopLaunchMode(mode)`
  - Native shell management: `openConnectionManager()` (invokes `shell:openConnectionManager`)
  - Tray: `updateTrayStatus(status)`
  - Native dialogs: `showExportDialog()`, `showImportDialog()`
  - Event subscriptions (return unsubscribe functions):
    - `onDeepLink(callback)`
    - `onUpdateAvailable(callback)`
    - `onUpdateDownloaded(callback)`
- `window.fusionShell`
  - `getState()`, `listProfiles()`, `saveProfile()`, `deleteProfile()`
  - `setActiveProfile()`, `setDesktopMode()`
  - `startQrScan()`, `openConnectionManager()`, `subscribe(listener)`
  - Together these cover create/delete/switch operations for shell-owned remote profiles without writing to project/global Fusion settings
- `window.fusionAPI` remains as a backward-compatible alias of `window.electronAPI`.

All preload typings are declared in `src/types.d.ts`.

### Regression coverage locked by tests

Desktop tests under `src/__tests__/` now explicitly lock:
- first-run mode projection and last-used mode restore (`choose`/`local`/`remote`)
- local runtime startup only when local mode is active (and no unexpected startup in remote mode)
- remote mode handoff persistence across relaunch behavior
- preload `fusionShell` bridge channel wiring (`shell:getState`, profile CRUD/switching, mode state, QR, and connection-manager open)

## Module Integration Overview

```text
renderer (window.fusionAPI)
        │
        ▼
   preload.ts (contextBridge)
        │
        ▼
     ipc.ts handlers ───────────► native.ts (dialogs, updater, window state)
        │
        ├────────────────────────► tray.ts (status + tray menu wiring)
        │
        └────────────────────────► main.ts lifecycle orchestration
                                      ├─ menu.ts (application menu)
                                      └─ deep-link.ts (fusion:// protocol + routing)
```

## System Tray

- Left-clicking the tray icon toggles the main window visibility.
- Right-click context menu includes:
  - **Show/Hide Window** (contextual based on visibility)
  - **Pause/Resume Engine** (status toggle placeholder; IPC wiring lands in FN-1076)
  - **Quit Fusion**
- Tray tooltip reflects engine status:
  - `Fusion — Running`
  - `Fusion — Paused`
  - `Fusion — Stopped`
- Tray icon is generated from the Fusion four-dot logo.

## Application Menu

The desktop shell installs a native menu with standard shortcuts.

- **macOS:** App, Edit, View, Window, and Help menus.
- **Windows/Linux:** Edit, View, Window, and Help (no App menu).
- Keyboard shortcuts use Electron `CmdOrCtrl` accelerators for cross-platform behavior.
- View menu includes reload, force reload, dev tools toggle, and zoom controls.

## Native Integrations

`src/native.ts` provides desktop-native utilities used by the Electron main process:

- **Settings file dialogs**
  - `showExportSettingsDialog(parentWindow?)` opens a save dialog for JSON exports using a default filename like `fusion-settings-YYYY-MM-DD-HHmmss.json`.
  - `showImportSettingsDialog(parentWindow?)` opens a single-file JSON picker.
- **Desktop notifications**
  - `showDesktopNotification(title, body, options?)` wraps Electron `Notification` with support checks and optional click callback wiring.
- **Auto-updater integration**
  - `setupAutoUpdater(mainWindow?)` configures `electron-updater`, checks for updates, and relays `update-available` / `update-downloaded` events to the renderer via IPC.
  - Failures are logged and treated as non-fatal (important for unsigned/local dev builds).
- **Window state persistence**
  - `loadWindowState()` reads `window-state.json` from `app.getPath("userData")`.
  - `saveWindowState(mainWindow)` writes bounds/maximized state atomically (`.tmp` + rename).
  - `DEFAULT_WINDOW_STATE` is the fallback (`1280x900`, not maximized).
- **Desktop launch-mode persistence**
  - `loadDesktopLaunchMode()` reads `desktop-launch-mode.json` and returns `"choose" | "local" | "remote"` (invalid/missing files fall back to `"choose"`).
  - `saveDesktopLaunchMode(mode)` writes the mode atomically (`.tmp` + rename).

## Deep Linking

`src/deep-link.ts` implements `fusion://` protocol support.

### Supported URL patterns

- `fusion://task/FN-123` → task deep link
- `fusion://project/my-app` → project deep link
- `fusion://task/FN-123/extra` → extra segments are ignored
- `fusion://project/my%20app` → ID is URL-decoded

Invalid or unsupported URLs (wrong scheme, missing host, unknown host) are ignored.

### Single-instance behavior and platform differences

- `setupDeepLinkHandler(mainWindow)` owns `app.requestSingleInstanceLock()`.
- If no lock is granted, the app quits to avoid duplicate instances.
- **macOS:** listens to `open-url` events.
- **Windows/Linux:** listens to `second-instance` args and extracts `fusion://` URLs.
- Valid parsed deep links are forwarded to the renderer as `mainWindow.webContents.send("deep-link", result)`.

## Cross-Task API Contract (FN-1075 → FN-1076)

FN-1076 depends on these exact exports and names.

### `src/native.ts`

| Export | Type |
|---|---|
| `showExportSettingsDialog` | `(parentWindow?) => Promise<string \| null>` |
| `showImportSettingsDialog` | `(parentWindow?) => Promise<string \| null>` |
| `showDesktopNotification` | `(title, body, options?) => void` |
| `setupAutoUpdater` | `(mainWindow?) => void` |
| `loadWindowState` | `() => Promise<WindowState \| null>` |
| `saveWindowState` | `(mainWindow) => void` |
| `loadDesktopLaunchMode` | `() => Promise<"choose" \| "local" \| "remote">` |
| `saveDesktopLaunchMode` | `(mode) => Promise<void>` |
| `DEFAULT_WINDOW_STATE` | `WindowState` |
| `WindowState` | `interface` |

### `src/deep-link.ts`

| Export | Type |
|---|---|
| `registerDeepLinkProtocol` | `() => void` |
| `parseDeepLink` | `(url: string) => DeepLinkResult \| null` |
| `handleDeepLink` | `(mainWindow, url: string) => void` |
| `setupDeepLinkHandler` | `(mainWindow) => void` |
| `DeepLinkResult` | `interface` |

## Tray Icons

Tray icons are generated from `packages/dashboard/app/public/logo.svg`.

- Script: `pnpm --filter @fusion/desktop generate:icons`
- Package-local equivalent (from `packages/desktop`): `pnpm generate:icons`
- Generated outputs are committed under `src/icons/`:
  - `tray-16.png`
  - `tray-32.png`
  - `tray-48.png`

## Scripts

- `pnpm --filter @fusion/desktop dev` — hot-reload workflow (main/preload bundle + dashboard Vite dev server + Electron)
- `pnpm --filter @fusion/desktop build` — production desktop build (dashboard client build + main/preload bundle + asset copy)
- `pnpm --filter @fusion/desktop test` — run Vitest suite
- `pnpm --filter @fusion/desktop typecheck` — run TypeScript checks without emitting files
- `pnpm --filter @fusion/desktop generate:icons` — regenerate tray icon PNG assets from the dashboard logo SVG
- `pnpm --filter @fusion/desktop pack` — generate unpacked artifacts via electron-builder (`--dir`)
- `pnpm --filter @fusion/desktop dist` — generate installable desktop artifacts via electron-builder

## Packaging

Desktop packaging is configured in `electron-builder.yml`.

- Output directory: `packages/desktop/dist-electron`
- Targets: macOS (`dmg`, `zip`), Windows (`nsis`, `portable`), Linux (`AppImage`, `deb`, `tar.gz`)
- Deep link protocol: `fusion://`
- Publish provider: GitHub (`gsxdsm/fusion`)

Run `pnpm --filter @fusion/desktop build` before `pack`/`dist` to ensure `dist/` assets are up to date.

## Environment

- `FUSION_DASHBOARD_URL` — override the default dashboard URL in development mode (`http://localhost:5173`)
- `FUSION_SERVER_PORT` — internal: port for embedded API server (set by CLI)
- `FUSION_ELECTRON_BINARY` — path to Electron binary (for testing)

## Build Pipeline

### Development Build (`pnpm --filter @fusion/desktop dev`)
1. Bundle `main.ts` and `preload.ts` with esbuild
2. Start dashboard Vite dev server
3. Launch Electron with `--dev` flag

### Production Build (`pnpm --filter @fusion/desktop build`)
1. Build dashboard client to `packages/dashboard/dist/client/`
2. Bundle `main.ts` and `preload.ts` with esbuild
3. Copy dashboard client to `packages/desktop/dist/client/`

### CLI Launch (`fn desktop`)
1. Build desktop artifacts (unless `--dev`)
2. Start embedded API server on ephemeral port
3. Launch Electron:
   - **Production:** Uses embedded renderer assets, `getServerPort()` for API connection
   - **Development (`--dev`):** Uses `FUSION_DASHBOARD_URL` for live reload

## Desktop Shell UI Components

- `src/renderer/components/DesktopWrapper.tsx` wraps the dashboard app for Electron-only chrome.
- `src/renderer/components/TitleBar.tsx` implements a custom frameless title bar with Fusion branding, drag region behavior, and window controls (minimize/maximize/close).
- The title bar styling lives in `src/renderer/components/TitleBar.css` and uses dashboard theme tokens (`--surface`, `--border`, `--text`, etc.).

## Desktop Hooks

Reusable renderer hooks in `src/renderer/hooks/` expose Electron runtime capabilities:

- `useElectron()` — runtime detection + typed `electronAPI` access
- `useAutoUpdate()` — update-available subscription + install trigger
- `useDeepLink()` — deep-link subscription and `fusion://task/...` / `fusion://project/...` parsing

## Renderer Entrypoint

- `src/renderer/index.html` mirrors dashboard theme initialization logic with Electron-safe defaults.
- `src/renderer/index.tsx` mounts the dashboard app in `StrictMode` and wraps it in `DesktopWrapper`.
- Unlike the web dashboard entry (`packages/dashboard/app/main.tsx`), this renderer entry does not register service workers and is intended for desktop-only bootstrapping.
