---
name: docs-sync-updater
description: ""Fetch latest documentation from all agent frontend sources and auto-update skills/agent configs""
allowed-tools: ["[read", "write", "grep", "web_search", "web_fetch]"]
---

> **Platform**: Gemini CLI | **Skill**: docs-sync-updater | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# Documentation Sync Updater

Fetches the latest documentation from all supported agent frontends to keep skills and configs up to date.

## Monitored Sources

| Source | URL |
|--------|-----|
| Pi | https://pi.dev/docs/latest |
| Gemini CLI | https://geminicli.com/docs/ |
| OpenCode | https://opencode.ai/docs/cli/ |
| Claude Code | https://code.claude.com/docs/en/overview |
| Codex | https://developers.openai.com/codex/cli |
| Antigravity | https://antigravity.google/docs/cli-overview |

## Commands

- `ai-harness docs sync` - Fetch all, show diff, create tickets
- `ai-harness docs sync --source=claude,gemini` - Selective sources
- `ai-harness docs watch` - Continuous monitoring daemon
- `ai-harness docs status` - Show last sync and pending updates

## Behavior

- Non-breaking changes → auto-update skill configs
- Breaking changes → create PROJ tickets via Ticket Manager
