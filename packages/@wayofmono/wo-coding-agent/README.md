# @wayofmono/wo-coding-agent

Coding agent CLI (`wocode`) with read, bash, edit, write tools, session management, and terminal UI. The primary coding agent for WayOfMono.

## Installation

```bash
# As a project dependency
pnpm add -D @wayofmono/wo-coding-agent

# Or globally
npm install -g @wayofmono/wo-coding-agent
```

## Quick Start

```bash
# Initialize project
npx wocode --init

# Start interactive session
npx wocode

# One-shot prompt
echo "Fix the bug in auth.ts" | npx wocode --print
```

## CLI Reference

### Core Commands

```bash
wocode                          # Start interactive TUI
wocode --print                  # Non-interactive mode (print to stdout)
wocode --init                   # Initialize .wocode/ directory
wocode --version                # Print version
wocode --help                   # Show help
```

### Model Selection

```bash
wocode --model openai/gpt-4o           # Specific model
wocode --model anthropic/claude-sonnet-4-20250514  # Specific model
wocode --provider openai               # Filter by provider
wocode --list-models                   # List all available models
wocode --list-models "qwen"            # Search models
```

### Session Management

```bash
wocode --continue                      # Continue most recent session
wocode --resume                        # Interactive session picker
wocode --session <id>                  # Open specific session
wocode --fork <id>                     # Fork a session
wocode --no-session                    # Disable session persistence
wocode --export <session>              # Export session to HTML
```

### Tool Control

```bash
wocode --no-tools                      # Disable all tools
wocode --tools read,bash,edit          # Enable specific tools only
```

### Output Modes

```bash
wocode --print                         # Print mode (text to stdout)
wocode --mode json                     # JSON output
wocode --mode rpc                      # JSON-RPC mode (IDE integration)
```

## Built-in Tools

| Tool | Description |
|------|-------------|
| `read` | Read file contents with line ranges |
| `bash` | Execute shell commands with timeout |
| `edit` | Diff-based file editing (find/replace) |
| `write` | Write/overwrite files |
| `grep` | Search file contents with regex |
| `find` | Find files by name/glob |
| `ls` | List directory contents |

## Configuration

### Project Config (`.wocode/`)

Created by `wocode --init`:

```
.wocode/
├── config.json          # Tool configuration
├── models.json          # Model/provider settings
├── skills/              # Installed skills
├── extensions/          # Installed extensions
└── themes/              # Custom themes
```

### Global Config (`~/.wocode/agent/`)

```
~/.wocode/agent/
├── skills/              # Global skills
├── agents/              # Agent definitions
├── extensions/          # Extensions
├── prompts/             # Prompt templates
└── themes/              # Themes
```

## API Key Setup

```bash
# OpenAI
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# Google Gemini
export GEMINI_API_KEY="AIza..."

# Ollama (local, no key needed)
ollama pull qwen3.5:9b
ollama serve
```

## Programmatic Usage

```typescript
import { createAgentSession, createCodingTools } from "@wayofmono/wo-coding-agent";

const session = await createAgentSession({
  cwd: process.cwd(),
  model: someModel,
  tools: createCodingTools(),
});

await session.prompt("Fix the bug in auth.ts");
session.abort();
```

## Session Management

```typescript
import { SessionManager } from "@wayofmono/wo-coding-agent";

// List sessions
const sessions = await SessionManager.list(cwd);

// Open a session
const session = SessionManager.open(sessionPath, undefined, cwd);

// Fork a session
const forked = SessionManager.forkFrom(sessionPath, cwd);
```

## Extension System

```typescript
import { Extension, discoverAndLoadExtensions } from "@wayofmono/wo-coding-agent";

// Discover and load extensions
const result = await discoverAndLoadExtensions({
  cwd: process.cwd(),
  agentDir: ".wocode",
});
```

## Keyboard Shortcuts (Interactive Mode)

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Abort current generation |
| `Ctrl+D` | Exit |
| `Tab` | Accept suggestion |
| `Ctrl+O` | Toggle output expand/collapse |
| `Ctrl+Alt+.` | Cycle theme forward |
| `Ctrl+Alt+,` | Cycle theme backward |

## Package Dependencies

- `@wayofmono/wo-agent-core` — Agent runtime
- `@wayofmono/wo-ai` — LLM provider abstraction
- `@wayofmono/wo-tui` — Terminal UI components

## Related Packages

- `@wayofmono/wo-agent` — General-purpose agent SDK (wouser)
- `@wayofmono/wo-agent-core` — Core runtime this is built on
- `@wayofmono/wo-ai` — LLM providers used by this
- `@wayofmono/wo-tui` — Terminal UI used by this

---

*Part of the WayOfMono high-performance coding agent ecosystem.*
