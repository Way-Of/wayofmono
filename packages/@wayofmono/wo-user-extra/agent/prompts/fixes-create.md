---
description: Fixes Create — Create fix note entry
---
# /fixes create — Create Fix Note Entry

Create a new fix note entry for any Way-Of project using the fixes-manager skill.

## Usage
`/fixes create --project=womono --component=harness --version=1.8.0`

## Steps
1. Validate arguments: `--project` (required), `--component` (optional), `--version` (optional)
2. Load the fixes-manager skill `assets/<project>/` for version fields
3. Read existing fix notes from `thoughts/<project>/docs/fixes/`
4. Append new version entry with standardized format
5. Confirm the result with the user
