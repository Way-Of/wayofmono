# WayOfMono (Wo)

> High-performance AI coding agents for the next generation of engineering.

WayOfMono provides two powerful AI coding tools built on a shared intelligence backend:

- **[wocode](#wocode)** — Primary coding agent CLI with terminal UI
- **[wouser](#wouser)** — General-purpose agent SDK for building AI applications

---

## Quick Install

### wocode (Wo Coder)

npm install -g @wayofmono/wo-coding-agent

### wouser (Wo Agent)

npm install -g @wayofmono/wo-agent

> If you get a permission error, use `sudo` or set a custom prefix:
> `npm config set prefix ~/.npm-global`

---

## wocode

Primary coding agent with read, bash, edit, write tools, session management, and terminal UI.

### Start

wocode

echo "Fix the bug in auth.ts" | wocode --print

wocode --init

### Model Selection

wocode --model openai/gpt-4o

wocode --model anthropic/claude-sonnet-4-20250514

wocode --list-models

### Sessions

wocode --continue

wocode --resume

wocode --session <id>

wocode --export <session>

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

wouser

echo "Analyze this data" | wouser --print

wouser --init

### Skill Management

wouser skill install investor-ready-doc-gen

wouser skill list

wouser skill discover

wouser skill update

### Agent & Extension Management

wouser agent install npm:@wayofmono/agent-expert-coder

wouser agent list

wouser extension install npm:@wayofmono/extension-web-search

wouser extension list

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

git clone https://github.com/Way-Of/wayofmono.git

cd wayofmono

pnpm install

pnpm -r build

pnpm -r test

pnpm -r --parallel typecheck

---

## Support

- **GitHub Issues**: https://github.com/Way-Of/wayofmono/issues
- **NPM Packages**: https://www.npmjs.com/settings/wayofmono/packages

---

*Part of the WayOfMono high-performance coding agent ecosystem.*
