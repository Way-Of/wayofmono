---
name: build-tool-skill
description: Build skills for all 7 AI coding tools — knows SKILL.md format, frontmatter, naming conventions, allowed-tools casing, and directory rules.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - WebFetch
  - WebSearch
---

# build_tool_skill — Unified Skill Builder

You are a cross-tool Skill builder. You know how to create Skill definitions for ALL 7 AI coding tools. Load this Skill when the user wants to create or modify a Skill for any tool.

## Tool Format Reference

### OpenCode
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name, regex `^[a-z0-9]+(-[a-z0-9]+)*$`
- **allowed-tools**: lowercase (`Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch, Question, todowrite, Skill`)
- **Config**: `~/.config/opencode/skills/`
- **Docs**: https://opencode.ai/docs/

### Claude Code
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: PascalCase (`Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch, Web`)
- **Config**: `~/.claude/skills/`
- **Docs**: https://code.claude.com/docs/en/overview

### Gemini CLI
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: lowercase (`Read, Write, Bash, Glob, Grep, web, code`)
- **Config**: `~/.gemini/skills/`
- **Docs**: https://cloud.google.com/gemini-cli/docs

### Pi
- **Directory naming**: kebab-case
- **Name field**: kebab-case, matches directory name
- **allowed-tools**: PascalCase (`Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch`)
- **Config**: `~/.pi/agent/skills/`
- **Docs**: https://pi.dev/

### Antigravity
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: lowercase (`Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch`)
- **Config**: `~/.antigravity/skills/`
- **Docs**: https://antigravity.sh/docs

### Codex
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **Format**: Skill.yaml + prompt.md (two files per Skill)
- **allowed-tools**: lowercase (`read_file, write_file, run_shell_command, Glob, Grep`)
- **Config**: `~/.codex/skills/`
- **Docs**: https://github.com/openai/codex

### Wo Coder
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: PascalCase (`Read, Write, Edit, Bash, Grep, Glob`)
- **Config**: `~/.wocoder/skills/`
- **Docs**: Internal (WayOfMono monorepo)

## Skill Formats Per Tool

### OpenCode / Claude / Antigravity / Wo Coder
- Format: Markdown with YAML frontmatter
- Required fields: `name`, `description`, `allowed-tools` (optional)
- Location: `skills/` directory
- Auto-trigger: via frontmatter `on` keywords or name matching

### Pi
- Format: Markdown with YAML frontmatter
- Required fields: `name` (kebab-case), `description`, `allowed-tools`, `tools` (alias)
- Location: `skills/` directory
- Also serves as subagent delegation targets

### Gemini CLI
- Format: TOML files
- Location: `skills/` directory
- Fields match TOML schema

### Codex
- Format: Two files per Skill - `Skill.yaml` (metadata) + `prompt.md` (instructions)
- Location: `skills/` directory

## Allowed Frontmatter Fields Per Tool

| Tool | Required | Optional | Forbidden |
|------|----------|----------|-----------|
| OpenCode | name, description | allowed-tools, docs-url, disable-model-invocation, on | All others |
| Claude | name, description | allowed-tools, disable-model-invocation, on | All others |
| Gemini | name, description | allowed-tools, disable-model-invocation, on | All others |
| Pi | name, description, allowed-tools/tools | docs-url, disable-model-invocation, on | All others |
| Antigravity | name, description | allowed-tools, docs-url, disable-model-invocation, on | All others |
| Codex | name, description (in Skill.yaml) | allowed-tools, docs-url, disable-model-invocation, on | All others |
| Wo Coder | name, description | allowed-tools, docs-url, disable-model-invocation, on | All others |

## Generation Workflow

1. **Identify target tool** — Ask user which of 7 tools the Skill is for
2. **Fetch latest docs** — Read `thoughts/global/docs/ai-coding-tools/<tool>.md` AND fetch official docs URL
3. **Determine naming** — snake_case or kebab-case per tool
4. **Set allowed-tools** — Must match per-tool casing exactly
5. **Validate frontmatter** — Only include fields supported by target tool
6. **Write to correct directory** — Place in harness dir or user config dir per tool
7. **Run compliance check** — `deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts` to validate

## Online Sources

Always fetch the latest docs before building:
- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Gemini CLI: https://cloud.google.com/gemini-cli/docs
- Pi: https://pi.dev/
- Antigravity: https://antigravity.sh/docs
- Codex: https://github.com/openai/codex
- Wo Coder: packages/@wayofmono/wo-agent/