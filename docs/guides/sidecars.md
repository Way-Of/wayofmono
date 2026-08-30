# Sidecars & Background Processes

> How each Wo-powered tool handles background processes, scheduled tasks, and daemon management

## Overview

Sidecars are background processes that run alongside an AI coding tool — for persistent workers, recurring scheduled tasks, or event-driven automation. Only **Antigravity CLI** has native sidecar support. All other tools achieve equivalent behavior through alternative mechanisms.

## Per-Tool Support Matrix

| Tool | Native Sidecars | Cron/Scheduling | Background Workers | Equivalent Mechanism |
|------|:---------------:|:---------------:|:------------------:|----------------------|
| **Antigravity CLI** | ✅ Full | ✅ Built-in `schedule` | ✅ `sidecar.json` | Native sidecar system + `agentapi` CLI |
| **Gemini CLI** (legacy) | ✅ Full | ✅ Built-in `schedule` | ✅ `sidecar.json` | Same system as Antigravity (deprecated) |
| **Claude Code** | ❌ | ✅ `CronCreate` (session) | ✅ `Monitor` tool | Session-scoped cron + process watching |
| **Codex CLI** | ❌ | ❌ | ✅ `codex cloud` | Cloud-based task offloading |
| **OpenCode** | ❌ | ❌ | ❌ | System-level cron + custom tool commands |
| **Pi** | ❌ | ❌ | ❌ | System-level cron + TS extension lifecycle hooks |
| **Wo Coder** | ❌ | ❌ | ❌ | System-level cron + TS extension lifecycle hooks |

## Tool Details

### Antigravity CLI — Native Sidecar System

**Full background process management** with lifecycle, restart policies, and cron scheduling.

**Config location:** `~/.antigravity/sidecars/<name>/sidecar.json`

```json
{
  "description": "Background worker",
  "command": "python3",
  "args": ["worker.py"],
  "restart_policy": "on-failure"
}
```

**Built-in scheduler** for cron tasks:

```json
{
  "description": "Hourly triage",
  "builtin": "schedule",
  "args": ["0 * * * *", "agentapi", "new-conversation", "Triage review requests."]
}
```

**Key features:**
- Auto-launch + auto-restart on crash
- Runtime data directories (`data/`, `logs/`, `events/`)
- `agentapi` CLI for programmatic Antigravity interaction
- Plugin-embedded sidecars supported
- `restart_policy`: `always` (default), `on-failure`, `never`

**Enable in config:**
```json
{ "sidecars": { "sidecar1": { "enabled": true } } }
```

### Claude Code — Session-Scoped Background Work

No persistent daemon management, but two mechanisms for background work:

**`Monitor` tool** — Watch background processes:
- Tail log files
- Poll CI pipeline status
- Watch file changes
- `restart: true` flag for auto-restart

**`CronCreate`** — Session-scoped recurring prompts:
- 5-field cron expressions
- One-shot via `ScheduleWakeup`
- Scoped to active session only (lost on exit)

**Limitation:** No persistent daemons, no cross-session scheduling, no auto-restart for cron tasks.

### Codex CLI — Cloud Offloading

No local sidecar support, but cloud task offloading:

```bash
codex cloud                    # Launch task in cloud environment
codex cloud list               # List active/finished tasks
```

**Use case:** Long-running operations that don't need to persist locally (CI, builds, batch processing).

### OpenCode, Pi, Wo Coder — System-Level Alternatives

These tools have **no built-in background process support**. Use OS-level mechanisms instead:

**Option A: systemd user services (Linux)**
```bash
# ~/.config/systemd/user/wo-sidecar.service
[Unit]
Description=WayOfMono sidecar worker

[Service]
ExecStart=/usr/bin/python3 /path/to/worker.py
Restart=on-failure
Type=simple

[Install]
WantedBy=default.target
```

**Option B: system crontab**
```cron
# Run every hour
0 * * * * /usr/bin/opencode --print "Triage review requests."
```

**Option C: Docker/Podman containers**
```bash
podman run -d --restart=always --name wo-worker worker:latest
```

**Option D: Pi/Wo Coder extension lifecycle hooks**
Extensions can subscribe to lifecycle events but cannot persist beyond the session:
```typescript
export function activate(context: ExtensionContext) {
  context.on("session_start", async () => {
    // Start background polling (dies with session)
  });
  context.on("session_shutdown", async () => {
    // Cleanup
  });
}
```

## Architecture Decision

Per the **Universal Capability Principle** (skills are universal, no capability gaps), background processing is an **infrastructure concern**, not a tool concern. The sidecar equivalent is implemented at the OS/container level rather than the AI tool level, ensuring identical capability regardless of which tool is in use.

For tool-specific needs:
- **Antigravity:** Use native sidecar system for integrated lifecycle management
- **Claude Code:** Use `Monitor` + `CronCreate` for session-scoped tasks
- **Codex:** Use `codex cloud` for offloaded computation
- **OpenCode/Pi/Wo Coder:** Use systemd/cron/containers for persistent workers
