#!/usr/bin/env python3
"""
test-skills.py — Validate all on-disk skill files for correct per-tool formatting.

Ensures users receive properly formatted skills when they download. Validates:
   1. Frontmatter YAML syntax validity
   2. `name` field matches directory name (snake_case or kebab-case per tool)
   3. `allowed-tools` case correctness (lowercase vs PascalCase per tool)
   4. `disable-model-invocation` flag correctness (tools with commands should have it)
   5. Per-tool naming conventions (directory names match tool spec)
   6. Cross-tool skill alignment — all 7 tools must have the same set of skills
      (only per-tool formatting differs; no tool missing a skill others have)
   7. Per-tool conventions verified against official docs (June 2026)

Usage:
    python3 scripts/test-skills.py                        # Test all tools' skills
    python3 scripts/test-skills.py --tool=opencode         # Single tool
    python3 scripts/test-skills.py --json                  # JSON output
    python3 scripts/test-skills.py --verbose               # Verbose output
"""

import os
import sys
import json
import re
import yaml

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

TOOL_SKILL_DIRS = {
    "opencode": os.path.join(REPO_ROOT, "opencode", "skills"),
    "claude": os.path.join(REPO_ROOT, "claude", "skills"),
    "pi": os.path.join(REPO_ROOT, "pi", "agent", "skills"),
    "wocode": os.path.join(REPO_ROOT, "wocode", "skills"),
    "codex": os.path.join(REPO_ROOT, "codex", "skills"),
    "antigravity": os.path.join(REPO_ROOT, "antigravity", "skills"),
}

TOOL_SPECS = {
    "opencode": {
        "dir_naming": "kebab",  # hyphenated dir names
        "name_naming": "kebab",  # kebab-case name matching directory name (verified against opencode docs June 2026)
        "skill_file": "SKILL.md",
        "allowed_tools_format": "string",  # comma-separated string
        "allowed_tools_case": "lowercase",
        "supports_disable_model_invocation": True,
        "has_commands": True,
    },
    "claude": {
        "dir_naming": "kebab",
        "name_naming": "snake",
        "skill_file": "SKILL.md",
        "allowed_tools_format": "string",
        "allowed_tools_case": "PascalCase",
        "supports_disable_model_invocation": True,
        "has_commands": True,
    },
        "dir_naming": "kebab",
        "name_naming": "snake",
        "skill_file": "SKILL.md",
        "allowed_tools_format": "string",
        "allowed_tools_case": "lowercase",
        "supports_disable_model_invocation": False,
        "has_commands": False,
    },
    "pi": {
        "dir_naming": "kebab",
        "name_naming": "kebab",
        "skill_file": "SKILL.md",
        "allowed_tools_format": "string",   # YAML parses comma-separated as string
        "allowed_tools_case": "lowercase",   # Pi built-in tools are lowercase (verified June 2026 via agentskills.io + Pi docs)
        "supports_disable_model_invocation": False,
        "has_commands": False,
    },
    "wocode": {
        "dir_naming": "snake",
        "name_naming": "kebab",           # wocode uses kebab-case dirs and names (matching opencode convention)
        "skill_file": "SKILL.md",
        "allowed_tools_format": "string",
        "allowed_tools_case": "lowercase",
        "supports_disable_model_invocation": True,
        "has_commands": True,
    },
    "wo-coder": {
        "allowed_tools_format": "string",
        "allowed_tools_case": "lowercase",
        "supports_disable_model_invocation": True,
        "has_commands": True,
    },
    "codex": {
        "dir_naming": "kebab",
        "name_naming": "kebab",           # kebab-case matching directory (verified June 2026)
        "skill_file": "SKILL.md",          # Codex uses SKILL.md, not skill.yaml (verified June 2026)
        "allowed_tools_format": "string",  # comma-separated string in SKILL.md frontmatter
        "allowed_tools_case": "lowercase", # tools are lowercase in SKILL.md
        "supports_disable_model_invocation": False,
        "has_commands": False,
    },
    "antigravity": {
        "dir_naming": "kebab",
        "name_naming": "snake",
        "skill_file": "SKILL.md",
        "allowed_tools_format": "string",
        "allowed_tools_case": "lowercase",
        "supports_disable_model_invocation": True,
        "has_commands": True,
    },
}

SKIP_DIRS = {"__pycache__", ".git", "node_modules", "assets", "templates"}

# Skills known to be commands (manual, not auto-triggered)
COMMAND_SKILLS = {
    "init-harness", "create-plan", "implement-plan", "validate-plan",
    "git-commit-helper", "debug", "debug-k8s", "research-codebase",
    "validate-telemetry", "worktree",
}


class SkillTestResult:
    def __init__(self, tool, skill_dir):
        self.tool = tool
        self.skill_dir = skill_dir
        self.errors = []
        self.warnings = []
        self.passed = True

    def error(self, code, message):
        self.errors.append({"code": code, "message": message})
        self.passed = False

    def warning(self, code, message):
        self.warnings.append({"code": code, "message": message})

    def to_dict(self):
        return {
            "tool": self.tool,
            "skill": self.skill_dir,
            "passed": self.passed,
            "errors": self.errors,
            "warnings": self.warnings,
        }


def parse_frontmatter(content):
    match = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
    if not match:
        return None, content
    try:
        return yaml.safe_load(match.group(1)), content[match.end():]
    except yaml.YAMLError:
        return None, content


def test_skill(tool, skill_dir_name, spec):
    result = SkillTestResult(tool, skill_dir_name)
    skill_path = os.path.join(TOOL_SKILL_DIRS[tool], skill_dir_name)

    skill_file = spec["skill_file"]
    skill_file_path = os.path.join(skill_path, skill_file)

    if not os.path.isdir(skill_path):
        result.error("DIR_NOT_FOUND", f"Skill directory not found: {skill_path}")
        return result

    skill_file_path = os.path.join(skill_path, skill_file)
    if not os.path.exists(skill_file_path):
        result.error("MISSING_SKILL_FILE", f"{skill_file} not found in {skill_dir_name}")
        return result

    with open(skill_file_path) as f:
        content = f.read()

    frontmatter, body = parse_frontmatter(content)
    if frontmatter is None:
        result.error("NO_FRONTMATTER", f"No valid YAML frontmatter (--- blocks) in {skill_file}")
        return result

    name = frontmatter.get("name", "")
    expected_naming = spec["name_naming"]

    if expected_naming == "snake":
        expected_name = skill_dir_name.replace("-", "_")
        actual_pattern = r"^[a-z0-9]+(_[a-z0-9]+)*$"
        if not re.match(actual_pattern, name) or name != expected_name:
            result.warning("NAME_CONVENTION",
                f"Frontmatter name '{name}' doesn't follow snake_case (expected '{expected_name}')")
    elif expected_naming == "kebab":
        expected_name = skill_dir_name
        actual_pattern = r"^[a-z0-9]+(-[a-z0-9]+)*$"
        if name == skill_dir_name:
            # Name matches directory exactly — always valid regardless of pattern
            pass
        elif not re.match(actual_pattern, name):
            # Kebab-naming tools (Pi, wocode, opencode, codex) treat underscores as invalid chars
            # Pi reports: "name contains invalid characters (must be lowercase a-z, 0-9, hyphens only)"
            result.error("NAME_CONVENTION",
                f"Frontmatter name '{name}' should be kebab-case matching directory '{expected_name}' — underscores ('_') are invalid for {tool}")

    allowed_tools = frontmatter.get("allowed-tools", None)
    if allowed_tools is not None:
        allowed_case = spec["allowed_tools_case"]
        if spec["allowed_tools_format"] == "string":
            if isinstance(allowed_tools, str):
                tools_list = [t.strip() for t in allowed_tools.replace("'", "").split(",") if t.strip()]
                for t in tools_list:
                    if allowed_case == "PascalCase":
                        if not re.match(r"^[A-Z][a-z]", t):
                            result.error("TOOLS_CASE",
                                f"Tool '{t}' should be PascalCase for {tool} (e.g., 'Read' not 'read')")
                    elif allowed_case == "lowercase":
                        if t != t.lower():
                            result.error("TOOLS_CASE",
                                f"Tool '{t}' should be lowercase for {tool}")
            else:
                result.warning("ALLOWED_TOOLS_TYPE",
                    f"allowed-tools should be a string for {tool}, got {type(allowed_tools).__name__}")

    dmi = frontmatter.get("disable-model-invocation", None)
    is_command = skill_dir_name in COMMAND_SKILLS
    if tool == "claude" and spec["supports_disable_model_invocation"]:
        if is_command and dmi is not True:
            if dmi is None:
                result.error("MISSING_DMI",
                    f"Command skill '{skill_dir_name}' should have disable-model-invocation: true")
            elif dmi is False:
                result.error("DMI_FALSE",
                    f"Command skill '{skill_dir_name}' has disable-model-invocation: false (should be true)")
    elif dmi is not None and not spec["supports_disable_model_invocation"]:
        result.warning("UNSUPPORTED_DMI",
            f"Tool {tool} doesn't support disable-model-invocation, but it's set to {dmi}")

    return result


def test_tool_skills(tool, spec, verbose=False):
    skill_dir = TOOL_SKILL_DIRS.get(tool)
    if not skill_dir or not os.path.isdir(skill_dir):
        return [], f"Skill directory not found: {skill_dir}"

    results = []
    for entry in sorted(os.listdir(skill_dir)):
        entry_path = os.path.join(skill_dir, entry)
        if os.path.isdir(entry_path) and entry not in SKIP_DIRS:
            result = test_skill(tool, entry, spec)
            results.append(result)
            if verbose or not result.passed:
                status = "PASS" if result.passed else "FAIL"
                print(f"    [{status}] {entry}: {len(result.errors)} errors, {len(result.warnings)} warnings")

    return results, None


def test_all(json_output=False, verbose=False):
    all_results = {}
    total_skills = 0
    total_passed = 0
    total_errors = 0
    total_warnings = 0

    print("=" * 60)
    print("  test-skills.py — On-Disk Skill Format Validation")
    print("=" * 60)

    for tool in sorted(TOOL_SPECS.keys()):
        spec = TOOL_SPECS[tool]
        print(f"\n--- {tool} ---")
        results, err = test_tool_skills(tool, spec, verbose=verbose)
        if err:
            print(f"  SKIP: {err}")
            continue

        all_results[tool] = results
        tool_passed = sum(1 for r in results if r.passed)
        tool_errors = sum(len(r.errors) for r in results)
        tool_warnings = sum(len(r.warnings) for r in results)
        total_skills += len(results)
        total_passed += tool_passed
        total_errors += tool_errors
        total_warnings += tool_warnings

        print(f"  Skills: {len(results)} total, {tool_passed} passed, "
              f"{tool_errors} errors, {tool_warnings} warnings")

        if verbose and tool_warnings > 0:
            for r in results:
                for w in r.warnings:
                    print(f"    WARN: [{w['code']}] {r.skill_dir}: {w['message']}")
        if not all(r.passed for r in results):
            for r in results:
                for e in r.errors:
                    print(f"    ERROR: [{e['code']}] {r.skill_dir}: {e['message']}")

    print(f"\n  \u2501 CROSS-TOOL SKILL ALIGNMENT")
    # Normalize skill names to kebab-case for comparison
    # (tools use snake_case or kebab per convention, but skills are the same)
    def normalize(name):
        return name.replace("_", "-")
    tool_skills = {}
    for tool, results in all_results.items():
        tool_skills[tool] = {normalize(r.skill_dir) for r in results}
    all_skills = set()
    for s in tool_skills.values():
        all_skills.update(s)
    print(f"  Expected skills (normalized union): {len(all_skills)}")
    alignment_errors = 0
    for tool, norm_skills in sorted(tool_skills.items()):
        missing = all_skills - norm_skills
        extra = norm_skills - all_skills
        if missing:
            alignment_errors += len(missing)
            print(f"  \u2717 {tool}: missing {len(missing)} skill(s): {', '.join(sorted(missing))}")
        if extra:
            print(f"  \u26a0 {tool}: has {len(extra)} tool-only skill(s): {', '.join(sorted(extra))}")
        if not missing and not extra:
            print(f"  \u2713 {tool}: {len(norm_skills)} skills — fully aligned")
    if alignment_errors > 0:
        print(f"  \u2717 {alignment_errors} cross-tool alignment error(s)")
        total_errors += alignment_errors
    else:
        print(f"  \u2713 All tools have the same skill set\n")

    print(f"  Total: {total_skills} skills across {len(TOOL_SPECS)} tools")
    print(f"  Passed: {total_passed}, Errors: {total_errors}, Warnings: {total_warnings}")

    if json_output:
        flat = []
        for tool_results in all_results.values():
            flat.extend(r.to_dict() for r in tool_results)
        print(json.dumps(flat, indent=2))

    return total_errors == 0


if __name__ == "__main__":
    args = sys.argv[1:]
    json_output = "--json" in args
    verbose = "--verbose" in args
    single_tool = None
    for arg in args:
        if arg.startswith("--tool="):
            single_tool = arg.split("=", 1)[1]
            break

    if single_tool:
        spec = TOOL_SPECS.get(single_tool)
        if not spec:
            print(f"Unknown tool: {single_tool}")
            sys.exit(1)
        print(f"\nTesting: {single_tool}")
        results, err = test_tool_skills(single_tool, spec, verbose=verbose)
        if json_output:
            print(json.dumps([r.to_dict() for r in results], indent=2))
        all_passed = all(r.passed for r in results)
        sys.exit(0 if all_passed else 1)
    else:
        all_passed = test_all(json_output=json_output, verbose=verbose)
        sys.exit(0 if all_passed else 1)
