---
name: build-pi-agent
description: Build Pi agent definitions — knows the .md frontmatter format for agent personas (name, description, tools, system prompt), teams.yaml structure, agent-team orchestration, and session management. Use when the user wants to create or modify Pi agent definitions.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Create Pi agent definitions using the Markdown frontmatter format. Agent definitions have YAML frontmatter (name, description, tools) + system prompt body.

## Format

```markdown
---
name: my-agent
description: What this agent does
docs-url: https://pi.dev/
tools: read,grep,find,ls
---
System prompt body here.
```

### Frontmatter Fields
- `name` (required): lowercase hyphenated identifier
- `description` (required): brief description
- `tools` (required): comma-separated tool list (read,grep,find,ls for read-only; +write,edit,bash for full access)

### Locations
- `.pi/agents/*.md` — project-local
- `agents/*.md` — project root

### Teams (teams.yaml)
```yaml
team-name:
  - agent-one
  - agent-two
```

### Orchestration Patterns
- Dispatcher: primary delegates via dispatch_agent
- Pipeline: sequential chain (scout → planner → builder → reviewer)
- Parallel: agents query simultaneously
- Specialist team: narrow-domain agents with orchestrator

## First Action
Search the local codebase for existing agent definitions and team configs before creating new ones.
