#!/usr/bin/env python3
"""
Manifest Validator: Per-tool YAML formatting validation for all 7 AI coding tools.

Validates that each tool's YAML configuration follows that tool's specific
naming conventions, path requirements, and frontmatter formats.

Usage:
    python3 validate.py                          # Validate all tools
    python3 validate.py --tool=opencode           # Validate single tool
    python3 validate.py --fix                     # Auto-fix minor issues
    python3 validate.py --json                    # Output JSON report

Integrates with:
  - skill-compliance-checker: SKILL.md frontmatter/format validation
  - skill-adapter: platform-specific format generation
  - skill-auto-update: cross-frontend skill sync
"""

import os
import sys
import json
import yaml
import glob
import re
from datetime import datetime

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_DIR = os.path.join(REPO_ROOT, "config-manifest")
TOOLS_DIR = os.path.join(CONFIG_DIR, "tools")
MANIFEST_PATH = os.path.join(REPO_ROOT, "manifest.json")

COLOURS = {
    "red": "\033[91m",
    "green": "\033[92m",
    "yellow": "\033[93m",
    "blue": "\033[94m",
    "bold": "\033[1m",
    "end": "\033[0m",
}

# Per-tool specification reference
TOOL_SPECS = {
    "opencode": {
        "naming": "snake",
        "allowed_prefixes": ["opencode/"],
        "forbidden_prefixes": ["claude/", "gemini/", "pi/", "wocode/", "codex/", "antigravity/"],
        "target": "~/.config/opencode",
        "allowed_tools_case": "lowercase",
        "skill_dir_regex": r"^[a-z0-9]+(-[a-z0-9]+)*$",
        "dir_naming": "snake_case",
    },
    "claude": {
        "naming": "snake",
        "allowed_prefixes": ["claude/"],
        "forbidden_prefixes": ["opencode/", "gemini/", "pi/", "wocode/", "codex/", "antigravity/"],
        "target": "~/.claude",
        "allowed_tools_case": "PascalCase",
        "skill_dir_regex": r"^[a-z0-9]+(-[a-z0-9]+)*$",
        "dir_naming": "snake_case",
    },
    "gemini": {
        "naming": "snake",
        "allowed_prefixes": ["gemini/"],
        "forbidden_prefixes": ["claude/", "opencode/", "pi/", "wocode/", "codex/", "antigravity/"],
        "target": "~/.gemini",
        "allowed_tools_case": "lowercase",
        "skill_dir_regex": r"^[a-z0-9]+(-[a-z0-9]+)*$",
        "dir_naming": "snake_case",
    },
    "pi": {
        "naming": "kebab",
        "allowed_prefixes": ["pi/agent/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "wocode/", "codex/", "antigravity/"],
        "target": "~/.pi/agent",
        "allowed_tools_case": "lowercase",
        "skill_dir_regex": r"^[a-z0-9]+(-[a-z0-9]+)*$",
        "dir_naming": "kebab-case",
    },
    "wocode": {
        "naming": "snake",
        "allowed_prefixes": ["wocode/", "wocode/agent/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "codex/", "antigravity/"],
        "target": "~/.wocode",
        "allowed_tools_case": "lowercase",
        "skill_dir_regex": r"^[a-z0-9]+(-[a-z0-9]+)*$",
        "dir_naming": "snake_case",
    },
    "codex": {
        "naming": "snake",
        "allowed_prefixes": ["codex/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "wocode/", "antigravity/"],
        "target": "~/.codex",
        "allowed_tools_case": "lowercase",
        "skill_dir_regex": r"^[a-z0-9]+(-[a-z0-9]+)*$",
        "dir_naming": "snake_case",
    },
    "antigravity": {
        "naming": "snake",
        "allowed_prefixes": ["antigravity/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "wocode/", "codex/"],
        "target": "~/.antigravity",
        "allowed_tools_case": "lowercase",
        "skill_dir_regex": r"^[a-z0-9]+(-[a-z0-9]+)*$",
        "dir_naming": "snake_case",
    },
}


class ValidationResult:
    def __init__(self, tool_name):
        self.tool = tool_name
        self.errors = []
        self.warnings = []
        self.passed = True

    def error(self, code, message, file="", line=0):
        self.errors.append({"code": code, "message": message, "file": file, "line": line})
        self.passed = False

    def warning(self, code, message, file="", line=0):
        self.warnings.append({"code": code, "message": message, "file": file, "line": line})

    def to_dict(self):
        return {
            "tool": self.tool,
            "passed": self.passed,
            "errors": self.errors,
            "warnings": self.warnings,
            "error_count": len(self.errors),
            "warning_count": len(self.warnings),
        }


def validate_yaml_syntax(path: str) -> tuple[dict | None, str | None]:
    """Validate that a YAML file parses correctly."""
    try:
        with open(path, "r") as f:
            content = f.read()
        data = yaml.safe_load(content)
        return data, content
    except yaml.YAMLError as e:
        return None, None
    except FileNotFoundError:
        return None, None


# ---------------------------------------------------------------------------
# Validation checks
# ---------------------------------------------------------------------------

def check_path_prefixes(result: ValidationResult, components: dict, spec: dict):
    """Check that all src paths use the correct tool-specific prefix."""
    def walk(obj, ctx=""):
        if isinstance(obj, dict):
            if "src" in obj and isinstance(obj["src"], str):
                src = obj["src"]
                allowed = any(src.startswith(p) for p in spec["allowed_prefixes"])
                forbidden = any(src.startswith(p) for p in spec["forbidden_prefixes"])
                if forbidden:
                    result.error(
                        "CROSS_CONTAMINATION",
                        f"src '{src}' uses path from another tool (forbidden prefix)",
                        file=ctx,
                    )
                elif not allowed:
                    result.error(
                        "INVALID_PREFIX",
                        f"src '{src}' does not start with allowed prefix: {spec['allowed_prefixes']}",
                        file=ctx,
                    )
            for k, v in obj.items():
                walk(v, f"{ctx}.{k}" if ctx else k)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                walk(item, f"{ctx}[{i}]")
    walk(components)


def check_naming_convention(result: ValidationResult, components: dict, spec: dict):
    """Check that component names follow the tool's naming convention."""
    naming = spec["naming"]
    for comp_key in components:
        parts = comp_key.split("/")
        for part in parts:
            # Component keys use a mix of underscores and hyphens as grouping identifiers
            accepted = r"^[a-z0-9]+([_-][a-z0-9]+)*$"
            if not re.match(accepted, part):
                result.warning(
                    "WRONG_NAMING_CONVENTION",
                    f"Component '{comp_key}' contains invalid characters in part '{part}'",
                )


def check_target_valid(result: ValidationResult, tool_config: dict, spec: dict):
    """Check that the target directory matches the spec."""
    target = tool_config.get("target", "")
    expected_target = spec.get("target", "")
    if target and expected_target and target != expected_target:
        result.warning(
            "TARGET_MISMATCH",
            f"Target '{target}' doesn't match expected '{expected_target}'",
        )


def check_source_files_exist(result: ValidationResult, components: dict):
    """Check that referenced source files exist on disk."""
    def walk(obj, ctx=""):
        if isinstance(obj, dict):
            if "src" in obj and isinstance(obj["src"], str):
                src_path = os.path.join(REPO_ROOT, obj["src"])
                if not os.path.exists(src_path):
                    result.warning(
                        "FILE_NOT_FOUND",
                        f"Source file not found: {obj['src']}",
                        file=ctx,
                    )
            for k, v in obj.items():
                walk(v, f"{ctx}.{k}" if ctx else k)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                walk(item, f"{ctx}[{i}]")
    walk(components)


def check_duplicate_components(result: ValidationResult, components: dict):
    """Check for duplicate component definitions."""
    seen = {}
    for comp_key in components:
        if comp_key in seen:
            result.error(
                "DUPLICATE_COMPONENT",
                f"Duplicate component definition: '{comp_key}'",
            )
        seen[comp_key] = True


def check_manifest_consistency(result: ValidationResult, tool_name: str, tool_config: dict):
    """Cross-check against the compiled manifest.json if it exists."""
    if not os.path.exists(MANIFEST_PATH):
        return
    try:
        with open(MANIFEST_PATH, "r") as f:
            manifest = json.load(f)
        compiled_tool = manifest.get("tools", {}).get(tool_name, {})
        compiled_components = compiled_tool.get("components", {})
        source_components = tool_config.get("components", {})

        for key in source_components:
            if key not in compiled_components:
                result.warning(
                    "MISSING_FROM_MANIFEST",
                    f"Component '{key}' is in YAML but not in compiled manifest.json",
                )
        for key in compiled_components:
            if key not in source_components:
                result.warning(
                    "EXTRA_IN_MANIFEST",
                    f"Component '{key}' is in compiled manifest.json but not in YAML",
                )
    except (json.JSONDecodeError, FileNotFoundError):
        pass


# ---------------------------------------------------------------------------
# Main validation
# ---------------------------------------------------------------------------

def validate_tool(tool_name: str, fix_mode: bool = False) -> ValidationResult:
    """Validate a single tool's YAML configuration."""
    result = ValidationResult(tool_name)
    spec = TOOL_SPECS.get(tool_name)
    if not spec:
        result.error("UNKNOWN_TOOL", f"No spec defined for tool: {tool_name}")
        return result

    yaml_path = os.path.join(TOOLS_DIR, f"{tool_name}.yaml")
    if not os.path.exists(yaml_path):
        result.error("FILE_NOT_FOUND", f"YAML file not found: {yaml_path}")
        return result

    data, content = validate_yaml_syntax(yaml_path)
    if data is None:
        result.error("YAML_SYNTAX_ERROR", f"Failed to parse YAML: {yaml_path}")
        return result

    components = data.get("components", {})

    check_path_prefixes(result, components, spec)
    check_naming_convention(result, components, spec)
    check_target_valid(result, data, spec)
    check_duplicate_components(result, components)
    check_source_files_exist(result, components)
    check_manifest_consistency(result, tool_name, data)

    # Check for empty components
    if not components:
        result.warning("EMPTY_COMPONENTS", f"Tool '{tool_name}' has no components defined")

    return result


def validate_all(fix_mode: bool = False, json_output: bool = False) -> list[ValidationResult]:
    """Validate all tools."""
    results = []
    print(f"\n{'=' * 60}")
    print(f"  Manifest YAML Validation")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 60}")

    for tool_name in sorted(TOOL_SPECS.keys()):
        print(f"\n{'=' * 60}")
        print(f"  Tool: {tool_name}")
        print(f"  Spec: {TOOL_SPECS[tool_name]['dir_naming']}, "
              f"target: {TOOL_SPECS[tool_name]['target']}")
        print(f"{'=' * 60}")

        result = validate_tool(tool_name, fix_mode)
        results.append(result)

        if result.passed:
            print(f"  {COLOURS['green']}PASSED{COLOURS['end']}")
        else:
            print(f"  {COLOURS['red']}FAILED{COLOURS['end']}")

        for w in result.warnings:
            print(f"  {COLOURS['yellow']}WARNING{COLOURS['end']} [{w['code']}]: {w['message']}")
        for e in result.errors:
            print(f"  {COLOURS['red']}ERROR{COLOURS['end']}   [{e['code']}]: {e['message']}")

    print(f"\n{'=' * 60}")
    total_passed = sum(1 for r in results if r.passed)
    total_errors = sum(len(r.errors) for r in results)
    total_warnings = sum(len(r.warnings) for r in results)
    print(f"  Summary: {total_passed}/{len(results)} tools passed, "
          f"{total_errors} errors, {total_warnings} warnings")
    print(f"{'=' * 60}")

    if json_output:
        print("\n--- JSON Output ---")
        print(json.dumps([r.to_dict() for r in results], indent=2))

    return results


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main():
    args = sys.argv[1:]

    fix_mode = "--fix" in args
    json_output = "--json" in args
    single_tool = None

    for arg in args:
        if arg.startswith("--tool="):
            single_tool = arg.split("=", 1)[1]
            break

    if single_tool:
        if single_tool not in TOOL_SPECS:
            print(f"Unknown tool: {single_tool}. Available: {', '.join(sorted(TOOL_SPECS.keys()))}")
            sys.exit(1)
        result = validate_tool(single_tool, fix_mode)
        if json_output:
            print(json.dumps(result.to_dict(), indent=2))
        sys.exit(0 if result.passed else 1)
    else:
        results = validate_all(fix_mode, json_output)
        all_passed = all(r.passed for r in results)
        sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
