# CTO Dashboard Fixes & Release Notes

## v0.5.4 (2026-06-18) — Update f-rr-d Button & Thoughts Root Auto-Detection

### Features
- **Update f-rr-d button**: Header button that pulls latest main from thoughts repo via `POST /api/update-forrad`
  - Spinner animation during sync, success/error feedback, auto-refreshes tickets after update
  - Switches from any branch to `main` before pulling (`git pull --ff-only origin main`)
  - Returns before/after commit hashes and pull output
- **Thoughts root auto-detection**: Finds thoughts repo across multiple standard paths
  - CWD-relative (`../thoughts`), `~/wayofmono/thoughts`, `~/.config/wodev/thoughts`, `~/src/wayofmono/thoughts`
  - Checks for `.git` directory or `shared` subdirectory
  - Falls back gracefully with configurable error message pointing to docs
- **Config layer support**: Uses same `getConfig()` system as rest of dashboard
  - `THOUGHTS_ROOT` env var
  - `~/.config/wodev/config.json` with `thoughtsRoot` key
  - `~/.config/wodev/.env` (loaded by wodev.js)
  - Auto-detection fallback
- **Local ticket source fixed**: Installed npm package now correctly finds thoughts repo for local ticket reading

### Files
- `ui/src/app/api/update-forrad/route.ts` — New API endpoint
- `ui/src/app/page.tsx` — Update button in header with loading/feedback
- `ui/src/lib/env.ts` — `detectThoughtsRoot()` auto-detection

### Verified
- Tickets API returns 152 tickets (was `[]` before fix)
- Update endpoint returns `"success":true` and `"Already up to date."` on re-run
- Auto-detection finds thoughts repo at `~/wayofmono/thoughts` from installed package CWD
- Pull switches from any branch to `main` before fetching
- Button shows spinner while syncing, auto-refreshes tickets on success
- Works without any manual config — zero-setup for devs with standard `~/wayofmono/` layout
- Configurable via `THOUGHTS_ROOT` env, `~/.config/wodev/config.json`, or `.env`

## v0.5.3 (2026-06-17) — Ticket Skill Notification Integration + Deprecated Skill Cleanup

### Features
- **Ticket skill notification integration**: `ticket-manager`, `ticket-executor`, `validate-plan` skills now mark CTO Dashboard notifications as read via API
  - `ticket-manager`: Marks `review-<TICKET_ID>` after review actions, `update-<TICKET_ID>` after status changes
  - `ticket-executor`: Marks notifications as read after phase completion
  - `validate-plan`: Marks notifications as read after validation
- **Notification API integration**: All 3 ticket skills updated across all 7 tools (opencode, claude, gemini, pi, wocode, antigravity, codex)
- **AGENTS.md updated**: Added ticket lifecycle, namespaces, notification integration docs
- **Deprecated skill removed**: `wow-tickets` skill removed from all 7 tools (replaced by namespace-agnostic `ticket-manager`)
- **Manifest.json cleaned**: Removed all `wow-tickets` entries from manifest

### Files
- `packages/@aiengineeringharness/*/skills/ticket-manager/SKILL.md` (7 tools + pi extension)
- `packages/@aiengineeringharness/*/skills/ticket-executor/SKILL.md` (7 tools + pi extension)
- `packages/@aiengineeringharness/*/skills/validate-plan/SKILL.md` (7 tools + pi extension)
- `AGENTS.md` - Added ticket lifecycle, namespaces, notification integration docs
- `packages/@aiengineeringharness/manifest.json` - Removed all wow-tickets entries
- Deleted: `packages/@aiengineeringharness/*/skills/wow-tickets/` (8 directories)

---

## v0.5.2 (2026-06-17) — Notification Read State Tracking (WOMONO-095) (2026-06-17) — Platform-Aware Installer + Major Dashboard Updates

### Major Features
- **Platform-aware harness installer (WOMONO-094)**: Complete detection + adaptation layer for OS, arch, tools, runtime, desktop, hardware, terminal, network, security, permissions
- **11 detection modules**: `os`, `arch`, `tools`, `runtime`, `desktop`, `hardware`, `terminal`, `network`, `security`, `permissions`, `locale` (cached, with confidence levels)
- **4 adaptation modules**: `paths` (XDG), `formats` (snake_case/kebab-case), `deps` (apt/dnf/brew/winget), `desktop` (.desktop files, clipboard, xdg-open)
- **Supporting modules**: `logger.ts` (persistent log with secret redaction), `transaction.ts` (atomic installs, rollback, file locking), `report.ts` (JSON report, PII sanitization, dashboard push)
- **CLI flags**: `--detect` (system report), `--tool=auto` (install only detected tools), `--no-report`/`WOMONO_DO_NOT_TRACK` (telemetry opt-out), `--debug` (verbose logging)
- **Dotfile hygiene**: `# BEGIN/END WOMONO HARNESS` comment blocks for idempotent shell config injection
- **Supply-chain security**: Optional `sha256` field in manifest.json FileEntry; installer verifies checksums on remote downloads

### Dashboard Features (v0.4.35 carried forward)
- **Interactive Docs File Tree**: Dynamic clickable file tree built from actual `docs[]` data. Folders expand/collapse, files are clickable.
- **Doc Markdown Preview**: Doc cards and file tree entries open a full MarkdownPreview dialog with rendered markdown + raw mode toggle.
- **Profile/Settings views now render**: Added `case 'profile'` and `case 'settings'` to `renderView()` switch in `page.tsx`, added imports, added labels, added to `ViewMode` type.
- **Electron taskbar icon**: Fixed icon path from non-existent `public/favicon.ico` to `electron/build/icon.png` via `nativeImage.createFromPath()`. Added `mainWindow.setIcon()`, `app.setAppUserModelId()`, `app.setName()`. Added `registerLinuxIcon()` in `wodev.js` that creates `~/.local/share/applications/wayofmono-cto-dashboard.desktop` (proper Linux way for taskbar icons across GNOME/KDE/etc).
- **public/favicon.ico**: Created from electron/build/icon.png so web version also has icon.
- **Version in banner**: Now displays `v0.5.0` in CLI logo next to "⟡ CTO DASHBOARD" and build/production headers.

### New Directories
- `thoughts/shared/news/`, `thoughts/shared/standups/`, `thoughts/shared/ideas/` for future per-entry persistence.

---

## v0.4.36 (2026-06-17) — wodev.js crash fix

### Fixes
- **`fs` is not defined in `registerLinuxIcon()`**: Added `writeFileSync` to the named import from `'fs'` and replaced `fs.xxx` calls with bare function names (`existsSync`, `mkdirSync`, `writeFileSync`) to match the ESM named-import pattern. wodev.js previously crashed at startup with `ReferenceError: fs is not defined`.

---

## v0.4.35 (2026-06-17) — Interactive Docs View + Profile/Settings Routing Fix + Linux Taskbar Icon

### Features
- **Interactive Docs File Tree**: Replaced static ASCII tree with dynamic clickable file tree built from actual `docs[]` data. Folders expand/collapse, files are clickable.
- **Doc Markdown Preview**: Doc cards and file tree entries open a full MarkdownPreview dialog with rendered markdown + raw mode toggle.
- **Version in banner**: `v0.4.34` now displayed in CLI logo next to "⟡ CTO DASHBOARD" and build/production headers.

### Fixes
- **Profile/Settings views now render**: Added `case 'profile'` and `case 'settings'` to `renderView()` switch in `page.tsx`, added imports, added labels, added to `ViewMode` type. Previously clicking Profile/Settings in sidebar silently showed Overview.
- **Electron taskbar icon**: Fixed icon path from non-existent `public/favicon.ico` to `electron/build/icon.png` via `nativeImage.createFromPath()`. Added `mainWindow.setIcon()`, `app.setAppUserModelId()`, `app.setName()`. Added `registerLinuxIcon()` in `wodev.js` that creates `~/.local/share/applications/wayofmono-cto-dashboard.desktop` (proper Linux way for taskbar icons across GNOME/KDE/etc).
- **public/favicon.ico**: Created from electron/build/icon.png so web version also has icon.

### New
- `thoughts/shared/news/`, `thoughts/shared/standups/`, `thoughts/shared/ideas/` directories created for future per-entry persistence.

### Files Changed
- `ui/src/components/dashboard/docs-view.tsx` — Full rewrite: FileTree component, buildTree utility, preview dialog state
- `ui/src/app/page.tsx` — Added ProfileView/SettingsView imports, labels, renderView cases
- `ui/src/lib/types.ts` — Added 'profile' and 'settings' to ViewMode
- `ui/electron/main.ts`, `ui/electron/main.js` — nativeImage icon, setIcon(), setAppUserModelId(), setName()
- `ui/bin/wodev.js` — registerLinuxIcon() for Linux desktop file, version in banner

### Migration
```bash
sudo wodev --build && wodev
```

---

## v0.4.34 (2026-06-17) — In-Sidebar Collapse Toggle + Pincode-to-GitHub Account Merging

### Changes
- **In-sidebar collapse toggle**: Collapse/expand button is at the bottom of the nav area (just above sync) — shows `[<] Collapse` when expanded, `[>]` icon when collapsed. No more fixed-position button outside causing overlap/click-through crashes with the header Back button
- **Back button crash fixed**: Removed the old fixed `z-50` collapse toggle — it was overlapping the header back button area in certain sidebar states

### Features
- **Pincode users can connect GitHub**: Profile GitHub Connection section is now dynamic:
  - GitHub OAuth users: green check + "Connected as @username" (unchanged)
  - Pincode users: "Connect GitHub" button → enter GitHub username → saves link mapping → signs in via GitHub OAuth → account is merged
  - After linking, users can sign in with either pincode or GitHub
  - Link mappings stored in `~/.config/wodev/github-links.json`
- **NextAuth signIn checks link mappings**: When a GitHub user doesn't match any developer's `githubUsername`, the signIn callback falls back to checking pincode link mappings in `github-links.json`
- **`authMethod` tracking**: Auth store now tracks whether user authenticated via `'github'` or `'pincode'` — drives dynamic Profile UI
- **Logout uses `signOut()` from next-auth/react**: Sidebar logout now clears the NextAuth JWT cookie properly (was using store's local `logout()` which left stale sessions)

### New Files
- `ui/src/app/api/link-github/route.ts` — CRUD API for pincode-to-GitHub link mappings (POST/GET/DELETE)

### Files Changed
- `ui/src/store/dashboard-store.ts` — Added `authMethod`, `setFromSession` implementation
- `ui/src/components/dashboard/sidebar.tsx` — Collapse toggle at bottom of nav (not header), Profile/Settings nav items restored, user section clickable → Profile
- `ui/src/components/dashboard/profile-view.tsx` — Dynamic GitHub connection section with linking UI
- `ui/src/components/dashboard/login-page.tsx` — Clears pending link from localStorage after OAuth redirect
- `ui/src/lib/auth.ts` — signIn callback checks `github-links.json` for pincode mappings

### Migration
```bash
sudo wodev --build && wodev
```

---

## v0.4.32 (2026-06-17) — Structure-Agnostic Developer Discovery + Git Tree API Fix

### Fixes
- **Git Trees API URL fixed**: Removed `{branch}:{path}` pattern — just uses `{branch}` (branch name works as tree SHA)
- **f-rr-d paths fixed**: Removed hardcoded `thoughts/` prefix — all paths relative to repo root
- **walkGitHubDir non-recursive**: Single `recursive=1` tree API call instead of per-directory recursion
- **parts[2]→parts[1] index bug**: `getDevelopers` path parsing assumed 3-part paths, now uses 2-part

### Refactored
- **getDevelopers GitHub mode is structure-agnostic**: Scans tree for `config.md` at **any depth** — parent directory = dev name, grandparent = project. Handles any f-rr-d repo structure change without code changes.
- **Auth fallback**: Falls back to local source when no access token is available
- **Token debug logging**: Added token presence logging to NextAuth signIn/session callbacks

### Key Design Decision
The old code assumed `thoughts/<project>/<developer>/config.md` (fixed 3-level depth). Now it recursively scans the entire tree for `config.md` files and infers the developer name (parent dir) and project (grandparent dir) automatically. This makes it resilient to any structural change in the f-rr-d repo.

### Migration
```bash
sudo wodev --build && wodev
```

---

## v0.4.31 (2026-06-17) — GitHub OAuth: Fixed Developer Fetching with Access Token

### Fixes
- **getDevelopers uses access_token**: OAuth callback passes access_token to fetch developers from GitHub
- **Debug logging**: Full trace of GitHub API calls, config parsing, developer matching
- **Reads githubUsername from config.md**: Matches GitHub OAuth user to f-rr-d developer
- **Known role overrides**: Maps local usernames to GitHub usernames (craig→craigmartin, etc.)

### GitHub Org OAuth App Restriction (Known Issue)
The Way-Of organization has **OAuth App access restrictions enabled**, causing 403 errors when fetching developers/tickets from GitHub API.

**To fix:** Org admin must approve the OAuth App at:
```
https://github.com/organizations/Way-Of/settings/oauth_application_policy
```
Find Client ID `Ov23liy3r3AGOFaXT6YV` and click "Approve".

### Working
- Pincode login works (no GitHub API needed)
- JWT secret fixed (no decryption errors)
- Auth route working
- Debug logging active

---

## v0.4.29 (2026-06-17) — GitHub OAuth Fixed + Debug Logging

### Fixes
- **Fixed auth route**: Removed custom GET/POST wrapper, restored `export { handler as GET, handler as POST }`
- **Permanent NEXTAUTH_SECRET**: Hardcoded to v0.4.21 value — never changes
- **Debug logging**: Comprehensive NextAuth callback logging for troubleshooting
- **JWT secret fixed**: No more decryption errors on updates

### Working
- No JWT decryption errors
- Auth route handlers working
- NextAuth callbacks firing with debug logs
- Next.js server starts on port 6969

### Migration
```bash
sudo npm update -g @wayofmono/wo-cto-dashboard
sudo wodev --build
wodev   # Electron app with working OAuth
```

### One-Time Fix for Users on Broken Versions (v0.4.22-v0.4.25)
```bash
rm -rf ~/.config/wodev/
rm -rf ~/.config/Electron/Cookies ~/.config/Electron/Local\ Storage ~/.config/Electron/Session\ Storage
wodev
```

---

## v0.4.23 (2026-06-16) — Fixed NEXTAUTH_SECRET Constant for Cookie Persistence

### Critical Fix
- **JWT secret now hardcoded constant** — never changes across versions
- **Old cookies decrypt correctly** on `npm update` — users don't need to clear cookies
- **Works automatically** on updates — zero user intervention

### The Problem
Each version generated a new secret (SHA256 of version), causing `JWT_SESSION_ERROR: decryption operation failed` on every update because old JWT cookies couldn't be decrypted with the new secret.

### The Solution
```javascript
// ui/bin/wodev.js - NEVER CHANGE THIS STRING
const fixedSecret = '68870c1363f4721bf3a154d3e524b54a34ac5eb683e4d7dc53c426edc10e41d7';
```

This is SHA256("wo-cto-dashboard-0.4.21") — the last working version before the broken versions.

### Migration (Automatic for Most Users)
```bash
sudo npm update -g @wayofmono/wo-cto-dashboard
wodev   # Just works — old cookies still decrypt
```

### One-Time Fix for Users on Broken Versions (v0.4.22-v0.4.25)
If you get `JWT_SESSION_ERROR: decryption operation failed`:
```bash
# Linux
rm -rf ~/.config/Electron/Cookies ~/.config/Electron/Local\ Storage ~/.config/Electron/Session\ Storage

# macOS
rm -rf ~/Library/Application\ Support/Electron/Cookies ~/Library/Application\ Support/Electron/Local\ Storage ~/Library/Application\ Support/Electron/Session\ Storage

# Windows
del %APPDATA%\Electron\Cookies %APPDATA%\Electron\Local\ Storage %APPDATA%\Electron\Session\ Storage
```
Then restart `wodev`. This only needs to be done **once** — future updates work automatically.

---

## v0.4.22 (2026-06-16) — Auto-Login After GitHub OAuth Callback

### Fixes
- **LoginPage auto-detects NextAuth session** after GitHub OAuth redirect
- **Syncs session data** (devId, devRole, accessToken) with auth store
- **Auto-redirects to dashboard** instead of staying on login page

### Flow
1. User clicks "Sign in with GitHub" → GitHub authorization
2. User completes GitHub mobile 2FA → redirects to `/api/auth/callback/github` → `/`
3. LoginPage detects authenticated session → logs in user → redirects to dashboard

### Migration
```bash
sudo npm update -g @wayofmono/wo-cto-dashboard
sudo wodev --build
wodev
```

---

## v0.4.21 (2026-06-16) — Electron Production UI Fixed

### Fixes
- **Removed `output: "standalone"`**: Was baking NEXTAUTH_SECRET at build time, causing JWT decryption errors at runtime
- **Electron uses `next start`**: Reads env vars (NEXTAUTH_SECRET, OAuth credentials) at runtime — same as web server
- **Consistent secret**: Deterministic SHA256 secret works across Electron + web
- **CSS/Tailwind loads correctly**: Regular Next.js server serves static assets properly

### Result
- Electron desktop app matches web UI exactly (colors, layout, buttons responsive)
- GitHub OAuth login works in Electron
- Sessions persist across restarts

### Migration
```bash
sudo npm update -g @wayofmono/wo-cto-dashboard
sudo wodev --build
wodev   # Electron desktop app with full UI + working OAuth
```

---

## v0.4.20 (2026-06-16) — Removed Standalone Output

### Fixes
- **Fixed JWT decryption errors**: NEXTAUTH_SECRET is now deterministic (SHA256 of version) instead of random per-run
- **Session persistence**: Login sessions survive app restarts and rebuilds
- **Same secret across Electron/web**: Both modes use identical secret

### Migration
```bash
sudo npm update -g @wayofmono/wo-cto-dashboard
wodev   # GitHub OAuth + sessions work correctly
```

---

## v0.4.18 (2026-06-16) — Electron Production Mode Fixed

### Fixes
- **Electron production mode**: Fixed `wodev` (default) to launch Electron app with standalone Next.js server
- **Standalone server in Electron**: Added `startNextProdServer()` to spawn `node .next/standalone/server.js` in production
- **Dev/Prod detection**: `isDev = !app.isPackaged && process.env.NODE_ENV !== 'production'` for correct mode
- **GPU errors in CI**: Xvfb virtual display GPU warnings are non-fatal

### Features
- **Default is Electron app**: `wodev` launches desktop app, `wodev --web` for web server
- **Embedded OAuth credentials**: Works out of the box for Way-Of team

### Migration
```bash
sudo npm update -g @wayofmono/wo-cto-dashboard
sudo wodev --build    # one-time build
wodev                 # launches Electron desktop app
```

---

## v0.4.17 (2026-06-16) — Electron main.ts Compilation

### Fixes
- **ESBuild compilation**: Added `prepublishOnly` script to compile `electron/main.ts` → `electron/main.js`
- **Electron entry point**: Fixed `ERR_UNKNOWN_FILE_EXTENSION` for `.ts` in production

---

## v0.4.16 (2026-06-16) — Electron Default Launch

### Features
- **Default command is Electron**: `wodev` (no args) launches desktop app
- **`--web` flag**: `wodev --web` runs production web server
- **`--dev` flag**: `wodev --dev` runs dev web server with hot reload
- **Version display**: Build output now shows version

### Migration
```bash
wodev              # Electron app (default)
wodev --web        # Web server
wodev --dev        # Dev server
wodev --build      # Build
```

---

## v0.4.15 (2026-06-16) — Electron TypeScript Fix

### Fixes
- **TypeScript compilation**: Added esbuild to compile electron/main.ts for production

---

## v0.4.14 (2026-06-16) — runElectron Port Bug Fix

### Fixes
- **Fixed `port is not defined`**: `runElectron()` now defines `port` locally

---

## v0.4.13 (2026-06-16) — Zero-Setup GitHub OAuth

### Features
- **Pre-embedded Way-Of OAuth credentials**: Shared OAuth App under Way-Of org works for all developers out of the box
- **Zero-setup GitHub login**: `npm install -g @wayofmono/wo-cto-dashboard && wodev` → click "Sign in with GitHub"
- **`wodev --setup` only for custom orgs**: Pre-configured defaults overrideable via `~/.config/wodev/.env` or env vars

### Migration from v0.4.10
```bash
sudo npm update -g @wayofmono/wo-cto-dashboard
wodev   # GitHub login just works, no --setup needed
```

---

## v0.4.10 (2026-06-16) — Setup Command Refactor

### Features
- **`wodev --setup`**: Interactive wizard to configure GitHub OAuth Client ID and Secret
- **Auto-loads `~/.config/wodev/.env`**: User config persists across npm updates
- **`NEXTAUTH_URL` auto-set**: Defaults to `http://localhost:{PORT}`, no manual config needed
- **`NEXTAUTH_SECRET` auto-generated**: Random 32-byte hex, no `openssl rand` needed

### Setup
```bash
wodev --setup
# Enter your GitHub Client ID and Client Secret
# Callback URL: http://localhost:6969/api/auth/callback/github
```

### Migration from v0.4.9
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard
wodev --setup     # requires Client ID + Secret from GitHub OAuth App
sudo wodev --build
wodev
```

---

## v0.4.9 (2026-06-16) — GitHub OAuth Setup Wizard

### Features
- `NEXTAUTH_SECRET` auto-generated via `crypto.randomBytes(32)` when not set

### Migration from v0.4.7
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard@0.4.8
sudo wodev --build
wodev
```

---

## v0.4.7 (2026-06-16) — Wodev Character + Process Exit Fix

### Fixes
- **Build no longer killed immediately**: Removed `process.exit(0)` after `runNext('build')` — was terminating the parent Node.js process right after spawning the child, killing `next build` before it could run
- **Same fix for `wodev --dev`**: Removed premature `process.exit(0)`
- **`npx prisma generate` no longer hangs**: Uses direct prisma binary path via `require.resolve()` first, falls back to `npx --yes`

### Features
- **Wodev character greeting**: Rotating welcome messages on startup, matching WoCode's "Yo! I'm Wo" style:
  - 🤖 "Yo! I'm Wodev — your deploy dashboard..."
  - ☕ "Wodev online. I handle the deploys so you can handle the important stuff..."
  - 🚀 "Ship it! Oh wait, that's my line..."
  - 🎩 "Ah, the CTO arrives..."
  - 🔥 "Wodev here. Your PR queue is glowing..."
- Funny messages now appear in ALL modes: production, dev, and the "no build found" hint screen

### Migration from v0.4.6
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard@0.4.7
sudo wodev --build
wodev
```

---

## v0.4.6 (2026-06-16) — [BROKEN - do not use] Syntax Error

### Known Issues
- Syntax error: missing closing brace in `bin/wodev.js` — crashes on startup
- Use v0.4.7 instead

---

## v0.4.5 (2026-06-16) — Welcome Messages (First Attempt)

### Features
- Welcome messages on startup (non-build modes)

### Known Issues
- Messages were one-liners, not character-style like WoCode
- `process.exit(0)` after `runNext()` killed child processes immediately
- Use v0.4.7 instead

---

## v0.4.4 (2026-06-16) — Prisma Generate Fix

### Fixes
- `wodev --build` now runs `npx prisma generate` before `next build` (required for global installs where Prisma client is not pre-generated)
- `postinstall` script now runs `prisma generate` + `electron-builder install-app-deps` (gracefully handles missing electron-builder)

### Migration from v0.4.3
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard@0.4.4
sudo wodev --build
wodev
```

---

## v0.4.3 (2026-06-16) — Dependency Fix

### Fixes
- `@tailwindcss/postcss`, `tailwindcss`, `tw-animate-css`, `typescript`, `@types/react`, `@types/react-dom` moved from `devDependencies` → `dependencies` so global npm installs can build

### Migration from v0.4.2
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard@0.4.3
sudo wodev --build
wodev
```

---

## v0.4.2 (2026-06-16) — node-fetch Removal

### Fixes
- Removed `import fetch from 'node-fetch'` in `src/lib/thoughts.ts` — uses global `fetch` (Node 18+) instead

### Migration from v0.4.1
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard@0.4.2
sudo wodev --build
wodev
```

---

## v0.4.1 (2026-06-16) — Build Flag Fix + ASCII Art Logo

### Fixes
- `wodev --build` no longer passes `-p` flag to `next build` (which doesn't accept it) — build now actually runs
- Build was silently failing because `next build -p 6969` doesn't recognize `-p`

### Features
- **Orange ASCII art logo**: WODEV banner displayed on startup (matching harness install.ts orange theme)
- **Colorful terminal output**: Orange, green, yellow, dim ANSI helpers throughout all messages
- **Better error messages**: Boxed hints with sudo vs local-prefix guidance

### Migration from v0.4.0
```bash
sudo npm update -g @wayofmono/wo-cto-dashboard
sudo wodev --build    # actually works now
wodev
```

---

## v0.4.0 (2026-06-16) — Production Mode Fix

### Breaking Changes
- `wodev` now defaults to **production mode** (`next start`, read-only) instead of dev mode
- `wodev --dev` required for development server with hot reload

### Features
- **Production mode**: `wodev` runs `next start` — no `.next` writes, works as normal user after sudo install
- **`wodev --build`**: One-time production build (`next build`, needs write access)
- **`wodev --dev`**: Dev server with Turbopack hot reload (`next dev --turbopack`)
- **Build check**: Detects missing `.next/` and prompts user to run `wodev --build` first
- **Recommended install**: `npm config set prefix ~/.npm-global` — no sudo at all, everything writable by user

### Fixes
- EACCES error when running `wodev` after `sudo npm install -g` (`.next/` was root-owned)
  - Workflow: `sudo npm install -g` → `sudo wodev --build` → `wodev` (as user)
  - Better: use local prefix install (no sudo)

### Migration from v0.3.x
```bash
# Update
sudo npm update -g @wayofmono/wo-cto-dashboard

# If using sudo install, rebuild:
sudo wodev --build

# Then run as normal user:
wodev
```

---

## v0.3.1 (2026-06-16) — npm Registry Propagation Fix + Self-Update

### Features
- **`wodev --update`**: Self-update command that runs `npm update -g @wayofmono/wo-cto-dashboard`

### Fixes
- Resolved npm registry CDN cache propagation issue after initial v0.3.0 publish
- Package now immediately visible via `npm view` and installable worldwide

### Known Issues
- `npm install -g` may fail with EACCES on systems without write access to `/usr/lib/node_modules/`
  - Fix: `sudo npm install -g @wayofmono/wo-cto-dashboard`
  - Fix: `npm config set prefix ~/.npm-global && export PATH=$PATH:~/.npm-global/bin`
- Both READMEs updated with EACCES workaround instructions (`npx` preferred, or sudo/local-prefix)

---

## v0.3.0 (2026-06-16) — Standalone npm Package + Port Change

### Breaking Changes
- **Port changed**: 3000 → 6969 (uncommon port, avoids conflicts with common dev servers)

### Features
- **npm Package**: Published `@wayofmono/wo-cto-dashboard@0.3.0` on npm registry
- **Standalone Repo**: UI extracted to `github.com/Way-Of/wayofdev` (128 files)
- **CLI Entry Point**: `wodev` command via `npx @wayofmono/wo-cto-dashboard` or `npm install -g @wayofmono/wo-cto-dashboard`
- **Zero bun dependency**: `wodev` uses node + next from node_modules instead of bun

### Files Changed
- `package.json` - name: `@wayofmono/wo-cto-dashboard`, version 0.3.0, private:false, type:module, added files[] field
- `bin/wodev.js` - rewritten to use `process.execPath` + `require.resolve('next/dist/bin/next')` instead of bun
- `.gitignore` - fixed to not ignore project's own docs/ and .env.example
- `.env.example` - port updated to 6969
- `electron/main.ts` - port updated to 6969
- `Dockerfile`, `Caddyfile`, `docker-compose.yml` - port updated to 6969
- All scripts (dev.sh, .zscripts/) - port updated to 6969
- `README.md` - all port references updated to 6969
- All docs - port references updated to 6969

### Installation
```bash
# Global install
npm install -g @wayofmono/wo-cto-dashboard
wodev

# Or npx
npx @wayofmono/wo-cto-dashboard

# From source (GitHub)
git clone https://github.com/Way-Of/wayofdev.git
cd wayofdev
npm install
npm run dev
```

### New Files
- `bin/wodev.js` — CLI entry point

---

## v0.2.1 (2026-06-16) — GitHub Ticket Source & Authentication

### Features
- **GitHub Ticket Source**: Fetch tickets directly from private `f-rr-d` GitHub repo (main branch)
- **Source Switch**: Toggle between Local (`thoughts/`) and GitHub in Tickets view
- **Branch Selector**: Dropdown to select branch (main, develop, staging) with auto-refetch
- **5-min Caching**: In-memory cache with branch-aware invalidation
- **Fallback**: Auto-falls back to local filesystem if GitHub returns no tickets
- **GitHub OAuth**: NextAuth.js with GitHub provider for private repo access
  - Scopes: `read:user user:email repo`
  - Maps GitHub users to developers in `thoughts/` repo
  - JWT session includes access token for authenticated API calls

### API Changes
- `GET /api?type=tickets&source=github&branch=main` — Fetch from GitHub
- `GET /api?type=tickets&source=local` — Fetch from local filesystem (default)
- `GET /api/auth/[...nextauth]` — NextAuth.js handler

### New Files
-Environment Variables
```bash
GITHUB_CLIENT_ID=xxx          # GitHub OAuth App Client ID
GITHUB_CLIENT_SECRET=xxx      # GitHub OAuth App Client Secret
NEXTAUTH_SECRET=xxx           # Generate with: openssl rand -base64 32
```

### Files Changed
- `ui/src/lib/thoughts.ts` — GitHub fetching logic, caching, fallback
- `ui/src/app/api/route.ts` — Added source/branch query params
- `ui/src/store/dashboard-store.ts` — Added ticketSource, ticketBranch state
- `ui/src/components/dashboard/tickets-view.tsx` — Source switch, branch selector, refresh button
- `ui/src/lib/types.ts` — Added TicketSource type
- `ui/src/lib/auth.ts` — NextAuth.js GitHub provider config
- `ui/src/app/api/auth/[...nextauth]/route.ts` — Auth handler

---

## v0.2.0 (Previous) — Initial Dashboard Release

### Features
- Team visibility: tickets, velocity, blockers across projects
- Skill health: real-time skill installation status across machines
- Standups: daily async check-ins (yesterday/today/blockers)
- Idea board: prioritized ideas with voting
- Review queue: PRs waiting for review
- Multi-project: WayOfMono (WOMONO), WayOfWork (WOW), Opticat (OPT)

### Tech Stack
- Next.js 16 (App Router)
- Prisma + SQLite
- Zustand for state management
- Radix UI + Tailwind CSS
- Lucide React icons

### Run Locally
```bash
cd ui && pnpm install && pnpm dev
# Starts on http://localhost:3000
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api` | List tickets, developers, docs |
| POST | `/api/ideas` | Create new idea |
| POST | `/api/standup` | Create standup entry |
| POST | `/api/news` | Create news item |
| GET | `/api/news` | List news items |
| GET | `/api/skills/report` | Skills health report |
| POST | `/api/skills/report` | Submit skills report |