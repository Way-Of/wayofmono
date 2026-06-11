---
name: build_claude_skill
description: Build Claude Code skills — knows SKILL.md format, frontmatter config flags, folder structure, validation parameters, and manual vs automatic invocation settings. Use when the user wants to create or modify Claude Code skills.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

# Building Claude Code Skills

Skills are repeatable workflows packaged into directories. A skill is discovered, registered as a slash command, and executed by Claude Code.

---

## 1. Skill Format (`SKILL.md`)
The core behavior of a skill is defined in a Markdown file with YAML frontmatter.

```markdown
---
name: my_skill
description: Performs custom validation of API routes.
docs-url: https://code.claude.com/docs/en/
allowed-tools: read grep find
disable-model-invocation: true
---
# Skill Execution Instructions
1. Run the search command to find API routes.
2. Read the source files to verify endpoints.
```

### Frontmatter Fields
- `name` (required): Max 64 characters, lowercase alphanumeric/underscores/hyphens. Must match its parent directory name.
- `description` (required): Max 1024 characters. Clear description of what the skill does, helping the model determine when to load it.
- `allowed-tools` (optional): Space-delimited list of pre-approved execution tools.
- `disable-model-invocation` (optional): If set to `true`, the model cannot trigger this skill automatically during a conversation. It can only be invoked manually by the user via `/skill:my_skill` or `/my_skill`.

---

## 2. Directory Structure
A skill resides in its own folder under a configuration path:
```
my_skill/
├── SKILL.md       # Main skill instructions and system prompt
├── script.py      # Optional helper script or data builder
└── references/    # Optional reference documents or files
```

### Locations
- **Project Specific**: `.claude/skills/`
- **Global**: `~/.claude/skills/`

---

## 3. Skill Validation Rules
1. The `name` frontmatter field must exactly match the parent folder name.
2. The folder name and name field must use `snake_case` or kebab-case.
3. If the `description` is missing or blank, the skill loader will reject it and it won't be registered.
