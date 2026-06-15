#!/usr/bin/env python3
"""
Gemini CLI Skill Updater — gemini/skills

Ensures all skills use correct:
  - Directory naming: snake_case
  - name field: snake_case
  - allowed-tools casing: lowercase
  - allowed-tools format: comma_string
  - Frontmatter fields: name, description, allowed-tools

Usage:
    python3 scripts/gemini-skill-update.py --validate
    python3 scripts/gemini-skill-update.py --fix
    python3 scripts/gemini-skill-update.py --add <name> --desc "..."
    python3 scripts/gemini-skill-update.py --sync-yaml
    python3 scripts/gemini-skill-update.py --all
"""

import os, sys, re, json, yaml

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SKILL_DIR = os.path.join(REPO_ROOT, "gemini/skills")
CONFIG_YAML = os.path.join(REPO_ROOT, "config-manifest/tools/gemini.yaml")

TOOL_NAME = "Gemini CLI"
SKILL_FILE = "SKILL.md"
DUAL_FILE = None
DIR_CASE = "snake_case"
NAME_CASE = "snake_case"
TARGET_TOOLS_CASE = "lowercase"
TOOLS_FMT = "comma_string"
SUPPORTED_FIELDS = ['name', 'description', 'allowed-tools']
HAS_COMMANDS = False
COMMAND_DIR = "commands"
TOOLS_EXAMPLE = "read, write, bash"


def to_case(text, case):
    text = text.strip().lower()
    sep = "_" if case == "snake_case" else "-"
    text = re.sub(r"[\W_]+", sep, text)
    text = re.sub(sep + "{2,}", sep, text)
    text = text.strip(sep)
    return text


def parse_frontmatter(content):
    content = content.lstrip("\n")
    if not content.startswith("---"):
        return None, content
    end = content.find("---", 3)
    if end == -1:
        return None, content
    fm = content[3:end].strip()
    body = content[end+3:].strip()
    try:
        data = yaml.safe_load(fm)
        return data if isinstance(data, dict) else None, body
    except yaml.YAMLError:
        return None, body


def serialize_frontmatter(data):
    lines = ["---"]
    for key, value in data.items():
        if isinstance(value, list):
            lines.append(key + ":")
            for item in value:
                lines.append("  - " + str(item))
        elif isinstance(value, bool):
            lines.append(key + ": " + ("true" if value else "false"))
        elif value is None:
            continue
        else:
            lines.append(key + ": " + str(value))
    lines.append("---")
    return "\n".join(lines)


def find_skills():
    if not os.path.isdir(SKILL_DIR):
        print("  ERROR: Skill directory not found:", SKILL_DIR)
        return []
    skills = []
    for entry in sorted(os.listdir(SKILL_DIR)):
        skill_path = os.path.join(SKILL_DIR, entry)
        if not os.path.isdir(skill_path):
            continue
        skill = {"dir": entry, "path": skill_path}
        if DUAL_FILE:
            sf = os.path.join(skill_path, SKILL_FILE)
            pf = os.path.join(skill_path, DUAL_FILE)
            skill["skill_file"] = sf if os.path.isfile(sf) else None
            skill["prompt_file"] = pf if os.path.isfile(pf) else None
            skill["has_skill"] = os.path.isfile(sf)
            skill["has_prompt"] = os.path.isfile(pf)
        else:
            sf = os.path.join(skill_path, SKILL_FILE)
            skill["skill_file"] = sf if os.path.isfile(sf) else None
            skill["has_skill"] = os.path.isfile(sf)
        skills.append(skill)
    return skills


def validate_skill(skill):
    issues = []
    expected_dir = to_case(skill["dir"], DIR_CASE)
    if skill["dir"] != expected_dir:
        issues.append("DIR_NAMING: directory '" + skill["dir"] + "' should be '" + expected_dir + "'")
    if not skill["has_skill"]:
        issues.append("MISSING_FILE: no " + SKILL_FILE + " found")
        return issues
    with open(skill["skill_file"]) as f:
        content = f.read()
    fm_data, body = parse_frontmatter(content)
    if fm_data is None:
        issues.append("FM_PARSE: cannot parse YAML frontmatter")
        return issues
    name = fm_data.get("name", "")
    expected_name = to_case(name if name else skill["dir"], NAME_CASE)
    if name != expected_name:
        issues.append("NAME_MISMATCH: name '" + name + "' should be '" + expected_name + "'")
    for key in fm_data:
        if key not in SUPPORTED_FIELDS:
            issues.append("UNSUPPORTED: field '" + key + "' not supported")
    if "allowed-tools" in SUPPORTED_FIELDS and "allowed-tools" in fm_data:
        at = fm_data["allowed-tools"]
        if TOOLS_FMT == "yaml_list" and not isinstance(at, list):
            issues.append("TOOLS_FMT: allowed-tools should be YAML list, got " + type(at).__name__)
        elif TOOLS_FMT in ("comma_string", "space_string") and isinstance(at, list):
            issues.append("TOOLS_FMT: allowed-tools should be string, got list")
        if isinstance(at, str):
            for t in re.split(r"[\s,]+", at):
                if t:
                    if TARGET_TOOLS_CASE == "PascalCase" and not t[0].isupper():
                        issues.append("TOOLS_CASE: '" + t + "' should be PascalCase")
                    elif TARGET_TOOLS_CASE in ("lowercase", "lowercase_snake") and t != t.lower():
                        issues.append("TOOLS_CASE: '" + t + "' should be lowercase")
        elif isinstance(at, list):
            for t in at:
                if TARGET_TOOLS_CASE == "PascalCase" and not t[0].isupper():
                    issues.append("TOOLS_CASE: '" + t + "' should be PascalCase")
                elif TARGET_TOOLS_CASE in ("lowercase", "lowercase_snake") and t != t.lower():
                    issues.append("TOOLS_CASE: '" + t + "' should be lowercase")
    dmi = fm_data.get("disable-model-invocation", False)
    if dmi and "disable-model-invocation" not in SUPPORTED_FIELDS:
        issues.append("DMI_UNSUPPORTED: disable-model-invocation not supported")
    if DUAL_FILE and not skill.get("has_prompt"):
        issues.append("MISSING_PROMPT: missing prompt.md for dual-file skill")
    return issues


def fix_skill(skill, dry_run=False):
    if not skill["has_skill"]:
        return False
    with open(skill["skill_file"]) as f:
        content = f.read()
    fm_data, body = parse_frontmatter(content)
    if fm_data is None:
        return False
    changed = False
    name = fm_data.get("name", "")
    expected_name = to_case(name if name else skill["dir"], NAME_CASE)
    if name != expected_name:
        fm_data["name"] = expected_name
        changed = True
    at = fm_data.get("allowed-tools", None)
    if at is not None:
        if TOOLS_FMT == "yaml_list" and isinstance(at, str):
            tools = [t.strip().lower() for t in re.split(r"[\s,]+", at) if t.strip()]
            if TARGET_TOOLS_CASE == "PascalCase":
                tools = [t.capitalize() for t in tools]
            fm_data["allowed-tools"] = tools
            changed = True
        elif TOOLS_FMT in ("comma_string", "space_string") and isinstance(at, list):
            sep = ", " if TOOLS_FMT == "comma_string" else " "
            tools = [t.strip().lower() for t in at]
            if TARGET_TOOLS_CASE == "PascalCase":
                tools = [t.capitalize() for t in tools]
            fm_data["allowed-tools"] = sep.join(tools)
            changed = True
        elif isinstance(at, str):
            tools = [t.strip() for t in re.split(r"[\s,]+", at) if t.strip()]
            fixed = []
            for t in tools:
                if TARGET_TOOLS_CASE == "PascalCase":
                    fixed.append(t.capitalize())
                elif TARGET_TOOLS_CASE in ("lowercase", "lowercase_snake"):
                    fixed.append(t.lower())
                else:
                    fixed.append(t)
            sep = ", " if TOOLS_FMT == "comma_string" else " "
            new_at = sep.join(fixed)
            if new_at != at:
                fm_data["allowed-tools"] = new_at
                changed = True
    for key in list(fm_data.keys()):
        if key not in SUPPORTED_FIELDS and key != "name":
            del fm_data[key]
            changed = True
    if changed and not dry_run:
        new_content = serialize_frontmatter(fm_data) + "\n\n" + body + "\n"
        with open(skill["skill_file"], "w") as f:
            f.write(new_content)
    return changed


def cmd_validate(fix=False):
    skills = find_skills()
    if not skills:
        print("  No skills found.")
        return True
    all_ok = True
    fixed = 0
    for skill in skills:
        issues = validate_skill(skill)
        if issues:
            print("  [ISSUES] " + skill["dir"] + ":")
            for i in issues:
                print("           " + i)
            all_ok = False
            if fix and fix_skill(skill):
                fixed += 1
                print("           -> Fixed")
        else:
            if fix and fix_skill(skill):
                fixed += 1
                print("  [FIXED]  " + skill["dir"])
    total = len(skills)
    ok_count = sum(1 for s in skills if not validate_skill(s))
    print(f"\n  {TOOL_NAME}: {total} skills, {ok_count} ok, {total - ok_count} with issues")
    if fix:
        print(f"  Auto-fixed: {fixed}")
    return all_ok


def cmd_add(name, description=""):
    dir_name = to_case(name, DIR_CASE)
    skill_path = os.path.join(SKILL_DIR, dir_name)
    if os.path.exists(skill_path):
        print("  ERROR: Directory exists:", skill_path)
        return False
    skill_name = to_case(name, NAME_CASE)
    desc = description or (name + " skill for " + TOOL_NAME)
    os.makedirs(skill_path)
    if DUAL_FILE:
        data = {"name": skill_name, "description": desc, "tools": ["read", "write", "bash"]}
        with open(os.path.join(skill_path, SKILL_FILE), "w") as f:
            f.write(yaml.dump(data, default_flow_style=False))
        with open(os.path.join(skill_path, DUAL_FILE), "w") as f:
            f.write("# " + skill_name + "\n\n" + desc + "\n")
    else:
        fm = {"name": skill_name, "description": desc, "allowed-tools": TOOLS_EXAMPLE}
        content = serialize_frontmatter(fm) + "\n\n# " + skill_name + "\n\n" + desc + "\n"
        with open(os.path.join(skill_path, SKILL_FILE), "w") as f:
            f.write(content)
    print("  Created:", skill_path)
    return True


def cmd_sync_yaml():
    if not os.path.isfile(CONFIG_YAML):
        print("  ERROR: Config YAML not found:", CONFIG_YAML)
        return False
    with open(CONFIG_YAML) as f:
        config = yaml.safe_load(f)
    if config is None:
        return False
    skills_on_disk = set()
    for entry in os.listdir(SKILL_DIR):
        if os.path.isdir(os.path.join(SKILL_DIR, entry)):
            sf = os.path.join(SKILL_DIR, entry, SKILL_FILE)
            if DUAL_FILE:
                pf = os.path.join(SKILL_DIR, entry, DUAL_FILE)
                if os.path.isfile(sf) or os.path.isfile(pf):
                    skills_on_disk.add(entry)
            elif os.path.isfile(sf):
                skills_on_disk.add(entry)
    components = config.get("components", {})
    yaml_skills = set()
    prefix = "gemini/skills/"
    for key, comp in components.items():
        src = comp.get("src", "") if isinstance(comp, dict) else ""
        if src.startswith(prefix):
            yaml_skills.add(key)
    added = skills_on_disk - yaml_skills
    removed = yaml_skills - skills_on_disk
    if removed:
        print("  In YAML but not on disk (" + str(len(removed)) + "): " + ", ".join(sorted(removed)))
    if added:
        print("  On disk but not in YAML (" + str(len(added)) + "): " + ", ".join(sorted(added)))
    if not added and not removed:
        print("  In sync: " + str(len(yaml_skills)) + " skills")
    return len(added) == 0 and len(removed) == 0


def print_help():
    print("Gemini CLI Skill Updater")
    print("Usage:")
    print(f"  python3 scripts/gemini-skill-update.py --validate    Validate all skills")
    print(f"  python3 scripts/gemini-skill-update.py --fix         Auto-fix issues")
    print(f"  python3 scripts/gemini-skill-update.py --add NAME    Scaffold new skill")
    print(f"  python3 scripts/gemini-skill-update.py --sync-yaml   Sync YAML config")
    print(f"  python3 scripts/gemini-skill-update.py --all         Fix + sync-yaml")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or "--help" in args or "-h" in args:
        print_help()
        sys.exit(0)
    if "--validate" in args:
        ok = cmd_validate(fix=False)
        sys.exit(0 if ok else 1)
    elif "--fix" in args:
        ok = cmd_validate(fix=True)
        sys.exit(0 if ok else 1)
    elif "--add" in args:
        idx = args.index("--add")
        if idx + 1 >= len(args):
            print("ERROR: --add requires a name argument")
            sys.exit(1)
        name = args[idx + 1]
        desc = ""
        if "--desc" in args:
            didx = args.index("--desc")
            if didx + 1 < len(args):
                desc = args[didx + 1]
        ok = cmd_add(name, desc)
        sys.exit(0 if ok else 1)
    elif "--sync-yaml" in args:
        ok = cmd_sync_yaml()
        sys.exit(0 if ok else 1)
    elif "--all" in args:
        print(f"=== {TOOL_NAME}: --all (fix + sync-yaml) ===")
        ok1 = cmd_validate(fix=True)
        ok2 = cmd_sync_yaml()
        sys.exit(0 if ok1 and ok2 else 1)
    else:
        print("Unknown args:", args)
        print_help()
        sys.exit(1)
