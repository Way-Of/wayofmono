# @wayofmono/wo-agent-core

Central Agent Runtime and ExtensionAPI for the Wo ecosystem. Provides the SDK that all Wo extensions, commands, tools, and lifecycle hooks register against.

```
npm install @wayofmono/wo-agent-core
```

## Usage

```ts
import { WoExtensionAPI, loadSkills, parseFrontmatter, truncateHead, formatSize, discoverAndLoadExtensions } from "@wayofmono/wo-agent-core";

// Create the extension API
const pi = new WoExtensionAPI("/path/to/project");

// Register a slash command
pi.registerCommand("hello", {
  description: "Say hello",
  handler: async (args, ctx) => {
    ctx.ui.notify(`Hello, ${args || "world"}!`, "info");
  },
});

// Register a tool
pi.registerTool({
  name: "my_tool",
  description: "Does something useful",
  parameters: Type.Object({ input: Type.String() }),
  async execute(toolCallId, params, signal, onUpdate, ctx) {
    return {
      content: [{ type: "text", text: `Result: ${params.input}` }],
    };
  },
});

// Register lifecycle handler
pi.on("session_start", async (event, ctx) => {
  console.log("Session started in", ctx.cwd);
});

// Register a flag
pi.registerFlag("debug", { type: "boolean", default: false });

// Skill loading
const { skills } = await loadSkills({ cwd: "/path/to/project" });
const { frontmatter, body } = parseFrontmatter(skillContent);

// Utilities
const truncated = truncateHead(longText, 1024, 100);
const size = formatSize(1048576); // "1.0 MB"

// Discover and load extensions from directories
const { pi, errors } = await discoverAndLoadExtensions(["/path/to/extensions"], cwd);
```

## Extension Pattern

Create a Wo extension by default-exporting a function that receives `ExtensionAPI`:

```ts
// my-extension.ts
import type { ExtensionAPI } from "@wayofmono/wo-agent-core";

export default function (pi: ExtensionAPI): void {
  pi.registerCommand("my-cmd", {
    description: "My custom command",
    handler: async (args, ctx) => {
      ctx.ui.setStatus("Working...");
      const result = await pi.exec("echo", ["hello"]);
      ctx.ui.notify(`Exit code: ${result.code}`, "info");
    },
  });

  pi.on("tool_result", async (event) => {
    console.log("Tool executed:", event);
  });
}
```

## API

### ExtensionAPI
| Method | Description |
|--------|-------------|
| `registerCommand(name, cmd)` | Register a `/wom-*` slash command |
| `registerTool(tool)` | Register an LLM-callable tool |
| `registerFlag(name, def)` | Register a CLI flag |
| `registerShortcut(key, def)` | Register a keyboard shortcut |
| `on(event, handler)` | Register lifecycle event handler |
| `getFlag(name)` | Read current flag value |
| `getActiveTools()` / `setActiveTools(names)` | Manage active tools |
| `getAllTools()` | List all registered tools |
| `exec(cmd, args?)` | Run shell command |
| `sendMessage(msg, opts?)` | Send a message to the LLM |
| `appendEntry(key, data)` | Append to session entry log |
| `registerProvider(name, config)` | Register an LLM provider |

### Lifecycle Events
`session_start`, `session_shutdown`, `session_compact`, `session_tree`, `before_agent_start`, `agent_start`, `agent_end`, `turn_start`, `turn_end`, `tool_call`, `tool_execution_start`, `tool_execution_end`, `tool_result`, `user_bash`, `model_select`, `input`, `context`, `resources_discover`

### ExtensionUIContext
`notify()`, `confirm()`, `input()`, `select()`, `setWidget()`, `setStatus()`, `setWorkingMessage()`, `setHiddenThinkingLabel()`, `onTerminalInput()`, `pasteToEditor()`, `theme`

### Utilities
| Function | Description |
|----------|-------------|
| `truncateHead(text, maxBytes?, maxLines?)` | Truncate text by byte/line limits |
| `formatSize(bytes)` | Human-readable file size |
| `convertToLlm(messages)` | Normalize message format |
| `isToolCallEventType(toolName, event)` | Type guard for tool_call events |
| `getMarkdownTheme(theme)` | Markdown theme from base theme |
| `withFileMutationQueue(fn)` | Atomic file write queue |

### Skill Loading
| Function | Description |
|----------|-------------|
| `loadSkills(opts)` | Discover and load `.md` skill files |
| `parseFrontmatter(content)` | Parse YAML frontmatter from markdown |
| `stripFrontmatter(content)` | Strip frontmatter, return body |
| `getAgentDir()` | Get agent config directory (`~/.wo/agent/`) |

### Extension Runtime
| Function | Description |
|----------|-------------|
| `discoverAndLoadExtensions(paths, cwd)` | Discover and load extensions from directories |
| `createExtensionRuntime()` | Create standalone extension runtime |

### Components
| Class | Description |
|-------|-------------|
| `DynamicBorder` | Animated spinner with text |
| `BorderedLoader` | Static bordered loading box |
| `keyHint(label, keys)` | Render keyboard shortcut hint |

## Types

`ExtensionAPI`, `ExtensionContext`, `ExtensionCommandContext`, `ExtensionUIContext`, `CommandDefinition`, `ToolDefinition`, `ToolInfo`, `FlagDefinition`, `ShortcutDefinition`, `EventHandler`, `AgentToolResult`, `AgentToolUpdateCallback`, `ExecResult`, `SendMessageParams`, `ProviderConfig`, `SessionManager`, `ModelRegistry`, `RegisteredCommand`, `Skill`, `SessionEntry`, `TruncationResult`, `BeforeAgentStartEvent`, `BeforeAgentStartEventResult`, `InputEvent`, `InputEventResult`, `ResourceDiagnostic`, `SelectItem`, `Message`, `Theme`, `Component`
