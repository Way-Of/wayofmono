# Wo User (wouser) Guide

> General-purpose user agent SDK + CLI — for building AI features in your app

## What is Wo User?

Wo User (`wouser`) is a **runtime dependency** (standard dependency, not dev-dependency). It's an SDK for embedding agent capabilities in your application.

```bash
npm install @wayofmono/wo-agent
npx wouser --init
./wouser
```

## Architecture

```
┌─────────────────────────────────────┐
│        AI Engineering Harness       │  ← Core: skills, agents, commands for 7 tools
├─────────────────────────────────────┤
│          Wo User (wouser)           │  ← SDK: Agent runtime, multi-provider LLM, extensions
├─────────────────────────────────────┤
│         Your Application            │  ← Your code uses wouser as a library
└─────────────────────────────────────┘
```

## Key Features

### Multi-Provider LLM API (`@wayofmono/wo-ai`)
- OpenAI, Anthropic, Gemini, Ollama
- Unified interface across providers
- Streaming and tool calling support

### Agent Runtime (`@wayofmono/wo-agent-core`)
- Session management
- Extension system
- Tool execution pipeline
- Compaction and context management

### Extension System
- Custom tools
- Skills loading
- Themes and TUI components
- MCP server integration

## Installation

```bash
# As SDK for your app
npm install @wayofmono/wo-agent

# CLI for testing
npx wouser --init
./wouser
```

## Usage as SDK

```typescript
import { createAgentSession } from '@wayofmono/wo-agent';

const session = await createAgentSession({
  cwd: process.cwd(),
  model: 'qwen3.5:9b',
  provider: 'ollama',
});

const result = await session.prompt('Build me a React component');
```

## Configuration

- `models.json` — LLM provider configuration
- `settings.json` — Agent behavior
- `.mcp.json` — MCP servers

## Dev vs Runtime Dependency

| Aspect | wocode (dev) | wouser (runtime) |
|--------|--------------|------------------|
| Purpose | Tool for engineers | SDK for your app |
| Bundle | Never bundled | Bundled in your app |
| Install | `--save-dev` | `--save` (default) |
| Users | You (developer) | Your end-users |

## Related

- [Wo Coder (wocode)](../wocode/) — CLI coding assistant (dev tool)
- [AI Engineering Harness](../ai-harness/) — Core skill/agent management
- [Getting Started](../getting-started.md) — Quick start for all components