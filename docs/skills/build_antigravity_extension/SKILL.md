---
name: build_antigravity_extension
description: Antigravity extensions expert — knows how to build custom tools, event handlers, commands, shortcuts, state management, custom rendering, and tool overrides. Use when the user wants to create or modify Antigravity extensions.
docs-url: 
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

Antigravity extensions are TypeScript files with a default export receiving `ExtensionAPI`.

### Custom Tools
```ts
antigravity.registerTool({
  name: "my-tool",
  description: "...",
  parameters: Type.Object({ ... }),
  execute: async (ctx, args) => { ... }
})
```

### Event System
Events: `session_start`, `tool_call`, `tool_result`, `before_agent_start`, `context`, `agent_start/end`, `turn_start/end`, `message`, `input`, `model_select`

### Registration APIs
- `antigravity.registerCommand({ name, description, handler, autocomplete })`
- `antigravity.registerShortcut(keyId, { description, handler })`
- `antigravity.registerFlag({ name, description, handler })`
- `antigravity.registerProvider({ ... })`

### State & Communication
- `antigravity.appendEntry()` — state management
- `antigravity.sendMessage()` / `antigravity.sendUserMessage()` — message injection
- `antigravity.exec()` — shell commands
- `antigravity.setActiveTools()` / `antigravity.getActiveTools()` / `antigravity.getAllTools()`

### Custom Rendering
- `renderCall` / `renderResult` — custom tool UI rendering

### Imports
- `@mariozechner/antigravity-coding-agent`
- `@sinclair/typebox` (TypeBox schemas)
- `@mariozechner/antigravity-ai` (StringEnum)
- `@mariozechner/antigravity-tui` (UI components)

### Locations
- `~/.antigravity/extensions/` — global
- `.agents/extensions/` — project

### Key Rules
1. Use TypeBox for schemas, StringEnum for Google compat
2. Tool registration at top level (not inside event handlers)
3. Always guard shortcuts with `if (!ctx.hasUI) return;`
