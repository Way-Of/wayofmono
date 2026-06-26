---
description: Fixes Bump — Bump version across project files
---
# /fixes bump — Bump Version Across Project Files

Bump the version across all project files using the fixes-manager skill.

## Usage
`/fixes bump --project=womono --version=1.8.0`

## Steps
1. Validate arguments: `--project` (required), `--version` (required)
2. Load the fixes-manager skill `assets/<project>/version-config.json`
3. Update each file's version field in the defined order
4. Update fix notes and CHANGELOG
5. Confirm the result with the user
