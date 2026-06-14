# AI Engineering Harness Fixes & Release Notes

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
- ❌ WoCoder config dir confused with wouser (`.wo` vs `.wocoder`)

---

## Installation Verification

### ✅ Working (v1.6.1+)
```bash
# Install all tools
ai-harness --tool=all --yes

# Or individual tools
ai-harness --tool=wocoder --yes
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
| **Wo Coder** | `~/.wocoder/` | `~/.wocoder/agent/skills/` |
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

- ❌ Harness skills installation via `ai-harness --tool=wocoder` only installs 25/81 skills
- ❌ Extensions, prompts, themes from harness NOT fully installed
- ❌ Skills don't appear in `/skill:` commands or system prompt
- ❌ Web-access extension requires `npm install` in extension dir (fixed by v1.6.1 installer)

---

## Related Documentation

- [CHANGELOG.md](../../CHANGELOG.md) - Full changelog
- [WOMONO-074 Ticket](../../thoughts/wayofmono/zerwiz/WOMONO-074-fix-npm-installation-in-pnpm-workspace.md) - Full ticket history