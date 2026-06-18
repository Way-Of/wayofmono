---
name: womono_version_updater
description: Bump the WayOfMono harness version across all files. Updates manifest.json, CHANGELOG.md, README.md, and deploys version to all 7 tools. Triggers on "bump version", "update version", "release v*", "tag version".
allowed-tools: - read
  - write
  - bash
  - grep
  - glob
  - edit
  - todowrite
---

# womono Version Updater

Bumps the AI Engineering Harness version consistently across all files and tools.

## Files to Update

| File | What to Change |
|------|---------------|
| `packages/@aiengineeringharness/manifest.json` | `"version": "X.Y.Z"` (line 2) |
| `CHANGELOG.md` | Add `## [X.Y.Z] - YYYY-MM-DD` entry with changes |
| `README.md` | `| Harness version | **X.Y.Z** |` in stats table |
| `docs/fixes/README.md` | Add release notes for the new version |

## Version Format

Strict SemVer: `MAJOR.MINOR.PATCH`

## Workflow

When user says "bump to X.Y.Z" or "release vX.Y.Z":
1. Read current version from `manifest.json`
2. Read `CHANGELOG.md` for unreleased changes
3. Update `manifest.json` line 2 to new version
4. Add `## [X.Y.Z] - YYYY-MM-DD` section to CHANGELOG.md above unreleased
5. Update harness version in README.md stats table
6. Add release notes to `docs/fixes/README.md`
7. If requested: `git add`, `git commit -m "chore: bump to vX.Y.Z"`, `git tag vX.Y.Z`
8. Show summary of changes
