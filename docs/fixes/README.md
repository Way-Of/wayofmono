# Release Notes & Fixes

## Index

- [wo-coding-agent Fixes](./wo-coding-agent-fixes.md) — CLI coding agent (wocode) v1.0.6+
- [Harness v1.6.1](#v161--2026-06-14) — Core harness fixes

---

## wo-coding-agent Fixes

See [wo-coding-agent-fixes.md](./wo-coding-agent-fixes.md) for detailed release notes on v1.0.6 through v1.0.9.

**Quick Summary:**
- v1.0.9: Added docs folder, Ollama defaults
- v1.0.8: CONFIG_DIR_NAME `.wo` → `.wocoder` (separate from wouser)
- v1.0.7: npm workspace deps → explicit versions
- v1.0.6: Removed `link:` protocol (npm incompatible)

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

---

For full changelog, see [CHANGELOG.md](../../CHANGELOG.md).
