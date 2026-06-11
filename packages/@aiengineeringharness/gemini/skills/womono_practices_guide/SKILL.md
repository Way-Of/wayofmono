---
name: womono_practices_guide
description: Guides development to follow WoM best practices from thoughts/wayofmono/docs/best-practices/. Load this skill at the start of any task to ensure work aligns with database, hosting, architecture, and coding standards.
---

# wow_practices_guide

## Purpose

Load this skill when beginning any new task, feature, or refactor. It references the canonical best-practices docs at `thoughts/wayofmono/docs/best-practices/` and ensures your implementation follows WoM conventions.

## Workflow

### 1. Load Relevant Practices

Before writing code, scan `thoughts/wayofmono/docs/best-practices/` for docs relevant to your task:

```bash
ls thoughts/wayofmono/docs/best-practices/
```

If you're working on databases, read `database-conventions.md`. If you're deploying, read `hosting-standards.md`. Apply the rules in each doc to your implementation.

### 2. Apply During Implementation

Keep the practices open in context as you code. For each decision point:
- Database schema? Check database conventions
- API endpoint? Check API style guide (if exists)
- Deployment config? Check hosting standards
- Code structure? Check architecture decisions

### 3. Self-Review

Before marking a task complete, verify your work against every applicable best-practices doc. Flag any violations as comments in your PR.

## When Not to Use

- Quick experiments or prototypes that won't be merged
- Legacy code cleanup that explicitly preserves the old pattern
