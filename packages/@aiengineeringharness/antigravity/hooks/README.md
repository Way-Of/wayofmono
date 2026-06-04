# Antigravity Hooks

> [!NOTE]
> This reference guide is based on the official [Antigravity Hooks Documentation](https://antigravity.google/docs/hooks).

Hooks are interceptors that allow you to monitor, inspect, and modify the behavior of an Antigravity agent at specific stages of its execution lifecycle. Hooks are essential for enforcing custom rules, running linters, logging diagnostic traces, and establishing security guardrails (e.g., blocking forbidden commands or sensitive credentials).

---

## 📂 Configuration Locations

Hooks are discovered by checking for a `hooks.json` configuration file in the following locations:

1. **Global Hooks**: Configured in `~/.gemini/config/hooks.json` or inside a global plugin folder at `~/.gemini/config/plugins/<pluginName>/hooks.json`.
2. **Workspace-Specific Hooks**: Configured in `<workspace-root>/.agents/hooks.json`. These are shared across your project team and committed to git.

---

## ⚡ Lifecycle Events

Hooks can hook into the following key events during the execution of an agent:

*   **`PreInvocation`**: Triggers before the model is prompted or invoked. Useful for preparing prompts or sanitizing user inputs.
*   **`PreToolUse`**: Fires immediately before a tool is executed. This is the primary event used for permission checks and safety guardrails.
*   **`PostToolUse`**: Fires immediately after a tool execution finishes, allowing you to validate results or capture side effects.
*   **`PostInvocation`**: Fires after a model call completes and outputs are generated. Used for auditing output safety.
*   **`Stop`**: Fires when the execution loop terminates.

---

## 🛠️ Hook Types (SDK Hook Model)

When writing programmatic hooks using the Antigravity SDK, hooks are divided into three functional categories:

| Hook Type | Nature | Mode | Primary Use Cases |
| :--- | :--- | :--- | :--- |
| **Inspect** | Read-Only | Non-Blocking | Tracing, telemetry logging, auditing, and diagnostic captures. |
| **Decide** | Read-Only | Blocking | Access control policies, custom permission rules, and guardrails (allowing/denying tool runs). |
| **Transform** | Modifying | Blocking | Data sanitization, prompt augmentation, output filtering, and automated error recovery. |

---

## 📄 JSON Hook Configuration Example (`hooks.json`)

JSON hooks execute shell commands or custom scripts in response to lifecycle events.

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "tool": "run_command",
      "command": "python3 hooks/verify_command_safety.py",
      "type": "Decide"
    },
    {
      "event": "PostToolUse",
      "tool": "write_file",
      "command": "eslint --fix ${filePath}",
      "type": "Transform"
    },
    {
      "event": "PostInvocation",
      "command": "node hooks/log_telemetry.js",
      "type": "Inspect"
    }
  ]
}
```

### JSON Hook Execution Rules:
*   **Decide Hooks**: If the script exits with a non-zero status code, the action is blocked, and the agent is prevented from executing the tool.
*   **Transform Hooks**: The hook script can modify the arguments passed to a tool or the outputs returned by it.
*   **Inspect Hooks**: Runs asynchronously without delaying the execution of the agent.
