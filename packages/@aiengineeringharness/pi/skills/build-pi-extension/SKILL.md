---
name: build-pi-extension
description: Pi extensions expert — knows how to build custom tools, event handlers, commands, shortcuts, state management, custom rendering, and tool overrides. Use when the user wants to create or modify Pi extensions.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

Pi extensions are TypeScript files with a default export receiving `ExtensionAPI`.

### Custom Tools
```ts
pi.registerTool({
  name: "my-tool",
  description: "...",
  parameters: Type.Object({ ... }),
  execute: async (ctx, args) => { ... }
})
```

### Event System
Events: `session_start`, `tool_call`, `tool_result`, `before_agent_start`, `context`, `agent_start/end`, `turn_start/end`, `message`, `input`, `model_select`

### Registration APIs
- `pi.registerCommand({ name, description, handler, autocomplete })`
- `pi.registerShortcut(keyId, { description, handler })`
- `pi.registerFlag({ name, description, handler })`
- `pi.registerProvider({ ... })`

### State & Communication
- `pi.appendEntry()` — state management
- `pi.sendMessage()` / `pi.sendUserMessage()` — message injection
- `pi.exec()` — shell commands
- `pi.setActiveTools()` / `pi.getActiveTools()` / `pi.getAllTools()`

### Custom Rendering
- `renderCall` / `renderResult` — custom tool UI rendering

### Imports
- `@mariozechner/pi-coding-agent`
- `@sinclair/typebox` (TypeBox schemas)
- `@mariozechner/pi-ai` (StringEnum)
- `@mariozechner/pi-tui` (UI components)

### Locations
- `~/.pi/agent/extensions/` — global
- `.pi/extensions/` — project

### Key Rules
1. Use TypeBox for schemas, StringEnum for Google compat
2. Tool registration at top level (not inside event handlers)
3. Always guard shortcuts with `if (!ctx.hasUI) return;`
