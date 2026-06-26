---
description: Fixes Validate — Validate version consistency
---
# /fixes validate — Validate Version Consistency

Validate version consistency across all project files using the fixes-manager skill.

## Usage
`/fixes validate --project=womono`

## Steps
1. Validate arguments: `--project` (required)
2. Load the fixes-manager skill `assets/<project>/version-config.json`
3. Read all version fields from their respective files
4. Report any mismatches between versions
5. Present a summary of findings to the user
