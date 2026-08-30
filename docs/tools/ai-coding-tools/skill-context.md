# Ticket Context Update

## Purpose

This skill updates tickets to use the proper format and rules per AI tool:
- **Codex**: skill.yaml + prompt.md dual-file format
- **Claude**: skills/ with disable-model-invocation: true
- **OpenCode**: skills/ with SKILL.md
- **Antigravity**: skills/ with SKILL.md and TOML commands

## Ticket Format Per Tool

### Codex Format
1. Create skill.yaml file with: name, description, tools, version
2. Create prompt.md file with instructions
3. Place both in skills/ directory
4. Naming: snake_case

### Claude Format
1. Create skill directory with snake_case name
2. Create SkillName-*.skill.md file
3. YAML frontmatter includes: name, description, depends_on, allowed-tools
4. Include: disable-model-invocation: true
5. Naming: PascalCase for skill files

### OpenCode Format
1. Create skill directory with snake_case name  
2. Create skill.md file (SKILL.md)
3. YAML frontmatter includes: name, description, version, namespace, platforms, allowed-tools
4. Naming: snake_case

### Antigravity Format
1. Create skill directory with snake_case name
2. Create skill.md file (SKILL.md)
3. YAML frontmatter includes: name, description, namespace, platforms, allowed-tools
4. Commands in TOML format
5. Naming: snake_case

## Tools Reference

Built-in tools for each AI agent:
- **Read**: Read file contents (supports images, PDFs, notebooks)
- **Write**: Create new files
- **Edit**: Modify files via exact string replacement
- **Bash**: Execute shell commands
- **Grep**: Search file contents with regex (ripgrep-based)
- **Glob**: Find files by pattern matching
- **CronCreate**: Schedule recurring tasks
- **Monitor**: Watch background processes

### Permission Settings
- `allow` — No prompt, always allowed
- `deny` — Blocked
- `ask` — Ask user each time (default)

## Enforcement Rules

### Codex Rules
- Use dual-file format (skill.yaml + prompt.md)
- skill.yaml: name, description, tools, version
- prompt.md: skill instructions
- Naming: snake_case
- No model invocation in skill.md (handled by separate file)

### Claude Rules
- Use `skills/` directory structure
- Include `disable-model-invocation: true` in frontmatter
- Naming: PascalCase skill files
- Use `@` for file referencing
- Commands are skills with `disable-model-invocation: true`

### OpenCode Rules
- Use `skills/` directory structure
- Naming: snake_case
- YAML frontmatter with proper fields
- Tools in lowercase
- Commands in snake_case

### Antigravity Rules
- Use `skills/` directory structure
- Naming: snake_case
- TOML format commands
- YAML frontmatter with proper fields
- No separate command files needed

## Ticket Location Reference

- Codex skills: `thoughts/codex/skills/`
- Claude skills: `thoughts/claude-ai/skills/`
- OpenCode skills: `thoughts/opticat/skills/`
- Antigravity skills: `thoughts/antigravity/skills/`

## Action Items

- [x] Update ticket contexts following each tool's rules
- [x] Create proper skill format per tool
- [x] Validate all tickets follow correct format

## Related Documentation

- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Codex: https://developers.openai.com/codex/cli
- Antigravity: https://antigravity.google/docs/cli-overview
