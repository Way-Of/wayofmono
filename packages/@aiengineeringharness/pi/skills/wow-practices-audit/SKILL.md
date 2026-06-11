---
name: wow-practices-audit
description: Validates existing code and infrastructure against WoM best practices from thoughts/wayofmono/docs/best-practices/. Run this to find compliance gaps and generate a report.
---

# wow_practices_audit

## Purpose

Audit existing code, configuration, or infrastructure against the canonical best-practices docs at `thoughts/wayofmono/docs/best-practices/`. This skill produces a compliance report identifying gaps, violations, and risks.

## Workflow

### 1. Load Practices to Audit Against

```bash
ls thoughts/wayofmono/docs/best-practices/
```

Read each doc. These are your audit criteria.

### 2. Scan the Codebase

For each practice doc, systematically check the codebase for compliance:

- **Database conventions**: Check schema files, migrations, queries
- **Hosting standards**: Check Dockerfiles, compose files, deployment scripts
- **Architecture decisions**: Check module structure, dependency injection patterns
- **Code style**: Check lint rules, formatting, naming conventions

Use `grep`, `glob`, and codebase reading tools to search for violations.

### 3. Produce an Audit Report

Output a structured report:

```markdown
## Audit Report — <area>

### ✅ Passing
- <specific thing that complies>

### ❌ Violations
- <specific file:line> — <what violates> — <expected behavior>

### ⚠️ Warnings
- <near-violations or risky patterns>

### 📋 Recommendations
- <actionable fix for each violation>
```

### 4. Create Tickets for Violations

For each violation, create a ticket. Use the `wow_practices_backlog` skill or manual ticket creation at `thoughts/wayofmono/shared/tickets/`.
