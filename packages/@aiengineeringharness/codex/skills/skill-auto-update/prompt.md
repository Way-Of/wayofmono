> **Platform**: Codex | **Skill**: skill-auto-update | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# Skill Auto-Update & Sync

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

## Dry-Run Mode

Use `--dry-run` to preview changes before applying.
