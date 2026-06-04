# Gemini CLI Harness Integration

This directory houses the shared capability templates, subagents, commands, and skills for the **Gemini CLI / Antigravity** agent platform integration. 

Gemini CLI is Google's terminal-based interface to the agent platform, allowing developers to execute commands, invoke background subagents, apply coding skills, run sidecars, and hook into lifecycle events.

---

## 📖 Integration Sub-Guides

Each core folder contains its own detailed specification and usage guide:

*   **[Agents & Subagents](./agents/README.md)**: Asynchronous subagent invocation, state cycles (`Running`, `Idle`, `Killed`), communication mechanisms, and `/teamwork-preview` guidelines.
*   **[Modular Skills](./skills/README.md)**: Skill discovery rules, instruction guides (`SKILL.md`), and global vs workspace-level storage.
*   **[Hooks & Interceptors](./hooks/README.md)**: Event triggers (`PreToolUse`, `PostInvocation`, etc.) and SDK hook definitions (`Inspect`, `Decide`, `Transform`).
*   **[Background Sidecars](./sidecars/README.md)**: Configuration schemas (`sidecar.json`), cron-built-in scheduling, runtime data outputs, and the `agentapi` CLI.
*   **[Namespaced Plugins](./plugins/README.md)**: Package bundles grouping rules, skills, MCP servers, and hooks under a single manifest (`plugin.json`).

---

## ⚙️ Core Configuration Files

*   **`config.json`**: Located at `~/.gemini/config/config.json`, this is the user's primary configuration file for enabling sidecars, declaring project scopes, and configuring model parameters.

---

## 🔗 Official Documentation Links

For further reference, check Google's official Gemini/Antigravity documentation:

*   [Gemini CLI Documentation Hub](https://geminicli.com/docs)
*   [Antigravity Documentation Hub](https://antigravity.google/docs)
*   [Asynchronous Subagents Guide](https://antigravity.google/docs/subagents)
*   [Customizing Skills](https://antigravity.google/docs/skills)
*   [Lifecycle Hooks Specification](https://antigravity.google/docs/hooks)
*   [Background Sidecars API](https://antigravity.google/docs/sidecars)
*   [Namespaced Plugins packaging](https://antigravity.google/docs/plugins)
