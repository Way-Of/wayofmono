# Pi Domain Experts (Agents)

> [!NOTE]
> This reference guide is based on the official [Pi Documentation](https://pi.dev).

In Pi, agents are custom domain-expert personas configured using Markdown files. They allow developers to customize the AI's instruction set, context formatting, and rules for specialized tasks.

---

## 📂 Naming & Location

Domain-expert agents in Pi are stored under:
*   **Global level**: `~/.pi/agent/agents/<agent-name>.md`
*   **Workspace level**: `<workspace-root>/.agents/agents/<agent-name>.md`

Pi strictly uses **kebab-case** naming conventions for its agent files (e.g., `codebase-analyzer.md`, `thoughts-locator.md`).

### Markdown Format Example (`my-custom-expert.md`)

Each custom agent file uses YAML frontmatter to define its name and description:

```markdown
---
name: db-administrator
description: Specialized database expert for designing schemas and migrations.
---

You are a Pi domain expert specialized in database administration. Your instructions are to verify indexes, write clean migrations, and optimize queries.
```

---

## 🔄 Invocation & Orchestration

*   **Slash Command**: You can chat directly with a specific domain expert from the CLI by typing `/agent <agent-name>`.
*   **Dynamic Selection**: The Pi orchestrator analyzes the user query, selects the best matching domain expert based on its YAML description, and delegates the query context.
*   **Context Scope**: Pi agents start their work with a clean context slice, preventing the parent agent's context from being polluted by granular details.
