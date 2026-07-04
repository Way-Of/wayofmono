#!/usr/bin/env python3
"""Compile agents-md-manager SKILL.md for all 7 AI coding tools.

Reads the canonical SKILL.md body and per-tool YAML configs from tools/,
generates frontmatter for each tool, and writes tool-specific SKILL.md files
to the appropriate destination directories.

Usage:
    python3 compile.py              # Compile all tools
    python3 compile.py --tool=opencode  # Compile single tool
    python3 compile.py --check      # Preview only, no writes
    python3 compile.py --validate   # Validate existing files against expected output
"""

import argparse
import os
import sys
import yaml
import json

HARNESS_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), "../.."))
CANONICAL_SKILL_PATH = os.path.join(os.path.dirname(__file__), "SKILL.md")
TOOLS_DIR = os.path.join(os.path.dirname(__file__), "tools")

CANONICAL_DESCRIPTION = (
    "Create, update, and maintain AGENTS.md files across projects and "
    "subdirectories. Ensures every AGENTS.md follows the Agent Ecosystem "
    "Manifest format and contains accurate agent, command, and skill "
    "references."
)


def read_canonical_body():
    with open(CANONICAL_SKILL_PATH, "r", encoding="utf-8") as f:
        return f.read()


def list_tool_configs():
    configs = {}
    for fname in sorted(os.listdir(TOOLS_DIR)):
        if fname.endswith(".yaml"):
            tool_name = fname.replace(".yaml", "")
            with open(os.path.join(TOOLS_DIR, fname), "r", encoding="utf-8") as f:
                configs[tool_name] = yaml.safe_load(f)
    return configs


def build_frontmatter(config):
    fields = {
        "name": config["name"],
        "description": CANONICAL_DESCRIPTION,
    }

    if config.get("disable-model-invocation", False):
        fields["disable-model-invocation"] = True

    allowed = config.get("allowed-tools")
    if allowed:
        fields["allowed-tools"] = allowed

    lines = ["---"]
    for key, value in fields.items():
        if isinstance(value, str) and "\n" in value:
            lines.append(f"{key}: >-")
            for line in value.split("\n"):
                lines.append(f"  {line}")
        elif isinstance(value, bool):
            lines.append(f"{key}: {str(value).lower()}")
        else:
            lines.append(f"{key}: {value}")
    lines.append("---")
    return "\n".join(lines) + "\n"


def build_skill(frontmatter, body):
    return frontmatter + body


def get_dest_path(config, dest_rel):
    skill_dir = os.path.join(HARNESS_ROOT, dest_rel, config["dir_name"])
    os.makedirs(skill_dir, exist_ok=True)
    return os.path.join(skill_dir, "SKILL.md")


def compile_tool(tool_name, config, body, check_only=False):
    frontmatter = build_frontmatter(config)
    skill_content = build_skill(frontmatter, body)

    results = []
    for dest_rel in config.get("dests", []):
        dest_path = get_dest_path(config, dest_rel)
        if check_only:
            results.append((dest_path, "WOULD WRITE"))
        else:
            with open(dest_path, "w", encoding="utf-8") as f:
                f.write(skill_content)
            results.append((dest_path, "WRITTEN"))
    return results


def validate_tool(tool_name, config, body):
    frontmatter = build_frontmatter(config)
    expected = build_skill(frontmatter, body)

    issues = []
    for dest_rel in config.get("dests", []):
        dest_path = get_dest_path(config, dest_rel)
        if not os.path.exists(dest_path):
            issues.append((dest_path, "MISSING"))
            continue
        with open(dest_path, "r", encoding="utf-8") as f:
            actual = f.read()
        if actual != expected:
            issues.append((dest_path, "OUTDATED"))
        else:
            issues.append((dest_path, "OK"))
    return issues


def main():
    parser = argparse.ArgumentParser(description="Compile agents-md-manager SKILL.md for all tools")
    parser.add_argument("--tool", help="Compile only for specific tool")
    parser.add_argument("--check", action="store_true", help="Preview only, no writes")
    parser.add_argument("--validate", action="store_true", help="Validate existing files against expected")
    parser.add_argument("--json", action="store_true", help="JSON output")
    args = parser.parse_args()

    body = read_canonical_body()
    configs = list_tool_configs()

    all_results = {}

    if args.tool:
        if args.tool not in configs:
            print(f"Error: unknown tool '{args.tool}'. Available: {', '.join(configs.keys())}", file=sys.stderr)
            sys.exit(1)
        tools_to_process = {args.tool: configs[args.tool]}
    else:
        tools_to_process = configs

    for tool_name, config in tools_to_process.items():
        if args.validate:
            results = validate_tool(tool_name, config, body)
        else:
            results = compile_tool(tool_name, config, body, check_only=args.check)
        all_results[tool_name] = results

    if args.json:
        print(json.dumps(all_results, indent=2))
        return

    for tool_name, results in all_results.items():
        print(f"\n=== {tool_name} ===")
        for path, status in results:
            rel_path = os.path.relpath(path, HARNESS_ROOT)
            print(f"  [{status}] {rel_path}")

    has_errors = any(
        status in ("MISSING", "OUTDATED")
        for results in all_results.values()
        for _, status in results
    )
    if has_errors and args.validate:
        print("\nValidation FAILED \u2014 some files are missing or outdated.")
        sys.exit(1)
    elif args.validate:
        print("\nAll files up to date.")


if __name__ == "__main__":
    main()
