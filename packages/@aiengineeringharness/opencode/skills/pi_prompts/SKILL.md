---
name: pi_prompts
description: Pi prompt templates expert — knows the single-file .md format, frontmatter, positional arguments ($1, $@, ${@:N}), discovery locations, and /template invocation. Use when the user wants to create or modify Pi prompt templates.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Pi prompt templates are single Markdown files that expand into full prompts. Filename becomes the command: `review.md` → `/review`.

### Format
```markdown
---
description: What this template does
---
Your prompt content here with $1 and $@ arguments
```

### Arguments
- `$1`, `$2`, ... — positional arguments
- `$@` or `$ARGUMENTS` — all arguments joined
- `${@:N}` — args from Nth position (1-indexed)
- `${@:N:L}` — L args starting at position N

### Locations
- Global: `~/.pi/agent/prompts/*.md`
- Project: `.pi/prompts/*.md`
- Packages: `prompts/` directory or `pi.prompts` in package.json
- CLI: `--prompt-template <path>`

### Usage
```
/review                           # Expands review.md
/component Button                 # Expands with argument
/component Button "click handler" # Multiple arguments
```

### Key Differences from Skills
- Single file, no directory structure
- No scripts, setup, or references
- Lightweight reusable prompts
