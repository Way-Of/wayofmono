# Gemini / Antigravity Sidecars

Sidecars are background processes that run alongside Gemini. Gemini manages the lifecycle of sidecars, automatically launching them and restarting them if they crash or error. They are useful for persistent background scripts, scheduled recurring tasks, and reacting to events.

---

## 📂 Configuration & Locations

Sidecars are discovered by searching for `sidecar.json` configuration files. They can be defined in two locations:

1. **Global sidecars**: Located under `~/.gemini/config/sidecars/`
2. **Plugin sidecars**: Located under `~/.gemini/config/plugins/<pluginName>/sidecars/`

Each sidecar has its own directory. The directory name is used as the sidecar’s ID. 
- For global sidecars: `<sidecarName>`
- For plugin sidecars: `<pluginName>/<sidecarName>`

### Directory Structure Example

```
~/.gemini/config/sidecars/
├── sidecar1/
│   ├── sidecar.json
│   └── script.py
└── sidecar2/
    └── sidecar.json

~/.gemini/config/plugins/
└── my-plugin/
      └── sidecars/
            └── plugin-sidecar/
                  └── sidecar.json
```

The sidecar’s directory acts as the **current working directory (CWD)** for the sidecar’s command and must contain a `sidecar.json` file. It can also contain other helper files (e.g., Python/Node scripts).

---

## 📄 Config Schema (`sidecar.json`)

The `sidecar.json` file defines how the sidecar is executed and restarted.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`command`** | `string` | Yes* | Command/executable to run (e.g. `python3` or `/bin/bash`). *Mutually exclusive with `builtin`.* |
| **`builtin`** | `string` | Yes* | Built-in command to execute (currently supports `schedule`). *Mutually exclusive with `command`.* |
| **`args`** | `string[]` | No | Arguments passed to the command or builtin function. |
| **`restart_policy`**| `string` | No | Restart behavior. One of `always` (default), `on-failure`, or `never`. |
| **`description`** | `string` | No | Human-readable description of what the sidecar does. |
| **`env`** | `object` | No | Key-value map of environment variables to set for the sidecar process. |
| **`display_name`** | `string` | No | Display name used in the UI. |

*One of `command` or `builtin` must be set.*

### Schema Examples

#### Example 1: External Python Script (Background Worker)
```json
{
  "description": "Background worker",
  "command": "python3",
  "args": [
    "worker.py"
  ],
  "restart_policy": "on-failure"
}
```

#### Example 2: Built-in Scheduler
```json
{
  "description": "Hourly agent to triage review requests.",
  "builtin": "schedule",
  "args": [
    "0 * * * *",
    "agentapi",
    "new-conversation",
    "Give me a summary of incoming review requests."
  ]
}
```

---

## ⚙️ User Configuration (`config.json`)

Sidecars are disabled by default. They must be explicitly enabled by the user in the global configuration file located at `~/.gemini/config/config.json`.

```json
{
  "sidecars": {
    "sidecar1": {
      "enabled": true
    },
    "my-plugin/plugin-sidecar": {
      "enabled": true,
      "projectId": "<projectId>"
    }
  }
}
```

### Config Options
- **`enabled`** (boolean): Whether the sidecar is enabled and managed.
- **`projectId`** (string): Optional. The ID of the project `agentapi` will create conversations in. (Required for sidecars using the `agentapi new-conversation` command).

---

## 💾 Runtime Data

Runtime data produced by sidecars is stored in `~/.gemini/antigravity/sidecar_data/<sidecarId>/`. 

The directories include:
- **`data/`**: Subdirectory for persistent data. This path is injected into the sidecar process environment as `ANTIGRAVITY_EXECUTABLE_DATA_DIR`.
- **`logs/`**: Auto-generated timestamped logs from the process's `stdout` and `stderr`.
- **`events/`**: JSON files recorded for `agentapi` calls.

---

## 🗓️ Builtin: `schedule`

`schedule` is a built-in cron scheduler for running recurring commands.

```json
{
  "builtin": "schedule",
  "args": [
    "* * * * *",
    "<command>",
    "<arg1>",
    "<arg2>"
  ]
}
```
* **First argument**: A standard 5-field cron expression (e.g. `*/5 * * * *` for every 5 minutes).
* **Remaining arguments**: The executable command and its arguments to run when the schedule triggers.

---

## 🤖 `agentapi` CLI Interface

Sidecars can use the `agentapi` CLI to programmatically interact with Antigravity / Gemini. The executable is automatically added to the sidecar’s `PATH`.

### 1. Create a New Conversation
```bash
agentapi new-conversation <prompt>
```
*Note: A `projectId` must be set in `config.json` for the corresponding sidecar to use this command.*

### 2. Send a Message to an Existing Conversation
```bash
agentapi send-message <conversation_id> <prompt>
```
