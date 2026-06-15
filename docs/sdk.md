# SDK — @wayofmono/wo-agent

General-purpose agent SDK for embedding AI capabilities in your application.

## Overview

The Wo User SDK (`@wayofmono/wo-agent`) is a **runtime dependency** — your application bundles it and end-users interact with it.

```bash
npm install @wayofmono/wo-agent
```

## Core Packages

| Package | Description |
|---------|-------------|
| `@wayofmono/wo-agent` | Main SDK + CLI (wouser) |
| `@wayofmono/wo-agent-core` | Agent runtime, extensions, tools |
| `@wayofmono/wo-ai` | Multi-provider LLM API |

## Quick Start

```typescript
import { createAgentSession } from '@wayofmono/wo-agent';

const session = await createAgentSession({
  cwd: process.cwd(),
  model: 'qwen3.5:9b',
  provider: 'ollama',
  systemPrompt: 'You are a helpful coding assistant.'
});

const result = await session.prompt('Create a React button component');
console.log(result.text);
```

## Agent Session

### createAgentSession(options)

```typescript
interface SessionOptions {
  cwd: string;
  model: string;
  provider: 'ollama' | 'openai' | 'anthropic' | 'gemini';
  systemPrompt?: string;
  extensions?: Extension[];
  tools?: Tool[];
  settings?: Settings;
  onEvent?: (event: SessionEvent) => void;
}
```

### Session Methods

```typescript
// Send prompt, get response
const result = await session.prompt('Build a REST API');

// Stream response
for await (const chunk of session.streamPrompt('Build a REST API')) {
  process.stdout.write(chunk.text);
}

// Get conversation history
const history = session.getHistory();

// Fork session at point
const forked = session.fork(messageIndex);

// Resume from fork
await session.resume(forkedSessionId);

// Compact context (summarize old messages)
await session.compact();
```

## Multi-Provider LLM (@wayofmono/wo-ai)

```typescript
import { createLLMClient } from '@wayofmono/wo-ai';

const client = createLLMClient({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o'
});

const response = await client.complete({
  messages: [{ role: 'user', content: 'Hello' }],
  tools: [...],
  stream: true
});
```

### Supported Providers

| Provider | Models | Config |
|----------|--------|--------|
| Ollama | qwen3.5:9b, llama3.1, etc. | Local, no API key |
| OpenAI | gpt-4o, gpt-4o-mini, etc. | `OPENAI_API_KEY` |
| Anthropic | claude-3.5-sonnet, etc. | `ANTHROPIC_API_KEY` |
| Gemini | gemini-1.5-pro, etc. | `GEMINI_API_KEY` |

## Extensions

```typescript
import { Extension, Tool } from '@wayofmono/wo-agent-core';

const myExtension: Extension = {
  name: 'my-extension',
  version: '1.0.0',
  tools: [myCustomTool],
  skills: [mySkill],
  onLoad: async (ctx) => { /* setup */ },
  onUnload: async (ctx) => { /* cleanup */ }
};

// Use in session
const session = await createAgentSession({
  extensions: [myExtension]
});
```

## Tools

```typescript
import { Tool } from '@wayofmono/wo-agent-core';

const myTool: Tool = {
  name: 'my_tool',
  description: 'Description for the LLM',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'First param' }
    },
    required: ['param1']
  },
  execute: async ({ param1 }) => {
    return { result: `Processed: ${param1}` };
  }
};
```

## Skills

Load skills from filesystem:

```typescript
import { loadSkills } from '@wayofmono/wo-agent-core';

const skills = await loadSkills([
  '~/.wocode/agent/skills',
  '.wo/agent/skills',
  './my-skills'
]);

const session = await createAgentSession({
  skills
});
```

## Configuration

### models.json

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "models": ["qwen3.5:9b", "llama3.1:8b"]
    },
    "openai": {
      "apiKey": "${OPENAI_API_KEY}",
      "models": ["gpt-4o", "gpt-4o-mini"]
    }
  },
  "defaultProvider": "ollama",
  "defaultModel": "qwen3.5:9b"
}
```

### settings.json

```json
{
  "theme": "tokyo-night",
  "maxContextTokens": 128000,
  "compactThreshold": 0.8,
  "streamOutput": true,
  "extensions": ["@myorg/wo-extension"]
}
```

## CLI (wouser)

```bash
# Initialize project
npx wouser --init

# Start interactive
./wouser

# One-shot prompt
./wouser -p "Create a React component"

# Stream output
./wouser -p "Create a React component" --stream
```

## Deployment

- **Bundle size**: ~8MB (wo-agent + deps)
- **Runtime**: Node.js 20+, Bun, Deno
- **Edge**: Works in Vercel Edge, Cloudflare Workers (with adaptations)

## Related

- [Wo User Guide](guides/wouser/)
- [Wo Coder Guide](guides/wocode/)
- [Custom Provider](custom-provider.md)
- [Models](models.md)
- [Packages](packages.md)