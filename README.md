# WayOfMono (Wo)

> High-performance AI coding agents for the next generation of engineering.

WayOfMono provides two powerful AI coding tools built on a shared intelligence backend:

- **[wocode](#wocode)** — Primary coding agent CLI with terminal UI
- **[wouser](#wouser)** — General-purpose agent SDK for building AI applications

---

## Quick Install

### wocode (Wo Coder)

```bash
# Install globally
npm install -g @wayofmono/wo-coding-agent

# Or use directly
npx @wayofmono/wo-coding-agent
```

### wouser (Wo Agent)

```bash
# Install globally
npm install -g @wayofmono/wo-agent

# Or use directly
npx @wayofmono/wo-agent
```

---

## wocode

Primary coding agent with read, bash, edit, write tools, session management, and terminal UI.

### Start

```bash
# Interactive TUI
wocode

# One-shot prompt
echo "Fix the bug in auth.ts" | wocode --print

# Initialize project
wocode --init
```

### Model Selection

```bash
wocode --model openai/gpt-4o
wocode --model anthropic/claude-sonnet-4-20250514
wocode --list-models
```

### Sessions

```bash
wocode --continue              # Continue last session
wocode --resume                # Pick a session
wocode --session <id>          # Open specific session
wocode --export <session>      # Export to HTML
```

### Built-in Tools

| Tool | Description |
|------|-------------|
| `read` | Read file contents with line ranges |
| `bash` | Execute shell commands with timeout |
| `edit` | Diff-based file editing (find/replace) |
| `write` | Write/overwrite files |
| `grep` | Search file contents with regex |
| `find` | Find files by name/glob |
| `ls` | List directory contents |

### Configuration

**Project config** (`.wocode/`):
```
.wocode/
├── config.json          # Tool configuration
├── models.json          # Model/provider settings
├── skills/              # Installed skills
├── extensions/          # Installed extensions
└── themes/              # Custom themes
```

**Global config** (`~/.wocode/agent/`):
```
~/.wocode/agent/
├── skills/              # Global skills
├── agents/              # Agent definitions
├── extensions/          # Extensions
├── prompts/             # Prompt templates
└── themes/              # Themes
```

### API Keys

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AIza..."

# Ollama (local, no key needed)
ollama pull qwen3.5:9b
ollama serve
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Abort current generation |
| `Ctrl+D` | Exit |
| `Tab` | Accept suggestion |
| `Ctrl+O` | Toggle output expand/collapse |
| `Ctrl+Alt+.` | Cycle theme forward |
| `Ctrl+Alt+,` | Cycle theme backward |

---

## wouser

General-purpose agent SDK for building AI-powered applications with skill management, extensions, and LLM integration.

### Start

```bash
# Interactive TUI
wouser

# One-shot prompt
echo "Analyze this data" | wouser --print

# Initialize project
wouser --init
```

### Skill Management

```bash
wouser skill install investor-ready-doc-gen
wouser skill list
wouser skill discover
wouser skill update
```

### Agent & Extension Management

```bash
wouser agent install npm:@wayofmono/agent-expert-coder
wouser agent list

wouser extension install npm:@wayofmono/extension-web-search
wouser extension list
```

### SDK Usage

```typescript
import { createAgentSession, ModelRegistry, AuthStorage } from "@wayofmono/wo-agent";

const session = await createAgentSession({
  cwd: "/my/project",
  model: someModel,
  thinkingLevel: "medium",
});

await session.prompt("Analyze this data and generate a report");

session.addEventListener((event) => {
  switch (event.type) {
    case "message_start": /* ... */ break;
    case "message_end": /* ... */ break;
  }
});
```

### Configuration

**Project config** (`.wo/`):
```
.wo/
├── manifest.json        # Registered skills, agents, extensions
├── models.json          # Model/provider settings
├── skills/              # Installed skills
├── extensions/          # Installed extensions
└── themes/              # Custom themes
```

**Global config** (`~/.wouser/agent/`):
```
~/.wouser/agent/
├── skills/              # Global skills
├── agents/              # Agent definitions
├── extensions/          # Extensions
├── prompts/             # Prompt templates
└── themes/              # Themes
```

---

## Differences

| Feature | wocode | wouser |
|---------|--------|--------|
| Binary | `wocode` | `wouser` |
| Purpose | Coding agent CLI | General-purpose SDK |
| Config dir | `~/.wocode/agent/` | `~/.wouser/agent/` |
| Skill CLI | No | Yes (`wouser skill install`) |
| Primary use | Terminal coding assistant | IDE/product integrations |

---

## Packages

| Package | Description |
|---------|-------------|
| `@wayofmono/wo-coding-agent` | Coding agent CLI (wocode) |
| `@wayofmono/wo-agent` | General-purpose agent SDK (wouser) |
| `@wayofmono/wo-agent-core` | Core agent runtime |
| `@wayofmono/wo-ai` | LLM provider abstraction |
| `@wayofmono/wo-tui` | Terminal UI components |

---

## Development

```bash
# Clone
git clone https://github.com/Way-Of/wayofmono.git
cd wayofmono

# Install dependencies
pnpm install

# Build
pnpm -r build

# Test
pnpm -r test

# Type check
pnpm -r --parallel typecheck
```

---

## Support

- **GitHub Issues**: https://github.com/Way-Of/wayofmono/issues
- **NPM Packages**: https://www.npmjs.com/settings/wayofmono/packages

---

*Part of the WayOfMono high-performance coding agent ecosystem.*
