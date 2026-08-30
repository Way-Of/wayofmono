# Antigravity Plugins

> [!NOTE]
> This reference guide is based on the official [Antigravity Plugins Documentation](https://antigravity.google/docs/plugins).

Plugins are namespaced bundles that allow you to extend Antigravity's capabilities by grouping skills, rules, MCP servers, and hooks into a single package.

---

## 📂 Directory Structure

Plugins follow a strict directory layout. A plugin must contain a `plugin.json` file at its root to be recognized:

```text
plugins/<plugin-name>/
├── plugin.json       # Required marker file
├── mcp_config.json   # Optional MCP server definitions
├── hooks.json        # Optional hooks definition
├── skills/           # Optional skills
│   └── <skill-name>/
│       └── SKILL.md
└── rules/            # Optional rules
    └── <rule-name>.md
```

---

## 📄 Manifest File (`plugin.json`)

Every plugin must have a `plugin.json` file at its root. This file identifies the directory as an Antigravity plugin.

```json
{
  "name": "my-custom-plugin"
}
```
*Note: The `name` field is optional and defaults to the directory name if omitted.*

---

## 🧩 Supported Components

A plugin can package and configure the following extension components:

*   **Skills**: Located in the `skills/` subdirectory. Each skill must contain a `SKILL.md` instruction file for the agent.
*   **Rules**: Located in the `rules/` subdirectory. These are markdown files defining constraints or coding guidelines for the agent's behavior.
*   **MCP Servers**: Configured via `mcp_config.json` at the plugin root. This connects the agent to external tools and services.
*   **Hooks**: Configured via `hooks.json` at the plugin root, triggering custom commands or scripts on lifecycle events.

---

## 🚀 How to Add Plugins

Antigravity supports two methods for installing and loading plugins:

### 1. Using Google-Bundled Plugins (Build with Google)
Antigravity comes with pre-packaged plugins. You can browse and add these directly from the user interface:
*   Navigate to the **Customizations** page.
*   For details about available Google-built integrations, consult the **Build with Google** resource page.

### 2. Manually Adding Plugins
Place your plugin folder in one of the designated customization directories. Antigravity automatically scans and loads them on startup:

*   **Workspace Level**: Place your plugin folder inside a `.agents/plugins/` or `_agents/plugins/` directory at the root of your opened workspace. The plugin will only be active when working in this workspace.
*   **Global Level**: Place your plugin folder inside `~/.gemini/config/plugins/` in your user home directory. The plugin will be active across all projects.
