# External Integrations

Projects that integrate with WayOfMono packages.

## Way of Pi

**Repository**: https://github.com/Way-Of/pi
**Description**: AI-augmented engineering platform (Electron/Web IDE)
**Integration**: Uses `@wayofmono/wo-agent` as backend SDK

### Usage

```bash
# In Way of Pi project
pnpm add @wayofmono/wo-agent
```

```typescript
import { createAgentSession } from '@wayofmono/wo-agent';

const session = await createAgentSession({
  cwd: process.cwd(),
  model: 'qwen3.5:9b',
  provider: 'ollama'
});
```

## Way of Work (WoW)

**Repository**: https://github.com/Way-Of/work
**Description**: AI-powered productivity platform
**Integration**: Uses `@wayofmono/wo-agent` as user agent SDK

### Usage

```bash
# In Way of Work project
pnpm add @wayofmono/wo-agent
```

```typescript
import { createAgentSession } from '@wayofmono/wo-agent';

const session = await createAgentSession({
  cwd: process.cwd(),
  model: 'gpt-4o',
  provider: 'openai'
});
```

## Integration Pattern

Both external projects follow the same pattern:

1. **Install** `@wayofmono/wo-agent` as runtime dependency
2. **Initialize** agent session with project config
3. **Use SDK** for chat, tools, extensions, skills
4. **Deploy** with their own infrastructure

## Shared Packages

| Package | Used By |
|---------|---------|
| `@wayofmono/wo-agent` | Pi, WoW |
| `@wayofmono/wo-ai` | Pi, WoW |
| `@wayofmono/wo-tui` | Pi |
| `@wayofmono/telemetry` | Pi, WoW |
| `@wayofmono/wo-web-ui` | WoW |

## Related

- [SDK Documentation](../sdk.md)
- [Packages Overview](../../packages.md)
- [Wo User Guide](../wouser/)