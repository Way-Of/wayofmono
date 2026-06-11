---
name: skill-auto-update
description: "Auto-update harness skills from upstream changes, sync documentation, and apply patches"
version: 1.0.0
namespace: core
tools: read, write, fetch
platforms: [claude, opencode, gemini, pi, wocoder, antigravity, codex]
allowed-tools: [read, write, fetch]
dependencies: [auto-ticket-creator]
---

# Skill Auto-Update Skill

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