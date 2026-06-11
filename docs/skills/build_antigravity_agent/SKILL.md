---
name: build_antigravity_agent
description: Build Antigravity agent definitions — knows the .md frontmatter format for agent personas, dashboard soul.md presets, teams.yaml structure, CLI agent creation, and agent-team orchestration. Use when the user wants to create or modify Antigravity agent definitions.
docs-url: 
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Building & Configuring Antigravity Agents

Antigravity supports multiple methods for defining, creating, and configuring custom AI agents.

---

## 1. Harness Agent Definition Format (.md files)
In the harness, custom agents are defined as Markdown files containing YAML frontmatter and a system prompt body.

### Location
- Workspace Project: `.agents/agents/<agent_name>.md`
- Global/Harness: `antigravity/agents/<agent_name>.md`

### File Format
```markdown
---
name: codebase_locator
description: Specialist agent for locating files and components.
docs-url: 
---
You are a specialist at finding WHERE code lives in a codebase.
Your core responsibilities are...
```
- **name**: lowercase snake_case identifier matching the filename.
- **description**: description explaining when to invoke this agent.
- **Body**: The complete system prompt (soul + instructions).

---

## 2. Dashboard Agent Presets (`soul.md` format)
Preset definitions populate fields when creating a new agent in the dashboard UI.

### Location
- Preset library: `packages/dashboard/app/components/agent-presets/` (requires rebuilding dashboard)

### File Format (`soul.md`)
```markdown
# Soul: Senior Engineer

I am a senior software engineer focused on robust and simple architectures.

## Operating Principles
- Write test-first code
- Keep modules deep and interfaces shallow

## Communication Style
- Be concise and direct
- Present code diffs to explain proposals
```

---

## 3. Programmatic CLI Agent Creation
You can create non-ephemeral permanent agents dynamically using the CLI or agent delegation tools.

### Command
```bash
agy agent create \
  --name "qa_agent" \
  --role "reviewer" \
  --soul "I am a QA specialist..." \
  --instructions-path ".agents/agents/qa-instructions.md" \
  --reportsTo "cto_agent_id" \
  --heartbeat-interval-ms 300000
```

### Parameters
- `name` — Name of the agent.
- `role` — `"triage" | "executor" | "reviewer" | "merger" | "engineer" | "custom"`.
- `soul` — Personality/operating principles.
- `instructions_text` — Inline instructions.
- `instructions_path` — Path to instructions markdown file.
- `reportsTo` — Manager agent ID (defaults to the creator agent).
- `heartbeat_interval_ms` — Polling interval (clamped to a minimum of 5 minutes / 300,000 ms).
- `message_response_mode` — `"immediate"` or `"on-heartbeat"`.

---

## 4. Multi-Agent Teams (`teams.yaml`)
Define agent reporting structures and team composition.

### Location
- `.agents/agents/teams.yaml`

### File Format
```yaml
engineering-team:
  manager: cto_agent
  members:
    - fullstack_engineer
    - qa_engineer
    - devops_engineer
```

---

## 5. Agent Delegation & Spawning
Agents coordinate and run tasks using delegation and spawning:
- **`list_agents`**: Retrieve active/idle agents in the workspace.
- **`delegate_task`**: Assign a task card (executor role required) to another agent's todo queue.
- **`spawn_agent`**: Spin up a child agent in a dedicated parallel Git worktree (e.g. for running tests in parallel). Child processes automatically terminate when the parent task ends.

