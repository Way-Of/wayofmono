// Auto-generated from canonical skill: build_claude_agent
// Platform: WoCoder (Node/Deno)
// Description: Build Claude Code agent definitions — knows the Markdown (.md) frontmatter format for agent personas, subagent configuration, directory locations, and subagent invocation. Use when the user wants to create or modify Claude Code agent definitions.

export const skill = {
  name: "build_claude_agent",
  description: "Build Claude Code agent definitions — knows the Markdown (.md) frontmatter format for agent personas, subagent configuration, directory locations, and subagent invocation. Use when the user wants to create or modify Claude Code agent definitions.",
  tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
  prompt: `> **Platform**: Wo Coder | **Skill**: build_claude_agent | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# Building & Configuring Claude Code Agents

Claude Code supports declaring custom specialized subagent personas using Markdown files containing YAML frontmatter and a system instructions body.

---

## 1. Subagent Definition Format (.md files)
Custom subagents are defined as Markdown files with YAML frontmatter and a system prompt body.

### Locations
- **Project Scope**: \`.claude/agents/<agent_name>.md\`
- **Global Scope**: \`~/.claude/agents/<agent_name>.md\`

### File Format
\`\`\`markdown
---
name: codebase_locator
description: Specialist agent for locating files and code patterns.
---
You are a specialist at finding WHERE code lives in a codebase.
Your core responsibilities are...
\`\`\`
- **name** (required): lowercase snake_case identifier matching the filename.
- **description** (required): clear description explaining when the model should invoke this agent.
- **Body**: The complete system instructions (soul + principles).

---

## 2. Default Settings Registration
You can configure a default agent to run in the main chat thread using \`settings.json\`:
\`\`\`json
{
  "agent": "codebase_analyzer"
}
\`\`\`
This forces Claude Code to use the specified agent prompt, model, and tool restrictions as the default persona for the session.

---

## 3. Subagent Execution
In the Claude Code runtime:
- Subagents are spawned to perform parallel tasks (e.g. background research, file searches, or test execution).
- Active subagents can be monitored in the UI.
- Run \`ctrl+x ctrl+k\` to abort/kill all active subagents immediately.
`,
};
