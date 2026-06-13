# Pi Agent Extensions

> [!NOTE]
> This reference guide is based on the official [Pi Documentation](https://pi.dev).

Extensions are TypeScript or JavaScript modules that hook into the Pi agent runtime to add custom commands, tools, event listeners, or model providers. Extensions are the primary mechanism for customizing and scaling Pi's core runtime.

---

## 📂 Storage Locations

Extensions are loaded dynamically on startup from the following locations:

1. **Global Extensions**: Located under `~/.pi/agent/extensions/`
2. **Workspace Extensions**: Located under `<workspace-root>/.agents/extensions/`

---

## 🛠️ Key Capabilities of Extensions

An extension code file (e.g., `open-editor.ts` or a folder like `subagent/index.ts`) can interact with the Pi runtime to provide:

### 1. Custom Tools
Extensions can register new tool definitions (with schemas) that the agent can execute. The runtime handles routing calls to the extension's JS/TS implementation.

### 2. Custom slash Commands
Register custom CLI terminal slash commands (e.g., `/edit` or `/commit`) and execute custom logic using the Pi session instance.

### 3. Event Subscriptions
Hook into agent lifecycle events, such as:
*   `session.created`
*   `message.sent`
*   `tool.executed`
*   `agent.shutdown`

### 4. Custom Model Providers & Workflows
Build complex orchestration loops. For example, the **`subagent`** extension registers the agents and prompts required for chain, serial, or parallel multi-agent delegation.

---

## 📄 Extension Example (Basic Tool Registration)

Below is a simplified example of registering a custom command and tool inside an extension:

```typescript
import { ExtensionContext } from "@earendil-works/pi-agent-core";

export function activate(context: ExtensionContext) {
  // Register a custom command
  context.registerCommand("my-command", async (session, args) => {
    session.writeLine(`Command triggered with arguments: ${args.join(", ")}`);
  });

  // Register a custom tool
  context.registerTool({
    name: "read_env_var",
    description: "Retrieve value of an environment variable.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" }
      },
      required: ["name"]
    },
    execute: async ({ name }) => {
      return process.env[name] || "undefined";
    }
  });
}
```
