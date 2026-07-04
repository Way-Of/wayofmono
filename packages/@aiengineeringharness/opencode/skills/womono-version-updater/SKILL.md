---
name: womono-version-updater
description: Bump the WayOfMono harness version across all files. Updates manifest.json, CHANGELOG.md, README.md, and deploys version to all 7 tools. Triggers on "bump version", "update version", "release v*", "tag version".
allowed-tools: read, write, bash, grep, glob, edit, todowrite
---

# womono Version Updater

Bumps the AI Engineering Harness version consistently across all files and tools.

## WOMONO Ecosystem Knowledge

### Manifest.json Safety — CRITICAL
Never use string replacement (`edit` tool, `sed`, or regex) on `manifest.json`. It is a 9700+ line JSON file with deeply nested structure. Always use Python:

```python
import json
with open('packages/@aiengineeringharness/manifest.json') as f:
    data = json.load(f)
data['version'] = 'X.Y.Z'
with open('packages/@aiengineeringharness/manifest.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

This preserves Unicode characters (em dashes, etc.) and ensures valid JSON.

### Fixes Docs
Release notes go in `docs/fixes/`. The relevant file is:
- `docs/fixes/ai-engineering-harness-fixes.md` for harness changes

Other fixes docs that may need updates during a cross-component release:
- `docs/fixes/wocode-fixes.md`
- `docs/fixes/wouser-fixes.md`
- `docs/fixes/cto-dashboard-fixes.md`

### Creating Scripts for Automation
For complex release tasks (multi-file updates, validation), write a Python or Deno script in `scripts/`. The existing `scripts/compliance-check.ts` and `scripts/validate-manifest.ts` are good reference implementations.

## Files to Update

| File | What to Change |
|------|---------------|
| `packages/@aiengineeringharness/manifest.json` | `"version": "X.Y.Z"` (use Python json.dump) |
| `CHANGELOG.md` | Add `## [X.Y.Z] - YYYY-MM-DD` entry with changes |
| `README.md` | `| Harness version | **X.Y.Z** |` in stats table |
| `docs/fixes/ai-engineering-harness-fixes.md` | Add release notes for the new version |

## Version Format

Strict SemVer: `MAJOR.MINOR.PATCH`

## Workflow

When user says "bump to X.Y.Z" or "release vX.Y.Z":
1. read current version from `manifest.json`
2. read `CHANGELOG.md` for unreleased changes
3. Update `manifest.json` version field — use Python `json.dump` with `ensure_ascii=False`
4. Add `## [X.Y.Z] - YYYY-MM-DD` section to CHANGELOG.md above unreleased
5. Update harness version in README.md stats table
6. Add release notes to `docs/fixes/ai-engineering-harness-fixes.md`
7. If requested: `git add`, `git commit -m "chore: bump to vX.Y.Z"`, `git tag vX.Y.Z`
8. Show summary of changes
