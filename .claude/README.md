# Claude Code Harness Integration

This directory houses the shared capability templates, subagents, and skills for the **Claude Code** agent platform integration.

Claude Code is Anthropic's official terminal-based AI coding assistant. It allows developers to search, explain, modify, test, and commit changes inside codebases.

---

## 📂 Naming & Location

Claude Code manages configurations and instructions through a multi-tiered hierarchy:

1. **Managed**: Highest precedence, server-level/IT-enforced settings.
2. **User (Global)**: Located in `~/.claude/` (affects all projects).
3. **Project**: Located in `.claude/` or root of the repository (shared with team members via Git).
4. **Local**: `.claude/settings.local.json` (personal machine overrides, ignored by Git).

---

## ⚙️ Core Configuration & Integration Patterns

### 1. `.mcp.json`
Configures Model Context Protocol (MCP) servers to extend Claude Code with external tools (such as database or Kubernetes MCP services). You can register them via the CLI with `claude mcp add`.

### 2. `settings.json`
Global and project settings for the Claude Code CLI interface (theme, language options, model settings). Can be configured interactively using the `/config` command.

### 3. Project Steering Rules (`CLAUDE.md`)
*   **`CLAUDE.md`**: The primary "instruction manual" for the project. Claude Code automatically reads this file at the start of every session to understand project-specific styles, rules, and commands. Can be bootstrapped via the `/init` command.
*   **`.claude/rules/`**: Directory for modular rule Markdown files (e.g. `testing.md`, `style.md`). Rules can use YAML frontmatter targeting specific path patterns (e.g. `paths: src/api/**/*.ts`).
*   **`@` Referencing**: Allows referencing files (e.g. `@docs/style-guide.md`) directly in conversation or instruction files to dynamically inject context.

### 4. Skills & Commands (`skills/`)
Repeatable workflows are defined under `.claude/skills/<name>/SKILL.md`. For manual slash commands, the YAML frontmatter includes `disable-model-invocation: true`.

---

## 🚫 Key Differences from Antigravity / Gemini CLI

Unlike Gemini CLI and Antigravity, Claude Code **does not** natively support:
*   **Builtin Sidecars (`sidecar.json`)**: Claude Code does not manage background sidecars or cron schedules.
*   **Pre/Post Hooks (`hooks.json`)**: Claude Code does not support intercepting commands or tool actions with pre/post-hook scripts in its configuration directory.

---

## 🔗 Official Reference Links
*   [Claude Code Official Website](https://code.claude.com)
*   [Model Context Protocol (MCP) Website](https://modelcontextprotocol.io)
