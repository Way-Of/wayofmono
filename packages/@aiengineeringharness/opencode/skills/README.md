# OpenCode Skills

> [!NOTE]
> This reference guide is based on the official [OpenCode Skills Documentation](https://opencode.ai/docs).

Skills are reusable packages of instruction guides, constraints, and validation logic that extend OpenCode's capabilities. When a skill matches the user's prompt or context, the agent loads and adheres to the guidelines specified in the skill file.

---

## 📂 Storage Locations

OpenCode discovers skills by scanning the following paths on startup:

1. **Global Skills**: Located under `~/.config/opencode/skills/<skill-folder>/`
2. **Workspace-Specific Skills**: Located under `<workspace-root>/.agents/skills/<skill-folder>/` (shared across the git repository).

---

## 🏗️ Structure of an OpenCode Skill

Each skill is represented by a dedicated subdirectory. The folder must contain a **`SKILL.md`** file, which acts as the instruction booklet for the agent.

### 📄 `SKILL.md` Format Example

```markdown
---
name: tdd
description: Enforce test-driven development vertical slices.
allowed-tools: read_file, write_file, run_command
---

# Test-Driven Development

Verify behavior through public interfaces, not implementation details.
Use vertical slices (Red -> Green -> Refactor) one test at a time.
```

*   **`name`**: The unique name of the skill.
*   **`description`**: A summary defining when the agent should select and activate this skill.
*   **`allowed-tools`**: The tools the agent is permitted to use for this skill.
