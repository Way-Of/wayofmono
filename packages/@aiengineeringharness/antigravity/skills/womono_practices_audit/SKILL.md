---
name: womono_practices_audit
description: Validates existing code and infrastructure against WoM best practices from thoughts/wayofmono/docs/best-practices/. Run this to find compliance gaps and generate a report.
---

# womono_practices_audit

## Purpose

Audit existing code, configuration, or infrastructure against the canonical best-practices docs at `thoughts/wayofmono/docs/best-practices/`. This skill produces a compliance report identifying gaps, violations, and risks.

## WOMONO Ecosystem Knowledge

When auditing WOMONO harness code, check against these systems:

### Canonical Skill Architecture
Verify skills follow the config-manifest pattern: `skills/<name>/SKILL.md` + `compile.py` + `tools/<tool>.yaml`. Check that per-tool copies exist in each tool's directory and naming conventions are correct (kebab for opencode/pi/wocode, snake for claude/gemini/antigravity/codex).

### Config-Manifest
Check `config-manifest/tools/*.yaml` for correct entries. The `config-manifest/validate.py` script can check per-tool format compliance.

### Fixes Docs
Verify release notes exist in `docs/fixes/` for each component. Check the relevant fixes doc was updated on the most recent release.

### Manifest.json
Validate using existing scripts:
```bash
deno run -A scripts/compliance-check.ts --all
deno run -A scripts/validate-manifest.ts --all
```

Check that `manifest.json` is valid JSON and follows key ordering.

### Existing Audit Scripts
Use these scripts to automate audits:
- `scripts/compliance-check.ts` — skill naming, frontmatter, allowed-tools
- `scripts/validate-manifest.ts` — manifest src path existence
- `config-manifest/validate.py` — per-tool format validation
- `config-manifest/scripts/test-consistency.py` — YAML consistency

When you need to create a new audit tool, write a Python script.

## Workflow

### 1. Load Practices to Audit Against

```bash
ls thoughts/wayofmono/docs/best-practices/
```

read each doc. These are your audit criteria.

### 2. Scan the Codebase

For each practice doc, systematically check the codebase for compliance:

- **Database conventions**: Check schema files, migrations, queries
- **Hosting standards**: Check Dockerfiles, compose files, deployment scripts
- **Architecture decisions**: Check module structure, dependency injection patterns
- **Code style**: Check lint rules, formatting, naming conventions
- **Production readiness**: Flag any mock data in application code, missing error handling, missing observability, insecure patterns, or untested failure modes
- **Canonical skill architecture**: Check skills follow config-manifest pattern
- **Manifest integrity**: Run compliance-check.ts and validate-manifest.ts
- **Version sync**: Verify `manifest.json`, `install.ts` (`VERSION` constant), and `install.ps1` (`$ScriptVersion`) all match. If any differ, flag as CRITICAL violation.

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

For each violation, create a ticket. Use the `womono_practices_backlog` skill or manual ticket creation at `thoughts/wayofmono/shared/tickets/`.
