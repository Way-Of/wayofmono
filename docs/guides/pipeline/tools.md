# Pipeline Tools

Scripts for documentation sync, compliance, migration, and stats.

## Commands

```bash
# Sync canonical skills to all tool skill directories
ai-harness --sync-docs

# Preview only (no changes)
ai-harness --sync-docs --check
```

```bash
# Validate frontmatter & naming conventions
deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts
```

```bash
# Migrate ticket namespaces (PROJ → WOMONO)
deno run -A packages/@aiengineeringharness/scripts/migrate-tickets.ts
```

```bash
# Import reference skills from docs/
deno run -A packages/@aiengineeringharness/scripts/import-ref-skills.ts
```

```bash
# Count lines per package
npx tsx scripts/stats.ts
```

## Tool Reference

| Tool | Location | Purpose |
|------|----------|---------|
| `docs-sync.ts` | `packages/@aiengineeringharness/scripts/` | Sync canonical skills → per-tool copies |
| `compliance-check.ts` | `packages/@aiengineeringharness/scripts/` | Validate frontmatter & naming conventions |
| `migrate-tickets.ts` | `packages/@aiengineeringharness/scripts/` | Migrate ticket namespaces (PROJ → WOMONO) |
| `import-ref-skills.ts` | `packages/@aiengineeringharness/scripts/` | Import reference skills from docs/ |
| `stats.ts` | `scripts/stats.ts` | Count lines per package |

## docs-sync.ts

Syncs canonical skills from `packages/@aiengineeringharness/skills/` to all 7 tool directories:

```bash
# Full sync
deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts

# Dry run (show what would change)
deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts --check
```

**Process:**
1. Reads `manifest.json` for skill list
2. Copies each skill to 7 tool directories
3. Adapts format per tool (snake_case vs kebab-case)
4. Validates frontmatter compliance

## compliance-check.ts

Validates all skill SKILL.md files across all 7 tool harnesses:

```bash
deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts
```

**Checks:**
- Correct frontmatter fields
- Naming conventions (snake_case for OpenCode/Claude/Gemini/Codex/Antigravity/WoCoder, kebab-case for Pi)
- `allowed-tools` casing
- Format compliance

**Exit codes:**
- `0` — All compliant
- `1` — Violations found

## migrate-tickets.ts

Migrates ticket namespaces from old format to new:

```bash
deno run -A packages/@aiengineeringharness/scripts/migrate-tickets.ts
```

**Migrations:**
- `PROJ-XXX` → `WOMONO-XXX`
- `WO-XXX` → `WOW-XXX`
- `OPT-XXX` → `OPT-XXX` (unchanged)

## import-ref-skills.ts

Imports reference skills from `docs/skills/` to canonical location:

```bash
deno run -A packages/@aiengineeringharness/scripts/import-ref-skills.ts
```

**Source:** `docs/skills/` (reference skills from external sources)
**Destination:** `packages/@aiengineeringharness/skills/`

## stats.ts

Generates repository statistics:

```bash
npx tsx scripts/stats.ts
```

**Output:**
- Lines per package
- File counts
- SKILL.md counts per tool
- Total repo size

## CI Integration

The CI workflow runs compliance check automatically:

```yaml
# .github/workflows/ci.yml
- name: Check canonical skills are in sync
  run: |
    deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts --check | grep -q "Would sync: 0" || (echo "Canonical skills out of sync. Run: deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts" && exit 1)
```

## Related

- [AI Engineering Harness](../ai-harness/)
- [CLI Reference](../installation/cli-reference.md)
- [Manifest](../ai-harness/#manifest)