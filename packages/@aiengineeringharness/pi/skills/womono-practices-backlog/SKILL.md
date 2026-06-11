---
name: womono-practices-backlog
description: Creates tickets across all WoM projects (WOMONO, WOW, OPT) with correct naming, namespace resolution, numbering, and frontmatter. Use after an audit or when discovering something that needs fixing.
---

# womono_practices_backlog

## Purpose

When you find code, infrastructure, or workflows that don't follow WoM best practices, create a ticket so the work is tracked and prioritized. This skill formalizes the ticketing process for tech debt and improvement items across all Way-Of projects.

## Project Namespace Reference

| Project | Folder | Ticket Prefix | Storage Path |
|---------|--------|---------------|--------------|
| WayOfMono | `thoughts/wayofmono/` | `WOMONO-XXX` | `thoughts/wayofmono/shared/tickets/` |
| WayOfWork (WoW) | `thoughts/wow/` | `WOW-XXX` | `thoughts/wow/shared/tickets/` |
| Opticat | `thoughts/opticat/` | `OPT-XXX` | `thoughts/opticat/shared/tickets/` |

## When to Use

- An audit (`womono_practices_audit`) found violations
- You discovered a pattern that should be updated
- A best-practices doc was updated and existing code doesn't match
- You see repeated violations that indicate a systemic issue

## Ticket Naming Logic

### Step 1: Resolve the Project

Determine which project the issue belongs to:

- **WayOfMono** — harness, wo-agent, wo-coding-agent, dashboard, monorepo → `WOMONO`
- **WayOfWork** — platform specs (WOW-010–016), server, API → `WOW`
- **Opticat** — HVAC/simulator → `OPT`

Check `thoughts/README.md` for the definitive project list. The project is usually clear from the violating code's location.

### Step 2: Determine the Next Ticket Number

```bash
ls thoughts/<project-slug>/shared/tickets/<PREFIX>-*.md
```

Find the highest existing number, then increment by 1. Example:
- Existing: `WOMONO-044`, `WOMONO-045`, ..., `WOMONO-050` → next is **WOMONO-051**
- If no tickets exist (e.g., `wow/` or `opticat/` have none), start at **001**

### Step 3: Create the Ticket File

**File path**: `thoughts/<project-slug>/shared/tickets/<PREFIX>-<NNN>-<SHORT-DESCRIPTION>.md`

**File name format**:
```
WOMONO-051-<UPPERCASE-DESCRIPTION-WITH-DASHES>.md
```

Use uppercase words separated by dashes for the description, matching existing convention:
- ✓ `WOMONO-044-IDEAS-PRIORITIZATION-BOARD.md`
- ✓ `WOMONO-049-SELF-UPDATING-INSTALLER.md`
- ✗ `WOMONO-051-my-ticket-description.md`

### Step 4: Use the Canonical Template

Copy from `thoughts/shared/tickets/ticket-template.md`.

### Step 5: Fill Frontmatter

```yaml
---
title: "[<PREFIX>-<NNN>] <Descriptive Title>"
type: "Feature" | "Bug" | "TechDebt" | "Epic" | "Improvement"
priority: "Critical" | "High" | "Medium" | "Low"
status: "Backlog" | "Planned" | "Ready" | "In Progress" | "Submitted for Review" | "Approved" | "Done"
assignee: ""
reporter: "@username"
project: "WOMONO" | "WOW" | "OPT"
namespace: "womono" | "wow" | "opticat"
category: "feature" | "bug" | "infrastructure" | "compliance" | "system"
parent_ticket: ""
shared_tickets: "[]"
pr_url: ""
github_issue: ""
---
```

Match `project` and `namespace` to the correct project:
| Prefix | project field | namespace field |
|--------|---------------|-----------------|
| WOMONO | `WOMONO` | `womono` |
| WOW | `WOW` | `wow` |
| OPT | `OPT` | `opticat` |

### Step 6: Write Description

Include:
- **What** violates the practice
- **Where** (file paths, line numbers)
- **Expected** behavior per the best-practices doc
- **Why** it matters (risk, maintenance cost, etc.)
