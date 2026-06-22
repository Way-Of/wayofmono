---
name: build_skill_auto_update
description: Auto-update harness skills from upstream changes, sync documentation, and apply patches
allowed-tools: Read, Write, Bash, Webfetch
---

# skill Auto-Update skill

Automatically updates harness skills from upstream changes, syncs documentation, and applies patches.

## Commands

- `/update all` - Update all installed skills
- `/update <tool>` - Update specific tool skills
- `/sync-docs` - Sync canonical docs from docs/skills/
- `/sync-docs --check` - Preview changes before applying

## Process

1. Scan canonical docs in `docs/skills/`
2. Find newer versions than installed
3. Generate diff previews
4. Apply updates non-interactively if `--yes`
5. Commit changes with proper messages

## Checksum Validation

After each update:
- Verify SHA256 checksums
- Check version bump
- Validate syntax
- Ensure tool mapping is correct

## Conflict Resolution

- Preserve user modifications (`.wo/` files)
- Update harness-specific SKILL.md
- Sync only canonical changes

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
