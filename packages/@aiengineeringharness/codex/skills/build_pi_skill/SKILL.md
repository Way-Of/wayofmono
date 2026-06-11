---
name: build_pi_skill
description: Pi skills expert — knows SKILL.md format, frontmatter fields, directory structure, validation rules, and skill command registration. Use when the user wants to create or modify Pi skills.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

Create Pi skills using the SKILL.md format.

## Format

```markdown
---
name: my-skill
description: What this skill does
allowed-tools: read grep find ls
---
Skill instructions and system prompt body here.
```

### Frontmatter Fields
- `name` (required): max 64 chars, lowercase a-z/0-9/hyphens, must match parent directory
- `description` (required): max 1024 chars, determines when agent loads the skill
- `allowed-tools` (optional): space-delimited pre-approved tools
- `disable-model-invocation` (optional): hide from system prompt, require `/skill:name`

### Directory Structure
```
my-skill/
├── SKILL.md       # Main skill definition
├── script.py      # Optional data/tools script
├── template.md    # Optional template
├── scripts/       # Optional helper scripts
├── references/    # Optional reference docs
└── assets/        # Optional assets
```

### Locations
- `~/.pi/agent/skills/` — global
- `.pi/skills/` — project
- Packages and settings.json

### Discovery
- Direct .md files in root
- Recursive SKILL.md under subdirs
- Progressive disclosure: only descriptions in system prompt, full content loaded on-demand

### Validation
- Name must match parent directory
- Character limits enforced
- Missing description = not loaded
