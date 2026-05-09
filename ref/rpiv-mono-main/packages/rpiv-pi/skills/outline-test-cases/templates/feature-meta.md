```markdown
---
date: {YYYY-MM-DD}
author: {User from injected git context}
commit: {commit-hash}
branch: {Current branch name}
repository: {Repository name}
topic: "{Feature Name}"
tags: [test-cases, outline, {module}, {feature-slug}]
status: pending | partial | generated
feature: "{Feature Name}"
module: {MOD}
portal: {Portal Name}
slug: {feature-slug}
tc_count: 0
last_updated: {YYYY-MM-DD}
last_updated_by: {User from injected git context}
---

## Routes
- `{route path}` — {ComponentName}

## Endpoints
- `{HTTP method} {path}` — {description}

## Scope Decisions
- {What's in scope and why}
- {What's OUT of scope and why}

## Domain Context
- {Business rules, intentional behaviors, known limitations}

## Test Data Requirements
- {Minimum data conditions for testing this feature}

## Checkpoint History
### {YYYY-MM-DD}
**Q: {Question asked during checkpoint}**
A: {Developer's answer}
```

**Notes on `_meta.md` content:**
- Routes come from route discovery findings — path and component name only, no file:line
- Endpoints come from backend discovery, filtered to those serving this feature
- Scope Decisions, Domain Context, and Test Data Requirements come from checkpoint answers
- Checkpoint History records dated Q&A pairs from developer checkpoints
- If a feature has no frontend routes (e.g., widget), list the component entry point instead
- If status is "partial", add an `## Existing Test Cases` section listing TC IDs found by the test-case-locator agent
- commit records which commit was analyzed during outline generation — used for staleness detection by consuming skills
- tc_count starts at 0 and is updated by write-test-cases when TCs are created
