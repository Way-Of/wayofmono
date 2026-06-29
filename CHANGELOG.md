# Changelog

## [1.8.4] - 2026-06-29

### Harness (AI Engineering Harness v1.8.4)
- **Subagent extension import path fixed (WOMONO-115)**: Fixed `agent/extensions/subagents-index.ts` import from `./agents.js` to `./subagent/agents.ts` — resolves "Cannot find module './agents.js'" error on pi startup.
- **Worker agent renamed to coder (WOMONO-115, WOMONO-116)**: Renamed `worker.md` → `coder.md` in both `packages/@aiengineeringharness/pi/agent/agents/` and `packages/@aiengineeringharness/pi/agent/extensions/subagent/agents/`.
- **Subagent agents rewritten with operational protocols (WOMONO-116)**: Updated `planner`, `reviewer`, `scout`, `coder` in both main agents folder and subagent extension with mandatory workflows, file generation requirements, directory integrity rules, completion signals (`[PLAN_COMPLETE]`, `[REVIEW_COMPLETE]`, `[RECON_COMPLETE]`, `[CODE_COMPLETE]`), and safety protocols (bash limits, read-only enforcement). Modeled after reference implementation in `/ref/pip/.pi/agents/agents/`.

## [1.7.9] - 2026-06-26

### Harness (AI Engineering Harness v1.7.9)
- **`--uninstall` recursive fix**: Changed `Deno.remove(dir)` to `Deno.remove(dir, { recursive: true })` so subdirectories (skills/, agents/, etc.) are fully deleted even when non-empty.
- **Multi-tool command alignment (WOMONO-085)**: Created 168 command files across all 7 tools for 24 slash commands (ticket workflow, sync, fixes, etc.). All commands registered in config-manifest YAMLs and compiled into manifest.json.

## [1.7.8] - 2026-06-26

### Harness (AI Engineering Harness v1.7.8)
- **`--purge` flag added**: Nuclear cleanup — wipes all harness config dirs regardless of manifest. Supports `--dry-run`, `--yes`, single-tool or `all`. Added to install.ts and install.ps1.
- **Skill consolidation (WOMONO-083)**: Deleted 5 skills (`skill-compliance-checker`, `skill-adapter`, `skill-auto-update`, `build-skill-adapter`, `build-skill-auto-update`) from all 7 tools. All functionality absorbed into `build-tool-skill` with expanded SKILL.md (validation, adaptation, lifecycle, config-manifest), 8 new assets, and updated YAML entries.
- **Wo Coder naming changed to kebab-case**: All 72 skill directories in `wocode/agent/skills/` renamed from snake_case to kebab-case (matching Pi convention). Updated AGENTS.md, build-tool-skill SKILL.md, and wocode.yaml.

## [1.7.7] - 2026-06-23

### Harness (AI Engineering Harness v1.7.7)
- **Per-tool naming compliance (WOMONO-076)**: Researched online docs for ALL 7 tools — OpenCode/Pi use kebab-case (hyphens), Claude/Codex/Antigravity/Wocode use snake_case. Fixed opencode-skill-update.py (snake→kebab), corrected AGENTS.md table. Deleted 72 kebab dirs from 5 tools, copied 2 kebab-only dirs to snake with corrected name. Converted 841 manifest src paths kebab→snake.
- **investor-ready-doc-gen enhanced (WOMONO-077)**: Added brand color detection, Marp CLI platform-install guide, Mermaid charts, anti-overflow QA checklist. Synced to all 7 tools.

## [1.7.6] - 2026-06-23

### Harness (AI Engineering Harness v1.7.6)
- **Full skill compliance: 981→0 errors (WOMONO-076)**: Fixed 650 TOOLS_CASE, 282 NAME_CONVENTION, 40 NO_FRONTMATTER, 2 MISSING_DMI, 7 alignment errors across all 845 skills / 7 tools
- **Pi frontmatter fixed**: 72 Pi skill files had `name` in snake_case but Pi requires kebab-case — caused real Pi startup errors. Bulk-fixed to match directory names.
- **Claude tools casing**: 105 Claude skills changed `allowed-tools` from lowercase to PascalCase. Also fixed 50 other tool files for tool name casing consistency.
- **Broken YAML frontmatter fixed**: 50 files had invalid YAML in `allowed-tools:` (list format `- read` on same line as key). Rewrote to comma-separated string format.
- **Wocode spec corrected**: Changed from kebab→snake to match actual directory naming.
- **Manifest recompiled**: Removed stale `womono-deploy` entry from pi.yaml, fixed `init_harness` path in wocode.yaml, bumped to v1.7.6.
- **Cross-tool alignment**: Added missing `init_harness` to wocode. All 7 tools now have identical skill sets (79 normalized skills each).

## [1.7.4] - 2026-06-22

### Harness (AI Engineering Harness v1.7.4)
- **OpenCode skills renamed to kebab-case (WOMONO-073)**: Fixed 74 SKILL.md `name:` fields and directory names from snake_case to kebab-case per official OpenCode naming regex
- **Duplicate directories removed**: 74 snake_case directories deleted from `opencode/skills/`
- **`wow-tickets` fully deprecated**: Removed all stale entries from `manifest.json` (7 tools × 1 entry each) and all 6 `config-manifest/tools/*.yaml` files
- **`init_harness` duplicates cleaned (WOMONO-074)**: Removed duplicate directories from antigravity, claude, codex, gemini, wocode (opencode + pi already had kebab-case `init-harness/`)
- **`docs/ai-coding-tools/opencode.md` fixed**: Incorrect "Skill naming: snake_case" changed to "kebab-case"
- **Version bumped to 1.7.4**: manifest.json, CHANGELOG.md, README.md, docs/fixes/

## [1.8.3] - 2026-06-19

### Dashboard (wo-cto-dashboard v0.6.3)
- **Wire notification read-state tracking (WOMONO-095)**: Badge now shows unread count only (filtered by `readNotificationIds`). Opening bell or clicking a notification marks it read. Visual indicators (blue ring) for unread items. "All caught up" when nothing to see. Sidebar review badge also respects read state. `mark-all-read` API handler fixed to persist all IDs.

## [1.8.2] - 2026-06-19

### Dashboard (wo-cto-dashboard v0.6.2)
- **Rename Local→DB in ticket source UI**: Updated all UI references from "Local" to "DB" to reflect SQLite read-cache architecture.

## [1.8.1] - 2026-06-19

### Dashboard (wo-cto-dashboard v0.6.1)
- **Fix missing DATABASE_URL in Electron mode**: `runElectron()` env block was missing `DATABASE_URL` — caused `PrismaClientInitializationError: Environment variable not found`. Now correctly sets `DATABASE_URL` from same logic as `runNext()`.

## [1.8.0] - 2026-06-19

### Dashboard (wo-cto-dashboard v0.6.0) — Markdown-First Ticket Storage with SQLite Read-Cache (WOMONO-098)

#### Architecture
- **Markdown-first + SQLite read-cache**: Tickets are now persisted. `.md` files remain the source of truth; SQLite via Prisma is a fast read-cache.
  - `gray-matter` replaces fragile `parseFrontmatter()` — handles colons, quotes, arrays, proper YAML
  - `chokidar` file watcher detects AI tool edits and upserts to DB automatically
  - API fast-tracks DB writes after file writes — no stale-read latency
  - DB is passive projection — file timestamp always wins (no sync loops)

#### New Files
- `ui/prisma/schema.prisma` — `Ticket` model with 18 fields + filePath for fast writes
- `ui/src/lib/prisma.ts` — Prisma client singleton
- `ui/src/lib/tickets-db.ts` — DB CRUD operations (getAll, upsert, delete, bootstrap)
- `ui/src/lib/tickets-fs.ts` — Filesystem .md read/write with gray-matter + path index
- `ui/src/app/api/tickets/route.ts` — RESTful GET (paginated/filtered), PATCH (status/review → .md + DB), POST (create)
- `ui/scripts/sync.ts` — chokidar file watcher with debounce + hash guard
- `ui/scripts/bootstrap-db.ts` — One-time migration script (walks all .md files → SQLite)

#### Changed Files
- `ui/src/app/api/route.ts` — `GET /api?type=tickets` reads from Prisma (auto-bootstraps if empty)
- `ui/src/store/dashboard-store.ts` — `updateTicketStatus` + `updateTicketReview` call `PATCH /api/tickets`
- `ui/bin/wodev.js` — Dev mode spawns sync watcher alongside Next.js server
- `ui/package.json` — Added `gray-matter` + `chokidar` deps, bumped to v0.6.0

#### Migration
```bash
cd ui
npm install                    # gets gray-matter + chokidar
npx tsx scripts/bootstrap-db.ts  # imports existing tickets into SQLite
wodev --dev                    # starts Next.js + file watcher
```

## [1.7.3] - 2026-06-18

### Dashboard (wo-cto-dashboard v0.5.3)
- **Update f-rr-d button**: New button in header pulls latest main from the thoughts (f-rr-d) git repo
  - `POST /api/update-forrad` endpoint with `/api/update-forrad` route
  - Auto-detects thoughts repo via config system (supports `THOUGHTS_ROOT` env, `~/.config/wodev/config.json`, auto-detect)
  - Spinner state during sync, success/error message, auto-refresh after update
  - Switches to `main` branch if on another branch, then `git pull --ff-only origin main`
- **Thoughts root auto-detection**: `env.ts` now detects thoughts repo location across multiple standard paths
  - Checks: CWD-relative, `~/wayofmono/thoughts`, `~/.config/wodev/thoughts`, `~/src/wayofmono/thoughts`
  - Falls back gracefully with helpful error message
  - Ensures local ticket source works from installed npm package

## [1.7.2] - 2026-06-17

### Dashboard (wo-cto-dashboard v0.5.2)
- **Notification read state tracking (WOMONO-095)**: Per-notification read/unread tracking with persistent storage
  - Unread badge count in bell (not total)
  - Visual indicators: blue ring on unread reviews, blue dot on unread updates
  - Section "X new" badges, "All caught up" state
  - Click to mark read, persistent storage to `~/.config/wodev/notifications/read.json`
  - API: `GET/POST /api/notifications`
  - Files: `useNotificationStore`, `/api/notifications`, updated bell dropdown UI

---

## [1.7.2] - 2026-06-17

### Added
- **Platform-aware harness installer (WOMONO-094)**: Complete detection + adaptation layer for OS, arch, tools, runtime, desktop, hardware, terminal, network, security, permissions
- **11 detection modules**: `os`, `arch`, `tools`, `runtime`, `desktop`, `hardware`, `terminal`, `network`, `security`, `permissions`, `locale` (cached, with confidence levels)
- **4 adaptation modules**: `paths` (XDG), `formats` (snake_case/kebab-case), `deps` (apt/dnf/brew/winget), `desktop` (.desktop files, clipboard, xdg-open)
- **Supporting modules**: `logger.ts` (persistent log with secret redaction), `transaction.ts` (atomic installs, rollback, file locking), `report.ts` (JSON report, PII sanitization, dashboard push)
- **CLI flags**: `--detect` (system report), `--tool=auto` (install only detected tools), `--no-report`/`WOMONO_DO_NOT_TRACK` (telemetry opt-out), `--debug` (verbose logging)
- **Dotfile hygiene**: `# BEGIN/END WOMONO HARNESS` comment blocks for idempotent shell config injection
- **Supply-chain security**: Optional `sha256` field in manifest.json FileEntry; installer verifies checksums on remote downloads

### Fixed
- Installer now adapts to platform: skips `.desktop` on WSL/headless, uses correct clipboard tool (wl-copy vs xclip), respects locale for UTF-8/ASCII output
- Root/Admin warning when running without `--force`
- macOS Gatekeeper quarantine removal on downloaded binaries
- Windows PowerShell ExecutionPolicy detection

---

## [1.7.1] - 2026-06-16

### Fixed
- **Installer status reporting**: Per-file `NEW`/`UPDATED`/`UNCHANGED`/`SKIPPED` labels; summary shows `X NEW, Y UPDATED, Z UNCHANGED, W SKIPPED` (was "changed"/"ok")
- **Stale file removal**: Renamed 12 `wocoder-skill-update.py` → `wocode-skill-update.py` across opencode, gemini, pi, wocode, config-manifest; clean reinstall finds all scripts
- **Skill parity**: All 7 tools now have identical 73 skills (opencode, claude, gemini, pi, wocode, codex, antigravity). Added missing `self-documentation` and `validate-manifest` to 6 non-wocode YAMLs; created codex SKILL.md files.
- **Remote install directory entries**: Fixed 404 errors when manifest contains directory entries (e.g., `antigravity/skills/skill-adapter/assets`) during remote install from raw.githubusercontent.com. Installer now catches 404 and skips gracefully.
- **Skill assets/scripts installation**: Removed 42 redundant directory entries (`/assets`, `/scripts`) from all 7 tool YAML configs in `config-manifest/tools/`. These caused "skipped - likely a directory" messages and prevented `skill-adapter`, `skill-auto-update`, `skill-compliance-checker` from getting their assets/scripts directories. Recompiled manifest.json. All 7 tools now have complete directory structures with 10 Python scripts + assets per skill.
- **Ticket status selection & CTO review**: Extended TicketStatus type to 10 statuses, added interactive status dropdowns in CTO Dashboard (list and detail views), updated ticket-manager/ticket-context/ticket-executor skills for all 7 tools with CTO review flow (Review Queue, approve/request-changes/reject), updated ticket template with all statuses.
- **6 New GitHub Skills**: Added `github-branch`, `github-pr`, `github-review`, `github-sync`, `github-release`, `github-issue` across all 7 tools with bi-directional ticket sync, CTO review queue, branch protection, conventional commits, automated changelog, and release publishing.

### Changed
- Version bumped to 1.7.1 across manifest.json, CHANGELOG.md, README.md, install.ts, setup.sh, install.ps1

---

## [1.7.0] - 2026-06-15

### Added
- **Config-Manifest modularization**: Broke monolithic `manifest.json` into per-tool YAML files at `config-manifest/tools/{tool}.yaml`
- **Compilation pipeline**: `config-manifest/compile.py` merges YAMLs → backward-compatible `manifest.json`
- **Validation pipeline**: `config-manifest/validate.py` checks per-tool formatting against tool specs
- **7 per-tool skill update scripts**: `{tool}-skill-update.py` with `--validate`, `--fix`, `--add`, `--sync-yaml`, `--all`
- **Test suite (4 scripts)**: `test-yamls.py`, `test-manifest.py`, `test-skills.py`, `run-all-tests.py` — all with `--tool=<name>` support
- **Sidecar support doc**: `docs/guides/sidecars.md` — per-tool background process analysis
- **New skills deployed to all 7 tools**: `self-documentation`, `validate-manifest`
- **Config-manifest knowledge in 3 skills**: `skill-compliance-checker`, `skill-adapter`, `skill-auto-update`

### Fixed
- `test-manifest.py` `--tool` filtering (was exit-code-only, now filters per-tool validation)
- Cross-tool path contamination in manifests detected via new validation

## [1.6.1] - 2026-06-14

### Fixed
- Command/skill naming conflicts: renamed gemini/antigravity command files with `run-` prefix to avoid clashing with skill directories
- WoCoder cleanup: removed duplicate `agent/commands/` dir (kept `agent/prompts/`)
- OpenCode: no changes needed (handles commands/skills separately)

### Added
- `womono_version_updater` skill — knows how to bump manifest version, update CHANGELOG, sync README version refs, and deploy to all 7 tools
- Release notes in `docs/fixes/README.md` for user-facing changes

## [1.6.0] - 2026-06-14

### Fixed
- Fixed JSON parse error in manifest.json (malformed self_documentation entry with wrong indentation and stray bracket)
- `ai-harness --update` now works without SyntaxError

## [Unreleased] - 2026-06-12

### Deno Wrapper --reload Patching + Bootstrap Fix
- `patchDenoWrapperReload()` — post-install step edits the deno wrapper to embed `--reload`, so every `ai-harness --update` fetches fresh from the URL, bypassing Deno 2's integrity cache
- Called on `--update` (Phase 1) and regular `--tool=all` install
- README documents one-time bootstrap: `deno run --reload -A <url> --update` for users with a stale cached binary
- Changelog: add unreleased section for wrapper patch

### Orange Matrix UI + `--prune` Interactive Skill Manager
- **Matrix-style orange UI**: WO MONO ASCII logo, box-drawn step layout, colored `✧`/`·` symbols on all install output
- **`--prune` interactive skill pruning**: scans all 7 tools, shows extra (non-manifest) files grouped by tool, interactive checkbox picker (pre-checked = safe to remove), user can un-check skills from other sources they want to keep
- **Two-stage interactive flow**: first pick tools to prune, then pick files within each tool
- **All output orange-colored**: `check()`/`cross()`/`warn()` ANSI helpers, install loop, stale cleanup, version checks

### WOMONO-063 — Phase 2 Complete: Skill Cleanup + Zero Hard Errors
- **Phase 2: Moved all misplaced skills to `ref/`** — 164 skills moved to `ref/<tool>/` across all 7 harness dirs
- **Created `scripts/fix-skills.ts`** — auto-fix script handles `allowed-tools` casing, frontmatter cleanup, `name` field fixes
- **Created `scripts/fix-errors.ts`** — targeted fix script for PARSE_ERROR, MISSING_SKILL, WRONG_NAMING_CONVENTION errors
- **Zero hard errors achieved** — from 267 errors down to 0 across 433 skills, 7 tools
- **Fixed at source**: broken YAML in `document_generation`, diff-corrupted `wow_tickets` (`+` prefix + missing `---`), empty dirs (`ticket_executor`, `build_auto_ticket_creator`), renamed `skill-creator` → `skill_creator`/`skill-creator` per tool convention

### WOMONO-063 — Phase 3 Complete: Consolidated build_tool Skill
- **Created `scripts/deploy-build-tool.ts`** — generates per-tool SKILL.md from canonical template with correct naming, casing, and frontmatter
- **Deployed `build_tool` to all 7 harness dirs** — opencode, claude, gemini, pi (build-tool), antigravity, codex, wocode
- **Comprehensive skill content**: covers all 8 component types (skills, agents, commands, extensions, configs, keybindings, themes, TUI) across all 7 tools with per-tool format tables
- **Zero compliance errors** on deployment — caught and fixed wocode casing mismatch during deploy

### WOMONO-063 — Phase 4 Complete: `--update` Comprehensive Sync
- **Rewrote `--update` flow**: CLI + docs + tool install + stale cleanup + auto-validate in one command
- **Added changelog awareness**: Reads CHANGELOG.md, shows version diff on bump
- **Added `--dry-run` support for `--update`**: previews all 4 steps before executing
- **Added confirmation prompt**: asks before proceeding (skipped with `--yes`)
- **Added `--no-validate` flag**: skips compliance check step
- **Added auto-compliance**: runs `compliance-check.ts` after update, reports error count
- **Added `build_tool` to manifest.json** for all 7 tools
- **WOMONO-063 Resolved** — All 4 phases complete

### Manifest Cleanup — Removed 192 Stale Entries
- **Created `scripts/cleanup-manifest.ts`** — removes manifest entries where source files no longer exist
- **Cleaned 192 stale entries** from `manifest.json` across all 7 tools (skills moved to `ref/` during Phase 2)
- **Bumped manifest to v1.4.0** — `ai-harness --update` now works without 404 errors
- **Zero compliance errors** maintained after cleanup

### README Rewrite & Architecture Docs
- **README.md** fully rewritten with real repository data (51,033 files, 906 SKILL.md, 13 packages, 4 developers, 29+ tickets, per-tool skill counts)
- Added slogan blockquote to header and footer
- Added **Quick Install** section (3-step flow: Deno → harness CLI → all tools)
- Added `🦙 Prerequisites: Ollama` top-level section
- Added `📦 Wo Packages` table with `Package | Description | npm` columns and install commands
- Added **f-rr-d How it works** bullet points (clone on init, project-scoped, multi-project, pull/push, branch naming) + Config note
- Added **AI Engineering Harness** summary with tutorial link
- Expanded Dev-Dependencies section with full "Hammer vs. The House" analogy
- Added `ai-harness --check`, `--interactive`, `--dry-run`, `--skill=` commands to Usage
- Created architecture docs: `docs/cto-dashboard-architecture.md`, `docs/deployment-architecture.md`, `docs/thoughts-architecture.md`, `docs/data-storage-architecture.md`
- Created `docs/archetecture/INDEX.md` architecture index
- Fixed duplicate section headers and deduplicated CHANGELOG

## [Unreleased] - 2026-06-11

### WOMONO-001 — Electron UI + Cross-Platform Starters + Förråd Sync — **In Progress**
- **Electron wrapper** for Next.js 16 CTO Dashboard (`ui/electron/main.ts`, `ui/electron/preload.ts`)
  - Secure IPC bridge for git sync (`sync-förråd` handler)
  - Dev mode: loads Next.js dev server with hot reload
  - Prod mode: loads Next.js standalone build
  - Multi-platform config in `package.json` build section (macOS x64/arm64, Linux x64/arm64, Windows x64/arm64)
- **Cross-platform start scripts** in repository root:
  - `start.sh` — macOS/Linux bash with dependency checks, colored output, trap cleanup
  - `start.ps1` — Windows PowerShell with same features
- **Sync Förråd button** in CTO Dashboard sidebar (`ui/src/components/ui/sync-forrad-button.tsx`)
  - Calls Electron IPC `sync-förråd` → runs `git -C thoughts pull --ff-only`
  - Shows toast notifications (success/error/up-to-date) via sonner
  - Auto-refresh capability after successful sync
- **Package.json updates** (`ui/package.json`):
  - Added `electron`, `electron-builder`, `concurrently`, `cross-env`, `wait-on` dependencies
  - New scripts: `electron:dev`, `electron:build`, `electron:dist`, `postinstall`
  - electron-builder config for multi-platform distribution with GitHub publishing

### WOMONO-046 — Production Hosting for CTO Dashboard — **Phases 1-3 Complete**
- Health endpoint `GET /api/health` — validates app + Prisma/SQLite are responding
- Systemd service file `ui/docker/wayofmono-dashboard.service`
- Deploy script `scripts/deploy-dashboard.sh` — git pull → podman-compose rebuild → health check loop
- cloudflared sidecar in compose (commented out, documented both config + token auth)
- Logging driver config (json-file, 10m/3 files) on all services
- Full deployment docs added to README.md
- Docker runtime hardening: Prisma build integration, entrypoint with auto-migrate, Alpine deps
- Fixed `DATABASE_URL` for Docker (absolute path override in compose)
- Added `THOUGHTS_ROOT` env var to `thoughts.ts` for configurable data path in Docker
- Created `Dockerfile` — multi-stage build with bun install, Next.js standalone output
- Created `docker-compose.yml` — Next.js + Caddy services with volumes for thoughts/ and SQLite
- Created `ui/docker/Caddyfile` — Caddy config for container env (proxies to `nextjs:3000`)
- Created `.dockerignore` for lean build context
- Updated WOMONO-043, WOMONO-044, WOMONO-045 → Done (all features implemented in prior sessions)
- Updated WOMONO-046 → In Progress

### WOMONO-045 — Comprehensive Skills for All Tools — **Phase 1-4 Complete**
- **Architecture correction**: Dashboard UI is server-hosted, skills live on users' machines → telemetry reporting model (`POST /api/skills/report`)
- **CLI naming fix**: All `womono` references corrected to `ai-harness` (the actual CLI binary)
- **Tool count**: Expanded from 6 to 7 tools (added Wo Coder)

### Phase 1: Audit & Inventory
- Audited 79 canonical skills across all 7 tools (553 SKILL.md files)
- Identified and ranked 10 issues by severity
- **Fixed #1** Codex degraded: Generated 44 missing SKILL.md files (Codex now 67/67)
- **Fixed #2** help-command: Added SKILL.md to all 7 tools
- **Fixed #3** init_harness divergent: Standardized all 7 tool copies on f-rr-d workflow
- **Fixed #5** disable-model-invocation: Added back to 14 files in gemini/antigravity
- **Fixed #7** Platform-specific text errors: 3 canonical skills cleansed of hardcoded "Gemini" references
- **Fixed #8** Antigravity orphans: Created canonical source for 11 antigravity-* skills + propagated to all tools
- **Fixed #9** Claude orphan: Created canonical validate_telemetry skill + propagated to all tools
- **Fixed #10** Pi agents mis-located: Removed 6 stale agent copies from pi/skills/

### Phase 3: Skill Updater Pipeline
- Built `packages/@aiengineeringharness/scripts/docs-sync.ts` — canonical-to-tool sync with:
  - Per-tool naming convention (snake_case for 6 tools, kebab-case for Pi)
  - Tool name translation table (e.g., `read_file` → `Read` for Pi)
  - docs-url frontmatter stripping for tool copies
  - Dry-run mode (`--check`) for preview
- Integrated as `ai-harness --sync-docs` and `ai-harness --sync-docs --check`
- Cleaned up 12 stale Pi snake_case skill directories
- All 553 SKILL.md files now in sync (0 differences)

### Phase 4: Compliance Checker
- Built `packages/@aiengineeringharness/scripts/compliance-check.ts` — validates:
  - Frontmatter field validity per tool spec
  - Tool name casing (PascalCase vs lowercase) in allowed-tools and body
  - Directory naming conventions vs frontmatter name
  - Deprecated pattern detection
  - YAML frontmatter parse errors
- Available as standalone: `deno run -A scripts/compliance-check.ts`

### Standup View
- Added `Daily Standup` view to the CTO Dashboard with submit form and feed
- Created `POST /api/standup` and `GET /api/standup` endpoints (JSON file persistence)
- Created `StandupView` component with yesterday/today/blockers form
- Shows per-author check-ins grouped by date with avatars
- Prevents duplicate submissions per author per day
- Shows "No skills reported" empty state with install instructions in Skills View

### Telemetry & Dashboard
- Added `SkillReport` model to Prisma schema
- Created `POST /api/skills/report` and `GET /api/skills/report` endpoints
- Updated Skills View to fetch from telemetry API (with empty state install instructions)
- Added `ai-harness --report-skills` CLI subcommand for local→dashboard reporting
- Fixed SQLite DATABASE_URL in .env

### CI
- Added canonical sync check to CI workflow: verifies `docs-sync.ts --check` reports 0 differences

## [Unreleased] - 2026-06-10

### WOMONO-001 — Centralized f-rr-d Multi-Project Support (Critical) — **Structure Complete**
- **Folder structure clarified**: `thoughts/global/` = cross-project global thoughts, `thoughts/<project>/shared/` = shared responsibility tickets per project, `thoughts/shared/` (f-rr-d root) = cross-project templates only
- **Ticket namespace migration**: All WayOfMono tickets renamed from `PROJ-XXX` → `WOMONO-XXX` (13 tickets migrated)
- **Tickets reorganized**: Moved 29 tickets from flat `shared/aiharness/` to categorized `shared/tickets/{architecture,frontend,backend,communications,system/}` with `system/{harness,skills,agents,team,templates,docs-sync}`
- **f-rr-d repository fixed**:
  - Removed nested `thoughts/thoughts/` structure, flattened to single `thoughts/` root
  - Updated AGENTS.md to reflect thoughts-only purpose (no skills/agents)
  - Updated README.md with multi-project structure documentation
  - Created `thoughts/wow/` and `thoughts/opticat/` with full project structure
  - Deleted local `thoughts/shared/` (wrong location)
  - Added f-rr-d root `shared/tickets/ticket-template.md`
- **AI Engineering Harness fixes**:
  - Updated `init_harness/SKILL.md` with correct multi-project structure
  - Updated `team-init.ts` to create correct structure + remove wrong `thoughts/shared/`
  - Updated `team-setup/SKILL.md` with project structure documentation
  - Updated `monitor.ts`, `dashboard.ts`, `help.ts`, `cto-dashboard.ts`, `auto-ticket-creator.ts` namespace references (PROJ → WOMONO)
  - Updated `import-ref-skills.ts` ticket reference (PROJ-016 → WOMONO-016)
  - Updated `docs-sync-updater` ticket creation (PROJ → WOMONO)
  - Updated `ticket-manager/SKILL.md` and `skill-registry.json` namespaces
  - Updated `migrate-tickets.ts` script to handle PROJ→WOMONO rename + categorization
- **WOMONO-001 ticket** updated as source of truth for all folder structure decisions

### WOMONO-013 through WOMONO-026 — AI Engineering Harness Core Skills — **All Done**
- **Ticket status updates** (14 WOMONO tickets marked Done):
  - WOMONO-013: Ticket Manager Skill
  - WOMONO-014: Skill Auto-Update Sync
  - WOMONO-015: Agent Namespacing Separation
  - WOMONO-016: Import Ref Skills/Agents
  - WOMONO-017: Auto Ticket Creation Skill
  - WOMONO-018: Team Project Setup
  - WOMONO-019: CTO Dashboard Reporting
  - WOMONO-020: Platform-Specific Skill Loading
  - WOMONO-021: Personal TODO Hierarchy
  - WOMONO-022: Docs Sync Updater
  - WOMONO-023: Ticket Folder Organization
  - WOMONO-024: AI Harness Help Command
  - WOMONO-025: Codex First-Class Platform
  - WOMONO-026: Centralized Ticket Repo

### WOMONO-021 — Personal TODO Hierarchy — **Done**
- **Personal ticket template** created: `thoughts/shared/tickets/personal-ticket-template.md` with `parent_ticket` frontmatter linking
- **New CLI commands added to ticket-manager sync.ts**:
  - `--show-todo=<dev>` — Show personal TODO for developer
  - `--add-todo="description" --parent=TKT-001 --dev=<dev>` — Create personal sub-task linked to shared ticket
  - `--cto-todo-all` — CTO aggregated view of all developers' TODOs
- **Implementation details**:
  - `syncPersonalTodos()` generates personal TODO.md from assigned shared tickets with status checkboxes
  - `syncTodoCheckboxes()` updates personal TODO checkboxes when shared ticket status changes
  - Personal tickets created in `thoughts/<dev>/tickets/` with DEVID-XXX format (e.g., ZERWIZ-001)
  - `parent_ticket` frontmatter links personal sub-tasks to parent shared ticket
  - Cross-platform Deno with sync.sh, sync.bat, sync.ps1 wrappers
- **Tested**: All commands working, personal ticket ZERWIZ-001 created for WOMONO-021

### Codex Platform — First-Class Support Complete
- **Skill sync across 7 platforms** (claude, opencode, gemini, pi, wocode, antigravity, codex):
  - Removed 82 duplicate skills with incorrect naming conventions
  - Fixed naming: pi uses kebab-case, other 6 platforms use snake_case
  - Core skills (auto-ticket-creator, cto-dashboard, docs-sync-updater, help-command, skill-adapter, skill-auto-update, ticket-manager) use hyphens on ALL platforms
  - Fixed `team-setup` → `team_setup` in canonical, updated skill-registry.json
  - Synced 20 missing skills to codex platform
  - Verified zero duplicates and zero gaps across all platforms
- **Ticket status updates** (14 WOMONO tickets marked Done):
  - WOMONO-013: Ticket Manager Skill
  - WOMONO-014: Skill Auto-Update Sync
  - WOMONO-015: Agent Namespacing Separation
  - WOMONO-016: Import Ref Skills/Agents
  - WOMONO-017: Auto Ticket Creation Skill
  - WOMONO-018: Team Project Setup
  - WOMONO-019: CTO Dashboard Reporting
  - WOMONO-020: Platform-Specific Skill Loading
  - WOMONO-021: Personal TODO Hierarchy
  - WOMONO-022: Docs Sync Updater
  - WOMONO-023: Ticket Folder Organization
  - WOMONO-024: AI Harness Help Command
  - WOMONO-025: Codex First-Class Platform
  - WOMONO-026: Centralized Ticket Repo

### Codex Platform — First-Class Support Complete
- Created `packages/@aiengineeringharness/codex/` with agents, rules, README
- Added codex to manifest.json, install.ts, setup.sh
- Updated AGENTS.md with Codex column in commands/agents tables
- Codex skill format: skill.yaml + prompt.md per skill

## Status

### ✅ Done
- 10 Pi expert skills created → `packages/@aiengineeringharness/*/skills/`
- `install.ts --check` — version tracking and update detection
- `packages/@wayofmono/*` — all 10 packages implemented, built, ready to publish
- GitHub Release v1.0.0 (tarballs for manual install)
- README + AGENTS.md + CHANGELOG updated
- Local install from cloned repo works: `pnpm add /path/to/packages/@wayofmono/wo-agent`
- Test verified: `test/coding-agent`, `test/user-agent` install correctly with pnpm

### ✅ Done — published to npm
- `@wayofmono/lens` `@wayofmono/wo-ai` `@wayofmono/wo-tui` `@wayofmono/wo-agent-core`
- `@wayofmono/wo-agent` `@wayofmono/wo-coding-agent` `@wayofmono/wo-skill-docs`
- `@wayofmono/wo-mermaid` `@wayofmono/wo-web-ui`
- All 9 packages live at https://www.npmjs.com/settings/wayofmono/packages
- `npm install @wayofmono/wo-agent` works from any project
- `v1.0.1` fixed incomplete package contents (missing `dist/` in npm tarball)
- `@wayofmono/telemetry` skipped (custom registry at npm.wayofmono.dev)

---

## [1.0.1] - 2026-05-19

### Fixed
- Fixed incomplete npm packages by including `dist/` directory in `files` field in `package.json`.
- Updated `package.json` exports to point to `dist/` for all packages.
- Verified CLI binaries (`wouser`, `wocode`) work after npm installation.

## [1.0.0] - 2024-05-13

#### AI Engineering Harness — 10 Pi Expert Skills
- `build-pi-agent` — Build Pi agent definitions with .md frontmatter format, teams.yaml, orchestration patterns
- `pi-cli` — Pi CLI expert: all flags, subcommands, output modes, env vars, non-interactive usage
- `pi-config` — Pi configuration: settings.json, providers, models, packages, keybindings
- `build-pi-extension` — Build Pi extensions: custom tools, event handlers, commands, shortcuts, providers
- `pi-keybindings` — Pi keyboard shortcuts: registerShortcut(), key IDs, modifiers, reserved keys, macOS compat
- `pi-orchestrate` — Orchestrate Pi domain experts to research documentation and build Pi components
- `pi-prompts` — Pi prompt templates: single-file .md, positional args, /template invocation
- `build-pi-skill` — Build Pi skills: SKILL.md format, frontmatter, validation, directory structure
- `pi-themes` — Pi themes: JSON format, 51 color tokens, vars system, hex/256-color values
- `pi-tui` — Pi TUI: built-in components, custom components, keyboard input, widgets, overlays

All 10 skills deployed across all 5 frontends (opencode, claude, gemini, pi, wocode) with correct naming:
- opencode/claude/wocode: kebab-case directory names
- gemini: snake_case directory names
- pi: kebab-case (native format)

#### AI Engineering Harness — Update Detection
- `install.ts --check` — compares local `.harness-version` vs remote manifest version
- `.harness-version` file written after each install in the target directory
- Shows "UPDATE AVAILABLE vX → vY" when new skills/commands/configs are available
- Works from both local file and remote GitHub URL
- Manifest bumped to v1.1.0

#### `@wayofmono/wo-agent` — Embeddable Agent SDK (NEW)
- `createAgent()` factory with `prompt()`, `task()`, `runLoop()`, `registerTool()`, lifecycle events
- ReAct tool loop (`runReActLoop`): send → stream → accumulate tool calls → execute → loop (max 18 steps, nudge logic)
- Pi-compatible JSONL session store (`createSessionStore` with `loadMessages`, `syncMessages`, `appendMessage`, `appendToolCalls`)
- Agent discovery scanner (`discoverAgents`, `parseAgentMarkdown`) — scans `.md` with YAML frontmatter across `agents/`, `.claude/agents/`, `.wo/agents/`, `.cursor/agents/`
- Multi-block system prompt composer (`composeSystemPrompt`, `applySystemPrompt`) — env → agent body → mode notes → planner → index blocks
- Workspace jail (`createWorkspace`) — jailed path resolution with escape prevention, max file size limits
- Built-in skills: documentation, file-operations, search, summarization
- Source-only package (no build step), designed for embedding

#### `@wayofmono/wo-agent-core` — Infrastructure Additions
- Context compaction module (`src/compaction/`): cut-point algorithm, LLM summarization (`generateSummary`), token estimation, overflow recovery, branch summarization, file operation tracking — adapted from pi
- JSONL storage (`src/storage/jsonl-storage.ts`): append, readAll, writeAll, exists with max file size guards
- Session tree management (`src/session/`): `SessionStore` interface with `create`, `getMetadata`, `appendEntry`, `getEntries`, `getBranch`, `estimateTokens` — JSONL-backed
- Config store (`src/config.ts`): `createConfigStore` with `load`, `get`, `set`, `update`, `clear` backed by JSON file
- Event cancellation: `emit()` stops propagation when handlers return `{ cancelled: true }`; new `emitCancellable()` returns `{ cancelled, results }`
- Concurrent tool execution: `ToolEngine.executeConcurrent()` using `Promise.allSettled` with `ConcurrentExecuteOptions` (AbortSignal + ExtensionContext)

#### `@wayofmono/wo-coding-agent` — Real AgentSession + Tool Execution
- **Real AgentSession** (`src/core/agent-session.ts`): wired with `runReActLoop` from wo-agent for LLM calls with full tool execution, session persistence via `wo-agent-core` SessionStore, auto-compaction via compaction module, event streaming, abort signal propagation, manual `compact()` method
- **7 real tool implementations** copied from pi: bash, read, write, edit, edit-diff, grep, find, ls — each with TypeBox schemas, pluggable operations, output truncation, AbortSignal support
- Supporting infrastructure: truncation, path-utils (workspace-bound), file-mutation-queue, output-accumulator
- **14 utility modules** from pi: sleep, paths, ansi, html, mime, fs-watch, child-process, frontmatter, changelog, shell, git, syntax-highlight, tools-manager, user-agent
- Project-local config (`src/config.ts`): `findProjectRoot`, `getWoDir`, `getSessionsDir`, `getBinDir`, `getConfigPath`, `isInsideProject`

#### Monorepo Infrastructure
- Root `package.json` with workspace scripts (`build`, `test`, `typecheck`)
- `pnpm-workspace.yaml` for pnpm workspace resolution
- `scripts/` directory with `sync-versions.js` (lockstep version sync) and `stats.ts` (package statistics)
- `tsconfig.base.json` at monorepo root with ES2024, NodeNext, strict mode
- Fixed `@opentelemetry/*` dependency versions in telemetry package (0.55→0.26 for grpc exporter)
- `@wayofmono/wo-agent` added as dependency of `wo-coding-agent`

#### Pi-to-Wo Bulk Import (382 files adapted)
- All 50 files from pi/ai/src/ → wo-ai, pi-ai import paths → wo-ai
- All 25 files from pi/tui/src/ → wo-tui, pi-tui import paths → wo-tui
- All 25 files from pi/agent/src/ → wo-agent-core, pi-agent-core → wo-agent-core
- All 141 files from pi/coding-agent/src/ → wo-agent (SDK, stripped CLI entry)
- All 141 files from pi/coding-agent/src/ → wo-coding-agent (CLI binary, keeps all)
- Package.json files created for all 5 packages with renamed deps
- tsconfig.json files created for all 5 packages
- Config dir `.pi` → `.wo`, APP_NAME `"pi"` → `"wo"`, env vars `PI_*` → `WO_*`
- Log paths `pi-debug.log`/`pi-crash.log` → `wo-debug.log`/`wo-crash.log`
- Missing deps added: `@smithy/types`, `@smithy/node-http-handler` (wo-ai), `@types/node` (wo-tui)
- tsconfig.base.json: ES2022 → ES2024 (for `/v` regex), added `types: ["node"]`
- All 5 packages pass `tsc --noEmit` with zero errors
- tsconfigs created for telemetry and lens (pre-existing non-pi packages)
- copy-assets scripts: theme `*.json`, `assets/*.png`, `export-html/template.*` + vendor JS copied to `dist/` post-tsc
- `./bedrock-provider` subpath export added to wo-ai
- `cli.ts` and `bun/` directory removed from wo-agent (SDK has no CLI entry)
- `@types/node` added to wo-tui and telemetry devDeps
- Missing deps: `@smithy/types`, `@smithy/node-http-handler` (wo-ai); `@silvia-odwyer/photon-node`, `shx` (wo-agent + wo-coding-agent)

### Fixed
- Build errors across all packages: duplicate `JsonlStorage`/`SessionEntry` exports in `wo-agent-core`, `Api` type mismatches in compaction, `StopReason` type in gemini provider, `AbortSignal` type in retry, `SelectItem` generic in `ExtensionUIContext`
- Added `types: ["node"]` to `wo-coding-agent` tsconfigs for `node:*` module resolution
- Added `getShellEnv()` to `wo-coding-agent/src/utils/shell.ts` (was missing from pi copy)
- Added module declarations for `hosted-git-info` and `highlight.js/lib/index.js`
- Added `KeyEvent` type re-export to `wo-agent-core` types (needed by `DynamicBorder`)
- Repository URLs fixed from `earendil-works` → `zerwiz` across all package.json files
- Telemetry type errors: `BasicTracerProvider` cast to `InstanceType`, `setAttribute` type widened
- Lens fixed: created 9 missing source modules (`ast-grep-parser`, `ast-grep-rule-manager`, `ast-grep-types`, `sg-runner`, `package-root`, `file-utils`, `tree-sitter-cache`, `tree-sitter-navigator`, `tree-sitter-query-loader`) + index.ts + 4 type error fixes
- Lens now builds successfully
- Wo-web-ui restored: package.json, tsconfig, 6 React components (ChatContainer, MessageBubble, ChatInput, SessionList, ToolCallCard), types, theme
- Tests: no test files exist in any pi-copied package (pi source didn't include them in `src/`)

### Tickets
- PROJ-007: `@wayofmono/wo-coding-agent` — Phase 2 (Real AgentSession) ✅, Phase 3 (Real Tools) ✅, Phase 5 (Session Persistence) ✅, Phase 6 (Compaction) ✅
- PROJ-008: Pi-to-wo copy plan — Section 1 (utilities) ✅, Section 2 (tools) ✅, Section 3 (compaction) ✅, Section 4a (AgentSession) ✅
- PROJ-009: `@wayofmono/wo-agent` — Agent Class ✅, Skills ✅, Embeddable API ✅, ReAct Loop ✅, Session Persistence ✅, Agent Discovery ✅, System Prompt ✅, Workspace Jail ✅

## [1.0.0] - 2024-05-13

### Added

#### `@wayofmono/wo-ai` — Unified Multi-Provider LLM API
- Core `complete()`, `completeSimple()`, `completeWithConfig()` functions for multi-provider LLM calls
- Provider implementations: OpenAI-compatible, Anthropic Claude, Google Gemini
- Streaming support for OpenAI and Anthropic providers
- Tool calling/functions support across all providers
- Type exports: `Message`, `UserMessage`, `AssistantMessage`, `SystemMessage`, `ToolMessage`, `StopReason`, `Usage`, `Model`, `Api`, `ThinkingLevel`, `ModelConfig`, `ToolDefinition`, `CompletionParams`, `CompletionResult`, `StreamChunk`
- `StringEnum()` helper for TypeBox string union schemas
- `registerModel()`, `getModel()`, `getModels()`, `getModelsByApi()`, `getSupportedThinkingLevels()`, `resolveModelConfig()` — model registry
- `calculateCost()` — token-based cost calculation from model pricing
- OAuth subpath export (`/oauth`) with `getOAuthProvider()`, `registerOAuthProvider()`, `createOAuthProvider()`
- Built-in default model registry (GPT-4o, GPT-4o-mini, o3-mini, Claude Sonnet 4, Haiku 3.5, Opus 4, Gemini 2.5 Flash/Pro)
- Self-contained ESM package with `exports`, `types`, `files`, `publishConfig` fields

#### `@wayofmono/wo-tui` — Terminal UI Library
- Render components: `Text`, `Box`, `Container`, `Spacer`, `SelectList`, `Markdown`, `Image`
- Text utilities: `truncateToWidth()`, `visibleWidth()`, `wrapTextWithAnsi()`, `stripAnsi()`
- Theme system: `createDefaultTheme()`, `getMarkdownTheme()` with ANSI color/bold/dim/italic/link formatting
- Keyboard handling: `Key` constants, `matchesKey()`, `getKeybindings()`
- Kitty protocol image support: `allocateImageId()`, `deleteKittyImage()`, `getCapabilities()`
- Type exports: `Component`, `KeyEvent`, `SelectItem`, `AutocompleteItem`, `Theme`, `MarkdownTheme`, `TUI`, `Input`, `OverlayOptions`, `Severity`
- Self-contained ESM package with full export map

#### `@wayofmono/telemetry` — ODD Instrumentation SDK
- OpenTelemetry-based tracing: `startSpan()`, `runInSpan()`, `recordEvent()`, `setAttribute()`, `getTracer()`
- Activity recorders: `recordToolCall()`, `recordLlmCall()`, `recordCommand()`, `recordDiagnostic()`
- Telemetry lifecycle: `initTelemetry()`, `shutdownTelemetry()`, `setupOtlpExporter()`
- Context propagation: `getCurrentTraceId()` for injecting trace context into agent prompts
- Exports: `TelemetryConfig`, `ToolCallRecord`, `LlmCallRecord`, `CommandRecord`, `DiagnosticRecord`
- Full OTel SDK deps declared for one-install setup

#### `@wayofmono/wo-agent-core` — Central Agent Runtime & ExtensionAPI
- `ExtensionAPI` interface: `registerCommand()`, `registerTool()`, `registerFlag()`, `registerShortcut()`, `on()`, `getFlag()`, `getActiveTools()`, `setActiveTools()`, `getAllTools()`, `exec()`, `sendMessage()`, `sendUserMessage()`, `appendEntry()`, `registerProvider()`
- `WoExtensionAPI` — full implementation of the ExtensionAPI with event emitter, tool engine, command registry, flag manager, UI context
- Event system: `EventEmitter` with priority-ordered handlers, `emit()`, `emitFirst()`, `removeAll()`
- Tool engine: `ToolEngine` with `register()`, `get()`, `getAll()`, `execute()`, `setActiveTools()`
- Command registry: `CommandRegistry` with `register()`, `get()`, `execute()`, `getNames()`
- Flag manager: `FlagManager` with `register()`, `set()`, `get()`, `getAll()`
- Skill loader: `loadSkills()`, `parseFrontmatter()`, `stripFrontmatter()`, `getAgentDir()`
- Utility functions: `truncateHead()`, `formatSize()`, `convertToLlm()`, `isToolCallEventType()`, `getMarkdownTheme()`, `withFileMutationQueue()`
- UI context: `ExtensionUIContextImpl` with `notify()`, `confirm()`, `input()`, `select()`, `setWidget()`, `setStatus()`, `setWorkingMessage()`, `setHiddenThinkingLabel()`, `onTerminalInput()`, `pasteToEditor()`
- Model registry: `ModelRegistryImpl` with built-in model list
- Dynamic border components: `DynamicBorder` (spinner), `BorderedLoader`, `keyHint()`
- Extension runtime: `discoverAndLoadExtensions()`, `createExtensionRuntime()`
- All 16 lifecycle events: `session_start`, `session_shutdown`, `session_compact`, `session_tree`, `before_agent_start`, `agent_start`, `agent_end`, `turn_start`, `turn_end`, `tool_call`, `tool_execution_start`, `tool_execution_end`, `tool_result`, `user_bash`, `model_select`, `input`, `context`, `resources_discover`
- Self-contained with all wo-* transitive deps declared

#### `@wayofmono/wo-web-ui` — Web UI Components
- `ChatContainer` — full chat interface with message list, streaming support, and input
- `MessageBubble` — role-styled message bubbles with streaming indicator
- `ChatInput` — multi-line textarea with Enter-to-send, Shift+Enter for newline, slash-command support
- `SessionList` — session sidebar with timestamps and create-new button
- `ToolCallCard` — collapsible tool call cards with status dot, args display, result preview
- Dark/light theme support across all components
- Type exports: `ChatMessage`, `ToolCall`, `ToolResult`, `SessionInfo`, `DiagnosticInfo`, `ThemeConfig`, `WebSocketMessage`
- React 19 with peer compatibility for React 18
- Self-contained ESM package with React as direct dependency

### Tickets
- PROJ-002: `@wayofmono/wo-ai` — In Progress (all source implemented)
- PROJ-003: `@wayofmono/wo-tui` — In Progress (all source implemented)
- PROJ-004: `@wayofmono/telemetry` — In Progress (all source implemented)
- PROJ-005: `@wayofmono/wo-agent-core` — In Progress (all source implemented)
- PROJ-006: `@wayofmono/wo-web-ui` — In Progress (all source implemented)

### Dependency Fixes
- Added `@wayofmono/wo-tui` as direct dependency of `@wayofmono/wo-agent-core` (was missing despite being imported)
- Added proper `exports`, `types`, `files`, `publishConfig`, `repository` fields to all package.json files for external consumption
- Added `@types/react` and `@types/react-dom` as devDependencies in wo-web-ui
- Moved workspace deps from devDependencies to dependencies in wo-agent-core for transitive resolution
