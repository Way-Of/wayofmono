# Skills Documentation

Skills are modular, discoverable capabilities that extend our agents' power. Our system synthesizes the **Skill/Extension** patterns from Pi and Gemini CLI.

## Core Capabilities

### [Git Commit Helper](../../pi/skills/git_commit_helper.md)
Analyzes \`git status\` and \`git diff\` to draft imperative-mood commit messages. Follows the "Imperative, Clear, Why-over-What" philosophy.

### [TDD](../../pi/skills/tdd.md)
Enforces the **Vertical Slice** philosophy: Red → Green → Refactor. Focuses on testing behavior through public interfaces rather than implementation details.

### [Observability-Driven Development (ODD)](../../pi/skills/observability_driven_development.md)
Treats the **Trace as a First-Class Design Artifact**. Requires a narrative spec before implementation and verification via the Aspire Dashboard.

## Skill Development Schema

When creating new skills in \`pi/skills/\` or \`gemini/skills/\`, follow these schemas:

### Pi Skill (Markdown)
Stored in \`pi/skills/<name>.md\`.
- **Name:** kebab-case identifier.
- **Trigger:** \`manual\` or \`auto\` (using keywords or context events).
- **Process:** Step-by-step instructions for the agent to follow.

### Gemini CLI Skill (TOML)
Stored in \`gemini/skills/<name>.toml\`.
- **Prompt:** The system-level instruction that activates the capability.
- **Tools:** List of tools authorized for this skill.
- **Validation:** Specific criteria the skill must meet before completion.

## Best Practices
- **Atomic Purpose:** Each skill should do one thing exceptionally well.
- **Context Efficiency:** Use targeted file reads (\`read_file\` with line ranges) to minimize token consumption.
- **Verification Logic:** A skill is incomplete without a way to verify its success (e.g., a test command or a \`scout\` scan).

## Auto-Discovery
Our agents automatically discover skills in the \`skills/\` directory. To steer discovery, use the \`/skill\` command to explicitly activate a specialized expert.
