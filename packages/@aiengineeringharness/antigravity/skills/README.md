# Antigravity Skills

> [!NOTE]
> This reference guide is based on the official [Antigravity Skills Documentation](https://antigravity.google/docs/skills).

Skills are reusable packages of knowledge, conventions, and instructions that extend an agent's capabilities. They allow agents to perform complex, domain-specific tasks by consulting best practices, design constraints, and optional helper scripts.

---

## 📂 Storage Locations

Antigravity automatically discovers skills by looking in two main locations:

1. **Global Skills**: Located under `~/.antigravity/skills/<skill-folder>/`
   - These are available across all project workspaces and are ideal for global utilities and personal preferences.
2. **Workspace-Specific Skills**: Located under `<workspace-root>/.agents/skills/<skill-folder>/`
   - These are scoped to a particular project repository, committed to version control, and shared across all developers on the team.

---

## 🏗️ Structure of a Skill

Each skill is represented by a dedicated subdirectory. At a minimum, this directory must contain a **`SKILL.md`** file, which guides the agent's behavior.

### 📄 `SKILL.md` Schema

The `SKILL.md` file must start with YAML frontmatter containing metadata about the skill:

```markdown
---
name: my-custom-skill
description: Performs refactoring of typescript code to adhere to clean-code standards.
allowed-tools: read_file, write_file, run_command
---

# My Custom Skill Guide

## Philosophy
[Detailed guidelines on when and why to apply this skill]

## Step-by-step Process
1. Analyze imports
2. Execute code modifications
3. Run test runner verification

## Examples
[Code snippets or expected input/output matches]
```

### Supported Frontmatter Fields
*   **`name`**: Unique kebab-case name of the skill.
*   **`description`**: A detailed summary explaining when the agent should select and activate this skill.
*   **`allowed-tools`**: (Optional) A list of tools the agent is permitted to use when executing this skill.

---

## 🔄 How Agents Execute Skills

1. **Discovery & Matching**: When a user makes a request, the agent parses the available skills' descriptions in global and workspace directories to match the user's intent.
2. **Reading Instructions**: The agent reads the matching `SKILL.md` completely.
3. **Execution**: The agent performs the task, sticking strictly to the conventions and steps defined in the instruction guide.
4. **Verification**: Many skills define validation checks (e.g., executing a local script or test command) to ensure the implementation is correct before finishing.