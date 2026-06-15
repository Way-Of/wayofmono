---
name: skill_adapter
description: Platform-specific skill/agent loading and format adapters for all 7 frontends
allowed-tools: read, write, glob, bash, grep
---

# Platform-Specific skill Loading & Format Adapters

Maintains a single canonical skill format and generates platform-specific configurations for all 7 frontends.

## Canonical skill Format

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
| `to-wocode()` | Node/Deno command registration | `~/.wocode/` |

## Integration

Called by `skill-auto-update` during `--sync-skills` to generate platform-specific output before installation.


## Config-Manifest Integration

The `config-manifest/` directory at `packages/@aiengineeringharness/config-manifest/` is the new source of truth for per-tool configuration:

- **`base_manifest.yaml`** — Global metadata and shared configuration anchors
- **`tools/<tool>.yaml`** — Per-tool config (skills, commands, prompts, extensions, agents, sidecars)
- **`compile.py`** — Merges base + per-tool YAMLs into `manifest.json` (backward compatible)
- **`validate.py`** — Validates per-tool YAMLs against format specs from `docs/ai-coding-tools/`

The compiled `manifest.json` is consumed by `install.ts` for deployment. The per-tool YAMLs replace the previously monolithic `manifest.json` — each tool's config is now independently maintainable.

When adding a new skill/command/agent to all tools:
1. Deploy the skill files to each tool's `skills/` directory
2. Add the entry to each tool's YAML at `config-manifest/tools/<tool>.yaml`
3. Run `compile.py` to regenerate `manifest.json`


## Assets

| Asset | Description |
|-------|-------------|
| `scripts/` | Test suite and skill update scripts: `test-yamls.py`, `test-manifest.py`, `test-skills.py`, `run-all-tests.py`, plus 7 per-tool skill update scripts |
| `scripts/compliance-check.ts` | Compliance checker for all 7 tools |
| `scripts/compliance-fix.ts` | Auto-fix script for cross-tool compliance issues |
| `scripts/run-all-tests.py` | Test suite orchestrator with `--tool=<name>` support |


## Assets

| Asset | Description |
|-------|-------------|
| `scripts/` | Test suite and skill update scripts: `test-yamls.py`, `test-manifest.py`, `test-skills.py`, `run-all-tests.py`, plus 7 per-tool skill update scripts |
| `scripts/compliance-check.ts` | Compliance checker for all 7 tools |
| `scripts/compliance-fix.ts` | Auto-fix script for cross-tool compliance issues |
| `scripts/run-all-tests.py` | Test suite orchestrator with `--tool=<name>` support |

