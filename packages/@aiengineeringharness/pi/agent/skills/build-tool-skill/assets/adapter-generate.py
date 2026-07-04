#!/usr/bin/env python3
"""
Platform adapter generator for canonical skills.
Migrated from skill-adapter.

Generates per-tool skill directories from the canonical source at
packages/@aiengineeringharness/skills/<skill>/ for each of the 7 AI tools.

Usage:
    python3 adapter-generate.py                          # Generate all skills for all tools
    python3 adapter-generate.py --skill=example-skill     # Single skill
    python3 adapter-generate.py --tool=opencode           # Single tool
    python3 adapter-generate.py --dry-run                 # Preview only
"""

import os
import sys
import shutil

HARNESS_ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")
HARNESS_ROOT = os.path.abspath(HARNESS_ROOT)
CANONICAL_DIR = os.path.join(HARNESS_ROOT, "skills")

# Per-tool path mapping: (directory_prefix, naming_transform)
TOOL_PATHS = {
    "opencode": ("opencode/skills", lambda n: n),                    # kebab → kebab
    "claude": ("claude/skills", lambda n: n.replace("-", "_")),     # kebab → snake
    "gemini": ("gemini/skills", lambda n: n.replace("-", "_")),     # kebab → snake
    "pi": ("pi/agent/skills", lambda n: n),                          # kebab → kebab
    "wocode": ("wocode/agent/skills", lambda n: n),                          # kebab → kebab
    "codex": ("codex/skills", lambda n: n.replace("-", "_")),       # kebab → snake
    "antigravity": ("antigravity/skills", lambda n: n.replace("-", "_")), # kebab → snake
}

SKIP_SKILLS = {"README.md"}


def generate(tool_filter=None, skill_filter=None, dry_run=False):
    if not os.path.isdir(CANONICAL_DIR):
        print(f"Canonical skills directory not found: {CANONICAL_DIR}")
        sys.exit(1)

    skills = sorted(d for d in os.listdir(CANONICAL_DIR)
                    if os.path.isdir(os.path.join(CANONICAL_DIR, d)) and d not in SKIP_SKILLS)

    if skill_filter:
        skills = [s for s in skills if s == skill_filter]

    tools = list(TOOL_PATHS.keys())
    if tool_filter:
        tools = [t for t in tools if t == tool_filter]

    for skill in skills:
        canonical_skill = os.path.join(CANONICAL_DIR, skill)
        for tool in tools:
            prefix, transform = TOOL_PATHS[tool]
            dir_name = transform(skill)
            target_dir = os.path.join(HARNESS_ROOT, prefix, dir_name)
            target_skill = os.path.join(target_dir, "SKILL.md")

            action = "update" if os.path.exists(target_skill) else "create"
            if dry_run:
                print(f"[{tool}] {action} {prefix}/{dir_name}/SKILL.md")
                continue

            os.makedirs(target_dir, exist_ok=True)
            os.makedirs(os.path.join(target_dir, "assets"), exist_ok=True)
            os.makedirs(os.path.join(target_dir, "platform"), exist_ok=True)

            shutil.copy2(os.path.join(canonical_skill, "SKILL.md"),
                         os.path.join(target_dir, "SKILL.md"))

            # Copy assets/
            src_assets = os.path.join(canonical_skill, "assets")
            if os.path.isdir(src_assets):
                for f in os.listdir(src_assets):
                    shutil.copy2(os.path.join(src_assets, f),
                                 os.path.join(target_dir, "assets", f))

            print(f"[{tool}] {action} {prefix}/{dir_name}/ ({'updated' if action == 'update' else 'created'})")


def main():
    args = sys.argv[1:]
    tool_filter = None
    skill_filter = None
    dry_run = "--dry-run" in args

    for arg in args:
        if arg.startswith("--tool="):
            tool_filter = arg.split("=", 1)[1]
        elif arg.startswith("--skill="):
            skill_filter = arg.split("=", 1)[1]

    generate(tool_filter, skill_filter, dry_run)


if __name__ == "__main__":
    main()
