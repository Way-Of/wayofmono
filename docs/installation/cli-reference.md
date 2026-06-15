# CLI Reference — ai-harness

Complete flag reference for the AI Engineering Harness CLI.

## Global Flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--install-cli` | | Install/update CLI binary |
| `--tool=<name>` | | Install tool config (claude, opencode, gemini, pi, wocode, antigravity, codex, all) |
| `--update` | | Full harness sync: CLI + docs + all tools + compliance |
| `--compliance` | | Validate all installed files match manifest |
| `--check` | | Compare installed versions against manifest |
| `--yes` | `-y` | Skip confirmation prompts |
| `--dry-run` | `-n` | Preview without writing files |
| `--skill=<name>` | | Specific components to install (comma-separated) |
| `--interactive` | `-i` | Interactive checkbox picker |
| `--local` | `-l` | Install to project-local directories |
| `--uninstall=<name>` | | Remove installed files (claude, opencode, all, ...) |
| `--no-validate` | | Skip compliance validation after --update |
| `--prune` | | Interactive: review & remove non-manifest skills |
| `--sync-docs` | | Sync canonical skills to all tool directories |
| `--report-skills` | | Report local skills to dashboard telemetry API |
| `--report-url=<url>` | | Dashboard URL for skill reporting |
| `--import-ref` | | Import ref skills/agents to all platforms |
| `--mode=<mode>` | | Show clone + stow instructions (repo) |
| `--dest=<path>` | | Clone destination for --mode=repo |
| `--skip-binary` | | Skip CLI binary update in --update |
| `--help` | `-h` | Show help |

## Tool Names

| Tool | Description |
|------|-------------|
| `opencode` | OpenCode (open-source TUI) |
| `claude` | Claude Code (Anthropic) |
| `gemini` | Gemini CLI (Google) |
| `pi` | Pi Agent |
| `codex` | Codex (OpenAI) |
| `antigravity` | Antigravity platform |
| `wocode` | Wo Coder (primary interface) |
| `all` | All 7 tools |

## Component Names (--skill)

| Component | Description |
|-----------|-------------|
| `skills` | Skill directories |
| `agents` | Subagent definitions |
| `commands` | Slash commands |
| `prompts` | Prompt templates |
| `extensions` | Extensions/packets |
| `themes` | Theme files |
| `keybindings` | Keybinding configs |
| `settings` | Settings files |

## Examples

```bash
# Install all tools non-interactively
ai-harness --tool=all --yes

# Install only skills for OpenCode
ai-harness --tool=opencode --skill=skills --yes

# Preview what would be installed
ai-harness --tool=claude --skill=skills,agents --dry-run

# Interactive component selection
ai-harness --tool=claude --interactive

# Project-local install
ai-harness --tool=wocode --local --yes

# Full update with compliance check
ai-harness --update

# Update without compliance validation
ai-harness --update --no-validate

# Update without binary update
ai-harness --update --skip-binary

# Check versions against manifest
ai-harness --check

# Validate all installed files
ai-harness --compliance

# Prune stale skills
ai-harness --prune

# Sync documentation
ai-harness --sync-docs
ai-harness --sync-docs --check

# Report skills to dashboard
ai-harness --report-skills
ai-harness --report-skills --report-url https://cto.wayof.work

# Import reference skills
ai-harness --import-ref

# Show stow instructions
ai-harness --mode=repo
ai-harness --mode=repo --dest=~/.ai-engineering-harness

# Uninstall
ai-harness --uninstall=claude
ai-harness --uninstall=all

# Help
ai-harness --help
```

## PowerShell Wrapper Flags

| Parameter | Description |
|-----------|-------------|
| `-InstallCli` | Install/update CLI binary |
| `-Tool <name>` | Install tool config |
| `-Update` | Full harness sync |
| `-Compliance` | Validate all installed files |
| `-Check` | Compare installed versions |
| `-Yes` | Skip confirmation prompts |
| `-DryRun` | Preview without writing files |
| `-Skill <name>` | Specific components (comma-separated) |
| `-Interactive` | Interactive checkbox picker |
| `-Local` | Install to project-local directories |
| `-Uninstall <name>` | Remove installed files |
| `-NoValidate` | Skip compliance validation |
| `-Prune` | Interactive stale skill removal |
| `-SyncDocs` | Sync canonical skills |
| `-ReportSkills` | Report skills to dashboard |
| `-ReportUrl <url>` | Dashboard URL |
| `-ImportRef` | Import reference skills |
| `-Mode <mode>` | Show clone + stow instructions |
| `-Dest <path>` | Clone destination |
| `-SkipBinary` | Skip binary update |
| `-Help` | Show help |

> **Note**: PowerShell uses full parameter names (no single-letter aliases). The underlying Deno script supports `-y`, `-n`, `-i`, `-l`, `-h` as aliases.