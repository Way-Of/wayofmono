---
name: skill-auto-update
description: Auto-discover, sync, and update skills across all 7 frontends (claude, opencode, gemini, pi, wocoder, antigravity, codex)
allowed-tools:
  - read
  - write
  - glob
  - ls
  - grep
---

# skill Auto-Update & Sync

Detects new/updated skills in `packages/@aiengineeringharness/skills/` and automatically propagates them to all configured frontends.

## Commands

- `ai-harness --sync-skills` - Sync all skills to all frontends
- `ai-harness --watch-skills` - Watch for changes and auto-sync
- `/sync skills` - Agent slash command for skill sync

## How It Works

1. Scans `packages/@aiengineeringharness/skills/` for all skill directories (core, wow_*, opticat_*)
2. Reads `skill-registry.json` for versions and hashes
3. Compares with installed skills per frontend
4. Generates platform-specific format using skill-adapter
5. Installs/updates via stow (`setup.sh`) or direct file copy
6. Recompiles `manifest.json` from `config-manifest/` YAMLs via `compile.py`
7. Runs `validate.py` to verify post-sync integrity

## Config-Manifest Sync

After skill changes, the manifest must be recompiled and validated:

```bash
# Recompile manifest.json from YAMLs
python3 packages/@aiengineeringharness/config-manifest/compile.py

# Validate post-sync YAMLs + manifest
python3 packages/@aiengineeringharness/config-manifest/validate.py
```

The `config-manifest/` directory at `packages/@aiengineeringharness/config-manifest/` holds per-tool YAML configs that are the **source of truth** for `manifest.json`. Any skill addition/removal must:
1. Update the corresponding tool YAML at `config-manifest/tools/<tool>.yaml`
2. Recompile via `compile.py`
3. Validate via `validate.py` or `python3 config-manifest/scripts/run-all-tests.py`

## Assets

| Asset | Description |
|-------|-------------|
| `scripts/` | Test suite and skill update scripts: `test-yamls.py`, `test-manifest.py`, `test-skills.py`, `run-all-tests.py`, plus 7 per-tool skill update scripts |
| `scripts/compliance-check.ts` | Compliance checker for all 7 tools |
| `scripts/compliance-fix.ts` | Auto-fix script for cross-tool compliance issues |
| `scripts/run-all-tests.py` | Test suite orchestrator with `--tool=<name>` support |

## Dry-Run Mode

Use `--dry-run` to preview changes before applying.
