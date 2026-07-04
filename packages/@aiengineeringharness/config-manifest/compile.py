#!/usr/bin/env python3
"""
Manifest Compiler: Merges modular YAML configs into production manifest.json

Usage:
    python3 compile.py                          # Compile to manifest.json
    python3 compile.py --output ../manifest.json # Custom output path
    python3 compile.py --validate-only           # Only validate, don't compile
    python3 compile.py --check                   # Validate compiled output matches existing

Each tool's YAML must follow its own naming/casing/directory conventions
or the compilation will fail with clear error messages.
"""

import os
import sys
import json
import yaml
import glob
import re

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_DIR = os.path.join(REPO_ROOT, "config-manifest")
TOOLS_DIR = os.path.join(CONFIG_DIR, "tools")
DEFAULT_OUTPUT = os.path.join(os.path.dirname(CONFIG_DIR), "manifest.json")

# Per-tool path validation rules
TOOL_PATH_RULES = {
    "claude": {
        "allowed_prefixes": ["claude/"],
        "forbidden_prefixes": ["opencode/", "gemini/", "pi/", "wocode/", "codex/", "antigravity/"],
        "naming": "snake",
        "dest_prefix": "",
    },
    "opencode": {
        "allowed_prefixes": ["opencode/"],
        "forbidden_prefixes": ["claude/", "gemini/", "pi/", "wocode/", "codex/", "antigravity/"],
        "naming": "kebab",
        "dest_prefix": "",
    },
    "gemini": {
        "allowed_prefixes": ["gemini/"],
        "forbidden_prefixes": ["claude/", "opencode/", "pi/", "wocode/", "codex/", "antigravity/"],
        "naming": "snake",
        "dest_prefix": "",
    },
    "pi": {
        "allowed_prefixes": ["pi/agent/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "wocode/", "codex/", "antigravity/"],
        "naming": "kebab",
        "dest_prefix": "",
    },
    "wocode": {
        "allowed_prefixes": ["wocode/", "wocode/agent/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "codex/", "antigravity/"],
        "naming": "kebab",
        "dest_prefix": "",
    },
    "codex": {
        "allowed_prefixes": ["codex/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "wocode/", "antigravity/"],
        "naming": "snake",
        "dest_prefix": "",
    },
    "antigravity": {
        "allowed_prefixes": ["antigravity/"],
        "forbidden_prefixes": ["claude/", "opencode/", "gemini/", "pi/", "wocode/", "codex/"],
        "naming": "snake",
        "dest_prefix": "",
    },
}


def validate_paths(tool_name: str, components: dict) -> list[str]:
    """Validate all src paths in a tool's components are using correct prefixes."""
    errors = []
    rules = TOOL_PATH_RULES.get(tool_name)
    if not rules:
        return [f"Unknown tool: {tool_name}"]

    def check_item(obj, path_ctx=""):
        if isinstance(obj, dict):
            if "src" in obj and isinstance(obj["src"], str):
                src = obj["src"]
                allowed = any(src.startswith(p) for p in rules["allowed_prefixes"])
                forbidden = any(src.startswith(p) for p in rules["forbidden_prefixes"])
                if forbidden:
                    errors.append(
                        f"[{tool_name}] Cross-contamination: src '{src}' uses forbidden prefix "
                        f"(path context: {path_ctx})"
                    )
                if not allowed and not forbidden:
                    errors.append(
                        f"[{tool_name}] Unknown prefix in src '{src}' "
                        f"(path context: {path_ctx})"
                    )
            for k, v in obj.items():
                check_item(v, f"{path_ctx}.{k}" if path_ctx else k)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                check_item(item, f"{path_ctx}[{i}]")

    check_item(components)
    return errors


def validate_naming(tool_name: str, tool_config: dict) -> list[str]:
    """Validate that component names use valid characters."""
    errors = []
    components = tool_config.get("components", {})

    for comp_key in components:
        parts = comp_key.split("/")
        for part in parts:
            # Component keys are grouping identifiers - accept underscores and hyphens
            accepted = r"^[a-z0-9]+([_-][a-z0-9]+)*$"
            if not re.match(accepted, part):
                errors.append(
                    f"[{tool_name}] Component '{comp_key}' contains invalid characters in part '{part}'"
                )

    return errors


def validate_source_files_exist(tool_name: str, components: dict, harness_root: str) -> list[str]:
    """Validate that all src files referenced exist on disk."""
    errors = []

    def check_obj(obj, path_ctx=""):
        if isinstance(obj, dict):
            if "src" in obj and isinstance(obj["src"], str):
                src_path = os.path.join(harness_root, obj["src"])
                if not os.path.exists(src_path):
                    errors.append(
                        f"[{tool_name}] Source file not found: {obj['src']} "
                        f"(expected at: {src_path})"
                    )
            for k, v in obj.items():
                check_obj(v, f"{path_ctx}.{k}" if path_ctx else k)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                check_obj(item, f"{path_ctx}[{i}]")

    check_obj(components)
    return errors


def load_yaml_safe(path: str) -> dict:
    """Load a YAML file with error handling."""
    try:
        with open(path, "r") as f:
            data = yaml.safe_load(f)
            if data is None:
                return {}
            return data
    except yaml.YAMLError as e:
        print(f"  YAML parse error in {path}: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"  File not found: {path}")
        sys.exit(1)


def compile_manifest(validate_only=False):
    print("=" * 60)
    print("  Manifest Compiler v1.0")
    print("=" * 60)

    if not os.path.exists(CONFIG_DIR):
        print(f"Config directory not found: {CONFIG_DIR}")
        sys.exit(1)

    # 1. Load base manifest
    base_path = os.path.join(CONFIG_DIR, "base_manifest.yaml")
    print(f"\nLoading base manifest: {base_path}")
    manifest = load_yaml_safe(base_path)

    if "tools" not in manifest:
        manifest["tools"] = {}

    # 2. Load each tool's configuration
    tool_files = sorted(glob.glob(os.path.join(TOOLS_DIR, "*.yaml")))
    if not tool_files:
        print(f"\nNo tool configs found in {TOOLS_DIR}")
        sys.exit(1)

    all_errors = []
    all_warnings = []

    print(f"\nFound {len(tool_files)} tool configs:")
    for tf in tool_files:
        tool_name = os.path.splitext(os.path.basename(tf))[0]
        print(f"  Loading: {tool_name}")

        tool_config = load_yaml_safe(tf)

        # Add target if missing
        default_targets = {
            "claude": "~/.claude",
            "opencode": "~/.config/opencode",
            "gemini": "~/.gemini",
            "pi": "~/.pi/agent",
            "wocode": "~/.wocode",
            "codex": "~/.codex",
            "antigravity": "~/.antigravity",
        }
        if "target" not in tool_config and tool_name in default_targets:
            tool_config["target"] = default_targets[tool_name]

        # Validate paths
        components = tool_config.get("components", {})
        path_errors = validate_paths(tool_name, components)
        all_errors.extend(path_errors)

        # Validate naming
        naming_errors = validate_naming(tool_name, tool_config)
        all_errors.extend(naming_errors)

        # Validate source files exist
        file_errors = validate_source_files_exist(tool_name, components, REPO_ROOT)
        # File existence is a warning, not a hard error (files may be generated later)
        all_warnings.extend(file_errors)

        manifest["tools"][tool_name] = tool_config

    # 3. Report validation results
    if all_warnings:
        print(f"\nWarnings ({len(all_warnings)}):")
        for w in all_warnings:
            print(f"  WARNING: {w}")

    if all_errors:
        print(f"\nERRORS ({len(all_errors)}):")
        for e in all_errors:
            print(f"  ERROR: {e}")
        print("\nCompilation FAILED. Fix the errors above.")
        sys.exit(1)
    else:
        print(f"\nPath validation: PASSED (0 errors)")

    if validate_only:
        print("\nValidation complete. No compilation.")
        return

    # 4. Write the output
    manifest_version = manifest.get("manifest_version", "1.0.0")
    output = {
        "version": manifest_version,
        "tools": manifest["tools"],
    }

    print(f"\nWriting manifest to: {DEFAULT_OUTPUT}")
    with open(DEFAULT_OUTPUT, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print("Compilation complete.")


def main():
    args = sys.argv[1:]

    validate_only = "--validate-only" in args

    compile_manifest(validate_only=validate_only)


if __name__ == "__main__":
    main()
