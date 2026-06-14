# Getting Started with Wo

Welcome to Wo — your coding co-pilot! 🚀

## What is Wo?

Wo is an AI coding agent harness that works across 7 tools:
- **OpenCode** (`opencode`)
- **Claude Code** (`claude`)
- **Gemini CLI** (`gemini`)
- **Pi** (`pi`)
- **Codex** (`codex`)
- **Antigravity** (`antigravity`)
- **Wo Coder** (`wocoder`)

## First Steps

### 1. Install the Harness
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
ai-harness --tool=all --yes
```

### 2. Start Coding
Open your project and start Wo:
```bash
wo
# or for your specific tool:
opencode
claude
gemini
pi
```

### 3. Ask Wo Anything
```
Wo, how do I create a new React component?
Wo, what's the command to run tests?
Wo, help me debug this error
```

## Key Concepts

### Skills
Skills are reusable instruction sets that teach Wo new capabilities. They live in:
- `~/.config/opencode/skills/` (OpenCode)
- `~/.claude/skills/` (Claude)
- etc.

### Tickets
Work is tracked via tickets in `thoughts/<project>/shared/tickets/`:
- `WOMONO-XXX` — WayOfMono tasks
- `WOW-XXX` — WayOfWork tasks
- `OPT-XXX` — OptiCat tasks

### Commands
Built-in slash commands:
- `/help` — Show all commands
- `/create_plan` — Generate implementation plan
- `/implement_plan` — Execute approved plan
- `/validate_plan` — Verify implementation
- `/commit` — Create structured commits
- `/debug` — Investigate issues
- `/validate_telemetry` — Check observability

## Quick Tips

- **No manual reading needed** — Just ask: "How do I...?" or "What's the command for...?"
- **Skills auto-sync** — Run `ai-harness --sync skills` to update all tools
- **Git workflow** — Use `/commit` for well-structured commits
- **Observability** — Use `/validate_telemetry` to verify traces

## Next Steps

- Read [Installation & Update Guide](installation-and-update.md)
- Explore [Skills Guide](skills.md)
- Check [Commands Reference](commands.md)
- Learn [Project Structure](project-structure.md)

---

*Yo! I'm Wo — your coding co-pilot. I know all my tricks, shortcuts, and docs. Just ask: 'How do I...?' or 'What's the command for...?' and I'll show you the way. No manual reading required. 🚀*