# AI Engineering Harness Fixes & Release Notes

## v1.7.12 — 2026-07-04 — WOMONO Skills Update + Standup Skill (WOMONO-135, WOMONO-136, WOMONO-137)

### Features
- **Standup skill for all 7 tools (WOMONO-135)**: Created canonical standup skill at `packages/@aiengineeringharness/skills/standup/` with SKILL.md, `compile.py`, and 7 per-tool YAML configs. Generates daily standup files at `thoughts/global/standup/<dev>/<YYYY-MM-DD>.md`. Compiled per-tool copies to all 7 tools with manifest entries.
- **WOMONO skills updated with ecosystem knowledge (WOMONO-136)**: All 6 WOMONO-specific skills updated to know about canonical skill architecture (`skills/<name>/SKILL.md` + `compile.py` + `tools/*.yaml`), config-manifest system, fixes docs (`docs/fixes/`), existing scripts (`scripts/`, `config-manifest/scripts/`), and manifest.json safety (Python `json.dump` with `ensure_ascii=False`).
- **validate-manifest renamed to womono-validate-manifest (WOMONO-136)**: Renamed directory, `name` frontmatter, and manifest.json component key + src paths across all 7 tools. Expanded SKILL.md with ecosystem knowledge.
- **Naming inconsistencies fixed (WOMONO-136)**: `wow_practices_guide` → `womono_practices_guide`, `wow_practices_audit` → `womono_practices_audit` in body headings across all tool copies.
- **thoughts_locator & thoughts_analyzer updated (WOMONO-137)**: Both agents updated across all 7 tools with knowledge of namespace-based tickets (WOMONO-XXX, WOW-XXX, OPT-XXX), enforcement tickets, per-project f-rr-d structure, ticket frontmatter/status flow, and GitHub Skills Agent Directory.
- **AGENTS.md updated**: Added WOMONO-Specific Skills section and thoughts agent update notes.

### Breaking Changes
- `validate-manifest` skill renamed to `womono-validate-manifest` — update any references to the old name
- Tool-specific skill names updated: `validate_manifest` → `womono_validate_manifest` (claude, gemini, antigravity, codex)

### Files
- `packages/@aiengineeringharness/skills/standup/` — New canonical standup skill (SKILL.md, compile.py, 7 tool YAMLs)
- `packages/@aiengineeringharness/opencode/skills/womono-practices-guide/SKILL.md` — Updated
- `packages/@aiengineeringharness/opencode/skills/womono-practices-audit/SKILL.md` — Updated
- `packages/@aiengineeringharness/opencode/skills/womono-practices-backlog/SKILL.md` — Updated
- `packages/@aiengineeringharness/opencode/skills/womonodeploy/SKILL.md` — Updated
- `packages/@aiengineeringharness/opencode/skills/womono-version-updater/SKILL.md` — Updated
- `packages/@aiengineeringharness/opencode/skills/womono-validate-manifest/SKILL.md` — Renamed from validate-manifest and updated
- `packages/@aiengineeringharness/opencode/agents/thoughts_locator.md` — Updated
- `packages/@aiengineeringharness/opencode/agents/thoughts_analyzer.md` — Updated
- `packages/@aiengineeringharness/{claude,gemini,pi,wocode,antigravity,codex}/skills/<tool-version-of-all-6>` — Propagated
- `packages/@aiengineeringharness/{claude,gemini,pi,wocode,antigravity,codex}/agents/thoughts_*.*` — Propagated
- `packages/@aiengineeringharness/manifest.json` — v1.7.12, rename validate-manifest entries
- `AGENTS.md` — Added WOMONO-Specific Skills section
- `CHANGELOG.md` — v1.7.12 entry

---

## v1.7.10 — 2026-06-29 — Subagent Extension Fix + Agent Protocol Rewrite (WOMONO-115, WOMONO-116)

### Bug Fixes
- **Subagent extension import path fixed (WOMONO-115)**: Fixed `packages/@aiengineeringharness/pi/agent/extensions/subagents-index.ts` import from `./agents.js` to `./subagent/agents.ts` — resolves "Cannot find module './agents.js'" error on pi startup.

### Features
- **Worker agent renamed to coder (WOMONO-115, WOMONO-116)**: Renamed `worker.md` → `coder.md` in both:
  - `packages/@aiengineeringharness/pi/agent/agents/`
  - `packages/@aiengineeringharness/pi/agent/extensions/subagent/agents/`
- **Subagent agents rewritten with full operational protocols (WOMONO-116)**: Updated `planner`, `reviewer`, `scout`, `coder` in both main agents folder and subagent extension with:
  - Mandatory workflows with gate/checkpoints
  - File generation requirements (plans → `.pi/planning/`, audits → `.pi/reviews/`, recon → `.pi/recon/`)
  - Directory integrity rules (specific save locations)
  - Completion signals: `[PLAN_COMPLETE]`, `[REVIEW_COMPLETE]`, `[RECON_COMPLETE]`, `[CODE_COMPLETE]`
  - Safety protocols: bash limits, read-only enforcement, git safety, review dispatch
  - Modeled after reference implementation in `/ref/pip/.pi/agents/agents/`

### Files
- `packages/@aiengineeringharness/pi/agent/extensions/subagents-index.ts` (L29: import path fix)
- `packages/@aiengineeringharness/pi/agent/agents/{planner,reviewer,scout,coder}.md` — 4 files rewritten
- `packages/@aiengineeringharness/pi/agent/extensions/subagent/agents/{planner,reviewer,scout,coder}.md` — 4 files rewritten
- `CHANGELOG.md` — v1.7.10 entry added
- `thoughts/wayofmono/shared/tickets/WOMONO-115-fix-subagents-extension-import-path.md` — Status: Done
- `thoughts/wayofmono/shared/tickets/WOMONO-116-improve-subagent-agent-definitions.md` — Status: Done

---

## v1.7.8 — 2026-06-26 — Skill Consolidation (WOMONO-083) + --purge + Wocode kebab-case

### Features
- **`--purge` flag added to installers**: Nuclear cleanup — wipes all harness config dirs regardless of manifest. No manifest needed (unlike `--uninstall`). Supports `--dry-run`, `--yes`, and single-tool or `all`. Added to both `install.ts` and `install.ps1`.
- **5 skills consolidated into build-tool-skill (WOMONO-083)**: Deleted `skill-compliance-checker`, `skill-adapter`, `skill-auto-update`, `build-skill-adapter`, `build-skill-auto-update` from all 7 tools. Absorbed all functionality into `build-tool-skill`:
  - Expanded canonical SKILL.md with validation, adaptation, lifecycle sync, config-manifest integration
  - Created `assets/` dir with 8 files: config-manifest-example.yaml, 4 skill examples, compliance-check.py, adapter-generate.py
  - Removed all 5 entries from 7 `config-manifest/tools/*.yaml` files
  - Deployed updated build-tool-skill entries with asset files to all tool YAMLs
  - Deleted skill directories from all 7 harnesses and canonical `skills/`
- **Wo Coder naming changed to kebab-case**: All 72 skill directories in `wocode/agent/skills/` renamed from snake_case to kebab-case (matching Pi convention). Updated `wocode.yaml`, `AGENTS.md`, and `build-tool-skill` SKILL.md references.

### Files
- `packages/@aiengineeringharness/install.ts` — Added `--purge` handler (L322-370)
- `packages/@aiengineeringharness/install.ps1` — Added `-Purge` switch
- `README.md` — Added Uninstall and Purge sections with examples
- `packages/@aiengineeringharness/skills/build-tool-skill/SKILL.md` — Expanded with 5 sections (creation, validation, adaptation, lifecycle, config-manifest)
- `packages/@aiengineeringharness/skills/build-tool-skill/assets/` — 8 new files (examples + scripts)
- `packages/@aiengineeringharness/config-manifest/tools/*.yaml` — All 7 files: removed 5 deleted skills + updated build-tool-skill entries
- `packages/@aiengineeringharness/{opencode,claude,gemini,pi,wocode,codex,antigravity}/skills/` — 5 skill directories deleted per tool
- `packages/@aiengineeringharness/wocode/agent/skills/` — 72 directories renamed snake→kebab
- `AGENTS.md` — Wo Coder naming: snake_case→kebab-case
- `manifest.json` — Recompiled with 0 errors

---

## v1.7.7 — 2026-06-23 — Per-Tool Naming Compliance: kebab vs snake resolved across all 7 tools

### Features
- **OpenCode skill compliance fixed (WOMONO-076)**: OpenCode now 100% compliant with kebab-case naming. The opencode-skill-update.py script was fixed: DIR_CASE/NAME_CASE changed from "snake_case" → "kebab_case".
- **Per-tool naming conventions researched from online docs**: Fetched official docs for OpenCode, Pi, Claude Code — confirmed OpenCode/Pi require kebab-case (hyphens), while Claude/Antigravity/Wocode/Codex use snake_case.
- **AGENTS.md naming table corrected**: OpenCode row changed from `snake_case` → `kebab-case`. Added Agent naming, allowed-tools casing, and Homepage URL columns per actual online documentation.
- **Kebab→snake conversion for 5 tools**: Deleted 72 kebab-case skill directories from Claude, Gemini, Wocode, Antigravity, Codex (kept existing snake equivalents). Copied 2 kebab-only directories (`init-harness`, `investor-ready-doc-gen`) to snake-case variants with corrected `name:` fields.
- **Manifest.json 841 path corrections**: Converted 841 `src:` paths from kebab→snake for Claude, Gemini, Antigravity, Codex, and Wocode to match on-disk directory names.
- **Claude `investor_ready_doc_gen` PascalCase fix**: Fixed `allowed-tools` from lowercase to PascalCase for Claude compliance.
- **investor-ready-doc-gen enhanced (WOMONO-077)**: Added 4 web-researched sections — brand color detection pipeline, Marp CLI platform-specific install guidance, Mermaid chart generation, anti-overflow QA checklist (11-point). Synced to all 7 tool copies (identical hashes). Added missing `design-template.yaml` to Pi install copy and manifest.json.

### Files
- `config-manifest/scripts/opencode-skill-update.py` — Fixed DIR_CASE/NAME_CASE from snake_case→kebab_case
- `AGENTS.md` — Naming conventions table updated with per-tool rules, Agent naming, allowed-tools casing, homepage URLs
- `manifest.json` — Bumped from v1.7.6→v1.7.7; 841 paths converted kebab→snake for 5 tools; added design-template.yaml to all tools
- `opencode/skills/investor-ready-doc-gen/SKILL.md` — Canonical source updated with 4 new sections
- `{claude,gemini,antigravity,codex,wocode}/skills/init_harness/` — New snake_case directories (copied from kebab with corrected name)
- `{claude,gemini,antigravity,codex,wocode,wocode/agent}/skills/investor_ready_doc_gen/` — New snake_case copies with corrected name
- `{claude,gemini,antigravity,codex,wocode,wocode/agent}/skills/` — 72 kebab-case directories deleted (snake equivalents already existed)

---

## v1.7.6 — 2026-06-23 — Full Skill Compliance: 981→0 Errors Across 7 Tools

### Features
- **All 7 tools now 100% compliant**: Zero errors across 845 skills. Fixed `TOOLS_CASE` (650 → 0), `NAME_CONVENTION` (282 → 0), `NO_FRONTMATTER` (40 → 0), `MISSING_DMI` (2 → 0), and cross-tool alignment (7 → 0).
- **Pi frontmatter fixed (WOMONO-076)**: 72 Pi skill files had `name:` field in snake_case but Pi requires kebab-case — caused real Pi startup errors ("name contains invalid characters"). Bulk-fixed to match directory names.
- **Claude tools casing fixed**: 105 Claude skill files changed `allowed-tools` from lowercase to PascalCase (`read` → `Read`). Also fixed 11 antigravity, 11 gemini, 11 codex, 6 opencode, 6 pi, 5 wocode files for tool name casing.
- **Broken YAML frontmatter fixed**: 50 files across 7 tools had invalid YAML in `allowed-tools:` (YAML list format `- read` on same line as colon). Rewrote to comma-separated string format matching all other skills.
- **NAME_CONVENTION now error for kebab tools**: Validates that `name:` matches directory name; underscores trigger errors since Pi/kebab tools reject them at startup.
- **`test-skills.py` spec fixes**: Wocode spec corrected from kebab→snake (dirs and names already match snake_case). Codex/NAME_CONVENTION now accepts name=dir match regardless of naming convention.

### Files
- `config-manifest/tools/pi.yaml` — Removed `skill/womono-deploy` entry (superseded by `womonodeploy`)
- `config-manifest/tools/wocode.yaml` — Fixed `skill/init-harness` source path to `wocode/skills/init_harness/SKILL.md`
- `config-manifest/base_manifest.yaml` — Bumped to v1.7.6
- `config-manifest/scripts/test-skills.py` — Wocode spec: kebab→snake; NAME_CONVENTION: accept name=dir match; NO_FRONTMATTER: better YAML parse
- `pi/agent/skills/*/SKILL.md` — 72 files: `name: snake_case` → `name: kebab-case`
- `codex/skills/*/SKILL.md` — 72 files: `name: snake_case` → `name: kebab-case`
- `{claude,antigravity,gemini,opencode,pi,wocode,codex}/skills/*/SKILL.md` — 155 files: `allowed-tools` tool name casing fix
- `wocode/skills/init_harness/SKILL.md` — New file (was missing from wocode)
- `claude/skills/{git-commit-helper,worktree}/SKILL.md` — Added `disable-model-invocation: true`

## v1.7.5 — 2026-06-22 — Stale Lock Detection + Auto-Install System Deps

### Features
- **Stale lock auto-recovery**: `transaction.ts::acquireLock` now detects stale lock files by checking if the holding PID is still alive (`/proc/<pid>` on Linux, `kill -0` on macOS). Dead process locks are automatically removed and retried instead of waiting forever.
- **Auto-install system deps with `--yes`**: `install.ts::installTool` now runs `sudo apt install -y <dep>` automatically when `--yes` is passed, instead of only warning. Without `--yes`, behavior is unchanged (warning only).
- **Multi-Machine Awareness across all 6 GitHub skills**: Added `## Multi-Machine Awareness` sections to `github-branch`, `github-pr`, `github-review`, `github-sync`, `github-release`, and `github-issue` skills, covering pull-before-create, push-upstream, fetch-before-switch, and never-force-push rules.
- **"Never push directly to main" rule**: Every GitHub skill involving git operations now explicitly prohibits direct pushes to `main` — all changes must go through feature branches → PR → main.
- **`--reload` section in README**: Added dedicated header under Step 2 with full `deno run --reload -A ... --install-cli` command and clarification that `--reload` is needed on Windows always and on macOS/Linux when re-installing.
- **init_harness skills updated**: All 9 copies updated with GitHub auth prerequisites, f-rr-d exclusivity rules, critical `.gitignore` warnings, "Discover and Append AI Engineering Harness Skills & Commands Reference" step, and multi-machine sync workflow (pull --ff-only, pull --rebase, never force-push).
- **f-rr-d multi-machine workflow**: Updated `thoughts/AGENTS.md` and `thoughts/README.md` with multi-machine sync documentation.
- **init_harness: always create all dev folders**: `zerwiz/`, `tomas/`, `craig/`, `andre/` are now always created for every project. `enforcement-ticket/` is a permanent folder (was conditional).
- **Enforcement ticket priority documented**: All 3 ticket skills (`ticket-manager`, `ticket-executor`, `validate-plan`) now check for active enforcement tickets at session start and pause non-enforcement work if any exist.
- **AGENTS.md (monorepo root)**: Updated f-rr-d structure diagram and added Enforcement Tickets section under Ticket Management Knowledge.

### Files
- `packages/@aiengineeringharness/transaction.ts` — Added `isProcessAlive()` helper (L4-17); stale lock check in `acquireLock()` (L90-98)
- `packages/@aiengineeringharness/install.ts` — Dep check now auto-installs when `opts.yes` is true (L877-885)
- `packages/@aiengineeringharness/{opencode,antigravity,claude,codex,gemini,pi}/skills/github-*/SKILL.md` — 6 skills × 6 tools = 36 files with Multi-Machine Awareness sections and "never push directly to main" rule
- `packages/@aiengineeringharness/{opencode,antigravity,claude,codex,gemini,pi,wocode}/skills/init-harness/SKILL.md` — 9 copies updated
- `packages/@aiengineeringharness/{opencode,antigravity,claude,codex,gemini,pi}/skills/ticket-{manager,executor}/SKILL.md` — 2 skills × 6 tools = 12 files
- `packages/@aiengineeringharness/{opencode,antigravity,claude,codex,gemini,pi}/skills/validate-plan/SKILL.md` — 6 tools
- `AGENTS.md` — Updated f-rr-d structure diagram + Enforcement Tickets section
- `README.md` — Added `--reload` section
- `thoughts/AGENTS.md`, `thoughts/README.md` — Multi-machine f-rr-d workflow

### Standard Procedure
- **Version bumps must update all 8 version fields in `manifest.json`**: 1 top-level + 7 per-tool entries (antigravity, claude, codex, gemini, opencode, pi, wocode)
- **Also update**: `CHANGELOG.md`, `README.md`, `docs/fixes/ai-engineering-harness-fixes.md`, `docs/fixes/README.md`

---

## v1.7.6 — 2026-06-22 — init_harness GitHub Skills + Dep Check + Windows PATH

### Features
- **init_harness generates GitHub skill agent definitions**: Step 2a now appends structured agent definitions (identifier, responsibility, inputs/outputs, constraints) for all 6 GitHub skills to the project memory file — `github-branch`, `github-issue`, `github-pr`, `github-release`, `github-review`, `github-sync`.
- **GitHub Workflow pattern added**: Generated AGENTS.md now includes the workflow sequence `github-branch → github-pr → github-review → github-sync → github-release → github-issue` so agents always use the correct skill at each step.
- **Monorepo AGENTS.md**: Added Agent Directory entries for all 6 GitHub skills with the same structured format as existing agents (harness-installer, ticket-manager, etc.).
- **init_harness command updated**: OpenCode's `/init_harness` command now documents that it appends GitHub skill agent definitions and the GitHub Workflow pattern.
- **Skip dep install if already installed**: `install.ts::installTool` now checks `dpkg -s` before adding `libwebkit2gtk-4.1-dev` to needed deps — avoids sudo password prompt on every run when the package is already present on Debian/Ubuntu.
- **Clearer Windows PATH hint**: After `--install-cli`, Windows users now see both a temporary fix (`set PATH=...`) and a permanent PowerShell fix (`[Environment]::SetEnvironmentVariable(...)`) for adding `.deno/bin` to PATH.

### Files
- `packages/@aiengineeringharness/{opencode,antigravity,claude,codex,gemini,pi}/skills/init-harness/SKILL.md` — 6 copies with Step 2a extended to generate GitHub skill agent definitions + workflow
- `AGENTS.md` — Added Agent Directory entries for 6 GitHub skills + GitHub Workflow section
- `packages/@aiengineeringharness/opencode/commands/init_harness.md` — Updated description, quick reference, and workflow sections
- `packages/@aiengineeringharness/install.ts` — dpkg check before dep install (L871-880); Windows PATH hint after --install-cli

---

## v1.7.4 — 2026-06-22 — OpenCode Skills Kebab-Case Naming (WOMONO-073, WOMONO-074)

### Features
- **OpenCode skills renamed to kebab-case**: All 74 OpenCode SKILL.md `name:` fields and directory names changed from snake_case to kebab-case per official OpenCode naming regex (`^[a-z0-9]+(-[a-z0-9]+)*$`)
- **Duplicate directories removed**: 74 snake_case directories deleted from `opencode/skills/` (kebab-case variants kept)
- **`wow-tickets` fully deprecated**: Removed all stale entries from `manifest.json` (7 tools × 1 entry each) and all 6 `config-manifest/tools/*.yaml` files
- **`init_harness` duplicates cleaned**: Removed duplicate `init_harness/` directories from antigravity, claude, codex, gemini, wocode (opencode + pi already had kebab-case `init-harness/`)
- **Opencode `help.ts` updated**: Skill references changed from snake_case to kebab-case
- **`docs/ai-coding-tools/opencode.md` fixed**: Incorrect "Skill naming: snake_case" changed to "kebab-case" (2 locations)
- **Per-tool versions bumped to 1.7.4**: All 7 tool entries in `manifest.json` updated from `1.0.0` to `1.7.4` to match top-level harness version

### Files
- `packages/@aiengineeringharness/opencode/skills/*/SKILL.md` — 74 frontmatter name: fields fixed
- `packages/@aiengineeringharness/opencode/skills/` — 74 snake_case directories deleted
- `packages/@aiengineeringharness/manifest.json` — `wow-tickets` entries removed from all 7 tools
- `packages/@aiengineeringharness/config-manifest/tools/*.yaml` — `wow-tickets` removed from 6 files
- `packages/@aiengineeringharness/{antigravity,claude,codex,gemini,wocode}/skills/init_harness/` — 5 directories deleted
- `packages/@aiengineeringharness/wocode/agent/skills/init_harness/` — 1 directory deleted
- `packages/@aiengineeringharness/opencode/skills/help-command/help.ts` — references fixed
- `docs/ai-coding-tools/opencode.md` — naming convention corrected
- `packages/@aiengineeringharness/opencode/skills/init-harness/init_harness.md` — frontmatter name: fixed
- `packages/@aiengineeringharness/manifest.json` — per-tool versions `1.0.0` → `1.7.4` (7 tools)

### Standard Procedure
- **Version bumps must update all 8 version fields in `manifest.json`**: 1 top-level + 7 per-tool entries (antigravity, claude, codex, gemini, opencode, pi, wocode)
- **Also update**: `CHANGELOG.md`, `README.md`, `docs/fixes/ai-engineering-harness-fixes.md`, `docs/fixes/README.md`

---

## v1.7.3 — 2026-06-17 — Ticket Skill Notification Integration + Deprecated Skill Cleanup

### Features
- **Ticket skill notification integration**: `ticket-manager`, `ticket-executor`, `validate-plan` skills now mark CTO Dashboard notifications as read via API
  - `ticket-manager`: Marks `review-<TICKET_ID>` after review actions, `update-<TICKET_ID>` after status changes
  - `ticket-executor`: Marks notifications as read after phase completion
  - `validate-plan`: Marks notifications as read after validation
- **Notification API integration**: All 3 ticket skills updated across all 7 tools (opencode, claude, pi, wocode, antigravity, codex)
- **AGENTS.md updated**: Added ticket lifecycle, namespaces, notification integration docs
- **Deprecated skill removed**: `wow-tickets` skill removed from all 7 tools (replaced by namespace-agnostic `ticket-manager`)
- **Manifest.json cleaned**: Removed all `wow-tickets` entries from manifest (8 tools × 1 entry each)

### Files
- `packages/@aiengineeringharness/*/skills/ticket-manager/SKILL.md` (7 tools + pi extension)
- `packages/@aiengineeringharness/*/skills/ticket-executor/SKILL.md` (7 tools + pi extension)
- `packages/@aiengineeringharness/*/skills/validate-plan/SKILL.md` (7 tools + pi extension)
- `AGENTS.md` - Added ticket lifecycle, namespaces, notification integration docs
- `packages/@aiengineeringharness/manifest.json` - Removed all wow-tickets entries
- Deleted: `packages/@aiengineeringharness/*/skills/wow-tickets/` (8 directories)

---

## v1.7.2 — 2026-06-17

### Platform-Aware Harness Installer (WOMONO-094)

**Problem**: The `ai-harness` installer installed skills/agents/commands uniformly without detecting the user's platform, hardware, chat frontend, runtime environment, or desktop configuration — leading to broken integrations (missing `.desktop` file on Linux, wrong icon paths, incompatible Node.js version, missing system deps, no dotfile idempotency).

**Fix**: Complete rewrite of detection + adaptation layer in `packages/@aiengineeringharness/`:

**Detection Modules (11):**
- `detect/os.ts` — OS, distro, WSL, container detection
- `detect/arch.ts` — CPU architecture (x86_64, arm64, etc.)
- `detect/tools.ts` — Detects 7 AI coding tools via config dirs + PATH
- `detect/runtime.ts` — Deno, Node, Python, pnpm/npm/yarn, Git (user/signing key)
- `detect/desktop.ts` — DE (GNOME/KDE/etc), display server (X11/Wayland), Nerd Font, XDG paths
- `detect/hardware.ts` — CPU cores/model, RAM, GPU (NVIDIA/AMD/Intel/Apple), disk, battery
- `detect/terminal.ts` — Shell, terminal emulator, color depth, tmux, locale/UTF-8
- `detect/network.ts` — Proxy, GitHub token, connectivity, npm registry
- `detect/security.ts` — SSH agent, GPG keys, keychain, SELinux, AppArmor
- `detect/permissions.ts` — Root/Admin, macOS Gatekeeper, Windows ExecutionPolicy, Homebrew path
- `detect/index.ts` — Aggregate cache + system report builder

**Adaptation Modules (4):**
- `adapt/paths.ts` — XDG-compliant paths per OS (Linux/macOS/Windows)
- `adapt/formats.ts` — Tool-specific skill naming (snake_case vs kebab-case)
- `adapt/deps.ts` — OS-specific dependency install commands (apt/dnf/brew/winget)
- `adapt/desktop.ts` — `.desktop` file generation, clipboard, xdg-open per platform

**Supporting Modules:**
- `logger.ts` — Persistent install log with secret redaction
- `transaction.ts` — Atomic installs with write-ahead log, rollback, file locking
- `report.ts` — JSON system report + PII sanitization + dashboard push

**CLI Flags Added:**
- `--detect` — Print full platform-aware system report
- `--tool=auto` — Install only detected tools (auto-detects via config dirs + PATH)
- `--no-report` / `WOMONO_DO_NOT_TRACK` — Opt-out of telemetry
- `--debug` — Verbose logging to OS-standard state directory
- Dotfile block wrapping (`# BEGIN/END WOMONO HARNESS`) for idempotent PATH/alias injection

**Supply-Chain Security:**
- Optional `sha256` field in manifest.json FileEntry
- Installer verifies SHA-256 checksum on remote downloads before placement

**Verified:**
- `deno run -A install.ts --detect` outputs complete system report
- `deno run -A install.ts --tool=auto --dry-run` auto-detects all 7 tools, runs full dry-run
- TypeScript compiles cleanly

---

## v1.7.1 — 2026-06-16

### Installer Status Reporting Fixed

**Problem**: Installer showed "changed" and "ok" in summary line instead of per-file "NEW" vs "UPDATED" labels.

**Fix**: Modified `packages/@aiengineeringharness/install.ts`:
- Added `newCount`, `updatedCount`, `unchanged`, `skipped` counters
- Per-file output now shows `NEW`, `UPDATED`, `UNCHANGED (ok)` labels
- Summary line format: `X NEW, Y UPDATED, Z UNCHANGED, W SKIPPED`

**Verified**: Clean install → 145 NEW for opencode; modified file → 1 UPDATED; subsequent reinstall → 0 UPDATED, 194 UNCHANGED.

### Stale File Removal Fixed

**Problem**: Stale cleanup removed `wocode-skill-update.py` scripts that were in manifest but didn't exist on disk (still named `wocoder-skill-update.py`).

**Fix**: Renamed 12 `wocoder-skill-update.py` → `wocode-skill-update.py` across:
- `opencode/skills/{skill-compliance-checker,skill-adapter,skill-auto-update}/scripts/`
- `gemini/skills/{skill-compliance-checker,skill-adapter,skill-auto-update}/scripts/`
- `pi/agent/skills/{skill-adapter,skill-auto-update}/scripts/`
- `wocode/agent/skills/{skill-compliance-checker,skill-adapter,skill-auto-update}/scripts/`
- `config-manifest/scripts/`

Compile now clean (0 errors). Clean reinstall finds all 7 scripts per tool.

### Skill Parity Achieved: 73/73 Across All 7 Tools

**Problem**: After adding `self-documentation` and `validate-manifest` to 6 non-wocode YAMLs, codex was missing SKILL.md files (dual-file format requires SKILL.md too).

**Fix**: Created missing codex SKILL.md files. Clean reinstall verified identical 73 skills:
- opencode: 73 | claude: 73 | gemini: 73 | pi: 73 | wocode: 73 | codex: 73 | antigravity: 73

### Womono Version Bumped to 1.7.1

All core files updated: manifest.json, CHANGELOG.md, README.md, install.ts, setup.sh, install.ps1.

### Remote Install: Directory Entries in Manifest Fixed (v1.7.1)

**Problem**: When installing from remote (`ai-harness --tool=antigravity`), the installer failed with `Failed to fetch antigravity/skills/skill-adapter/assets (404)` because the manifest includes directory entries (e.g., `antigravity/skills/skill-adapter/assets`) that work locally but don't exist as files on raw.githubusercontent.com.

**Fix**: Modified `packages/@aiengineeringharness/install.ts` (lines 863-873) to catch 404 errors during remote fetch and skip those entries gracefully, logging them as "likely a directory, not in remote manifest". Individual files within those directories (e.g., `assets/compliance-fix.ts`) are still fetched correctly.

**Verified**: Remote install now skips directory entries and continues with individual files.

### Skill Assets/Scripts Installation Fixed (v1.7.1)

**Problem**: Skills `skill-adapter`, `skill-auto-update`, and `skill-compliance-checker` were missing their `assets/` and `scripts/` directories when installed. The installer showed:
```
· skills/skill-adapter/assets  (skipped - likely a directory, not in remote manifest)
· skills/skill-adapter/scripts  (skipped - likely a directory, not in remote manifest)
```
These directories contain critical scripts (10 Python scripts per skill for skill-adapter, skill-auto-update, skill-compliance-checker) and assets (compliance-fix.ts, skillsrules.md) that skills need at runtime.

**Root Cause**: The YAML source files in `config-manifest/tools/*.yaml` had redundant directory entries (src ending in `/assets` or `/scripts`) alongside individual file entries. These directory entries don't exist as files on GitHub, causing 404 errors during remote fetch.

**Fix**: Removed all 42 redundant directory entries from the 7 tool YAML configs:
- `antigravity.yaml`: 6 entries removed
- `claude.yaml`: 6 entries removed
- `codex.yaml`: 6 entries removed
- `gemini.yaml`: 6 entries removed
- `opencode.yaml`: 6 entries removed
- `pi.yaml`: 6 entries removed
- `wocode.yaml`: 6 entries removed

Then recompiled `manifest.json` via `python3 config-manifest/compile.py`. The individual files were already listed, so directories are created automatically when files are copied.

**Verified**: All 7 tools now have complete directory structures:
- `~/.config/opencode/skills/skill-adapter/{assets,scripts}/` (11 files)
- `~/.config/opencode/skills/skill-auto-update/{assets,scripts}/` (12 files)
- `~/.config/opencode/skills/skill-compliance-checker/{assets,scripts}/` (11 files)
- Same for antigravity, claude, codex, pi, wocode

### Ticket Status Selection & CTO Review Integration (v1.7.1)

**Problem**: The CTO Dashboard only showed static status badges for tickets. No interactive way to change status, submit tickets, and no CTO review workflow.

**Fix**: 
1. **Extended TicketStatus type** in `ui/src/lib/types.ts` to include all 10 statuses
2. **Added interactive Select dropdowns** in `ui/src/components/dashboard/tickets-view.tsx`:
   - TicketRow (list view) - status dropdown with color-coded options
   - TicketDetailView (detail view) - status dropdown in header
3. **Added statusColors mapping** for all 10 statuses with consistent theme colors
4. **Updated ticket-manager, ticket-context, ticket-executor skills** across all 7 tools with:
   - Extended status flow documentation
   - CTO Dashboard integration details
   - Review Queue workflow (submit → In Review → Approve/Request Changes/Reject)
5. **Updated ticket-template.md** with all statuses and action table

**New Status Flow**:
```
Backlog → Planned → Ready → In Progress → Submitted for Review → In Review → Approved → Done
                                           ↘ Changes Requested → In Progress
                                           ↘ Reject → Blocked
```

**Dashboard Integration**:
- **Review Queue view**: Shows "Submitted for Review" and "In Review" tickets
- **CTO Actions**: Approve → "Approved" → "Done"; Request Changes → "Changes Requested" → "In Progress"; Reject → "Blocked"
- **Status Filter**: All 10 statuses available in filter dropdown

### 6 New GitHub Skills Added (v1.7.1)

Added comprehensive GitHub integration skills across all 7 tools:

| Skill | Purpose | Key Tools |
|-------|---------|-----------|
| `github-branch` | Branch naming, creation, protection | `create_branch`, `protect_branch`, `cleanup_branches` |
| `github-pr` | PR creation, management, linking | `create_pr`, `update_pr`, `merge_pr`, `link_pr_to_ticket` |
| `github-review` | Code review workflow, CTO actions | `start_review`, `add_review_comment`, `submit_review_decision` |
| `github-sync` | Branch sync, conflict resolution | `sync_branch`, `check_branch_status`, `resolve_conflicts` |
| `github-release` | Release creation, changelog, publishing | `prepare_release`, `generate_changelog`, `create_release` |
| `github-issue` | Issue management, bi-directional ticket sync | `create_issue_from_ticket`, `link_issue_to_ticket`, `sync_issue_to_ticket` |

**Features**:
- Bi-directional sync between f-rr-d tickets and GitHub Issues/PRs
- CTO Review Queue in Dashboard with Approve/Request Changes/Reject
- Branch protection rules enforcement
- Conventional commits for automated versioning
- Automated changelog generation
- Release artifact publishing

---



## v1.7.0 — 2026-06-15

### Config-Manifest Modularization

**Problem**: The monolithic `manifest.json` had cross-tool path contamination, was hard to maintain, and had no validation that per-tool skill formatting was correct.

**Solution**: Broke `manifest.json` into modular per-tool YAML files with a compilation pipeline:

- `config-manifest/tools/{tool}.yaml` — one YAML per tool (7 files)
- `config-manifest/compile.py` — merges YAMLs → backward-compatible `manifest.json`
- `config-manifest/validate.py` — per-tool format validation against specs
- `config-manifest/scripts/` — test suite + skill update scripts

### Per-Tool Skill Update Scripts (7 scripts)

Each tool now has its own format enforcer that validates and fixes:
- Directory naming (snake_case vs kebab-case per tool)
- `allowed-tools` casing (PascalCase for Claude, lowercase for others)
- `allowed-tools` format (space-delimited string vs YAML list)
- Frontmatter field requirements
- Dual-file format for Codex (`skill.yaml` + `prompt.md`)

Scripts: `{tool}-skill-update.py` with `--validate`, `--fix`, `--add <name>`, `--sync-yaml`, `--all`

### Test Suite (4 scripts)

- `test-yamls.py` — validates YAML syntax, cross-contamination, path prefixes
- `test-manifest.py` — validates compiled manifest.json structure
- `test-skills.py` — validates on-disk skill files per format spec
- `run-all-tests.py` — orchestrator with `--tool=<name>` support

### Sidecar Support Documented

Created `docs/guides/sidecars.md` covering background process support per tool:
- Antigravity: native sidecars (sidecar.json + cron + agentapi)
- Claude: session-scoped Monitor/CronCreate
- Others: systemd/cron/containers

### Skills Updated with Config-Manifest Knowledge

- `skill-compliance-checker` — validation pipeline section
- `skill-adapter` — YAML→manifest.json pipeline
- `skill-auto-update` — recompile steps 6-7 post-sync

### New Skills Deployed to All 7 Tools

- `self-documentation` — enables tools to answer "How do I...?" questions locally
- `validate-manifest` — validates skill manifest against standards

---

## v1.6.1 — 2026-06-14

### Command/Skill Conflicts Resolved

**Problem**: Gemini CLI and Antigravity CLI had naming conflicts where `commands/*.toml` files shared the same names as `skills/*/` directories. This caused auto-renaming to `/user.*` and `/.*1` variants.

**Fix**: Renamed all command files with `run-` prefix:
- `/run-create_plan` instead of `/create_plan`
- `/run-debug` instead of `/debug`
- `/run-worktree` instead of `/worktree`
- (and all 14 commands)

**Tools affected**: Gemini CLI, Antigravity CLI

**Tools NOT affected**: OpenCode (handles commands/skills separately), Claude (no commands dir), Pi (prompts only), WoCoder (prompts only), Codex

### WoCoder Cleanup

Removed duplicate `agent/commands/` directory (was identical to `agent/prompts/`). WoCoder now uses prompts only, matching the Pi pattern.

### New Skill: womono_version_updater

Auto-triggered skill that knows how to bump the harness version across all files and tools. Invoked when the user requests a version update.

### Extension Dependency Installation

**Added**: `installExtensionDependencies()` in `install.ts`
- After copying extension files, scans extension directories for `package.json`
- Runs `npm install` in extension directories that have dependencies
- Fixes missing deps for web-access extension (`@mozilla/readability`, `linkedom`, `turndown`, `unpdf`, etc.)

---

## v1.6.0 and earlier — Pre-fixes

### Known Issues (now fixed)
- ❌ Command/skill naming conflicts in Gemini CLI and Antigravity
- ❌ Duplicate `commands/` and `prompts/` in WoCoder
- ❌ Extension dependencies not installed (web-access failed to load)
- ❌ WoCoder config dir confused with wouser (`.wo` vs `.wocode`)

---

## Installation Verification

### ✅ Working (v1.7.0+)
```bash
# Install all tools
ai-harness --tool=all --yes

# Or individual tools
ai-harness --tool=wocode --yes
ai-harness --tool=pi --yes
ai-harness --tool=opencode --yes
ai-harness --tool=claude --yes
ai-harness --tool=gemini --yes
ai-harness --tool=antigravity --yes
ai-harness --tool=codex --yes

# Update to latest
ai-harness --update
```

### ✅ Per-Tool Config Directories
| Tool | Config Dir | Skills Dir |
|------|------------|------------|
| **Wo Coder** | `~/.wocode/` | `~/.wocode/agent/skills/` |
| **Pi** | `~/.pi/agent/` | `~/.pi/agent/skills/` |
| **OpenCode** | `~/.config/opencode/` | `~/.config/opencode/skills/` |
| **Claude Code** | `~/.claude/` | `~/.claude/skills/` |
| **Gemini CLI** | `~/.gemini/` | `~/.gemini/skills/` |
| **Codex** | `~/.codex/` | `~/.codex/skills/` |
| **Antigravity** | `~/.antigravity/` | `~/.antigravity/skills/` |

All tools also discover skills from `~/.agents/skills/` (shared cross-tool location).

---

## Extension Support

| Tool | Extension System |
|------|------------------|
| **Pi** | `extensions/` (subagent, open-editor, etc.) |
| **Wo Coder** | `extensions/` (subagent, open-editor, theme-cycler, web-access) |
| **OpenCode** | `plugins/` (plugin.json) |
| **Claude Code** | No native extension system |
| **Gemini CLI** | No native extension system |
| **Antigravity** | `plugins/` (plugin.json) |
| **Codex** | No native extension system |

---

## v1.7.11 — 2026-07-04 — Init-Harness Canonical Skill Architecture (WOMONO-131)

### Features
- **Init-harness skill converted to config-manifest pattern**: Refactored from 9 standalone per-tool copies to a canonical + compile architecture at `packages/@aiengineeringharness/skills/init-harness/`:
  - `SKILL.md` — tool-agnostic canonical body (no frontmatter)
  - `tools/{opencode,claude,gemini,pi,wocode,antigravity,codex}.yaml` — per-tool frontmatter configs
  - `compile.py` — generates per-tool SKILL.md files from canonical + YAML configs
  - `compile.py --validate` — checks existing files match expected output
- **Frontmatter compliance fixes** (applied by compile.py):
  - Pi: `name: init_harness` → `init-harness` (kebab-case), removed `disable-model-invocation` (unsupported on Pi)
  - wocode: `name: init_harness` → `init-harness` (kebab-case)
  - Codex: removed `disable-model-invocation` (unsupported on Codex)
  - Gemini: removed `disable-model-invocation` (unsupported on Gemini)
- **AGENTS.md updated**: Added "Canonical Skill Architecture (config-manifest pattern)" section documenting the pattern, per-tool YAML fields, install.ts data flow, and how to create new skills

### Files
- `packages/@aiengineeringharness/skills/init-harness/SKILL.md` — new canonical body
- `packages/@aiengineeringharness/skills/init-harness/compile.py` — new compile script
- `packages/@aiengineeringharness/skills/init-harness/tools/opencode.yaml` — new per-tool config
- `packages/@aiengineeringharness/skills/init-harness/tools/claude.yaml` — new per-tool config
- `packages/@aiengineeringharness/skills/init-harness/tools/gemini.yaml` — new per-tool config
- `packages/@aiengineeringharness/skills/init-harness/tools/pi.yaml` — new per-tool config
- `packages/@aiengineeringharness/skills/init-harness/tools/wocode.yaml` — new per-tool config
- `packages/@aiengineeringharness/skills/init-harness/tools/antigravity.yaml` — new per-tool config
- `packages/@aiengineeringharness/skills/init-harness/tools/codex.yaml` — new per-tool config
- `AGENTS.md` — Added Canonical Skill Architecture section (L423-509)
- `docs/fixes/ai-engineering-harness-fixes.md` — v1.7.11 entry added

---

## Known Issues (Future Work)

- ❌ Harness skills installation via `ai-harness --tool=wocode` only installs 25/81 skills
- ❌ Extensions, prompts, themes from harness NOT fully installed
- ❌ Skills don't appear in `/skill:` commands or system prompt
- ❌ Web-access extension requires `npm install` in extension dir (fixed by v1.6.1 installer)

---

## Related Documentation

- [CHANGELOG.md](../../CHANGELOG.md) - Full changelog
- [WOMONO-074 Ticket](../../thoughts/wayofmono/zerwiz/WOMONO-074-fix-npm-installation-in-pnpm-workspace.md) - Full ticket history