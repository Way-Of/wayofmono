# AI Engineering Harness Fixes & Release Notes

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

## Known Issues (Future Work)

- ❌ Harness skills installation via `ai-harness --tool=wocode` only installs 25/81 skills
- ❌ Extensions, prompts, themes from harness NOT fully installed
- ❌ Skills don't appear in `/skill:` commands or system prompt
- ❌ Web-access extension requires `npm install` in extension dir (fixed by v1.6.1 installer)

---

## Related Documentation

- [CHANGELOG.md](../../CHANGELOG.md) - Full changelog
- [WOMONO-074 Ticket](../../thoughts/wayofmono/zerwiz/WOMONO-074-fix-npm-installation-in-pnpm-workspace.md) - Full ticket history