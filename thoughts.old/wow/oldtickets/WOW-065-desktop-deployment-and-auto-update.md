# WOW-065 Desktop Deployment, Installer & Auto-Update System

## Current Reality Check (2026-06-06)

> ✅ **STATUS**: Deployment system is **BUILT but NOT BUNDLED**. All code exists, but Phase 0 assets (bin/, icons) are missing. `bun run pack` fails until Phase 0 completes.

### ✅ What Actually Exists

| Component | Status | Notes |
|---|---|---|
| `electron/electron-main.mjs` | ✅ Complete | Setup detection, Bun spawn, IPC handlers, window management |
| `electron/preload.cjs` | ✅ Complete | Exposes `window.wopShell` IPC bridge |
| `electron/wait-prod.mjs` | ✅ Complete | Health check before Electron loads |
| `electron/build/icon.svg` | ✅ Exists | Only SVG — need to convert to required formats |
| `electron/build/wayofwork.desktop` | ✅ Exists | Linux desktop entry |
| `electron/build/generate-macos-icns.sh` | ✅ Exists | Script to generate .icns from .png |
| `server/routes/setup.ts` | ✅ Complete | 5 API endpoints (status, admin, llm, workspace, complete) with `setupGuard` |
| `src/pages/SetupWizard.tsx` | ✅ Complete | 5-step wizard (welcome, admin, llm, workspace, summary) with Ollama install/pull flow |
| `src/main.tsx` | ✅ Has `/setup` route | Route exists, no auth required |
| `electron-updater` in deps | ✅ Added | Not wired into main process yet |

### ❌ What's Missing / Broken

| Component | Status | Impact |
|---|---|---|
| `bin/` directory | ❌ **DOES NOT EXIST** | `extraResources` in package.json references `bin/${os}` — electron-builder will fail |
| `bin/download-bun.sh` | ❌ **DOES NOT EXIST** | No way to download Bun binaries for bundling |
| Bun binaries (`bin/{os}/bun`) | ❌ **DOES NOT EXIST** | Packaged Electron app cannot start without bundled Bun |
| `electron/build/icon.icns` | ❌ **DOES NOT EXIST** | macOS build will fail (package.json refs this at line 44) |
| `electron/build/icon.ico` | ❌ **DOES NOT EXIST** | Windows build will fail (package.json refs this at lines 54, 66-68) |
| `electron/build/icon.png` | ❌ **DOES NOT EXIST** | Linux icon directory is `electron/build` but no .png there |
| `.github/workflows/release.yml` | ❌ **DOES NOT EXIST** | No CI/CD pipeline at all |
| `electron/notarize.js` | ❌ **DOES NOT EXIST** | No macOS notarization |
| `docs/deployment-strategy.md` | ❌ **DOES NOT EXIST** | No deployment alternatives documented |
| `public/wayofwork-icon.png` | ❌ DOES NOT EXIST | Only `public/wayofpi-icon.png` (legacy name) exists |
| `public/wayofwork-icon.svg` | ❌ DOES NOT EXIST | Only `public/wayofpi-icon.svg` (legacy name) exists |
| `electron-updater` integration | ❌ Not wired | `electron-updater` in deps but no IPC/UI for update flow |
| `UpdateNotification.tsx` | ❌ DOES NOT EXIST | No UI for download progress or "restart to update" |

### 🧪 `bun run pack` Would Fail
Running `bun run pack` right now would fail because:
1. `tsc -b && vite build` would succeed (build chain works)
2. `electron-builder` would fail at `extraResources` resolution — `bin/${os}` doesn't exist
3. Missing `icon.icns` and `icon.ico` would cause build errors
4. No code signing configured

## Problem Statement

## Desired Outcome

A cross-platform desktop deployment system where:

1. **One-click install** — users download an installer for Windows, macOS, or Linux that includes everything needed (app + runtime)
2. **First-run setup wizard** — boots fresh, asks for admin credentials, configures LLM provider, creates workspace
3. **Auto-update** — when code is pushed to the production GitHub branches, the system automatically detects and installs updates in the background
4. **Self-contained** — no external runtime dependencies (Bun bundled inside the app)
5. **Signed installers** — macOS notarized, Windows Authenticode signed for trust
6. **CI/CD pipeline** — GitHub Actions build and publish installers on tag push

## Context & Background

### Current State

**Production branches:**
- Way of Work: `https://github.com/Way-Of/wayofwork/tree/productionopticat`
- OptiCat: `https://github.com/Epileptickk/OptiCat/tree/productionwowopticat`

**Current deployment flow:**
```
bun run pack
  └─ electron-builder
      ├─ macOS → .dmg (unsigned)
      ├─ Windows → nsis .exe (unsigned)
      └─ Linux → .AppImage/.deb
  (output: release/)
```

**Key problems with current packaging:**

| Issue | Details |
|---|---|
| **No Bun runtime bundled** | Production server runs on Bun, but `electron-builder` doesn't bundle it. User must install Bun separately. Fix: use `extraResources` to bundle Bun binary per platform. |
| **Uncompiled server code** | `server/**/*` includes raw TypeScript files. They work because Bun runs `.ts` directly at runtime, but electron-builder packages them as-is. Works if Bun is bundled. |
| **No auto-update** | No `electron-updater`, no `latest.yml` generation, no publish config. Zero update infrastructure. |
| **No CI/CD** | No GitHub Actions workflow for build/test/package/release. |
| **No code signing** | macOS: no Apple Developer ID → Gatekeeper blocks. Windows: no Authenticode → SmartScreen blocks. |
| **Missing electron-builder assets** | `build/icon.png` or `build/icon.icns` not at electron-builder default path (expects `build/` root, project has `electron/build/`). |
| **No first-run setup** | App starts with default admin/admin credentials. No onboarding wizard. |

### Existing Infrastructure That Can Be Reused

- **Electron main process** (`electron/electron-main.mjs`): Dual dev/prod mode, Bun autostart, IPC handlers, window management
- **electron-builder config** (`package.json:22-51`): Already has platform targets configured
- **Preload script** (`electron/preload.cjs`): Exposes `window.wopShell` for IPC
- **Windows batch scripts** (`startdeve.bat`, `stop.bat`): Existing Windows dev workflow
- **macOS icon generator** (`electron/build/generate-macos-icns.sh`): Script for icon generation
- **Wait script** (`electron/wait-prod.mjs`): Waits for server health check before Electron loads

### Why This Matters

- Users need a consumer-grade install experience — no terminal, no git, no manual config
- Without auto-update, every bugfix requires users to manually reinstall
- Unsigned installers trigger OS security warnings that scare non-technical users
- Construction companies running on Windows need simple onboarding

> ⚠️ **CRITICAL: Company & User Data Integrity**
> This deployment system handles **live production data** — projects, tasks, time entries, financials, ID06 credentials, and per-tenant databases. Any corruption, data leakage between instances, or failed migration during update will affect real companies and their workers. The pipeline MUST include:
> - **Data integrity checks** before/after every update (checksum DBs, verify row counts)
> - **Rollback capability** — if an update fails, the previous version must restore without data loss
> - **Migration guardrails** — schema migrations must be transactional and tested against production-like data before release
> - **Isolation verification** — confirm deployed instance cannot access another tenant's data (cross-reference WOW-063)
> - **Backup before update** — automatic backup of `data/` directory before applying any update
> - **No hardcoded file paths** — every path must derive from app configuration or environment, never hardcoded absolute paths that break when the app is installed to different directories on different OSes

## Requirements

### Functional Requirements

#### Phase 0: Fix Missing Build Assets (IMMEDIATE PREREQUISITE)
- [x] Created `bin/` directory with `download-bun.sh` script (but binaries not downloaded yet)
- [x] Renamed legacy icons: `public/wayofpi-icon.*` → `public/wayofwork-icon.*`
- [x] Created icon documentation at `electron/build/README_ICONS.md`
- [ ] Convert `electron/build/icon.svg` to macOS/.ico formats:
  - [ ] `electron/build/icon.icns` — macOS icon (need to convert using sips or Python)
  - [ ] `electron/build/icon.ico` — Windows icon (need to convert using ImageMagick)
- [ ] Verify `bun run pack` completes for at least one platform (blocked until Bun binaries downloaded)

#### Phase 1: Self-Contained Installer (IN PROGRESS)

### ✅ Completed
- [x] electron-main.mjs launches bundled Bun from `extraResources` path instead of assuming system-installed Bun — **code exists** (`resolveBunPath()` at line 24)
- [x] `bin/` directory created with `linux/`, `darwin/`, `win/` subdirectories
- [x] Electron main process has `resolveBunPath()` function written and ready
- [x] Build scripts ready (download-bun.sh)

### ⚠️ In Progress
- [ ] **Bun binaries not yet downloaded**: Need to winget install or use install script locally
- [ ] **electron-builder** config updated to use `extraResources: { from: "bin/${os}", ... }`
- [ ] **Test** `bun run pack` after binaries are placed in `bin/`

### Code Ready
```javascript
const resolveBunPath = () => {
  const bin = process.resourcesPath || app.getPath('exe');
  if (!app.isPackaged) return 'bun'; // dev mode
  return process.platform === 'win32' 
    ? path.join(bin, 'bun.exe') 
    : path.join(bin, 'bun');
};
```

### Next Step
Download Bun binaries locally:
```bash
winget install BunToolchain
# Then copy to bin/{linux,darwin,win}/
```

#### Phase 2: First-Run Setup Wizard (PRODUCTION OVERHAUL)

> **Current state**: Basic 5-step wizard exists. Needs comprehensive hardware detection, dependency auto-install, resume support, and production hardening.

##### Architecture Requirements
- [x] Setup wizard is a **full React UI page** (`src/pages/SetupWizard.tsx`) rendered inside the same Electron window — ✅ **Done**
- [x] Electron main process checks `app.getPath('userData')/setup-complete.json` on startup — ✅ **Done** (`isSetupComplete()` at line 76)
- [x] `/setup` route registered in `src/main.tsx` with no auth required — ✅ **Done**
- [x] Backend `server/routes/setup.ts` with `setupGuard` — ✅ **Done**
- [ ] Replace `setup-complete.json` file check with backend-driven check: Electron asks the Bun server `/api/setup/status` instead of reading a local file (avoids file/state drift between Electron and server)

##### Hardware & Environment Detection (NEW)
- [ ] **Auto-detect system capabilities** on wizard start and show a system summary card:
  - [ ] **CPU**: cores, architecture (Intel/ARM), model name — recommend model size based on this
  - [ ] **RAM**: total GB — if <8GB warn "Ollama may be slow, consider OpenRouter"; if <4GB disable local LLM
  - [ ] **Disk**: free space at default workspace location — warn if <10GB
  - [ ] **GPU**: detect NVIDIA/CUDA, AMD ROCm, Apple Metal, or integrated — show acceleration status
  - [ ] **OS**: Windows/macOS/Linux, version, architecture — adapt install paths accordingly
  - [ ] **Network**: online/offline status — skip Ollama download if offline, recommend cloud provider instead
  - [ ] **Virtualization**: detect Docker, WSL2 — recommend Docker alternative if available
- [ ] Use Electron IPC (`os.cpus()`, `os.totalmem()`, `os.freemem()`, `os.platform()`, `os.release()`) in main process, pass to renderer via `wop-shell:get-system-info`
- [ ] Store hardware profile in setup state so summary screen shows a "Recommended for your system" section

##### Smart Defaults Based on Hardware (NEW)
- [ ] If RAM ≥ 16GB + GPU present → default: Ollama + `qwen3.5:9b` (or larger model)
- [ ] If RAM 8-16GB → default: Ollama + `qwen3.5:9b` (medium)
- [ ] If RAM < 8GB → default: OpenRouter (no local LLM), show warning about performance
- [ ] If no GPU → skip Ollama GPU acceleration note, still offer CPU-based Ollama
- [ ] If offline → default: Ollama (if already installed) or None, show "Connect to internet for cloud AI"

##### Dependency Auto-Install & Validation (NEW)
- [ ] **Ollama detection & install** (improved over current basic flow):
  - [ ] Check if Ollama is installed by probing `http://127.0.0.1:11434/api/tags`
  - [ ] If not running, check if binary exists on PATH (`ollama --version` via IPC shell)
  - [ ] If binary exists but not running, offer "Start Ollama" button (not reinstall)
  - [ ] If binary not found, show platform-specific install:
    - **macOS**: download `.dmg` from `https://ollama.com/download/Ollama-darwin.zip`, mount, copy to `/Applications`, eject — all automated via IPC
    - **Windows**: download `.exe` installer, run silently via `start /wait`, detect completion
    - **Linux**: detect distro, run `curl -fsSL https://ollama.com/install.sh | sh` or suggest apt/brew
  - [ ] After install, wait for Ollama health, then proceed to model pull
  - [ ] Show real-time install progress in wizard UI (not just "Downloading...")
  - [ ] Handle permission errors (admin elevation prompt via Electron)

- [ ] **Bun installation check** (for advanced users / development mode):
  - [ ] Detect if Bun is available on PATH
  - [ ] If missing, offer `curl -fsSL https://bun.sh/install | bash` or platform-specific install

- [ ] **Git installation check** (for backup/versioning features):
  - [ ] Detect `git --version`
  - [ ] If missing, offer to install: `winget install Git.Git` / `brew install git` / `apt install git`

- [ ] **System dependencies check**:
  - [ ] Verify SQLite support (`bun:sqlite` is bundled, but check filesystem permissions)
  - [ ] Verify workspace directory is writable (create test file)
  - [ ] Verify port 3333 is free (or configurable)
  - [ ] Check firewall isn't blocking localhost

##### Wizard Steps (revised to 7-step flow)
- [x] Step 1: **Welcome & Language** — App logo, language picker (sv/en), "Get Started" — ✅ **Done**
- [ ] Step 2: **System Check** — NEW — Auto-detected hardware summary card (CPU, RAM, disk, GPU, OS, network). "Recommended: Local LLM with Ollama" or "Cloud AI via OpenRouter". User can accept or change.
- [x] Step 3: **Admin Account** — Company/tenant name, admin username, password (min 6 chars) — ✅ **Done** (was step 2)
- [ ] Step 4: **AI Provider** — REVISED — Ollama/OpenRouter/None with smart default from Step 2. Improved Ollama install flow (detect → install if missing → pull model with progress). If Ollama install is needed, show platform-specific instructions or auto-install via IPC.
- [x] Step 5: **Workspace Location** — Directory picker with disk space indicator — ✅ **Done** (was step 4)
- [ ] Step 6: **Dependencies** — NEW — Auto-install missing dependencies (Git, etc.). Show checklist: ☐ Ollama ✓, ☐ Model pulled ✓, ☐ Git installed ✓, ☐ Workspace writable ✓.
- [x] Step 7: **Summary & Finish** — Lists all choices, "Complete Setup" button — ✅ **Done** (was step 5)

##### Setup API Endpoints (existing)
- [x] `GET /api/setup/status` — returns `{ completed: boolean, hasAdmin: boolean }` — ✅ **Done**
- [x] `POST /api/setup/admin` — creates initial admin user — ✅ **Done**
- [x] `POST /api/setup/llm` — configures LLM provider — ✅ **Done**
- [x] `POST /api/setup/workspace` — sets workspace directory — ✅ **Done**
- [x] `POST /api/setup/complete` — marks setup as complete — ✅ **Done**
- [ ] New: `POST /api/setup/ollama/install` — trigger Ollama download/install on server side (if server can reach ollama.com)
- [ ] New: `POST /api/setup/system-info` — save hardware profile to `server_config` for telemetry/optimization

##### Resume Support & State Persistence (NEW)
- [ ] **Partial state persistence**: Save wizard progress to `setup-progress.json` after each step
- [ ] On restart, check progress file — if exists, resume at last completed step instead of starting over
- [ ] Clear progress file when setup completes successfully
- [ ] Auto-save form data (username, workspace path, etc.) so user doesn't re-type

##### Production Edge Cases
- [ ] **Reset**: Settings page has "Reset Setup" button that clears `setup-complete.json`, deletes admin user, clears progress, and redirects to setup wizard
- [ ] **Crash recovery**: If setup crashes mid-flow, next launch resumes from last saved progress step
- [ ] **Offline mode**: Detect no internet → skip Ollama download and model pull, recommend OpenRouter (and note that OpenRouter also needs internet). If completely offline, allow "None (skip AI)"
- [ ] **First-launch vs re-setup**: Distinguish between fresh install reset vs. setup reset after use — warn if data exists before allowing reset
- [ ] **Admin password change**: Link to Settings page post-setup
- [x] **No LLM configured**: AI features disabled with warning — ✅ **Done**
- [x] **Workspace changeable later**: Settings page — ✅ **Done**
- [x] **Admin password changeable later**: Settings page — ✅ **Done**

##### Security & Production Hardening
- [ ] Use `contextIsolation: true` + `sandbox: true` (already set in electron-main.mjs line 388-389)
- [ ] Validate all IPC payloads in main process — never trust renderer input
- [ ] Strip setup wizard code from production bundle after setup is complete (or lazy-load it)
- [ ] Never expose setup routes after admin user exists (`setupGuard` does this — ✅ done)
- [ ] Log all setup actions to audit log (already does for admin creation — `auditLog("setup.admin_created")`)
- [ ] Generate unique `app.getPath('userData')` per OS so reinstall doesn't corrupt old config

#### Phase 3: Auto-Update System (PRODUCTION OVERHAUL)

> Auto-update is not a v1.1 feature — ship it from day one. Based on electron-builder best practices:
> - `electron-updater` with GitHub Releases provider (zero infrastructure cost)
> - Differential updates (5-20 MB instead of 150 MB full installer)
> - Staged rollouts via release channels (canary → beta → stable)
> - Code signing required on macOS (auto-update won't work without it)

- [x] `electron-updater` dependency exists in `package.json`
- [x] `publish` config exists in electron-builder (mac, win, linux all point to `zerwiz/wayofwork` on `productionopticat`)
- [ ] **Wire `autoUpdater` into `electron/electron-main.mjs`**:
  - [ ] On app startup (after window created, non-blocking): `autoUpdater.checkForUpdatesAndNotify()`
  - [ ] `autoUpdater.on('checking-for-update')` → log
  - [ ] `autoUpdater.on('update-available', (info) =>` → send to renderer via IPC `update-available`
  - [ ] `autoUpdater.on('update-not-available')` → log, no user-facing message
  - [ ] `autoUpdater.on('download-progress', (progress) =>` → send `update-download-progress` IPC to renderer
  - [ ] `autoUpdater.on('update-downloaded', (info) =>` → send `update-ready` IPC, show "Restart to update" prompt
  - [ ] `autoUpdater.on('error', (err) =>` → log, silently fail (retry next launch)
- [ ] **Expose update events to renderer** via `electron/preload.cjs`:
  - [ ] `window.wopShell.onUpdateAvailable(callback)` — new version available
  - [ ] `window.wopShell.onUpdateProgress(callback)` — download percentage + bytes
  - [ ] `window.wopShell.onUpdateReady(callback)` — downloaded, restart prompt
  - [ ] `window.wopShell.restartAndUpdate()` — `autoUpdater.quitAndInstall()`
- [ ] Create `src/components/UpdateNotification.tsx` — UI for:
  - [ ] Toast banner when update is downloading (percentage bar)
  - [ ] "Restart to update" modal when download complete (with "Later" / "Restart Now" buttons)
  - [ ] Release notes display (from `info.releaseNotes`)
  - [ ] Error state: "Update check failed, will retry later" (dismissible)
- [ ] **Auto-update on macOS**: code signing is required. Without signing, auto-update can check and notify but cannot silently install. The user must manually download.
- [ ] **Staged rollouts**: use pre-release version components for channels (e.g. `1.0.1-alpha.1` for canary, `1.0.1-beta.1` for beta, `1.0.1` for stable). `detectUpdateChannel: true` in electron-builder config.
- [ ] **Differential updates**: enabled by default with electron-updater — only downloads changed files (5-20 MB vs 150 MB)
- [ ] **Forced updates**: add server-side `forceUpdate: true` flag for CVE-level severity — app refuses to start on old version
- [ ] **Update integrity**: electron-updater verifies SHA checksums automatically
- [ ] Generate `latest.yml` / `latest-mac.yml` / `latest-linux.yml` during build (auto-generated by electron-builder with `publish` config)

#### Phase 4: CI/CD Pipeline (PRODUCTION OVERHAUL)

> Based on starter-series/electron-app-starter best practices and electron-builder docs:
> - Matrix build on macOS, Windows, Linux runners in parallel
> - Code signing via GitHub Secrets
> - Draft releases first, publish after testing

- [ ] Create `.github/workflows/release.yml`:
  ```yaml
  name: Build & Release
  on:
    push:
      tags:
        - 'v*'
    workflow_dispatch:
      inputs:
        release_channel:
          description: 'Release channel'
          required: true
          default: 'stable'
          type: choice
          options:
            - stable
            - beta
            - alpha
  ```
  - **Jobs**:
    1. **CI Gate** — lint + type-check + Vite build (all platforms)
    2. **Matrix Build** — parallel on macOS, Windows, Linux:
       - macOS: `electron-builder --mac --publish onTag`
       - Windows: `electron-builder --win --publish onTag`
       - Linux: `electron-builder --linux --publish onTag`
    3. **Notarize** (macOS) — built-in via electron-builder `mac.notarize: true`
    4. **GitHub Release** — `softprops/action-gh-release` uploads all artifacts, creates draft release
    5. **Publish** — promotes draft to published release (auto-update picks it up)
- [ ] **Pre-CI setup**:
  - [ ] Bump version scripts: `npm run version:patch/minor/major` (update package.json version)
  - [ ] CHANGELOG.md maintained with each release
  - [ ] Git tag pushed: `git tag v1.0.1 && git push origin v1.0.1`
- [ ] **Code signing**:
  - **macOS** (required for auto-update):
    - Apple Developer Program ($99/year)
    - Developer ID Application certificate → exported as .p12 → base64 → `CSC_LINK` secret
    - `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` secrets for notarization
    - Hardened runtime entitlements in electron-builder config
    - Build on `macos-latest` runner (can't cross-compile signed macOS from Linux)
  - **Windows** (recommended for SmartScreen):
    - OV or EV Authenticode certificate → .pfx → base64 → `WIN_CSC_LINK` secret
    - `WIN_CSC_KEY_PASSWORD` secret
    - EV cert ($400-700/year) eliminates SmartScreen reputation period
    - Azure Trusted Signing as alternative (cloud-based, CI-friendly)
    - Build on `windows-latest` runner
  - **Linux** (no signing required, but AppImage can be GPG-signed)
- [ ] **CI best practices**:
  - [ ] `forceCodeSigning: true` in electron-builder config → fails build if signing misconfigured
  - [ ] Use `CSC_LINK`/`CSC_KEY_PASSWORD` env vars (never commit certs to git)
  - [ ] GitHub Secrets for all signing credentials
  - [ ] Build artifacts uploaded as Actions artifacts for manual testing before release
  - [ ] Draft release → QA test → publish
  - [ ] `electron-builder install-app-deps` in CI to rebuild native modules for Electron's Node ABI
- [ ] **Additional CI workflows**:
  - [ ] `ci.yml` — lint + type-check on every push/PR (fast feedback)
  - [ ] `codeql.yml` — CodeQL security analysis on push/PR + weekly
  - [ ] `maintenance.yml` — weekly CI health check, auto-creates issue on failure
  - [ ] `stale.yml` — labels inactive issues after 30 days, closes after 37

#### Phase 6: Hardcoded Path & Data Integrity Audit
👉 **MOVED TO**: [WOW-066 Hardcoded File Path Audit & Removal](WOW-066-hardcoded-filepaths.md)

#### Phase 5: Investigation & Alternatives
- [ ] Evaluate alternative deployment strategies:
  - **Docker Compose** — single `docker compose up` for server-side deployment (Linux VM / NAS / VPS)
  - **Bun single-file compile** — `bun build --compile server/index.ts` produces standalone binary, no Bun runtime needed
  - **Progressive Web App (PWA)** — host the frontend, users access via browser (no install needed)
  - **Native OS packages** — `.deb`/`.rpm` for Linux, Homebrew cask for macOS, Winget for Windows
  - **Cloud-hosted SaaS** — managed multi-tenant instance (requires WOW-063 tenant isolation)
- [ ] Document pros/cons of each approach for different user segments in `docs/deployment-strategy.md`
- [ ] Recommend optimal deployment matrix (e.g., desktop for single-company, Docker for self-hosters, SaaS for multi-tenant)

### Out of Scope
- Mobile app deployment (iOS/Android)
- Snap/Flatpak packaging
- In-app purchase / licensing system
- Enterprise MDM distribution

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`
- [ ] electron-builder completes for at least one platform: `bun run pack`
- [ ] GitHub Actions workflow runs successfully on push to `productionopticat`

### Manual Verification
- [ ] Installer downloads and installs on clean Windows machine (no Bun, no Node, no Git required)
- [ ] First-run setup wizard creates admin account
- [ ] App auto-updates when a new release is published to GitHub
- [ ] macOS installer is notarized and opens without Gatekeeper warning
- [ ] Windows installer runs without SmartScreen warning
- [ ] Update downloads in background without blocking the UI
- [ ] Bun compile binary works as standalone server (`bun build --compile`)

## Technical Notes

### Affected Components

#### Phase 1 — Self-Contained Installer
- `package.json` — electron-builder config: `extraResources` for Bun binary, `icon` fix, `publish` config
- `electron/electron-main.mjs` — resolve Bun path from `extraResources` instead of system PATH
- `electron/build/` — ensure proper icon placement for electron-builder
- `.gitignore` — add `release/` and `dist/` if not already

#### Phase 2 — Setup Wizard
- `src/pages/SetupWizard.tsx` — new setup wizard page
- `src/App.tsx` — check setup completion, redirect to wizard if not done
- `server/routes/setup.ts` — API for setup completion check and initial config
- `electron/electron-main.mjs` — handle `setup-complete` signal for window management

#### Phase 3 — Auto-Update
- `package.json` — add `electron-updater` dependency
- `electron/electron-main.mjs` — integrate `autoUpdater`, event handlers for update-check, download-progress, update-downloaded
- `electron/preload.cjs` — expose update events to renderer via IPC
- `src/components/UpdateNotification.tsx` — UI for update progress and restart prompt
- `.github/workflows/release.yml` — generate update metadata files

#### Phase 4 — CI/CD
- `.github/workflows/release.yml` — new workflow file
- GitHub Secrets: `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, `CSC_LINK`, `CSC_KEY_PASSWORD`, `WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD`
- `electron/notarize.js` — notarization script (optional, can use `afterSign` hook)

#### Phase 5 — Investigation
- `docs/deployment-strategy.md` — deployment comparison document
- No code changes needed initially

### Bundling Bun Binary

Download Bun prebuilt binaries:
```bash
# macOS ARM64
curl -LO https://bun.sh/install/bun-darwin-aarch64.zip
# macOS x64
curl -LO https://bun.sh/install/bun-darwin-x64.zip
# Windows x64
curl -LO https://bun.sh/install/bun-windows-x64.zip
# Linux x64
curl -LO https://bun.sh/install/bun-linux-x64.zip
```

electron-builder extraResources config:
```json
"extraResources": [
  {
    "from": "bin/${os}",
    "to": "bun",
    "filter": ["**/*"]
  }
]
```

In `electron-main.mjs`, resolve path:
```javascript
const bunPath = app.isPackaged
  ? path.join(process.resourcesPath, 'bun', process.platform === 'win32' ? 'bun.exe' : 'bun')
  : 'bun';
```

### Bun Compile Alternative

Bun supports compiling to a standalone binary:
```bash
bun build --compile --target=bun-linux-x64-modern server/index.ts --outfile wayofwork-server
bun build --compile --target=bun-windows-x64-modern server/index.ts --outfile wayofwork-server.exe
bun build --compile --target=bun-darwin-x64-modern server/index.ts --outfile wayofwork-server-macos-x64
bun build --compile --target=bun-darwin-arm64-modern server/index.ts --outfile wayofwork-server-macos-arm64
```

This produces a self-contained binary that includes Bun runtime and all dependencies. No Bun installation needed. This could replace the `extraResources` approach entirely.

### Update Flow

```
User launches app
  → electron-main checks for updates (autoUpdater.checkForUpdates())
  → If update available:
    → Download in background
    → Show progress bar in main window UI
    → On download complete:
      → Show "Restart to update" button
      → User clicks → app.restart (electron auto-installs)
  → If no update → proceed normally
```

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: XL

---

## Status Summary

### ✅ IMPLEMENTED
- Electron main process: Setup detection, Bun spawn, IPC handlers
- Setup wizard: 5-step wizard (React page, backend API)
- Setup API endpoints: `/api/setup/*` routes with `setupGuard`
- Wait for server: `wait-prod.mjs` health check
- electron-updater: Package dependency added

### ⚠️ BUILD ASSETS MISSING (Phase 0)
- `bin/` directory with download scripts
- Platform-specific Bun binaries
- Icon files in electron-builder default location

### 🚧 IN PROGRESS
- Phase 1: Wire up auto-update events to UI
- Phase 2: Hardware detection and smart defaults
- Phase 3: Bundle Bun binary in extraResources  
- Phase 4: CI/CD pipeline

### 📋 NEXT IMMEDIATE STEPS
1. Create `bin/` directory and download Bun scripts
2. Generate icon files from legacy SVG
3. Test Phase 0 with `bun run pack`
