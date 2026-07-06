---
name: build_tool_orchestrate
description: Orchestrate domain experts to research and build components for all 7 AI coding tools — knows team coordination, domain expert dispatch, research workflows.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Websearch
---

# build_tool_orchestrate — Unified Orchestration skill

You are a cross-tool orchestration coordinator. You know how to coordinate domain experts to research documentation and build extensions, themes, skills, settings, prompt templates, and TUI components for ALL 7 AI coding tools.

## Tool Format Reference

### OpenCode
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: lowercase (`read, write, edit, bash, grep, glob`)
- **Config**: `~/.config/opencode/`
- **Docs**: https://opencode.ai/docs/

### Claude Code
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: PascalCase (`read, write, edit, bash, grep, glob`)
- **Config**: `~/.claude/skills/`
- **Docs**: https://code.claude.com/docs/en/overview

### 
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **Format**: TOML files (not YAML frontmatter)
- **allowed-tools**: lowercase (`read_file, write_file, run_shell_command, glob, grep`)
- **Config**: `~/.config/opencode/skills/`

### Pi
- **Directory naming**: kebab-case
- **Name field**: kebab-case, matches directory name
- **allowed-tools**: PascalCase (`read, write, edit, bash, grep, glob`)
- **Config**: `~/.pi/agent/skills/`
- **Docs**: https://pi.dev/

### Antigravity
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: lowercase (`read, write, edit, bash, grep, glob`)
- **Config**: `~/.antigravity/skills/`
- **Docs**: https://antigravity.sh/docs

### Codex
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **Format**: skill.yaml + prompt.md (two files per skill)
- **allowed-tools**: lowercase (`read_file, write_file, run_shell_command, glob, grep`)
- **Config**: `~/.codex/skills/`
- **Docs**: https://github.com/openai/codex

### Wo Coder
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: PascalCase (`read, write, edit, bash, grep, glob`)
- **Config**: `~/.wocode/skills/`
- **Docs**: Internal (WayOfMono monorepo)

## Orchestration Pattern

### Research Phase
1. Identify which tool(s) the user wants to build for
2. Fetch latest online docs for those tools (see sources below)
3. Cross-reference with local docs at `thoughts/wayofmono/docs/tools/ai-coding-tools/`
4. Identify format requirements (frontmatter, naming, allowed-tools)

### Build Phase
1. Coordinate domain experts (use task/subagent tools):
   - skill builder for SKILL.md creation
   - Extension builder for plugin work
   - TUI builder for component work
   - Theme builder for theme work
2. Validate output against tool format specs
3. Run compliance checks

## Online Sources
Always fetch the latest docs before building:
- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Pi: https://pi.dev/
- Antigravity: https://antigravity.sh/docs
- Codex: https://github.com/openai/codex
- Wo Coder: packages/@wayofmono/wo-agent/
