---
name: validate_manifest
description: Validate that all file paths in manifest.json exist on disk for all 7 AI coding tools
---

# Validate Manifest — Manifest Integrity Validator

Validate all file paths referenced in `manifest.json` against the actual filesystem for each of the 7 AI coding tools.

## Usage

- **validate-manifest**: Validate all tools
- **validate-manifest --dry-run**: Show what would be fixed
- **validate-manifest --fix**: Remove invalid entries
- **validate-manifest --tool=pi**: Validate specific tool
- **validate-manifest --report=json**: JSON report

## What It Validates

1. **Missing files**: Manifest src paths that don't exist on disk
2. **Stale entries**: Files on disk not referenced in manifest
3. **Directory structure**: Nested path existence and naming conventions

## Exit Codes

- `0`: Fully compliant
- `1`: Issues found (non-critical)
- `2`: Critical errors (missing required files)
- `3`: Internal validation failure
