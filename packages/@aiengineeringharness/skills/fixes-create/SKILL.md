---
name: fixes_create
description: "Create a fix note entry for any Way-Of project. Delegates to fixes-manager skill."
disable-model-invocation: true
---

Create a new fix note entry for any Way-Of project using the fixes-manager skill.

## Usage
`/fixes create --project=<project> [--component=<component>] [--version=<version>]`

### Arguments
- `--project` (required) — Project namespace: `womono`, `wow`, `opticat`
- `--component` (optional) — Component name (e.g. `harness`, `wocode`, `wouser`, `dashboard`)
- `--version` (optional) — Version string (e.g. `1.8.0`). Prompts interactively if omitted.

## Process
1. Validate the provided arguments
2. Activate the fixes-manager skill
3. Load `assets/<project>/` for version fields and component list
4. Read existing fix notes from `thoughts/<project>/docs/fixes/`
5. Append new version entry with standardized format
6. Confirm the result with the user
