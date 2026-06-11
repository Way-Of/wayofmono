---
name: womono_practices_backlog
description: Creates tickets in thoughts/wayofmono/shared/tickets/ for improvements, violations, or tech debt found against WoM best practices. Use after an audit or when discovering something that needs fixing.
---

# wow_practices_backlog

## Purpose

When you find code, infrastructure, or workflows that don't follow WoM best practices, create a ticket so the work is tracked and prioritized. This skill formalizes the ticketing process for tech debt and improvement items.

## When to Use

- An audit (`wow_practices_audit`) found violations
- You discovered a pattern that should be updated
- A best-practices doc was updated and existing code doesn't match
- You see repeated violations that indicate a systemic issue

## Workflow

### 1. Determine Ticket Details

- **Title**: Clear, actionable — "Update X to follow Y standard"
- **Type**: `TechDebt` or `Improvement`
- **Priority**: Based on risk (security/correctness = High, style = Low)
- **Namespace**: Use the project slug (e.g., `WOMONO`, `WOW`, `OPT`)
- **Context**: Link to the relevant best-practices doc and the violating code

### 2. Create the Ticket File

```
thoughts/<project-slug>/shared/tickets/<PREFIX>-<NNN>-<short-description>.md
```

Use the template at `thoughts/shared/tickets/ticket-template.md`.

### 3. Fill Frontmatter

```yaml
---
title: "..."
type: "TechDebt" | "Improvement"
priority: "High" | "Medium" | Low"
status: "Backlog"
category: "compliance"
parent_ticket: "<optional-reference>"
---
```

### 4. Description

Include:
- **What** violates the practice
- **Where** (file paths, line numbers)
- **Expected** behavior per the best-practices doc
- **Why** it matters (risk, maintenance cost, etc.)
