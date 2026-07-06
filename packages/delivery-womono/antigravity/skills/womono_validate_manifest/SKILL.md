---
name: womono_validate_manifest
description: "Validate that all file paths in manifest.json exist on disk for all 7 AI coding tools. Checks for missing, stale, or incorrectly formatted entries and offers auto-fix capabilities."
allowed-tools: read, write, bash, glob, grep
---

# womono-validate-manifest — Manifest Integrity Validator

Validate all file paths referenced in `manifest.json` against the actual filesystem for each of the 7 AI coding tools in the AI Engineering Harness.

## WOMONO Ecosystem Knowledge

### Manifest.json Safety — CRITICAL
Never use string replacement on `manifest.json`. For any JSON manipulation, write a Python script using `json.load`/`json.dump`:

```python
import json
with open('packages/@aiengineeringharness/manifest.json') as f:
    data = json.load(f)
# inspect or modify
with open('packages/@aiengineeringharness/manifest.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

### Existing Validation Scripts
The harness provides scripts for automation:
- `scripts/compliance-check.ts` — skill naming, frontmatter, allowed-tools (Deno)
- `scripts/validate-manifest.ts` — manifest src path validation (Deno)
- `config-manifest/validate.py` — per-tool format validation (Python)
- `config-manifest/scripts/test-consistency.py` — YAML consistency checks

When building new validation features, create a script in `scripts/` rather than doing manual validation each time.

### Canonical Skill Architecture
Skills use `skills/<name>/SKILL.md` + `compile.py` + `tools/<tool>.yaml`. The manifest entries for generated skills are produced by `compile.py`. Always recompile after adding new files to a canonical skill.

### Config-Manifest
The `config-manifest/` system generates `manifest.json` from per-tool YAML files. Validate the YAML files in `config-manifest/tools/*.yaml`, not just the compiled `manifest.json`.

## Usage

```bash
# Validate all tools
womono-validate-manifest

# Dry-run: show what would be fixed
womono-validate-manifest --dry-run

# Auto-fix: remove invalid entries
womono-validate-manifest --fix

# Validate specific tool
womono-validate-manifest --tool=pi

# JSON report
womono-validate-manifest --report=json
```

## What It Validates

1. **Missing files**: Manifest src paths that don't exist on disk
2. **Stale entries**: Files on disk not referenced in manifest
3. **Directory structure**: Nested path existence and naming conventions
4. **File type consistency**: Extensions match expectations
5. **Canonical skill compilation**: Verify that per-tool copies exist for canonical skills
6. **Config-manifest alignment**: Check that manifest matches compiled YAMLs
7. **Version consistency**: Verify `manifest.json`, `install.ts` (`VERSION` constant), and `install.ps1` (`$ScriptVersion`) all have the same version. Flag mismatch as CRITICAL.

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
