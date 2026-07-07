# @wayofmono/wo-agent

Agent SDK for building AI-powered applications. General-purpose user agent (`wouser`) with skill management, extensions, and LLM integration.

## Installation

```bash
# As a project dependency
pnpm add @wayofmono/wo-agent

# Or globally
npm install -g @wayofmono/wo-agent
```

## Quick Start

```bash
# Initialize project
npx wouser --init

# Start interactive session
npx wouser

# One-shot prompt
echo "Analyze this data" | npx wouser --print
```

## CLI Reference

### Core Commands

```bash
wouser                          # Start interactive TUI
wouser --print                  # Non-interactive mode (print to stdout)
wouser --init                   # Initialize .wo/ directory
wouser --version                # Print version
wouser --help                   # Show help
```

### Model Selection

```bash
wouser --model openai/gpt-4o           # Specific model
wouser --model anthropic/claude-sonnet-4-20250514  # Specific model
wouser --provider openai               # Filter by provider
wouser --list-models                   # List all available models
wouser --list-models "qwen"            # Search models
```

### Session Management

```bash
wouser --continue                      # Continue most recent session
wouser --resume                        # Interactive session picker
wouser --session <id>                  # Open specific session
wouser --fork <id>                     # Fork a session
wouser --no-session                    # Disable session persistence
wouser --export <session>              # Export session to HTML
```

### Tool Control

```bash
wouser --no-tools                      # Disable all tools
wouser --tools read,bash,edit          # Enable specific tools only
```

### Skill Management

```bash
# Install skills from npm packages
wouser skill install investor-ready-doc-gen
wouser skill install npm:@wayofmono/skill-investor-ready-doc-gen

# List installed skills
wouser skill list

# Discover unregistered skills in node_modules
wouser skill discover

# Update skills after npm update
wouser skill update
wouser skill update investor-ready-doc-gen

# Remove a skill
wouser skill remove investor-ready-doc-gen
```

### Agent & Extension Management

```bash
# Install agents
wouser agent install npm:@wayofmono/agent-expert-coder
wouser agent list
wouser agent discover

# Install extensions
wouser extension install npm:@wayofmono/extension-web-search
wouser extension list
wouser extension discover
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

### Project Config (`.wo/`)

Created by `wouser --init`:

```
.wo/
├── manifest.json        # Registered skills, agents, extensions
├── models.json          # Model/provider settings
├── skills/              # Installed skills
├── extensions/          # Installed extensions
└── themes/              # Custom themes
```

### Global Config (`~/.wouser/agent/`)

```
~/.wouser/agent/
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

## Programmatic Usage (SDK)

```typescript
import { createAgentSession, ModelRegistry, AuthStorage } from "@wayofmono/wo-agent";

// Create session
const session = await createAgentSession({
  cwd: "/my/project",
  model: someModel,
  thinkingLevel: "medium",
});

// Send prompts
await session.prompt("Analyze this data and generate a report");

// Add custom tools
await session.setTools([...existingTools, myCustomTool]);

// Listen to events
session.addEventListener((event) => {
  switch (event.type) {
    case "message_start": /* ... */ break;
    case "message_end": /* ... */ break;
    case "turn_end": /* ... */ break;
  }
});
```

## Skill Manifest System

`wouser` manages skills, extensions, and agents via a manifest:

```typescript
import { readManifest, discoverNpmSkills } from "@wayofmono/wo-agent";

// Read manifest
const manifest = readManifest(agentDir);

// Discover npm-installed skills
const skills = discoverNpmSkills(agentDir);
```

## Differences from wo-coding-agent

| Feature | wo-coding-agent (`wocode`) | wo-agent (`wouser`) |
|---------|---------------------------|---------------------|
| Binary | `wocode` | `wouser` |
| Purpose | Coding agent CLI | General-purpose SDK |
| Config dir | `~/.wocode/agent/` | `~/.wouser/agent/` |
| Skill CLI | No | Yes (`wouser skill install`) |
| Primary use | Terminal coding assistant | IDE/product integrations |

## Package Dependencies

- `@wayofmono/wo-agent-core` — Core agent runtime
- `@wayofmono/wo-ai` — LLM provider abstraction
- `@wayofmono/wo-tui` — Terminal UI components
- `@wayofmono/wo-user-extra` — Additional extension skills

## Related Packages

- `@wayofmono/wo-coding-agent` — Coding agent CLI (wocode)
- `@wayofmono/wo-agent-core` — Core runtime both are built on
- `@wayofmono/wo-ai` — LLM providers used by this
- `@wayofmono/wo-tui` — Terminal UI used by this

---

*Part of the WayOfMono high-performance coding agent ecosystem.*
