# @wayofmono/wo-coding-agent

WayOfMono (Wo) Coding Agent CLI — AI-assisted software development harness.

```
wo [options] [@files...] [messages...]
```

## Quick Start

```bash
# Interactive mode
wo

# Single-shot mode
wo -p "Refactor this function"

# With a model
wo --model claude-sonnet-4-20250514 "Explain this code"

# Continue last session
wo -c

# Resume from saved sessions
wo -r
```

## Installation

```bash
npm install -g @wayofmono/wo-coding-agent
```

Or run directly:

```bash
npx @wayofmono/wo-coding-agent
```

## CLI Options

### Modes
| Flag | Description |
|------|-------------|
| (default) | Interactive TUI mode |
| `-p`, `--print` | Print response and exit |
| `--mode print\|json\|rpc` | Output mode |

### Model Options
| Flag | Description |
|------|-------------|
| `--provider <name>` | Provider (anthropic, openai, gemini) |
| `--model <pattern>` | Model ID or pattern |
| `--api-key <key>` | API key override |
| `--thinking <level>` | off, low, medium, high, xhigh |

### Session Options
| Flag | Description |
|------|-------------|
| `-c`, `--continue` | Continue most recent session |
| `-r`, `--resume` | Browse and select session |
| `--session <id\|path>` | Use specific session |
| `--fork <id\|path>` | Fork session into new one |
| `--no-session` | Ephemeral mode (don't save) |

### Tool Options
| Flag | Description |
|------|-------------|
| `-t`, `--tools <list>` | Tool allowlist (comma-separated) |
| `--no-builtin-tools` | Disable built-in tools |
| `--no-tools`, `-nt` | Disable all tools |

### Resource Options
| Flag | Description |
|------|-------------|
| `-e`, `--extension <path>` | Load extension (repeatable) |
| `--no-extensions` | Disable extension discovery |
| `--skill <path>` | Load skill (repeatable) |
| `--no-skills` | Disable skill discovery |
| `--no-context-files`, `-nc` | Disable AGENTS.md/CLAUDE.md discovery |

## SDK Usage

```ts
import { createAgentSession, ModelRegistry, AuthStorage } from "@wayofmono/wo-coding-agent";

const session = createAgentSession({
  cwd: process.cwd(),
  agentDir: process.env.HOME + "/.wo/agent",
});

session.subscribe((event) => {
  if (event.type === "message_update") {
    process.stdout.write(event.content);
  }
});

const response = await session.prompt("Hello!");
```

## Built-in Tools

- **read** — Read files with line range support
- **bash** — Execute shell commands with streaming output
- **write** — Create/overwrite files
- **edit** — Find/replace file editing
- **grep** — Content search with glob patterns
- **find** — Glob-based file discovery
- **ls** — Directory listing

## Architecture

```
wo-coding-agent
├── cli.ts              # Shebang entry point
├── main.ts             # CLI bootstrap + mode dispatch
├── cli/args.ts         # Argument parser
├── core/
│   ├── agent-session.ts    # Session + LLM orchestration
│   ├── settings-manager.ts # Global + project settings
│   ├── auth-storage.ts     # API key credential management
│   ├── model-registry.ts   # Built-in + custom model loading
│   ├── session-manager.ts  # Session persistence
│   └── message-converter.ts # Message format conversion
├── tools/
│   └── index.ts        # Tool definitions (bash, read, write, etc.)
├── modes/
│   ├── print-mode.ts   # Single-shot response
│   └── interactive-mode.ts # TUI mode
└── index.ts            # Public API exports
```

## Dependencies

- `@wayofmono/wo-ai` — Multi-provider LLM API
- `@wayofmono/wo-agent-core` — Agent runtime & ExtensionAPI
- `@wayofmono/wo-tui` — Terminal UI library
- `@wayofmono/telemetry` — OTel instrumentation

## Status

This package is under active development. See `PROJ-007.md` for the full roadmap.
