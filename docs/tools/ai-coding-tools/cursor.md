# Cursor — Comprehensive Reference

Cursor is primarily an AI-first IDE (VS Code fork) with CLI capabilities.

## Quick Facts

| Attribute | Value |
|-----------|-------|
| **Binary** | `cursor` |
| **Type** | IDE (VS Code fork) with CLI |
| **Runtime** | TypeScript/Electron |
| **Install** | Download from cursor.com |
| **Docs** | https://docs.cursor.com/ |
| **CLI ref** | https://docs.cursor.com/cli |
| **Rules** | https://docs.cursor.com/context/rules-for-ai |
| **Config** | `~/.cursor/cursor.json` |
| **Project rules** | `.cursor/rules/` directory (.mdc files) |
| **Auth** | Cursor account |
| **License** | Proprietary (free tier + Pro $20/mo) |

## Role vs Other AI Coding Tools

**Cursor is an IDE, not a CLI-first tool.** Unlike OpenCode, Claude Code, Codex, etc. which are terminal-based agentic coding tools, Cursor is a full IDE (fork of VS Code) with AI capabilities built in.

In the WayOfMono monorepo, Cursor is **not** part of the 7-tool AI Engineering Harness:
- No config in `packages/@aiengineeringharness/cursor/`
- No entries in `manifest.json`, `install.ts`, or `setup.sh`
- Not listed in the skill-registry.json platforms array
- No `.cursor/` config directory exists in this repo
- Only documented in the WOMONO-043 research ticket and this doc

## CLI Commands

| Command | Description |
|---------|-------------|
| `cursor --help` | Show CLI help |
| `cursor <file>` | Open file in editor |
| `cursor .` | Open current project |
| `cursor --new-window` | Force new window |
| `cursor --reuse-window` | Force reuse window |
| `cursor --wait` | Wait for file to close |
| `cursor --diff <file1> <file2>` | Open diff view |
| `cursor --goto <file>:<line>:<col>` | Open at specific location |
| `cursor --add <folder>` | Add folder to workspace |
| `cursor --version` | Show version |
| `cursor --telemetry` | Telemetry settings |
| `cursor --install-extension <id>` | Install extension |
| `cursor --list-extensions` | List installed extensions |
| `cursor --disable-extensions` | Disable all extensions |
| `cursor --locale <locale>` | Set display language |
| `cursor --file-gc` | Garbage collect working files |
| `cursor --crash-reporter-directory` | Crash reporter settings |
| `cursor --agent-mode` | Start in agent mode |
| `cursor --ask-mode` | Start in ask mode |
| `cursor --edit-mode` | Start in edit mode |
| `cursor --no-agent-menu` | Disable agent mode switcher |

## Configuration

- **Global**: `~/.cursor/cursor.json`
- **Format**: JSON
- **Project**: `.cursor/rules/` directory for project-scoped AI rules (.mdc files)

## Rules System

### Global Rules
Configured in Settings → Rules (`~/.cursor/cursor.json`).

### Project Rules (`.cursor/rules/`)
- `.mdc` file format with YAML frontmatter
- Fields: `description`, `globs`, `alwaysApply`
- Content after `---` separator
- **Priority**: Filename prefix numbers (e.g., `01-core.mdc`, `02-testing.mdc`)
- **Pattern matching**: Glob patterns for which files the rule applies to
- **Automatic rules**: `alwaysApply: true` or global rules in settings

### Rule Example
```markdown
---
description: TypeScript coding conventions
globs: src/**/*.ts
alwaysApply: true
---
Use functional patterns over classes...
```

## MCP Support

- Configured in `cursor.json` → `mcpServers`
- STDIO transport
- Per-project MCP configuration
- MCP tools appear alongside built-in tools

## Key Features

| Feature | Description |
|---------|-------------|
| VS Code fork | Full VS Code extension compatibility |
| Agent mode | Autonomous coding agent |
| Ask mode | Q&A about codebase |
| Edit mode | Targeted edits |
| @Docs | Index external docs for AI context |
| @Web | Web search in chat |
| @Files/@Folders/@Code | Codebase references in chat |
| @Git | Git context |
| Tab completion | Ghost text completion |
| Terminal integration | In-editor terminal |
| Image support | Attach screenshots |
| Privacy mode | Disables cloud features |
| Cloud Agents | Isolated VMs with computer use |
| Semantic search | Custom embedding model |
| Instant Grep | Fast codebase search |
| Browser tool | In-agent web browsing |
| Image generation | Built-in image gen |
| Checkpoints | Session versioning |
| Voice input | Voice-to-text in editor |

## Research URLs for Agents

| Source | URL |
|--------|-----|
| Official docs | https://docs.cursor.com/ |
| CLI reference | https://docs.cursor.com/cli |
| Rules for AI | https://docs.cursor.com/context/rules-for-ai |
| Agent overview | https://docs.cursor.com/agent/overview |
