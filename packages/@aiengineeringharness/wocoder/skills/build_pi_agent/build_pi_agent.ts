// Auto-generated from canonical skill: build_pi_agent
// Platform: WoCoder (Node/Deno)
// Description: Build Pi agent definitions — knows the .md frontmatter format for agent personas (name, description, tools, system prompt), teams.yaml structure, agent-team orchestration, and session management. Use when the user wants to create or modify Pi agent definitions.

export const skill = {
  name: "build_pi_agent",
  description: "Build Pi agent definitions — knows the .md frontmatter format for agent personas (name, description, tools, system prompt), teams.yaml structure, agent-team orchestration, and session management. Use when the user wants to create or modify Pi agent definitions.",
  tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
  prompt: `> **Platform**: Wo Coder | **Skill**: build_pi_agent | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


Create Pi agent definitions using the Markdown frontmatter format. Agent definitions have YAML frontmatter (name, description, tools) + system prompt body.

## Format

\`\`\`markdown
---
name: my-agent
description: What this agent does
tools: read,grep,find,ls
---
System prompt body here.
\`\`\`

### Frontmatter Fields
- \`name\` (required): lowercase hyphenated identifier
- \`description\` (required): brief description
- \`tools\` (required): comma-separated tool list (read,grep,find,ls for read-only; +write,edit,bash for full access)

### Locations
- \`.pi/agents/*.md\` — project-local
- \`agents/*.md\` — project root

### Teams (teams.yaml)
\`\`\`yaml
team-name:
  - agent-one
  - agent-two
\`\`\`

### Orchestration Patterns
- Dispatcher: primary delegates via dispatch_agent
- Pipeline: sequential chain (scout → planner → builder → reviewer)
- Parallel: agents query simultaneously
- Specialist team: narrow-domain agents with orchestrator

## First Action
Search the local codebase for existing agent definitions and team configs before creating new ones.
`,
};
