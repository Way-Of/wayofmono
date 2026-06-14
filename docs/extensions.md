# Extensions

Wo supports extensions to add custom functionality to agents.

## Overview

Extensions are modular add-ons that can:
- Add custom tools
- Provide new capabilities
- Integrate with external services
- Extend the agent runtime

## Structure

```
extensions/
├── my-extension/
│   ├── package.json
│   ├── index.ts          # Entry point
│   ├── tools/            # Custom tools
│   ├── skills/           # Custom skills
│   └── themes/           # Custom themes
```

## Creating an Extension

### 1. Package.json

```json
{
  "name": "@myorg/wo-extension-example",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "peerDependencies": {
    "@wayofmono/wo-agent-core": "^1.0.0"
  }
}
```

### 2. Extension Entry Point

```typescript
// index.ts
import { Extension } from '@wayofmono/wo-agent-core';

export const myExtension: Extension = {
  name: 'my-extension',
  version: '1.0.0',
  tools: [
    // Custom tools
  ],
  skills: [
    // Custom skills
  ],
  onLoad: async (context) => {
    // Initialization logic
  },
  onUnload: async (context) => {
    // Cleanup logic
  }
};

export default myExtension;
```

### 3. Custom Tool

```typescript
// tools/my-tool.ts
import { Tool } from '@wayofmono/wo-agent-core';

export const myTool: Tool = {
  name: 'my_tool',
  description: 'Does something useful',
  parameters: {
    type: 'object',
    properties: {
      input: { type: 'string', description: 'Input parameter' }
    },
    required: ['input']
  },
  execute: async ({ input }) => {
    return `Processed: ${input}`;
  }
};
```

## Installation

### Via Harness (Recommended)

```bash
ai-harness --tool=wocoder --skill=extensions --yes
```

### Manual

```bash
npm install @myorg/wo-extension-example

# Add to settings.json
{
  "extensions": ["@myorg/wo-extension-example"]
}
```

## Built-in Extensions

| Extension | Package | Description |
|-----------|---------|-------------|
| web-access | `@wayofmono/web-access` | Web search, fetch, GitHub clone, PDF/YouTube |
| open-editor | built-in | File editing capabilities |
| subagent | built-in | Parallel task delegation |

## Loading Extensions

Extensions are loaded from:
1. Global: `~/.wocoder/agent/extensions/`
2. Project: `.wo/agent/extensions/`
3. Shared: `~/.agents/extensions/`
4. npm packages in `settings.json`

## Publishing

```bash
npm publish --access public
```

## Related

- [Wo Coder Guide](guides/wocoder/)
- [Skills](skills.md)
- [TUI Components](tui.md)
- [SDK](sdk.md)