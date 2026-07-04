---
name: womono-practices-guide
description: Guides development to follow WoM best practices from thoughts/wayofmono/docs/best-practices/. Load this skill at the start of any task to ensure work aligns with database, hosting, architecture, and coding standards.
---

# womono_practices_guide

## Purpose

Load this skill when beginning any new task, feature, or refactor. It references the canonical best-practices docs at `thoughts/wayofmono/docs/best-practices/` and ensures your implementation follows WoM conventions.

## WOMONO Ecosystem Knowledge

When working on WOMONO harness code, know these systems:

### Canonical Skill Architecture
Skills should follow the config-manifest pattern: `skills/<name>/SKILL.md` (canonical body, no frontmatter) + `compile.py` + `tools/<tool>.yaml` → per-tool copies. Reference `packages/@aiengineeringharness/skills/init-harness/` and `skills/standup/`.

### Config-Manifest
The `config-manifest/` system at `packages/@aiengineeringharness/config-manifest/` has:
- `compile.py` — YAML → manifest.json compiler
- `validate.py` — per-tool format validation
- `tools/*.yaml` — per-tool definitions
- `scripts/` — per-tool skill update scripts

### Existing Scripts
Scripts at `packages/@aiengineeringharness/scripts/`:
- `compliance-check.ts` — validates skill naming, frontmatter, allowed-tools
- `validate-manifest.ts` — validates all manifest src paths exist on disk
- `config-manifest/scripts/opencode-skill-update.py` etc. — per-tool skill config updates

When automating tasks, create Python scripts (not Bash) for JSON manipulation — use `json.load`/`json.dump` with `ensure_ascii=False` and `indent=2`.

### Fixes Docs
Release notes go in `docs/fixes/`:
- `ai-engineering-harness-fixes.md` — harness changes
- `wocode-fixes.md` — wocode changes
- `wouser-fixes.md` — wouser changes
- `cto-dashboard-fixes.md` — dashboard changes

### Manifest.json Safety
Never use string replacement (`sed`, `edit` tool) on `manifest.json`. Always use Python:
```python
with open('manifest.json') as f: data = json.load(f)
# modify data
with open('manifest.json', 'w') as f: json.dump(data, f, indent=2, ensure_ascii=False)
```

## Workflow

### 1. Load Relevant Practices

Before writing code, scan `thoughts/wayofmono/docs/best-practices/` for docs relevant to your task:

```bash
ls thoughts/wayofmono/docs/best-practices/
```

If you're working on databases, read `database-conventions.md`. If you're deploying, read `hosting-standards.md`. Apply the rules in each doc to your implementation.

### 2. Production-Ready Mandate

All code written must be **production-ready, enterprise grade**:

- **No mock data** — every endpoint, query, and component must work against real data sources. Stubs/mocks are only allowed in test suites, never in application code.
- **Error handling** — every external call, DB query, and user input must be validated and handled. No `unwrap()`, no bare `catch`, no silent failures.
- **Observability** — add structured logging, metrics, or traces for all non-trivial operations.
- **Security** — follow `wow_access_control` rules: RBAC, Economics Shield, audit logging.
- **Edge cases** — handle empty states, timeouts, rate limits, and malformed input.
- **Testing** — include tests that cover failure modes, not just the happy path.

### 3. Apply During Implementation

Keep the practices open in context as you code. For each decision point:
- Database schema? Check database conventions
- API endpoint? Check API style guide (if exists)
- Deployment config? Check hosting standards
- Code structure? Check architecture decisions
- Building a skill? Use canonical skill architecture + config-manifest pattern

### 3. Self-Review

Before marking a task complete, verify your work against every applicable best-practices doc. Flag any violations as comments in your PR.

## When Not to Use

- Quick experiments or prototypes that won't be merged
- Legacy code cleanup that explicitly preserves the old pattern
