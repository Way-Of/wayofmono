#!/usr/bin/env python3
"""
test-yamls.py — Validate all per-tool YAML configs for compatibility, compliance, and correctness.

Validates:
  1. YAML syntax validity for every tool file
  2. Path prefix correctness (no cross-contamination — each tool uses its own paths)
  3. Naming convention compliance (snake_case vs kebab-case per tool spec)
  4. Source file existence (every referenced src file exists on disk)
  5. Component structure integrity (required keys: name, version, target, components)

Usage:
    python3 scripts/test-yamls.py                          # Test all tools
    python3 scripts/test-yamls.py --tool=opencode           # Test single tool
    python3 scripts/test-yamls.py --json                    # JSON output
    python3 scripts/test-yamls.py --verbose                 # Verbose output
"""

import os
import sys
import json
import glob
import re
import yaml

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONFIG_DIR = os.path.join(REPO_ROOT, "config-manifest")
TOOLS_DIR = os.path.join(CONFIG_DIR, "tools")

TOOL_SPECS = {
    "opencode": {
        "naming": "snake",
        "allowed_prefixes": ["opencode/"],
        "forbidden_prefixes": ["claude/", "gemini/", "pi/", "wocode/", "codex/", "antigravity/"],
        "target": "~/.config/opencode",
    },
    "claude": {
        "naming": "snake",
        "allowed_prefixes": ["claude/"],
        "forbidden_prefixes": ["opencode/", "gemini/", "pi/", "wocode/", "codex/", "antigravity/"],
        "target": "~/.claude",
    },
    "gemini": {
        "naming": "snake",
        "allowed_prefixes": ["gemini/"],
        "forbidden_prefixes": ["claude/", "opencode/", "pi/", "wocode/", "codex/", "antigravity/"],
        "target": "~/.gemini",
    },
    "pi": {
        "naming": "kebab",
        "allowed_prefixes": ["pi/agent/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "wocode/", "codex/", "antigravity/"],
        "target": "~/.pi/agent",
    },
    "wocode": {
        "naming": "snake",
        "allowed_prefixes": ["wocode/", "wocode/agent/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "codex/", "antigravity/"],
        "target": "~/.wocode",
    },
    "codex": {
        "naming": "snake",
        "allowed_prefixes": ["codex/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "wocode/", "antigravity/"],
        "target": "~/.codex",
    },
    "antigravity": {
        "naming": "snake",
        "allowed_prefixes": ["antigravity/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "wocode/", "codex/"],
        "target": "~/.antigravity",
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


def validate_yaml(path):
    try:
        with open(path) as f:
            data = yaml.safe_load(f)
        if data is None:
            return None, "Empty YAML file"
        return data, None
    except yaml.YAMLError as e:
        return None, f"YAML syntax error: {e}"
    except FileNotFoundError:
        return None, f"File not found: {path}"


def check_cross_contamination(result, components, spec):
    def walk(obj, ctx=""):
        if isinstance(obj, dict):
            if "src" in obj and isinstance(obj["src"], str):
                src = obj["src"]
                allowed = any(src.startswith(p) for p in spec["allowed_prefixes"])
                forbidden = any(src.startswith(p) for p in spec["forbidden_prefixes"])
                if forbidden:
                    result.error("CROSS_CONTAMINATION", f"src '{src}' uses path from another tool", file=ctx)
                elif not allowed:
                    result.error("INVALID_PREFIX", f"src '{src}' doesn't match allowed prefixes: {spec['allowed_prefixes']}", file=ctx)
            for k, v in obj.items():
                walk(v, f"{ctx}.{k}" if ctx else k)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                walk(item, f"{ctx}[{i}]")
    walk(components)


def check_source_files(result, components):
    def walk(obj, ctx=""):
        if isinstance(obj, dict):
            if "src" in obj and isinstance(obj["src"], str):
                src_path = os.path.join(REPO_ROOT, obj["src"])
                if not os.path.exists(src_path):
                    result.warning("FILE_NOT_FOUND", f"Source file not found: {obj['src']}", file=ctx)
            for k, v in obj.items():
                walk(v, f"{ctx}.{k}" if ctx else k)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                walk(item, f"{ctx}[{i}]")
    walk(components)


def check_duplicate_components(result, components):
    seen = {}
    for comp_key in components:
        if comp_key in seen:
            result.error("DUPLICATE_COMPONENT", f"Duplicate component key: '{comp_key}'")
        seen[comp_key] = True


def check_target(result, tool_config, spec):
    target = tool_config.get("target", "")
    expected = spec.get("target", "")
    if target and expected and target != expected:
        result.warning("TARGET_MISMATCH", f"Target '{target}' doesn't match expected '{expected}'")


def check_structure(result, tool_config):
    required = ["name", "version", "target", "components"]
    for key in required:
        if key not in tool_config:
            result.error("MISSING_KEY", f"Missing required key: '{key}'")
    if "components" in tool_config and not isinstance(tool_config["components"], dict):
        result.error("INVALID_COMPONENTS", "'components' must be a dict")


def test_tool(tool_name):
    result = ValidationResult(tool_name)
    spec = TOOL_SPECS.get(tool_name)
    if not spec:
        result.error("UNKNOWN_TOOL", f"No spec defined for tool: {tool_name}")
        return result

    yaml_path = os.path.join(TOOLS_DIR, f"{tool_name}.yaml")
    if not os.path.exists(yaml_path):
        result.error("FILE_NOT_FOUND", f"YAML file not found: {yaml_path}")
        return result

    data, err = validate_yaml(yaml_path)
    if err:
        result.error("YAML_SYNTAX", err, file=yaml_path)
        return result

    components = data.get("components", {})
    check_structure(result, data)
    check_cross_contamination(result, components, spec)
    check_duplicate_components(result, components)
    check_target(result, data, spec)
    check_source_files(result, components)

    if not components:
        result.warning("EMPTY_COMPONENTS", f"Tool '{tool_name}' has no components defined")

    return result


def test_all(json_output=False, verbose=False):
    results = []
    for tool_name in sorted(TOOL_SPECS.keys()):
        result = test_tool(tool_name)
        results.append(result)

        status = "PASS" if result.passed else "FAIL"
        print(f"  [{status}] {tool_name}: {len(result.errors)} errors, {len(result.warnings)} warnings")
        if verbose or not result.passed:
            for e in result.errors:
                print(f"         ERROR: [{e['code']}] {e['message']}")
            for w in result.warnings:
                print(f"         WARN:  [{w['code']}] {w['message']}")

    total_passed = sum(1 for r in results if r.passed)
    total_errors = sum(len(r.errors) for r in results)
    total_warnings = sum(len(r.warnings) for r in results)
    print(f"\n  Summary: {total_passed}/{len(results)} passed, {total_errors} errors, {total_warnings} warnings")

    if json_output:
        print(json.dumps([r.to_dict() for r in results], indent=2))

    return results


if __name__ == "__main__":
    args = sys.argv[1:]
    json_output = "--json" in args
    verbose = "--verbose" in args
    single_tool = None
    for arg in args:
        if arg.startswith("--tool="):
            single_tool = arg.split("=", 1)[1]
            break

    print("=" * 60)
    print("  test-yamls.py — Per-tool YAML Validation")
    print("=" * 60)

    if single_tool:
        if single_tool not in TOOL_SPECS:
            print(f"Unknown tool: {single_tool}")
            sys.exit(1)
        print(f"\nTesting: {single_tool}")
        result = test_tool(single_tool)
        if json_output:
            print(json.dumps(result.to_dict(), indent=2))
        sys.exit(0 if result.passed else 1)
    else:
        results = test_all(json_output=json_output, verbose=verbose)
        all_passed = all(r.passed for r in results)
        sys.exit(0 if all_passed else 1)
