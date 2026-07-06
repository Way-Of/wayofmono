# Fixes Bump

Bump the version across all project files using the fixes-manager skill.

## Usage
`/fixes bump --project=<project> --version=<version>`

### Arguments
- `--project` (required) — Project namespace: `womono`, `wow`, `opticat`
- `--version` (required) — Target version string (e.g. `1.8.0`)

## Process:

### 1. Validate Arguments
- Project must be a valid namespace from `skills/fixes-manager/assets/`

### 2. Load Version Config
- Read `skills/fixes-manager/assets/<project>/version-config.json`
- This defines ALL version files for that project, their types (json/yaml/regex/markdown), and bump order
- **Each project has its own config** — wow and opticat only have a fix note to bump, womono has 5+ files

### 3. Bump Each Version File in Order
For each file in `version-config.json.version_files`, sorted by `bump_order`:

| type | How to update |
|------|--------------|
| `json` | Update the specified `fields` in the JSON file |
| `yaml` | Update the specified `fields` in the YAML file |
| `regex` | Replace the regex `pattern` match with the new version |
| `markdown` | Insert a new version header entry (CHANGELOG) or find/replace old version strings (README) |

### 4. womono-Specific Notes
If `--project=womono`, these additional steps apply:
- After updating `manifest.json`, also update the 7 per-tool `version` fields: `antigravity/version`, `claude/version`, `codex/version`, `opencode/version`, `pi/version`, `wocode/version`
- After all files are updated, recompile:
  ```bash
  python3 packages/@aiengineeringharness/config-manifest/compile.py
  ```

### 5. CHANGELOG.md Entry Format (womono only)
Insert after `# Changelog` line:

```markdown
## [<version>] - YYYY-MM-DD

### Harness (AI Engineering Harness v<version>)
- <summary of changes>
```

### 6. Confirm
Show the user a summary of what was changed and ask for confirmation before committing.
