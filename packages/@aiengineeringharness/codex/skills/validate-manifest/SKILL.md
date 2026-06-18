---
name: validate_manifest
description: "Validate that all file paths in manifest.json exist on disk for all 7 AI coding tools. Checks for missing, stale, or incorrectly formatted entries and offers auto-fix capabilities."
allowed-tools: read, write, bash, glob, grep
---

# Validate Manifest — Manifest Integrity Validator

Validate all file paths referenced in `manifest.json` against the actual filesystem for each of the 7 AI coding tools in the AI Engineering Harness.

## Usage

```bash
# Validate all tools
validate-manifest

# Dry-run: show what would be fixed
validate-manifest --dry-run

# Auto-fix: remove invalid entries
validate-manifest --fix

# Validate specific tool
validate-manifest --tool=pi

# JSON report
validate-manifest --report=json
```

## What It Validates

1. **Missing files**: Manifest src paths that don't exist on disk
2. **Stale entries**: Files on disk not referenced in manifest
3. **Directory structure**: Nested path existence and naming conventions
4. **File type consistency**: Extensions match expectations

## Exit Codes
- `0`: Fully compliant
- `1`: Issues found (non-critical)
- `2`: Critical errors (missing required files)
- `3`: Internal validation failure

## Integration

```bash
# With the installer
ai-harness --validate-manifest

# CI/CD GitHub Actions
- name: Validate Manifest
  run: |
    ai-harness --validate-manifest
    if [ $? -ne 0 ]; then exit 1; fi
```
