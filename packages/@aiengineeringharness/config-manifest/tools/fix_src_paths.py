#!/usr/bin/env python3
"""Fix src paths in YAML files to match actual on-disk directory names."""

import os
import re
import yaml

BASE = "/home/zerwiz/wayofmono/packages/@aiengineeringharness"
TOOLS_DIR = os.path.join(BASE, "config-manifest", "tools")

# Define the expected naming convention per tool and the skills directory path
TOOL_CONFIG = {
    "wocode": {"convention": "kebab-case", "skills_dir": "wocode/agent/skills"},
    "pi": {"convention": "kebab-case", "skills_dir": "pi/agent/skills"},
    "antigravity": {"convention": "snake_case", "skills_dir": "antigravity/skills"},
    "codex": {"convention": "snake_case", "skills_dir": "codex/skills"},
    "claude": {"convention": "snake_case", "skills_dir": "claude/skills"},
    "opencode": {"convention": "kebab-case", "skills_dir": "opencode/skills"},
}

def kebab_to_snake(name):
    return name.replace("-", "_")

def snake_to_kebab(name):
    return name.replace("_", "-")

def get_actual_skills(base_path, skills_rel_dir):
    """Get the set of actual directory names on disk."""
    full_path = os.path.join(base_path, skills_rel_dir)
    if not os.path.isdir(full_path):
        return set()
    return {d for d in os.listdir(full_path) if os.path.isdir(os.path.join(full_path, d))}

def analyze_yaml(filepath):
    """Analyze a YAML file for src path mismatches."""
    with open(filepath) as f:
        content = f.read()
    
    data = yaml.safe_load(content)
    tool_name = data.get("name", "unknown")
    
    if tool_name not in TOOL_CONFIG:
        print(f"  SKIP: unknown tool '{tool_name}'")
        return []
    
    config = TOOL_CONFIG[tool_name]
    convention = config["convention"]
    skills_dir = config["skills_dir"]
    actual_dirs = get_actual_skills(BASE, skills_dir)
    
    fixes = []
    
    def walk(obj, path=""):
        if isinstance(obj, dict):
            for key, val in obj.items():
                walk(val, f"{path}.{key}" if path else key)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                walk(item, f"{path}[{i}]")
        elif isinstance(obj, str):
            # Check if this is a src path containing skills/ directory
            if skills_dir in obj and obj.startswith(skills_dir + "/"):
                # Extract the skill directory name (first path component after skills/...)
                rel = obj[len(skills_dir) + 1:]  # e.g., "auto-ticket-creator/SKILL.md"
                parts = rel.split("/")
                skill_dir_name = parts[0]  # e.g., "auto-ticket-creator"
                
                # Check if this skill dir actually exists on disk
                if skill_dir_name not in actual_dirs:
                    # Try the alternative naming convention
                    if convention == "snake_case":
                        alt_name = kebab_to_snake(skill_dir_name)
                        alt_path = os.path.join(BASE, skills_dir, alt_name)
                    else:
                        alt_name = snake_to_kebab(skill_dir_name)
                        alt_path = os.path.join(BASE, skills_dir, alt_name)
                    
                    if os.path.isdir(alt_path):
                        old_src = obj
                        new_src = obj.replace(skill_dir_name, alt_name, 1)
                        fixes.append((tool_name, old_src, new_src, skill_dir_name, alt_name))
    
    walk(data)
    return fixes

# Main
all_fixes = []
for yaml_file in sorted(os.listdir(TOOLS_DIR)):
    if not yaml_file.endswith(".yaml"):
        continue
    filepath = os.path.join(TOOLS_DIR, yaml_file)
    print(f"\n=== Analyzing {yaml_file} ===")
    fixes = analyze_yaml(filepath)
    all_fixes.extend(fixes)
    if not fixes:
        print("  No fixes needed.")
    for tool, old, new, old_name, new_name in fixes:
        print(f"  {old} -> {new}")

print(f"\n\nTotal fixes needed: {len(all_fixes)}")

# Now apply the fixes
if all_fixes:
    print("\n\n=== Applying Fixes ===")
    
    # Group fixes by file
    from collections import defaultdict
    fixes_by_file = defaultdict(list)
    for tool, old, new, old_name, new_name in all_fixes:
        yaml_file = f"{tool}.yaml"
        fixes_by_file[yaml_file].append((old, new))
    
    for yaml_file, fixes in sorted(fixes_by_file.items()):
        filepath = os.path.join(TOOLS_DIR, yaml_file)
        with open(filepath) as f:
            content = f.read()
        
        for old, new in fixes:
            count = content.count(old)
            if count > 0:
                content = content.replace(old, new)
                print(f"  {yaml_file}: replaced {count} occurrences of {old} -> {new}")
            else:
                print(f"  WARNING: '{old}' not found in {yaml_file}")
        
        with open(filepath, 'w') as f:
            f.write(content)
    
    print("\nAll fixes applied.")
else:
    print("\nNo fixes to apply.")
