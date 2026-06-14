# AI Engineering Harness Guide

> Core skill/agent/command management for all 7 AI coding tools

## What is the AI Engineering Harness?

The AI Engineering Harness is the **shared intelligence backend** that serves 7 distinct agent frontends. It manages canonical skills, agents, commands, themes, and extensions — then syncs them to each tool's native format.

## Architecture

```
┌─────────────────────────────────────┐
│        AI Engineering Harness       │  ← Source of truth (manifest.json)
│  packages/@aiengineeringharness/    │
├─────────────────────────────────────┤
│  opencode/    → ~/.config/opencode/ │
│  claude/      → ~/.claude/          │
│  gemini/      → ~/.gemini/          │
│  pi/          → ~/.pi/agent/        │
│  codex/       → ~/.codex/           │
│  antigravity/ → ~/.antigravity/     │
│  wocoder/     → ~/.wocoder/         │
└─────────────────────────────────────┘
```

## What It Manages

| Component | Canonical Location | Synced To |
|-----------|-------------------|-----------|
| **Skills** | `skills/` (81 skills) | All 7 tool skill dirs |
| **Agents** | `agents/` (6 subagents) | All 7 tool agent dirs |
| **Commands** | `commands/` | Per-tool command formats |
| **Themes** | `themes/` | Per-tool theme formats |
| **Extensions** | `extensions/` | Per-tool extension formats |
| **Keybindings** | `keybindings/` | Per-tool keybinding formats |
| **Prompts** | `prompts/` | Per-tool prompt formats |

## Installation

```bash
# Install CLI
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli

# Sync all tools
ai-harness --tool=all --yes

# Update everything
ai-harness --update
```

## Core Commands

| Command | Description |
|---------|-------------|
| `ai-harness --tool=all --yes` | Install all tools non-interactively |
| `ai-harness --update` | Full 4-step sync (binary + docs + tools + validate) |
| `ai-harness --sync-docs` | Sync canonical skills to per-tool copies |
| `ai-harness --compliance` | Validate all installed files match manifest |
| `ai-harness --check` | Version diff against manifest |
| `ai-harness --prune` | Interactive non-manifest file remover |
| `ai-harness --report-skills` | Report skills to CTO Dashboard |

## Manifest

`manifest.json` is the **source of truth** — defines all skills, versions, and tool mappings.

```json
{
  "version": "1.3.0",
  "skills": [
    { "name": "create_plan", "version": "1.0.0", "tools": ["opencode", "claude", ...] }
  ]
}
```

## Skill Format

Each skill is a directory with `SKILL.md`:

```
skills/create_plan/
├── SKILL.md          # Frontmatter + instructions
├── references/       # Optional reference files
└── scripts/          # Optional helper scripts
```

## Per-Tool Adaptation

The harness adapts each skill for 7 tools:
- **OpenCode**: snake_case dirs, SKILL.md with `allowed-tools`
- **Claude**: snake_case dirs, SKILL.md with `allowed-tools`  
- **Gemini**: snake_case dirs, SKILL.md format
- **Pi**: kebab-case dirs, SKILL.md format
- **Codex**: snake_case dirs, SKILL.md format
- **Antigravity**: snake_case dirs, SKILL.md format
- **Wo Coder**: snake_case dirs, SKILL.md format

## Pipeline Scripts

| Script | Purpose |
|--------|---------|
| `docs-sync.ts` | Sync canonical → per-tool |
| `compliance-check.ts` | Validate frontmatter & naming |
| `migrate-tickets.ts` | Migrate ticket namespaces |
| `import-ref-skills.ts` | Import reference skills from docs/ |

## Related

- [Wo Coder (wocode)](../wocoder/) — CLI coding assistant (dev tool)
- [Wo User (wouser)](../wouser/) — General-purpose user agent SDK
- [Getting Started](../getting-started.md) — Quick start for all components