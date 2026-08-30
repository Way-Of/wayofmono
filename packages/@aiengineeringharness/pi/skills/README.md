---
name: pi-skills-readme
description: "Reference guide for Pi skills in the AI Engineering Harness. Not an executable skill."
disable-model-invocation: true
---

# Pi Skills

> [!NOTE]
> This reference guide is based on the official [Pi Documentation](https://pi.dev).

Skills are modular, discoverable capabilities that extend the Pi agent's functional power. They provide the agent with best practices, workflows, allowed tools, and verification logic for specific development disciplines.

---

## 📂 Storage Locations

Pi discovers skills by scanning the following paths on startup:

1. **Global Skills**: Located under `~/.pi/agent/skills/<skill-folder>/`
2. **Workspace Skills**: Located under `<workspace-root>/.agents/skills/<skill-folder>/` (shared in the git repository).

---

## 🏗️ Structure of a Skill

Each skill is represented by its own folder, containing a **`SKILL.md`** file at its root.

### 📄 `SKILL.md` Schema

The `SKILL.md` file must start with YAML frontmatter containing metadata about the skill:

```markdown
---
name: tdd
description: Test-driven development with red-green-refactor loop.
allowed-tools: read_file write_file run_command
---

# Test-Driven Development (TDD)

## Philosophy
Write behavioral integration tests through public interfaces instead of testing implementation details.
Enforce vertical slices (Red -> Green -> Refactor) to prevent speculative code.
```

### Supported Frontmatter Fields

*   **`name`**: Kebab-case identifier of the skill.
*   **`description`**: A detailed summary explaining when the agent should select and activate this skill.
*   **`allowed-tools`**: (Optional) Space-delimited list of pre-approved tools.
*   **`disable-model-invocation`**: (Optional) When `true`, skill is hidden from system prompt; users must use `/skill:name`.

---

## 🔧 Key Pi-Specific Notes

- **Name format**: lowercase, numbers, hyphens only (max 64 chars). No leading/trailing/consecutive hyphens.
- **Description**: Max 1024 chars. Be specific — determines when agent loads the skill.
- **`allowed-tools`**: Space-delimited (not YAML array), e.g., `read write glob grep`
- **Directory name ≠ skill name**: Pi does NOT require directory name to match `name` field (unlike Agent Skills standard).
- **Validation**: Missing `description` = skill NOT loaded. Invalid name = warning but loads.

See [Pi Skills Documentation](https://pi.dev/docs/latest/skills) for full spec.