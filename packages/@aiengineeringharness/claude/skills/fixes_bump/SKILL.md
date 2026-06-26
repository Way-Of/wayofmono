---
name: fixes_bump
description: "Bump the version across all project files. Delegates to fixes-manager skill."
disable-model-invocation: true
---

Bump the version across all project files using the fixes-manager skill.

## Usage
`/fixes bump --project=<project> --version=<version>`

### Arguments
- `--project` (required) — Project namespace: `womono`, `wow`, `opticat`
- `--version` (required) — Target version string (e.g. `1.8.0`)

## Process
1. Validate the provided arguments
2. Activate the fixes-manager skill
3. Load `assets/<project>/version-config.json` for version fields and file list
4. Update each file's version field in the defined order
5. Update fix notes and CHANGELOG
6. Confirm the result with the user
