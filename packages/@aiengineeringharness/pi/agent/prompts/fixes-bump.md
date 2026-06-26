---
description: Fixes Bump — Bump version across project files
---
# /fixes bump — Bump Version Across Project Files

Bump the version across all project files using the fixes-manager skill.

## Usage
`/fixes bump --project=<project> --version=<version>`

## Steps
1. Validate arguments: `--project` (required), `--version` (required)
2. Load the fixes-manager skill
3. Read `assets/<project>/version-config.json` for version files, types, and bump order
4. Update each version file in order (types: json/yaml/regex/markdown)
5. If `--project=womono`: also update 7 per-tool version fields in manifest.json, then recompile
6. Confirm the result with the user
