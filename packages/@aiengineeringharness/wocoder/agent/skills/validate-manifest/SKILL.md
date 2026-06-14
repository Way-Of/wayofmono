---
name: validate-manifest
description: "Validate that all file paths in manifest.json exist on disk for all 7 AI coding tools. Checks for missing, stale, or incorrectly formatted entries and offers auto-fix capabilities."
allowed-tools: read, write, bash, glob, grep, websearch
---

# Validate Manifest — Manifest Integrity Validator

Validate all file paths referenced in `manifest.json` against the actual filesystem for each of the 7 AI coding tools in the AI Engineering Harness.

## Overview

The `validate-manifest` skill ensures that the manifest file accurately reflects the actual file structure across all 7 tools (OpenCode, Claude Code, Gemini CLI, Pi, Antigravity, Codex, Wo Coder). This prevents installation errors by catching path issues early and maintains the integrity of the harness configuration.

## Key Features

- **Comprehensive Validation**: Checks all 7 tools for file path consistency
- **Auto-Fix Support**: Remove stale manifest entries pointing to non-existent files
- **Detailed Reporting**: Clear, actionable output with per-tool summaries
- **Flexible CLI Options**: Dry-run, fix, specific tool, and report format options
- **Integration Ready**: Works with installer, CI/CD, and development workflows

## Usage

### Basic Commands

```bash
# Validate all tools (shows issues)
validate-manifest

# Dry-run: Show what would be fixed
validate-manifest --dry-run

# Auto-fix: Remove invalid entries
validate-manifest --fix

# Validate specific tool only
validate-manifest --tool=pi

# Get JSON report
validate-manifest --report=json
```

### Examples

```bash
# Check what's broken in the manifest
validate-manifest

# See what files would be removed if we auto-fixed
validate-manifest --dry-run

# Fix the manifest (removes stale entries)
validate-manifest --fix

# Only check the Pi tool
validate-manifest --tool=pi

# Output as JSON for automation
validate-manifest --report=json > validation-report.json
```

## File Structure

The skill validates paths across these tool directory structures:

| Tool | Directory Pattern | Typical File Types |
|------|-------------------|-------------------|
| OpenCode | `packages/@aiengineeringharness/opencode/` | `*.md` (skills, agents, commands) |
| Claude Code | `packages/@aiengineeringharness/claude/` | `*.md` (skills, agents, commands) |
| Gemini CLI | `packages/@aiengineeringharness/gemini/` | `*.md` (skills, agents, commands) |
| Pi | `packages/@aiengineeringharness/pi/agent/` | `*.md` (skills, agents), `*.ts` (extensions) |
| Antigravity | `packages/@aiengineeringharness/antigravity/` | `*.md` (skills, agents, commands) |
| Codex | `packages/@aiengineeringharness/codex/` | `*.md` (skills, agents) |
| Wo Coder | `packages/@aiengineeringharness/wocoder/agent/` | `*.md` (skills, agents), `*.ts` (extensions) |

## What It Validates

### 1. Missing Files

Checks for manifest entries where `src` paths don't exist on disk:

```
[ERROR] Missing: pi/agent/skills/validate-manifest/SKILL.md
[ERROR] Missing: wocoder/agent/extensions/open-editor.ts
```

### 2. Stale Entries

Identifies files on disk that are not referenced in the manifest:

```
[WARN] Stale: packages/@aiengineeringharness/wocoder/agent/skills/temp-skill.md
[WARN] Stale: packages/@aiengineeringharness/pi/agent/themes/temp-theme.json
```

### 3. Directory Structure Issues

Validates nested path existence and naming conventions:

```
[ERROR] Invalid path: wocoder/agent/skills//double-slash.md
[ERROR] Wrong naming: pi/agent/skills/SKİLL.md (should be kebab-case)
```

### 4. File Type Consistency

Ensures file extensions match expectations:

```
[ERROR] Wrong extension: pi/agent/skills/validate_manifest.py (should be .md)
```

## Exit Codes

- `0`: Manifest is fully compliant
- `1`: Manifest has issues but no critical errors
- `2`: Critical errors found (missing required files)
- `3`: Validation failed (internal error)

## Validation Rules

### Per-Tool Path Patterns

```javascript
const toolPaths = {
  // Skills and agents (Markdown files)
  opencode: 'packages/@aiengineeringharness/opencode',
  claude: 'packages/@aiengineeringharness/claude',
  gemini: 'packages/@aiengineeringharness/gemini',
  antigravity: 'packages/@aiengineeringharness/antigravity',
  codex: 'packages/@aiengineeringharness/codex',
  // Pi has special requirements
  pi: 'packages/@aiengineeringharness/pi/agent',
  // Wo Coder
  wocoder: 'packages/@aiengineeringharness/wocoder/agent',
};
```

### File Patterns Per Tool

1. **Skills and Agents**: `*.md` files
2. **Extensions**: `*.ts` files (for Pi, Wo Coder)
3. **Themes**: `*.json` files
4. **Commands**: `*.md` files (for some tools)
5. **Other**: Tool-specific patterns

### Validation Checks

1. **Path Existence**: Does the file exist at `src` path?
2. **Directory Structure**: Are parent directories valid?
3. **Naming Conventions**: Does the filename match tool-specific naming rules?
4. **File Type**: Does the extension match expectations?
5. **Completeness**: Is the file in the correct location?

## Integration

### CLI Options

```bash
validate-manifest [options]

Options:
  --dry-run          Show what would be fixed (no changes)
  --fix              Auto-fix: Remove invalid entries
  --tool <name>      Validate specific tool only
  --report <format>  Output format: text|json|csv
  --help             Show help
```

### With Installer

```bash
# Integrated with the installer
ai-harness --validate-manifest

# With auto-fix
ai-harness --validate-manifest --fix

# Specific tool validation
ai-harness --validate-manifest --tool=pi
```

### With CI/CD

```yaml
# GitHub Actions example
- name: Validate Manifest
  run: |
    ai-harness --validate-manifest
    # Fail CI if there are issues
    if [ $? -ne 0 ]; then
      echo "Manifest validation failed"
      exit 1
    fi

- name: Auto-fix (on PR)
  if: github.event_name == 'pull_request'
  run: |
    ai-harness --validate-manifest --fix
    git diff -- manifest.json
    git add manifest.json
    git commit -m "fix: Remove stale manifest entries"
```

## Reports

### Text Report (Default)

```
=== Manifest Validation Report ===

Tool: Pi
Status: ⚠️ Issues Found

Missing files:
  - pi/agent/skills/validate-manifest/SKILL.md

Stale files:
  - packages/@aiengineeringharness/pi/agent/themes/old-theme.json

Summary:
  - Total entries checked: 1,247
  - Missing files: 3 (0.2%)
  - Stale files: 5 (0.4%)
  - Issues resolved: 0

Tool: Wo Coder
Status: ✅ Compliant

Summary:
  - Total entries checked: 892
  - Missing files: 0 (0.0%)
  - Stale files: 0 (0.0%)
  - Issues resolved: 0

=== Overall Status: ⚠️ Issues Found ===
```

### JSON Report

```json
{
  "timestamp": "2026-06-14T03:13:00Z",
  "summary": {
    "totalEntries": 2139,
    "compliant": 1934,
    "warning": 182,
    "error": 23,
    "staleRemoved": 0
  },
  "tools": {
    "pi": {
      "status": "warning",
      "missingFiles": ["pi/agent/skills/validate-manifest/SKILL.md"],
      "staleFiles": ["pi/agent/themes/old-theme.json"],
      "stats": {
        "total": 324,
        "ok": 321,
        "missing": 3,
        "stale": 5,
        "format": 2
      }
    }
  },
  "actions": {
    "canAutoFix": true,
    "filesToRemove": ["manifest.json entry for old-theme.json"]
  }
}
```

## Installation and Setup

### For Development

```bash
# Clone and setup
git clone <repo>
cd <repo>
npm install
npm run build

# Run validation
npm run validate-manifest

# Test with dry-run
npm run validate-manifest -- --dry-run
```

### Running Tests

```bash
# Run unit tests
npm test

# Run validation tests specifically
npm run test:validate

# Watch mode for testing
npm run test:watch
```

## File Reference

### Source Files

1. `packages/@aiengineeringharness/wocoder/agent/skills/validate-manifest/SKILL.md`
   - skill definition and documentation

2. `packages/@aiengineeringharness/scripts/validate-manifest.ts`
   - Core validation logic

3. `packages/@aiengineeringharness/scripts/test-validate-manifest.js`
   - Test suite

### Configuration

1. `.validate-manifest.json` (optional)
   - Custom validation rules
   - Exclude patterns
   - Auto-fix options

### Documentation

1. `docs/skills/validate-manifest.md`
   - Detailed usage guide

2. `thoughts/wayofmono/docs/skills/validate-manifest.md`
   - Technical implementation details

## See Also

### Related Skills

- `skill_compliance_checker` - Validates SKILL.md format compliance
- `skill_auto_update` - Syncs skills between frontend and backend
- `skill_adapter` - Handles platform-specific skill loading

### Related Tools

- `ai-harness --compliance` - Built-in installer compliance check
- `deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts` - skill compliance validator

### Validation Commands

```bash
# Basic validation
validate-manifest

# Check compliance (similar to installer)
validate-manifest --dry-run

# Get detailed JSON report
validate-manifest --report=json

# Fix specific issues
validate-manifest --fix
```

## Best Practices

### Before Committing

```bash
# Validate before committing
validate-manifest

# Fix issues automatically
validate-manifest --fix

# Commit changes

git add manifest.json

git commit -m "fix: Remove stale manifest entries"
```

### During Development

1. **Regular validation**: Run `validate-manifest --dry-run` before committing
2. **Tool-specific checks**: Use `--tool=<tool-name>` to focus on one tool
3. **Auto-fix carefully**: Use `--fix` only when you're certain about stale entries
4. **Review reports**: Check JSON reports for automated systems

### Production Use

1. **CI/CD integration**: Add to GitHub Actions or other CI systems
2. **Pre-commit hooks**: Set up hooks to validate before commits
3. **Monitoring**: Track validation failures over time
4. **Automation**: Use `--fix` in scheduled maintenance

## Troubleshooting

### Common Issues

**Issue**: Many missing files

**Solution**: This typically means the manifest.json has stale entries. Use `--fix` to remove them.

```bash
validate-manifest --fix
```

**Issue**: Permission denied

**Solution**: Ensure proper file permissions and access:

```bash
chmod +x scripts/validate-manifest.ts
chmod +x packages/@aiengineeringharness/wocoder/agent/skills/validate-manifest/SKILL.md
```

**Issue**: Large number of files

**Solution**: Use `--tool=<specific-tool>` to validate one tool at a time:

```bash
validate-manifest --tool=pi
```

### Error Messages

- `[ERROR] Missing: path/to/file.ext` - File doesn't exist
- `[WARN] Stale: path/to/file.ext` - File exists but not in manifest
- `[ERROR] Invalid path: path with //` - Invalid path format
- `[ERROR] Wrong naming: FileName.md` - Naming convention violation

## References

1. Manifest structure: `packages/@aiengineeringharness/manifest.json`
2. Similar skill: `skill_compliance_checker`
3. Installation: `ai-harness --help`
4. Documentation: `docs/commands.md`
5. Best practices: `thoughts/wayofmono/docs/best-practices/`
