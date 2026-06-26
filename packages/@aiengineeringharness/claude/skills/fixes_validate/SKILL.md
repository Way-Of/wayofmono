---
name: fixes_validate
description: "Validate version consistency across all project files. Delegates to fixes-manager skill."
disable-model-invocation: true
---

Validate version consistency across all project files using the fixes-manager skill.

## Usage
`/fixes validate --project=<project>`

### Arguments
- `--project` (required) — Project namespace: `womono`, `wow`, `opticat`

## Process
1. Validate the provided arguments
2. Activate the fixes-manager skill
3. Load `assets/<project>/version-config.json` and `validate-rules.json`
4. Read all version fields from their respective files
5. Report any mismatches between versions
6. Present a summary of findings to the user
