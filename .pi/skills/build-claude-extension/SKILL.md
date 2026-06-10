---
name: build-claude-extension
description: Build Claude Code plugins/extensions — knows plugin.json manifest structure, relative paths format, custom commands, hook interceptors, and local/marketplace deployment. Use when the user wants to build custom Claude Code plugins.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

# Building Claude Code Plugins / Extensions

Claude Code extensions are packaged as **Plugins**. A plugin is a namespaced bundle containing custom commands, subagents, skills, lifecycle hooks, and MCP servers.

---

## 1. Plugin Directory Structure
A typical plugin directory looks like:
```
my-plugin/
├── plugin.json         # Manifest (metadata and component bindings)
├── commands/           # Command markdown files or skill directories
│   └── about.md
├── agents/             # Specialist agent persona markdown files
├── skills/             # Repeatable workflow folders (with SKILL.md)
└── hooks.json          # Lifecycle event hook scripts (optional)
```

---

## 2. Manifest Schema (`plugin.json`)
The manifest configures how components are loaded into the user session:
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Short description of my plugin",
  "author": {
    "name": "Developer Name",
    "email": "dev@example.com"
  },
  "commands": {
    "about": {
      "source": "./commands/about.md",
      "description": "Displays information about the plugin tools"
    }
  },
  "skills": ["./skills/extra-skill"],
  "hooks": "./hooks.json",
  "mcpServers": {
    "sqlite-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite"],
      "env": {
        "SQLITE_FILE": "/path/to/db.sqlite"
      }
    }
  }
}
```

---

## 3. Hook Interceptors
Plugins can register lifecycle hooks (in `hooks.json` or inline) to execute scripts before or after specific operations:
- Pre-approved commands and script hooks.
- Note: Claude Code does not support ad-hoc user `hooks.json` like Antigravity, but allows **plugin-scoped** hooks to be defined inside plugin manifests.

---

## 4. Key Rules for Plugins
1. **Namespacing**: Plugin names must use kebab-case and cannot contain spaces.
2. **Relative Paths**: All file paths inside the manifest (for commands, skills, agents) must start with `./` and reside inside the plugin root folder.
3. **No Impersonation**: Plugin names cannot mimic official Anthropic or Claude brands (these are blocked by the marketplace schema validation).
