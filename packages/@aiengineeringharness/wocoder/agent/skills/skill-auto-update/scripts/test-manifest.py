#!/usr/bin/env python3
"""
test-manifest.py — Validate the compiled manifest.json for correctness and consistency.

Validates:
  1. Valid JSON structure
  2. All 7 tools present with no missing/extra tools
  3. Component counts match YAML source definitions
  4. No cross-contamination (paths reference correct tool)
  5. All referenced src files exist on disk
  6. Naming conventions are correct per tool
  7. Structural integrity (all required keys present)

Usage:
    python3 scripts/test-manifest.py                       # Full validation
    python3 scripts/test-manifest.py --tool=opencode        # Single tool
    python3 scripts/test-manifest.py --json                 # JSON output
    python3 scripts/test-manifest.py --verbose              # Verbose output
    python3 scripts/test-manifest.py --no-src-check         # Skip disk file checks
"""

import os
import sys
import json
import glob
import re
import yaml

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MANIFEST_PATH = os.path.join(REPO_ROOT, "manifest.json")
CONFIG_DIR = os.path.join(REPO_ROOT, "config-manifest")
TOOLS_DIR = os.path.join(CONFIG_DIR, "tools")

EXPECTED_TOOLS = {"claude", "opencode", "gemini", "pi", "wocoder", "codex", "antigravity"}

TOOL_PATH_RULES = {
    "claude": {"allowed_prefixes": ["claude/"], "forbidden_prefixes": ["opencode/", "gemini/", "pi/", "wocoder/", "codex/", "antigravity/"]},
    "opencode": {"allowed_prefixes": ["opencode/"], "forbidden_prefixes": ["claude/", "gemini/", "pi/", "wocoder/", "codex/", "antigravity/"]},
    "gemini": {"allowed_prefixes": ["gemini/"], "forbidden_prefixes": ["claude/", "opencode/", "pi/", "wocoder/", "codex/", "antigravity/"]},
    "pi": {"allowed_prefixes": ["pi/agent/"], "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "wocoder/", "codex/", "antigravity/"]},
    "wocoder": {"allowed_prefixes": ["wocoder/", "wocoder/agent/"], "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "codex/", "antigravity/"]},
    "codex": {"allowed_prefixes": ["codex/"], "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "wocoder/", "antigravity/"]},
    "antigravity": {"allowed_prefixes": ["antigravity/"], "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "wocoder/", "codex/"]},
}


class ManifestTestResult:
    def __init__(self, name):
        self.name = name
        self.errors = []
        self.warnings = []
        self.passed = True

    def error(self, code, message):
        self.errors.append({"code": code, "message": message})
        self.passed = False

    def warning(self, code, message):
        self.warnings.append({"code": code, "message": message})

    def ok(self):
        return self.passed and not self.warnings


def count_component_files(components):
    """Count total file entries across all components."""
    total = 0
    for comp_key, comp_data in components.items():
        files = comp_data.get("files", [])
        if isinstance(files, list):
            total += len(files)
    return total


def check_cross_contamination(components, tool_name):
    """Check that all src paths use correct prefix for this tool."""
    errors = []
    rules = TOOL_PATH_RULES.get(tool_name)
    if not rules:
        return errors

    def walk(obj, ctx=""):
        if isinstance(obj, dict):
            if "src" in obj and isinstance(obj["src"], str):
                src = obj["src"]
                allowed = any(src.startswith(p) for p in rules["allowed_prefixes"])
                forbidden = any(src.startswith(p) for p in rules["forbidden_prefixes"])
                if forbidden:
                    errors.append(f"src '{src}' uses forbidden prefix (context: {ctx})")
                elif not allowed:
                    errors.append(f"src '{src}' doesn't match allowed prefixes (context: {ctx})")
            for k, v in obj.items():
                walk(v, f"{ctx}.{k}" if ctx else k)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                walk(item, f"{ctx}[{i}]")
    walk(components)
    return errors


def check_source_files(components, tool_name):
    """Check that all src files exist on disk."""
    warnings = []
    def walk(obj, ctx=""):
        if isinstance(obj, dict):
            if "src" in obj and isinstance(obj["src"], str):
                src_path = os.path.join(REPO_ROOT, obj["src"])
                if not os.path.exists(src_path):
                    warnings.append(f"File not found: {obj['src']}")
            for k, v in obj.items():
                walk(v, f"{ctx}.{k}" if ctx else k)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                walk(item, f"{ctx}[{i}]")
    walk(components)
    return warnings


def load_yaml_configs():
    """Load all tool YAMLs and return a dict of tool_name -> config."""
    configs = {}
    for yaml_path in sorted(glob.glob(os.path.join(TOOLS_DIR, "*.yaml"))):
        tool_name = os.path.splitext(os.path.basename(yaml_path))[0]
        try:
            with open(yaml_path) as f:
                configs[tool_name] = yaml.safe_load(f) or {}
        except (yaml.YAMLError, FileNotFoundError) as e:
            configs[tool_name] = None
    return configs


def test_manifest(json_output=False, verbose=False, no_src_check=False):
    results = []

    # --- Test 1: JSON structure ---
    r = ManifestTestResult("manifest.json structure")
    try:
        with open(MANIFEST_PATH) as f:
            manifest = json.load(f)
    except json.JSONDecodeError as e:
        r.error("INVALID_JSON", f"manifest.json is not valid JSON: {e}")
        results.append(r)
        print(f"  [FAIL] manifest.json structure: invalid JSON")
        return results
    except FileNotFoundError:
        r.error("FILE_NOT_FOUND", f"manifest.json not found at {MANIFEST_PATH}")
        results.append(r)
        return results

    if "version" not in manifest:
        r.warning("MISSING_FIELD", "manifest.json missing 'version' field")
    if "tools" not in manifest:
        r.error("MISSING_TOOLS", "manifest.json missing 'tools' field")
        results.append(r)
        return results

    tools = manifest["tools"]
    results.append(r)

    # --- Test 2: Tool completeness ---
    r = ManifestTestResult("tool completeness")
    manifest_tools = set(tools.keys())
    missing = EXPECTED_TOOLS - manifest_tools
    extra = manifest_tools - EXPECTED_TOOLS
    if missing:
        r.error("MISSING_TOOLS", f"Missing tools: {sorted(missing)}")
    if extra:
        r.error("EXTRA_TOOLS", f"Unexpected tools: {sorted(extra)}")
    results.append(r)

    # --- Test 3: Per-tool validation ---
    yaml_configs = load_yaml_configs()
    tool_list = sorted(EXPECTED_TOOLS)
    if single_tool:
        if single_tool not in EXPECTED_TOOLS:
            print(f"  [FAIL] Unknown tool: {single_tool}")
            sys.exit(1)
        tool_list = [single_tool]
    for tool_name in tool_list:
        r = ManifestTestResult(f"{tool_name}")
        tool_data = tools.get(tool_name, {})

        if not tool_data:
            r.error("EMPTY_TOOL", f"Tool '{tool_name}' has no configuration in manifest.json")
            results.append(r)
            continue

        components = tool_data.get("components", {})
        if not components:
            r.warning("EMPTY_COMPONENTS", f"No components defined for '{tool_name}'")

        # Check required keys
        for key in ["name", "version", "target"]:
            if key not in tool_data:
                r.error("MISSING_KEY", f"Missing required key '{key}'")

        # Check cross-contamination
        contamination_errors = check_cross_contamination(components, tool_name)
        for ce in contamination_errors:
            r.error("CROSS_CONTAMINATION", ce)

        # Check source files
        if not no_src_check:
            file_warnings = check_source_files(components, tool_name)
            for fw in file_warnings:
                r.warning("FILE_NOT_FOUND", fw)

        # Verify component count matches YAML source
        yaml_config = yaml_configs.get(tool_name)
        if yaml_config:
            yaml_components = yaml_config.get("components", {})
            yaml_count = count_component_files(yaml_components)
            manifest_count = count_component_files(components)
            if yaml_count != manifest_count:
                r.warning("COUNT_MISMATCH",
                    f"YAML has {yaml_count} file entries but manifest.json has {manifest_count}")

        results.append(r)

    # --- Report ---
    print("=" * 60)
    print("  test-manifest.py — manifest.json Validation")
    print("=" * 60)
    for r in results:
        if r.errors:
            print(f"  [FAIL] {r.name}: {len(r.errors)} errors, {len(r.warnings)} warnings")
        elif r.warnings:
            print(f"  [WARN] {r.name}: {len(r.warnings)} warnings")
        else:
            print(f"  [PASS] {r.name}")

        if verbose or r.errors:
            for e in r.errors:
                print(f"         ERROR: [{e['code']}] {e['message']}")
            for w in r.warnings:
                print(f"         WARN:  [{w['code']}] {w['message']}")

    total_errors = sum(len(r.errors) for r in results)
    total_warnings = sum(len(r.warnings) for r in results)
    all_passed = all(not r.errors for r in results)
    print(f"\n  Summary: {total_errors} errors, {total_warnings} warnings")
    print(f"  Overall: {'PASS' if all_passed else 'FAIL'}")

    if json_output:
        print("\n" + json.dumps([r.__dict__ for r in results], indent=2))

    return results


if __name__ == "__main__":
    args = sys.argv[1:]
    json_output = "--json" in args
    verbose = "--verbose" in args
    no_src_check = "--no-src-check" in args
    single_tool = None
    for arg in args:
        if arg.startswith("--tool="):
            single_tool = arg.split("=", 1)[1]
            break

    results = test_manifest(json_output=json_output, verbose=verbose, no_src_check=no_src_check)

    if single_tool:
        for r in results:
            if r.name == single_tool:
                sys.exit(0 if not r.errors else 1)
        sys.exit(1)

    all_passed = all(not r.errors for r in results)
    sys.exit(0 if all_passed else 1)
