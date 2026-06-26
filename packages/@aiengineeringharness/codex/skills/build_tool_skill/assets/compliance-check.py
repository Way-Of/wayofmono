#!/usr/bin/env python3
"""
Compliance checker for skill files across all 7 AI coding tools.
Migrated from skill-compliance-checker.

Usage:
    python3 compliance-check.py                        # Check all tools
    python3 compliance-check.py --tool=opencode         # Single tool
    python3 compliance-check.py --fix                   # Auto-fix issues
    python3 compliance-check.py --json                  # JSON output
"""

import os
import sys
import re
import json
import glob
import yaml

HARNESS_ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")
HARNESS_ROOT = os.path.abspath(HARNESS_ROOT)

# Per-tool spec as defined in AGENTS.md Naming Conventions table
TOOL_SPECS = {
    "opencode": {
        "naming": "kebab",
        "allowed_tools_case": "lowercase",
        "dir_prefix": "opencode/skills/",
    },
    "claude": {
        "naming": "snake",
        "allowed_tools_case": "pascalcase",
        "dir_prefix": "claude/skills/",
    },
    "gemini": {
        "naming": "snake",
        "allowed_tools_case": "lowercase",
        "dir_prefix": "gemini/skills/",
    },
    "pi": {
        "naming": "kebab",
        "allowed_tools_case": "titlecase",
        "dir_prefix": "pi/agent/skills/",
    },
    "wocode": {
        "naming": "snake",
        "allowed_tools_case": "lowercase",
        "dir_prefix": "wocode/agent/skills/",
    },
    "antigravity": {
        "naming": "snake",
        "allowed_tools_case": "lowercase",
        "dir_prefix": "antigravity/skills/",
    },
    "codex": {
        "naming": "snake",
        "allowed_tools_case": "lowercase_snake",
        "dir_prefix": "codex/skills/",
    },
}


def check_naming_convention(dir_name: str, spec: dict) -> list[str]:
    errors = []
    naming = spec["naming"]
    if naming == "kebab":
        if not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", dir_name):
            errors.append(f"WRONG_NAMING_CONVENTION: '{dir_name}' should be kebab-case")
    elif naming == "snake":
        if not re.match(r"^[a-z0-9]+(_[a-z0-9]+)*$", dir_name):
            errors.append(f"WRONG_NAMING_CONVENTION: '{dir_name}' should be snake_case")
    return errors


def check_allowed_tools_case(tools: list[str], spec: dict) -> list[str]:
    errors = []
    expected_case = spec["allowed_tools_case"]
    for tool in tools:
        if expected_case == "lowercase" and tool != tool.lower():
            errors.append(f"WRONG_TOOL_CASE: '{tool}' should be lowercase")
        elif expected_case == "pascalcase" and tool != tool.capitalize():
            errors.append(f"WRONG_TOOL_CASE: '{tool}' should be PascalCase")
        elif expected_case == "titlecase" and tool != tool.title():
            errors.append(f"WRONG_TOOL_CASE: '{tool}' should be Title Case")
        elif expected_case == "lowercase_snake" and not re.match(r"^[a-z]+_[a-z]+$", tool):
            errors.append(f"WRONG_TOOL_CASE: '{tool}' should be lowercase_snake")
    return errors


def check_skill_file(skill_dir: str, tool: str, spec: dict) -> list[dict]:
    issues = []
    dir_name = os.path.basename(skill_dir)
    skill_path = os.path.join(skill_dir, "SKILL.md")

    if not os.path.exists(skill_path):
        issues.append({"file": skill_path, "code": "FILE_NOT_FOUND", "message": "SKILL.md not found"})
        return issues

    with open(skill_path) as f:
        content = f.read()

    # Parse frontmatter
    match = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
    if not match:
        issues.append({"file": skill_path, "code": "NO_FRONTMATTER", "message": "No YAML frontmatter found"})
        return issues

    try:
        fm = yaml.safe_load(match.group(1))
    except yaml.YAMLError as e:
        issues.append({"file": skill_path, "code": "YAML_ERROR", "message": str(e)})
        return issues

    if not isinstance(fm, dict):
        return issues

    # Check name matches directory
    name = fm.get("name", "")
    if name != dir_name:
        issues.append({
            "file": skill_path,
            "code": "NAME_MISMATCH",
            "message": f"name '{name}' != directory '{dir_name}'",
        })

    # Check naming convention
    naming_errors = check_naming_convention(dir_name, spec)
    for e in naming_errors:
        issues.append({"file": skill_path, "code": e.split(":")[0], "message": e})

    # Check allowed-tools casing
    tools = fm.get("allowed-tools", "")
    if isinstance(tools, str):
        tools = [t.strip() for t in tools.split(",") if t.strip()]
    if isinstance(tools, list):
        case_errors = check_allowed_tools_case(tools, spec)
        for e in case_errors:
            issues.append({"file": skill_path, "code": e.split(":")[0], "message": e})

    return issues


def main():
    args = sys.argv[1:]
    tool_filter = None
    fix_mode = "--fix" in args
    json_mode = "--json" in args

    for arg in args:
        if arg.startswith("--tool="):
            tool_filter = arg.split("=", 1)[1]

    tools_to_check = [tool_filter] if tool_filter else list(TOOL_SPECS.keys())
    all_issues = {}

    for tool in tools_to_check:
        if tool not in TOOL_SPECS:
            print(f"Unknown tool: {tool}")
            sys.exit(1)

        spec = TOOL_SPECS[tool]
        skills_glob = os.path.join(HARNESS_ROOT, spec["dir_prefix"], "*", "SKILL.md")
        skill_dirs = set(os.path.dirname(p) for p in glob.glob(skills_glob))

        tool_issues = []
        for skill_dir in sorted(skill_dirs):
            issues = check_skill_file(skill_dir, tool, spec)
            tool_issues.extend(issues)

        all_issues[tool] = tool_issues

    if json_mode:
        print(json.dumps(all_issues, indent=2))
    else:
        total = sum(len(v) for v in all_issues.values())
        for tool, issues in all_issues.items():
            status = "OK" if not issues else f"{len(issues)} issue(s)"
            print(f"{tool}: {status}")
            for issue in issues:
                print(f"  [{issue['code']}] {issue['file']}")
                print(f"    {issue['message']}")
        print(f"\nTotal: {total} issue(s) across {len(tools_to_check)} tool(s)")

    total_issues = sum(len(v) for v in all_issues.values())
    sys.exit(0 if total_issues == 0 else 1)


if __name__ == "__main__":
    main()
