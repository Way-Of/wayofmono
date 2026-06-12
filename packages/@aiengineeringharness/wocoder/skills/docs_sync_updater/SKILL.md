---
name: docs_sync_updater
description: >-
  Fetch latest documentation from all AI tool sources and update tool reference
  docs + skills/agent configs
allowed-tools: 'read, write, grep, web, search, web, fetch'
---

# Documentation Sync Updater

Fetches the latest documentation from all supported AI coding tools to keep
**tool reference docs** (`docs/tools/ai-coding-tools/*.md`) and **skill/agent configs**
up to date.

## Reference Docs Target

The truth source for all tool references lives at:
`docs/tools/ai-coding-tools/`

| File | Tool | Doc URL |
|------|------|---------|
| `pi.md` | Pi | https://pi.dev/ |
| `opencode.md` | OpenCode | https://opencode.ai/docs/ |
| `claude-code.md` | Claude Code | https://code.claude.com/docs/en/overview |
| `codex.md` | Codex | https://developers.openai.com/codex/cli |
| `antigravity-cli.md` | Antigravity CLI | https://antigravity.google/docs/cli-overview |
| `wo-coder.md` | Wo Coder | Custom (monorepo) |
| `cursor.md` | Cursor | https://cursor.com/docs |
| `README.md` | Index | — |

## Update Flow

For each tool reference doc:

1. **Go online** — fetch the tool's official documentation pages using the doc URLs above
2. **Parse latest info** — extract: install commands, built-in tools list, config format, MCP support, subagent system, slash commands, unique capabilities
3. **Compare** against the current `docs/tools/ai-coding-tools/<tool>.md`
4. **Update** the reference doc if anything changed (new tools, renamed flags, deprecated features, new capabilities)
5. **Propagate** — if tool APIs changed, flag which skills/agents in `packages/@aiengineeringharness/<tool>/skills/` need updating too

## Commands

- `ai-harness docs sync` — Fetch all tool docs, update reference files, create tickets for skill changes
- `ai-harness docs sync --source=claude,opencode` — Selective update for specific tools
- `ai-harness docs sync --path=docs/tools/ai-coding-tools/pi.md` — Single file update
- `ai-harness docs watch` — Continuous monitoring daemon
- `ai-harness docs status` — Show last sync date and pending updates per tool

## Installation

This skill ships as part of every tool harness. On `ai-harness --tool=all` or `ai-harness --tool=<tool>`, it is installed to the user's machine at `~/.<tool>/skills/docs-sync-updater/SKILL.md` just like every other skill. No separate install step needed.

If the canonical source at `docs/skills/docs-sync-updater/SKILL.md` is updated, run `ai-harness docs sync` to propagate changes to all installed tool copies.

## Behavior

- **No changes needed** — do nothing (reference doc is current)
- **Non-breaking changes** (new tools, new flags, new capabilities) — auto-update the `.md` file
- **Breaking changes** (deprecated tools, removed flags, renamed binaries) — update reference doc AND create WOMONO tickets via Ticket Manager for affected skills/agents
- **Config format changes** — update the reference doc examples AND regenerate relevant `packages/@aiengineeringharness/<tool>/` configs

## Example Session

```
User: "update the tool references"
Agent: Reads docs/tools/ai-coding-tools/README.md →
       Fetches https://opencode.ai/docs/ →
       Compares with docs/tools/ai-coding-tools/opencode.md →
       Finds new tools added →
       Updates opencode.md with latest tool list →
       Reports: "Updated OpenCode reference (2 new tools, 1 deprecated)"
```
