#!/usr/bin/env python3
"""
Consistency test for AI Engineering Harness tool configs.
Validates that all 7 tools have the same skills, commands, prompts, extensions, themes.
"""

import os
import sys
import yaml
from pathlib import Path

CONFIG_DIR = Path(__file__).parent.parent
TOOLS_DIR = CONFIG_DIR / "tools"

TOOLS = ["antigravity", "claude", "codex", "gemini", "opencode", "pi", "wocode"]

COMPONENT_TYPES = [
    "skill",
    "command",
    "prompt",
    "extension",
    "theme",
    "agent",
]

def load_tool_config(tool: str) -> dict:
    """Load a tool's YAML config and extract component keys by type."""
    path = TOOLS_DIR / f"{tool}.yaml"
    if not path.exists():
        return {}
    with open(path, 'r') as f:
        data = yaml.safe_load(f)
    return data.get("components", {})

def count_components(components: dict) -> dict:
    """Count component keys by prefix."""
    counts = {t: 0 for t in COMPONENT_TYPES}
    skill_names = set()
    for key in components.keys():
        for t in COMPONENT_TYPES:
            if key.startswith(f"{t}/"):
                counts[t] += 1
                if t == "skill":
                    skill_names.add(key[6:])  # strip "skill/"
    return {"counts": counts, "skill_names": skill_names}

def main():
    results = {}
    all_skill_names = {}
    
    for tool in TOOLS:
        comps = load_tool_config(tool)
        res = count_components(comps)
        results[tool] = res
        all_skill_names[tool] = res["skill_names"]
    
    # Print counts table
    print("\n=== Component Counts by Tool ===")
    header = f"{'Tool':<15} " + " ".join(f"{t:<10}" for t in COMPONENT_TYPES)
    print(header)
    print("-" * len(header))
    for tool in TOOLS:
        counts = results[tool]["counts"]
        row = f"{tool:<15} " + " ".join(f"{counts.get(t, 0):<10}" for t in COMPONENT_TYPES)
        print(row)
    
    # Skill comparison
    print("\n=== Skill Name Differences ===")
    ref_tool = "antigravity"  # baseline
    ref_skills = all_skill_names[ref_tool]
    print(f"Reference: {ref_tool} ({len(ref_skills)} skills)")
    
    for tool in TOOLS:
        if tool == ref_tool:
            continue
        skills = all_skill_names[tool]
        missing = ref_skills - skills
        extra = skills - ref_skills
        if missing or extra:
            print(f"\n{tool} vs {ref_tool}:")
            if missing:
                print(f"  Missing ({len(missing)}): {sorted(missing)}")
            if extra:
                print(f"  Extra   ({len(extra)}): {sorted(extra)}")
        else:
            print(f"{tool}: MATCH ({len(skills)} skills)")
    
    # Special check: pi and wocode should have themes + extensions
    print("\n=== Pi/Wocode Extras Check ===")
    for tool in ["pi", "wocode"]:
        counts = results[tool]["counts"]
        print(f"{tool}: themes={counts['theme']}, extensions={counts['extension']}, prompts={counts['prompt']}")
    
    # Check: other tools should NOT have themes/extensions
    print("\n=== Non-Pi/Wocode Theme/Extension Check ===")
    for tool in ["antigravity", "claude", "codex", "gemini", "opencode"]:
        counts = results[tool]["counts"]
        if counts['theme'] > 0 or counts['extension'] > 0:
            print(f"  WARNING: {tool} has themes={counts['theme']} extensions={counts['extension']} (should be 0)")
        else:
            print(f"  {tool}: OK (no themes/extensions)")
    
    # Check for duplicate skill names within a tool
    print("\n=== Duplicate Skill Check ===")
    for tool in TOOLS:
        comps = load_tool_config(tool)
        skill_keys = [k for k in comps.keys() if k.startswith("skill/")]
        skill_names = [k[6:] for k in skill_keys]
        dupes = {x for x in skill_names if skill_names.count(x) > 1}
        if dupes:
            print(f"  {tool}: DUPLICATES - {dupes}")
        else:
            print(f"  {tool}: OK")
    
    # Summary
    print("\n=== Summary ===")
    skill_counts = {t: results[t]["counts"]["skill"] for t in TOOLS}
    if len(set(skill_counts.values())) == 1:
        print(f"  All tools have same skill count: {list(skill_counts.values())[0]}")
    else:
        print(f"  Skill counts DIFFER: {skill_counts}")
    
    return results

if __name__ == "__main__":
    main()