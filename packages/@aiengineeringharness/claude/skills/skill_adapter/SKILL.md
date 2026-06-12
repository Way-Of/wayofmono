---
name: skill_adapter
description: Platform-specific skill/agent loading and format adapters for all 7 frontends
allowed-tools: 'Read, Write, Glob, Ls, Grep'
---

# Platform-Specific Skill Loading & Format Adapters

Maintains a single canonical skill format and generates platform-specific configurations for all 7 frontends.

## Canonical Skill Format

Each skill in `packages/@aiengineeringharness/skills/<skill>/` has:
- `SKILL.md` - Canonical spec with YAML frontmatter (name, description, version, tools, platforms, allowed-tools)
- `tools.json` - JSON-RPC tool definitions (optional)
- `sync.ts` - Core logic scripts (optional)
- `platform/` - Platform-specific overrides (optional)

## Platform Generators

| Generator | Output Format | Target |
|-----------|--------------|--------|
| `to-claude()` | `.claude/agents/<skill>.md`, commands, hooks | `~/.claude/` |
| `to-gemini()` | SKILL.md with Gemini frontmatter | `~/.gemini/` |
| `to-pi()` | skill.json + prompt.md | `~/.pi/agent/` |
| `to-opencode()` | manifest.json + tool defs | `~/.config/opencode/` |
| `to-codex()` | skill.yaml + prompt.md | `~/.codex/` |
| `to-antigravity()` | Gemini-compatible pass-through | `~/.antigravity/` |
| `to-wocode()` | Node/Deno command registration | `~/.wocoder/` |

## Integration

Called by `skill-auto-update` during `--sync-skills` to generate platform-specific output before installation.
