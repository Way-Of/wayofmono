# Wo Coder (wocode) Guide

> High-performance coding assistant CLI — the tool Wo runs in

## What is Wo Coder?

Wo Coder (`wocode`) is a **dev-dependency CLI tool** for engineers. It's the interface where **Wo** (your coding co-pilot) lives and works.

```bash
npm install --save-dev @wayofmono/wo-coding-agent
npx wocode --init
./wocode
```

## Architecture

```
┌─────────────────────────────────────┐
│        AI Engineering Harness       │  ← Core: skills, agents, commands for 7 tools
├─────────────────────────────────────┤
│         Wo Coder (wocode)           │  ← CLI: TUI, extensions, web-access, packets
├─────────────────────────────────────┤
│              Wo                     │  ← Persona: coding co-pilot (you're talking to him)
└─────────────────────────────────────┘
```

## Key Features

### Built-in Packets (Extensions)
- **web-access** — Web search, URL fetching, GitHub cloning, PDF/YouTube extraction
- **open-editor** — File editing capabilities
- **subagent** — Parallel task delegation

### TUI Interface
- Expandable header with startup help
- Real-time tool execution display
- Session management (fork, tree, resume)
- Model cycling and selection

### Skills System
Loads skills from:
- `~/.wocoder/agent/skills/` (global)
- `.wo/agent/skills/` (project-local)
- `~/.agents/skills/` (shared cross-tool)

## Installation

```bash
# Via harness (recommended)
ai-harness --tool=wocoder --yes

# Direct npm
npm install --save-dev @wayofmono/wo-coding-agent
npx wocode --init
./wocode
```

## Commands

| Command | Description |
|---------|-------------|
| `wocode` | Start interactive TUI |
| `wocode --init` | Initialize project (.wo/ folder) |
| `wocode --help` | Show help |

## Configuration

- `models.json` — LLM providers (default: Ollama + qwen3.5:9b)
- `settings.json` — Agent behavior, themes, keybindings
- `.mcp.json` — MCP server configuration

## Related

- [Wo User (wouser)](../wouser/) — General-purpose user agent SDK
- [AI Engineering Harness](../ai-harness/) — Core skill/agent management
- [Getting Started](../getting-started.md) — Quick start for all components

---

🤖 **Yo! I'm Wo** — your coding co-pilot. I run inside Wo Coder. Just ask: 'How do I...?' or 'What's the command for...?' and I'll show you the way. 🚀