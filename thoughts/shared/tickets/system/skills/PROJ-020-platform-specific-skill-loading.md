---
title: "[PROJ-020] Platform-Specific Skill/Agent Loading & Format Adapters"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
Each agent frontend loads skills/agents differently with different formats:
- **Claude Code**: `.claude/agents/*.md` (system prompt), `.claude/commands/*.md` (slash commands), hooks via `settings.json`
- **Gemini CLI**: `~/.gemini/config/skills/<skill>/SKILL.md` with YAML frontmatter (name, description, allowed-tools)
- **Pi**: `~/.pi/agent/skills/<skill>/` with `skill.json` + `prompt.md`, agents in `~/.pi/agent/agents/`
- **OpenCode**: `~/.config/opencode/skill/<skill>/` with `manifest.json` + tool definitions (JSON-RPC)
- **Antigravity**: Native Gemini-compatible format
- **Codex**: `~/.codex/skills/<skill>/` with `skill.yaml` + `prompt.md`
- **WoCode/WoUser**: Node/Deno middleware, custom command registry

We need a **Skill Adapter Layer** that:
1. Maintains a single source of truth in `packages/@aiengineeringharness/skills/<skill>/`
2. Generates platform-specific formats during install/sync
3. Handles format differences (YAML frontmatter vs JSON vs custom)
4. Supports platform-specific overrides where needed

## Requirements & Scope
- [ ] Create `skill-adapter` skill at `packages/@aiengineeringharness/skills/skill-adapter/`
- [ ] Define **Canonical Skill Format** in `packages/@aiengineeringharness/skills/<skill>/`:
  - [ ] `SKILL.md` - Canonical spec with frontmatter (name, description, version, tools, namespaces, platforms[])
  - [ ] `prompt.md` - System prompt content
  - [ ] `tools.json` - JSON-RPC tool definitions
  - [ ] `agents/` - Agent definitions (if skill includes agents)
  - [ ] `platform/` - Platform-specific overrides (optional)
    - [ ] `claude/` - `.claude/agents/`, `.claude/commands/`, hooks
    - [ ] `gemini/` - SKILL.md additions
    - [ ] `pi/` - skill.json, prompt.md
    - [ ] `opencode/` - manifest.json, tool defs
    - [ ] `codex/` - skill.yaml
    - [ ] `antigravity/` - native format
    - [ ] `wocode/` - Node/Deno middleware
- [ ] Create `adapter.ts` - Core transformation logic (Deno, cross-platform)
- [ ] Implement platform generators:
  - [ ] `to-claude()` - Generates `.claude/agents/<skill>.md`, commands, hooks
  - [ ] `to-gemini()` - Generates SKILL.md with Gemini frontmatter
  - [ ] `to-pi()` - Generates skill.json + prompt.md
  - [ ] `to-opencode()` - Generates manifest.json + tool defs
  - [ ] `to-codex()` - Generates skill.yaml + prompt.md
  - [ ] `to-antigravity()` - Pass-through (Gemini compatible)
  - [ ] `to-wocode()` - Generates Node/Deno command registration
- [ ] Integrate with `ai-harness --sync-skills` (PROJ-014) and `setup.sh`/`setup.bat`/`setup.ps1`
- [ ] Add validation: canonical format validates against schema
- [ ] Cross-platform: all scripts `.sh` + `.bat`/.ps1

## Technical Notes
- Canonical format is the single source of truth
- Platform generators are pure functions: `canonical → platform-specific`
- Platform overrides in `platform/<platform>/` allow customization without fork
- Installer (`install.ts`) runs generators for each target platform
- Stow (`setup.sh`) symlinks generated output to platform config dirs
- Skill registry (`skill-registry.json`) tracks canonical version + generated hashes
- **Deduplication**: Base skills shared, platform-specific only where necessary
  - Example: `ticket-manager` has one canonical, 7 platform outputs
  - Example: `claude-prompt-optimizer` only has `claude/` platform output

## Success Criteria
- [ ] Single canonical skill in `packages/@aiengineeringharness/skills/<skill>/`
- [ ] `ai-harness --sync-skills` generates all 7 platform formats correctly
- [ ] Each platform loads skills natively (no manual conversion)
- [ ] Platform overrides work for special cases
- [ ] Validation catches format errors before install
- [ ] Cross-platform: generators work on Linux, macOS, Windows
- [ ] Documentation: "Creating Cross-Platform Skills" guide