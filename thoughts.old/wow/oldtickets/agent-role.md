# Agent Role — Way of Work

## Runtime

The system uses `@wayofmono/wo-agent` (Wo User Agent, `wouser`).

This is a **general-purpose user agent** with NO coding tools (no read, bash, edit, write). Way of Work is a work planning and organizational tool — users plan, track, and manage work; they don't need file system access.

## What the agent does

The agent powers chat across all UI modes (Simple, Claw, Docs). Its job is to help users plan and organize work:

- Answer questions about tasks, projects, and schedules
- Help create and manage plans
- Provide status updates on work items
- Guide users through the system's features
- Offer suggestions and recommendations

## Tools the agent provides

The Wo User Agent ships with a small set of general-purpose tools:

| Tool | Purpose |
|---|---|
| `web_search` | Search the web for information |
| `web_fetch` | Fetch content from a URL |
| (future) task tools | Read/write tasks, projects, schedules via API |

No file system tools. No shell access. No code execution.

## Key workflows

1. **Planning** — User describes what they want to do, agent helps break it into tasks and create a plan
2. **Status** — User asks what's going on, agent checks the system and reports back
3. **Coordination** — Agent helps assign work, set priorities, manage deadlines
4. **Onboarding** — Agent explains how to use Way of Work features
5. **Reporting** — Agent summarizes progress, flags overdue items, highlights blockers

## Integration

The agent receives context about:
- The user's role (worker, leader, admin)
- The current project/workspace
- Relevant tasks and their status
- Chat history for continuity

The agent does NOT receive:
- File system access
- Shell access
- Agent/extension configuration from Pi
- Coding toolchain

## Future

- Custom tools for task CRUD via the Way of Work API
- Integration with worker portal permissions
- Scheduled agent runs for reminders and reports (Claw mode)
