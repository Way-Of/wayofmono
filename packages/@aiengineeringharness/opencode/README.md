# OpenCode Harness Integration

This directory houses the shared capability templates, custom agent personas, slash commands, and skills for the **OpenCode** TUI agent platform integration. 

OpenCode is an open-source, Go-based AI coding assistant designed specifically for the terminal. It provides a fast, interactive Terminal User Interface (TUI) built with Bubble Tea that supports multiple model backends.

---

## 📖 Integration Sub-Guides

*   **[Agent Personas](./agents/README.md)**: Custom developer personas (e.g. `codebase_analyzer`, `web_search_researcher`) configured as Markdown files in the `agents/` folder.
*   **[Modular Skills](./skills/README.md)**: Capability instructions configured via folder subdirectories containing a `SKILL.md` file.

---

## ⚙️ Core Configuration & Integration Patterns

### 1. `opencode.json`
Located at `~/.config/opencode/opencode.json` (or the harness configuration file `./opencode.json`), this manages:
*   **MCP (Model Context Protocol) Servers**: Connects the agent to external APIs (e.g., file system access, database interfaces).
*   **LSP (Language Server Protocol) Servers**: Plugs into language servers for code suggestions, formatting, and diagnostics.

### 2. Custom Commands (`commands/`)
OpenCode supports custom slash commands defined as Markdown files in the `commands/` directory (e.g. `/create_plan`, `/implement_plan`, `/commit`).

### 3. Project Memory (`AGENTS.md`)
OpenCode dynamically discovers and reads an `AGENTS.md` file at your workspace root to steer codebase rules, directories, patterns, and style guides.

---

## 🚫 Key Differences from Antigravity / Gemini CLI

Unlike the Gemini CLI / Antigravity SDK platforms, OpenCode is a lightweight terminal-first interface and **does not** natively support:
*   **Background Sidecars (`sidecar.json`)**: OpenCode does not manage background daemons or cron schedules.
*   **Lifecycle Hooks (`hooks.json`)**: OpenCode does not intercept terminal or file actions through pre/post-hook event pipelines.
*   **Packaged Plugins (`plugin.json`)**: OpenCode does not package extensions into namespaced plugin folders.

Extensibility in OpenCode is handled entirely via standard **MCP Servers**, **LSP Server configurations**, and **Markdown-based custom commands / skills / rules**.

---

## 🔗 Official Reference Links
*   [OpenCode Official Docs](https://opencode.ai/docs)
*   [OpenCode GitHub Repository](https://github.com/opencode-ai/opencode)
