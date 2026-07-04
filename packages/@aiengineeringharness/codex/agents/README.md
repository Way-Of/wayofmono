# OpenCode Agent Personas

> [!NOTE]
> This reference guide is based on the official [OpenCode Documentation](https://opencode.ai/docs).

In OpenCode, agents are custom personas with specialized system prompts and description files. They allow developers to customize the AI's persona, system instructions, and tool access limits for different developer roles (e.g., Codebase Locator, thoughts Analyzer, or Web Researcher).

---

## 📂 Naming & Structure

Custom agent profiles are defined as Markdown files under:
*   **Global level**: `~/.config/opencode/agents/<agent_name>.md`
*   **Workspace level**: `<workspace-root>/.agents/agents/<agent_name>.md`

### Markdown Format Example (`my_agent.md`)

Each custom agent file uses YAML frontmatter to define its name and description:

```markdown
---
name: db_administrator
description: Specialized database administrator for optimizing SQL and migrations.
---

You are an expert DB Administrator. Help the user design clean schemas, verify index usage, and write migration scripts.
```

---

## 🔄 How OpenCode Operates Personas

*   **TUI Discovery**: OpenCode scans the agents folders on startup. You can switch between active personas directly from the TUI interface.
*   **Context Steering**: Each persona governs the system instructions sent to the LLM backend for that conversation.
*   **No Asynchronous Spawning**: Unlike the Antigravity/Gemini SDK, OpenCode does not natively support spawning independent, parallel background sub-sessions (`invoke_subagent`). Instead, it acts as a single-process, interactive terminal UI that executes commands and swaps system prompts dynamically.
