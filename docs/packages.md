# Wo Packages

All 13 NPM packages published under `@wayofmono` scope.

## Package List

| Package | Version | Description | Size |
|---------|---------|-------------|------|
| `@wayofmono/wo-ai` | 1.x | Multi-Provider LLM API | 4.0M |
| `@wayofmono/wo-tui` | 1.x | High-Performance Terminal UI | 1.5M |
| `@wayofmono/wo-agent-core` | 1.x | Agent Runtime & Extension API | 1.1M |
| `@wayofmono/wo-agent` | 1.x | General-Purpose Agent SDK + CLI (wouser) | 8.2M |
| `@wayofmono/wo-coding-agent` | 1.x | CLI Coding Agent (wocode) | 8.2M |
| `@wayofmono/wo-skill-docs` | 1.x | Multi-format Documentation Expert | 148K |
| `@wayofmono/wo-mermaid` | 1.x | TUI Mermaid Renderer (ASCII) | 3.9M |
| `@wayofmono/web-access` | 1.x | Web search, fetch, GitHub, PDF, YouTube | 7.7M |
| `@wayofmono/lens` | 1.x | Codebase Analysis & Safety Engine | 2.1M |
| `@wayofmono/wo-web-ui` | 1.x | Web UI Components (React 19) | 224K |
| `@wayofmono/telemetry` | 1.x | Telemetry and metrics | 188K |
| `@wayofmono/telegram` | 1.x | Telegram bot integration | 88K |
| `@wayofmono/whatsapp` | 1.x | WhatsApp bot integration | 88K |

## Install from NPM

```bash
# Individual packages
npm install @wayofmono/wo-agent
npm install @wayofmono/wo-coding-agent
npm install @wayofmono/wo-ai

# All core packages
npm install @wayofmono/wo-agent @wayofmono/wo-coding-agent @wayofmono/wo-ai @wayofmono/wo-tui
```

## Install from Repo (Development)

```bash
git clone https://github.com/Way-Of/wayofmono.git ~/wayofmono

# Link packages
pnpm add ~/wayofmono/packages/@wayofmono/wo-agent
pnpm add ~/wayofmono/packages/@wayofmono/wo-coding-agent
pnpm add ~/wayofmono/packages/@wayofmono/wo-ai
```

## Package Details

### @wayofmono/wo-ai
**Multi-Provider LLM API**
```typescript
import { createLLMClient } from '@wayofmono/wo-ai';

const client = createLLMClient({
  provider: 'ollama',
  model: 'qwen3.5:9b'
});

await client.complete({ messages: [{ role: 'user', content: 'Hi' }] });
```
- Providers: Ollama, OpenAI, Anthropic, Gemini, Azure, Bedrock, Vertex, Custom
- Streaming, tool calling, structured output
- Zero dependencies

### @wayofmono/wo-tui
**Terminal UI Library (React Ink)**
```tsx
import { Box, Text, Flex, useInput } from '@wayofmono/wo-tui';

export const MyComponent = () => {
  useInput((input, key) => {
    if (key.return) handleSubmit();
  });
  return <Box><Text>Hello TUI</Text></Box>;
};
```
- Built on React Ink
- Theming, keybindings, layouts
- Components: Header, ToolDisplay, SessionTree, ModelSelector

### @wayofmono/wo-agent-core
**Agent Runtime**
```typescript
import { AgentSession, Extension, Tool } from '@wayofmono/wo-agent-core';

const session = new AgentSession({
  extensions: [myExtension],
  tools: [myTool]
});
```
- Session management, context compaction
- Extension system, tool execution pipeline
- Event streaming

### @wayofmono/wo-agent
**User Agent SDK + CLI (wouser)**
```bash
# As SDK
npm install @wayofmono/wo-agent

# CLI
npx wouser --init
./wouser
```
- Runtime dependency (bundled in your app)
- Multi-provider, extensions, skills
- Session fork/resume

### @wayofmono/wo-coding-agent
**Coding Agent CLI (wocode)**
```bash
# Dev dependency
npm install --save-dev @wayofmono/wo-coding-agent

npx wocode --init
./wocode
```
- Dev dependency (tool for engineers)
- TUI, packets (web-access, open-editor, subagent)
- Project-local install

### @wayofmono/wo-skill-docs
**Documentation Expert**
```typescript
import { generateDocs } from '@wayofmono/wo-skill-docs';

await generateSkillsDocs({
  input: 'skills/',
  output: 'docs/skills/',
  format: 'mdx'
});
```
- SKILL.md → MDX, HTML, PDF, JSON
- Cross-reference generation
- Multi-format output

### @wayofmono/wo-mermaid
**Mermaid Renderer (ASCII)**
```typescript
import { renderMermaid } from '@wayofmono/wo-mermaid';

const ascii = await renderMermaid(`
  graph TD
    A --> B
    B --> C
`);
```
- Renders Mermaid to ASCII in terminal
- Used in TUI for diagrams
- No headless browser needed

### @wayofmono/web-access
**Web Tools Packet**
```typescript
import { webAccessPacket } from '@wayofmono/web-access';

const tools = webAccessPacket.tools;
// web_search, fetch_url, github_clone, extract_pdf, extract_youtube
```
- Web search (DuckDuckGo, Google, Bing)
- URL fetching with readability
- GitHub repo cloning
- PDF text extraction
- YouTube transcript extraction

### @wayofmono/lens
**Codebase Analysis**
```typescript
import { analyzeCodebase } from '@wayofmono/lens';

const analysis = await analyzeCodebase({
  path: './src',
  includePatterns: ['**/*.ts', '**/*.tsx']
});
```
- Dependency graph
- Complexity metrics
- Dead code detection
- Safety analysis

### @wayofmono/wo-web-ui
**React Web Components**
```tsx
import { ChatWindow, MessageList, ToolDisplay } from '@wayofmono/wo-web-ui';

<ChatWindow session={session} />
```
- React 19, Tailwind CSS
- Chat interface components
- Tool display, session tree

### @wayofmono/telemetry
**Telemetry & Metrics**
```typescript
import { initTelemetry, recordMetric } from '@wayofmono/telemetry';

initTelemetry({ serviceName: 'my-app' });
recordMetric('request.duration', 150, { endpoint: '/api/users' });
```
- OpenTelemetry compatible
- Metrics, traces, logs
- Dashboard integration

### @wayofmono/telegram
**Telegram Bot**
```typescript
import { createTelegramBot } from '@wayofmono/telegram';

const bot = createTelegramBot({ token: process.env.BOT_TOKEN });
bot.onMessage(async (msg) => { /* handle */ });
```
- Bot API wrapper
- Webhook + polling
- Session management

### @wayofmono/whatsapp
**WhatsApp Bot**
```typescript
import { createWhatsAppBot } from '@wayofmono/whatsapp';

const bot = createWhatsAppBot({ /* config */ });
bot.onMessage(async (msg) => { /* handle */ });
```
- WhatsApp Web API
- Multi-device support
- Session persistence

## Dependency Graph

```
@wayofmono/wo-agent
  ├── @wayofmono/wo-agent-core
  │   ├── @wayofmono/wo-ai
  │   ├── @wayofmono/wo-tui
  │   └── @wayofmono/telemetry
  └── @wayofmono/web-access (optional)

@wayofmono/wo-coding-agent
  ├── @wayofmono/wo-agent
  └── @wayofmono/wo-mermaid
```

## Versioning

All packages versioned together:
- Check: `ai-harness --check`
- Update: `ai-harness --update`
- Publish: Tag `v*` triggers CD workflow

## Related

- [SDK](sdk.md)
- [Wo Coder](guides/wocode/)
- [Wo User](guides/wouser/)
- [NPM Registry](https://www.npmjs.com/settings/wayofmono/packages)