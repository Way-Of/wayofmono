# AI Coding Tools — Comprehensive Reference

Source of truth for all supported AI coding tools. Data verified against official documentation (June 2026).

## Supported Tools

| Tool | Binary | Type | Runtime | Best For |
|------|--------|------|---------|----------|
| [Pi](./pi.md) | `pi` | CLI (TUI) | TypeScript | Extensibility, custom workflows, SDK/RPC integration |
| [OpenCode](./opencode.md) | `opencode` | CLI (TUI) + Desktop + IDE | TypeScript | Open source, multi-provider, community-driven |
| [Claude Code](./claude-code.md) | `claude` | CLI (TUI) + Desktop + IDE + Web | TypeScript | Most tools (30+), dynamic workflows, enterprise |
| [Codex](./codex.md) | `codex` | CLI (TUI) | Rust | Speed, sandbox security, OpenAI ecosystem |
| [Antigravity CLI](./antigravity-cli.md) | `agy` | CLI (TUI) | Go | Google ecosystem, async workflows, 2M context |
| [Wo Coder](./wo-coder.md) | `wocode` | CLI (TUI) | TypeScript | WayOfMono native, PI, fork, monorepo integrated |
| [Cursor](./cursor.md) | `cursor` | IDE (editor) | TypeScript/Electron | Full IDE experience, Cloud Agents, semantic search |

## Key Facts

- **172K stars** — OpenCode (most popular open source AI coding tool)
- **61K stars** — Pi (most extensible, 4 modes, TypeScript extensions)
- **30+ built-in tools** — Claude Code (most tools of any AI coding CLI)
- **Rust-based** — Codex (fastest startup, ~0.5s)
- **Go-based** — Antigravity CLI (replaces deprecated Gemini CLI)
- **2M tokens max context** — Antigravity CLI / Gemini models
- **Cloud Agents with computer use** — Cursor (isolated VMs)

## Research URLs for Agents

Each tool's official documentation URL is the primary source for agent research:

| Tool | Primary Docs URL | SDK/API Docs | GitHub |
|------|-----------------|--------------|--------|
| Pi | https://pi.dev/ | https://badlogic-pi-mono.mintlify.app/ | https://github.com/earendil-works/pi |
| OpenCode | https://opencode.ai/docs/ | https://opencode.ai/docs/sdk/ | https://github.com/anomalyco/opencode |
| Claude Code | https://code.claude.com/docs/en/overview | https://code.claude.com/docs/en/agent-sdk | N/A (closed) |
| Codex | https://developers.openai.com/codex/cli | https://developers.openai.com/codex/cli/reference | https://github.com/openai/codex |
| Antigravity CLI | https://antigravity.google/docs/cli-overview | https://antigravity.google/docs/cli-features | https://github.com/google-antigravity/antigravity-cli |
| Wo Coder | Custom (monorepo) | Custom (monorepo) | `./wo-coder.md` in this dir |
| Cursor | https://cursor.com/docs | https://cursor.com/docs/agent/overview | N/A (closed) |

## How to Use This Reference

1. Each tool page contains:
   - **Installation**: Exact install commands verified from official docs
   - **Built-in tools**: Complete list with tool names
   - **Configuration**: File locations, formats, schemas
   - **Extension system**: How to extend the tool
   - **MCP support**: How Model Context Protocol is configured
   - **Subagent system**: How to delegate tasks
   - **Slash commands**: All available commands
   - **Research URLs**: Direct links for agents to fetch
   - **Capabilities matrix**: Unique features per tool

2. When validating capabilities, always check official docs first using the URLs above.
