---
name: alliner-compliance-check
description: "Deep compliance validation for existing f-rr-d projects. Checks ticket templates, frontmatter, AGENTS.md, folder structure, cross-references, and f-rr-d sync status. Auto-fixes safe issues."
allowed-tools: read, write, edit, bash, grep, glob, task
disable-model-invocation: true
---

# alliner-compliance-check — Deep Project Compliance Validation

Validates an existing f-rr-d project against current standards. Called by init-harness Step 2b for deep validation beyond basic file existence checks.

**Input:** Project slug, f-rr-d path
**Output:** Compliance report with severity levels + auto-fix recommendations

---

## Usage

From init-harness or directly:
```
/alliner-compliance-check --project=<slug> --frrd-path=<path>
```

Or via delegation:
```
Delegate to `alliner-compliance-check` for deep validation of project <slug>.
```

---

## Process

### Step 1: Load Context

1. Read `thoughts/shared/templates/ticket-template.md` — the canonical template
2. Read `thoughts/shared/templates/AGENTS.md.template` — the canonical AGENTS.md template
3. Set `PROJECT_SLUG` and `FRRD_PATH` from arguments or detect from `.wo/settings.json`

### Step 2: Run All Checks

Execute all 6 check categories below. Collect results with severity levels:

| Severity | Meaning |
|----------|---------|
| **ERROR** | Must fix — breaks workflow or violates standards |
| **WARNING** | Should fix — outdated or incomplete |
| **INFO** | Optional — nice to have |

### Step 3: Auto-Fix Safe Issues

For issues that can be safely auto-fixed (no user decisions needed):
- Create missing directories
- Copy latest ticket template
- Create missing enforcement-ticket/ placeholder

### Step 4: Generate Report

Present findings grouped by check category with severity and fix status.

---

## Check 1: Ticket Template Validation

Compare the project's ticket template against the canonical template.

```bash
# Check if template exists
ls thoughts/${PROJECT_SLUG}/shared/tickets/ticket-template.md 2>/dev/null
ls thoughts/shared/templates/ticket-template.md 2>/dev/null
```

**Checks:**
- [ ] `ticket-template.md` exists in project's `shared/tickets/`
- [ ] `ticket-template.md` exists in `shared/templates/` (canonical)
- [ ] Template has all required frontmatter fields:
  - `title`, `type`, `priority`, `status`, `domain`, `assignee`, `reporter`
  - `project`, `namespace`, `category`, `parent_ticket`, `shared_tickets`
  - `created`, `updated`, `completed`
  - `deprecated`, `deprecated_reason`, `deprecated_date`, `replaced_by`
  - `knowledge_entries`
- [ ] `type` values match: `"Feature" | "Bug" | "TechDebt" | "Epic" | "Improvement"`
- [ ] `priority` values match: `"Critical" | "High" | "Medium" | "Low"`
- [ ] `status` values match: `"Backlog" | "Planned" | "Ready" | "In Progress" | "Submitted for Review" | "In Review" | "Approved" | "Done" | "Blocked" | "Changes Requested" | "Deprecated"`
- [ ] `domain` values match: `"frontend" | "backend" | "devops" | "infra" | "ai-tools" | "docs" | "security" | "testing" | "architecture" | "cross-cutting"`
- [ ] Template matches canonical version (diff check)

**Auto-fix:** If project template is missing or outdated, copy from `thoughts/shared/templates/ticket-template.md`.

---

## Check 2: Existing Ticket Frontmatter Audit

Scan all tickets in `thoughts/<project>/shared/tickets/` and check each one.

```bash
ls thoughts/${PROJECT_SLUG}/shared/tickets/*.md 2>/dev/null
```

**For each ticket file:**

**Checks:**
- [ ] Has YAML frontmatter (starts with `---`)
- [ ] Has all required fields (same list as Check 1)
- [ ] `status` value is valid (not custom/invented)
- [ ] `type` value is valid
- [ ] `priority` value is valid
- [ ] `domain` value is valid
- [ ] `created` field has date format `YYYY-MM-DD`
- [ ] `updated` field has date format `YYYY-MM-DD` (if not empty)
- [ ] `completed` field has date format `YYYY-MM-DD` (if not empty)
- [ ] `project` field matches the project slug (uppercase)
- [ ] `namespace` field matches the project slug (lowercase)
- [ ] Ticket filename matches naming convention: `<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md`
- [ ] Ticket prefix matches project namespace (e.g., `WOMONO-` for wayofmono)
- [ ] No tickets with status "Done" in active `shared/tickets/` (should be in `done/`)
- [ ] No tickets with status "Deprecated" in active `shared/tickets/` (should be in `deprecated/`)

**Severity mapping:**
- Missing required field → ERROR
- Invalid status/type/priority/domain value → ERROR
- Wrong date format → WARNING
- Wrong project/namespace → WARNING
- Done ticket in active dir → WARNING
- Deprecated ticket in active dir → WARNING
- Filename convention mismatch → INFO

---

## Check 3: AGENTS.md Content Validation

```bash
ls thoughts/${PROJECT_SLUG}/AGENTS.md 2>/dev/null
```

**Checks:**
- [ ] `AGENTS.md` exists
- [ ] Has YAML frontmatter with `name`, `description`, `version`
- [ ] `name` field matches project slug
- [ ] Has required sections:
  - `## Purpose`
  - `## Critical Convention: Thoughts Folder`
  - `## Project Structure`
  - `## Ticket System`
  - `## Agent Workflow`
  - `## Available Skills`
  - `## Agent Instructions`
- [ ] Contains `thoughts/<project>/` paths (not hardcoded `thoughts/wayofmono/`)
- [ ] For client projects: zero references to internal Way-Of paths:
  - No `thoughts/global/`
  - No `ENFORCE-`, `STRAT-`, `SALES-`, `GLOBAL-`
  - No `wayofmono/`, `wayofteams/`, `wowx/`, `woc/`
- [ ] Ticket naming convention section references correct prefix

**Severity:**
- Missing AGENTS.md → ERROR
- Missing required section → WARNING
- Hardcoded wrong project paths → ERROR
- Client project with internal refs → ERROR

---

## Check 4: Folder Structure Deep Check

Beyond "does dir exist" — check for expected content.

```bash
# Required directories
for dir in shared/tickets shared/plans shared/research docs enforcement-ticket; do
  [ -d "thoughts/${PROJECT_SLUG}/${dir}" ] || echo "MISSING: ${dir}/"
done

# Required subdirectories
for dir in shared/tickets/done shared/tickets/deprecated docs/architecture docs/decisions; do
  [ -d "thoughts/${PROJECT_SLUG}/${dir}" ] || echo "MISSING: ${dir}/"
done
```

**Checks:**
- [ ] `shared/tickets/` exists and has at least `ticket-template.md`
- [ ] `shared/tickets/done/` exists
- [ ] `shared/tickets/deprecated/` exists
- [ ] `shared/plans/` exists
- [ ] `shared/research/` exists
- [ ] `docs/` exists
- [ ] `docs/architecture/` exists
- [ ] `docs/decisions/` exists
- [ ] `enforcement-ticket/` exists
- [ ] `TODO.md` exists
- [ ] No orphaned directories (dirs without AGENTS.md entry or purpose)

**Severity:**
- Missing `shared/tickets/` → ERROR
- Missing `enforcement-ticket/` → ERROR
- Missing `done/` or `deprecated/` → WARNING
- Missing `docs/architecture/` or `docs/decisions/` → WARNING
- Missing `TODO.md` → INFO

**Auto-fix:** Create missing directories and placeholder files.

---

## Check 5: Cross-Reference Validation

Scan all tickets for valid cross-references.

**Checks:**
- [ ] Every `parent_ticket` value points to an existing ticket file
- [ ] Every `shared_tickets` JSON array contains valid ticket IDs
- [ ] Every `replaced_by` value points to an existing ticket file
- [ ] No orphaned files in personal directories (files with no matching shared ticket)
- [ ] Ticket numbering has no gaps (sequential NNN values)

**Severity:**
- Broken `parent_ticket` reference → ERROR
- Broken `replaced_by` reference → ERROR
- Orphaned personal files → WARNING
- Numbering gaps → INFO

**Command to find orphaned personal files:**
```bash
# List files in personal dirs that don't have a matching shared ticket
for dev_dir in thoughts/${PROJECT_SLUG}/*/; do
  dev=$(basename "$dev_dir")
  # Skip known non-developer dirs
  [ "$dev" = "shared" ] || [ "$dev" = "docs" ] || [ "$dev" = "global" ] || [ "$dev" = "enforcement-ticket" ] || continue
  for f in "$dev_dir"*.md; do
    [ -f "$f" ] || continue
    ticket_id=$(basename "$f" .md | grep -oP '^[A-Z]+-\d+')
    if [ -n "$ticket_id" ]; then
      ls thoughts/${PROJECT_SLUG}/shared/tickets/${ticket_id}*.md 2>/dev/null || echo "ORPHAN: $f (no matching shared ticket)"
    fi
  done
done
```

---

## Check 6: f-rr-d Sync Status

```bash
cd thoughts/
git status --porcelain
git log --oneline -1
git branch -vv | grep '\*'
```

**Checks:**
- [ ] No uncommitted changes (`git status` clean)
- [ ] Working tree is up to date with remote
- [ ] Branch is not diverged from remote
- [ ] Current commit is recent (within 7 days)

**Severity:**
- Uncommitted changes → WARNING
- Diverged branch → ERROR
- Stale (older than 30 days) → INFO

---

## Report Format

```markdown
## Compliance Report: <project-slug>

**Date:** YYYY-MM-DD
**Project:** <project-slug>
**f-rr-d:** <remote-url>

### Summary
| Check | Errors | Warnings | Info |
|-------|--------|----------|------|
| Ticket Template | 0 | 1 | 0 |
| Ticket Frontmatter | 2 | 3 | 1 |
| AGENTS.md | 0 | 0 | 0 |
| Folder Structure | 0 | 1 | 0 |
| Cross-References | 1 | 0 | 0 |
| f-rr-d Sync | 0 | 0 | 1 |
| **Total** | **3** | **5** | **2** |

### Auto-Fixed
- ✅ Created `shared/tickets/done/` directory
- ✅ Copied latest ticket-template.md

### Requires Decision
- ❌ **ERROR**: Ticket `WOMONO-045` has invalid status "todo" (not in allowed values)
- ❌ **ERROR**: Broken parent_ticket reference in `WOMONO-067` → points to `WOMONO-000` (not found)
- ⚠️ **WARNING**: AGENTS.md missing `## Available Skills` section

### Compliance Score
**7/10 checks passed** — 3 errors need resolution
```

---

## Auto-Fix Rules

| Issue | Auto-fix? | Action |
|-------|-----------|--------|
| Missing directory | ✅ Yes | `mkdir -p` |
| Missing ticket template | ✅ Yes | Copy from canonical |
| Missing enforcement-ticket/ | ✅ Yes | Create with placeholder README |
| Missing TODO.md | ✅ Yes | Create empty with header |
| Missing done/deprecated dirs | ✅ Yes | `mkdir -p` |
| Outdated ticket template | ✅ Yes | Overwrite with canonical |
| Invalid frontmatter field | ❌ No | Report to user |
| Broken cross-reference | ❌ No | Report to user |
| Wrong project/namespace | ❌ No | Report to user |
| Client with internal refs | ❌ No | Report to user |
| AGENTS.md missing section | ❌ No | Report to user |

---

## Integration with init-harness

init-harness Step 2b calls this skill when available:

```bash
# Check if the skill is installed
ls <TOOL_CONFIG_DIR>/skills/alliner-compliance-check/SKILL.md 2>/dev/null
```

If available, delegate:
```
Delegate to `alliner-compliance-check` for deep validation of project <slug>.
```

If not available, fall back to the basic checks in Step 2b.

---

## Related Skills

- `init-harness` — Calls this skill from Step 2b
- `womono-practices-audit` — Validates code against best practices (different scope)
- `ticket-manager` — Ticket lifecycle (this skill validates ticket format)
