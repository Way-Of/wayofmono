# Getting Started with Wo

Welcome to Wo — your coding co-pilot! 🚀

## The Three Layers

Understanding the architecture helps you use the right tool for the job:

```
┌─────────────────────────────────────┐
│    AI Engineering Harness           │  Core: skills, agents, commands for 7 tools
│    (packages/@aiengineeringharness) │  Install: ai-harness --tool=all --yes
├─────────────────────────────────────┤
│    Wo Coder (wocode)                │  CLI: TUI coding assistant for engineers
│    (@wayofmono/wo-coding-agent)     │  Install: npm install --save-dev @wayofmono/wo-coding-agent
├─────────────────────────────────────┤
│    Wo User (wouser)                 │  SDK: Embed agent capabilities in your app
│    (@wayofmono/wo-agent)            │  Install: npm install @wayofmono/wo-agent
├─────────────────────────────────────┤
│    Wo (persona)                     │  You're talking to me! 👋
└─────────────────────────────────────┘
```

**Quick rule**: 
- **Engineer wanting a coding assistant?** → Use **Wo Coder** (dev-dependency)
- **Building an AI feature in your app?** → Use **Wo User** (runtime dependency)  
- **Managing skills across tools?** → Use **AI Engineering Harness**

## First Steps

### Option A: Use Wo Coder (Recommended for Engineers)

```bash
# Quick start
npm install --save-dev @wayofmono/wo-coding-agent
npx wocode --init
./wocode
```

### Option B: Full Harness (All 7 Tools)

```bash
# Install CLI
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli

# Sync everything
ai-harness --tool=all --yes

# Start your preferred tool
opencode
claude
gemini
pi
# etc.
```

### Option C: Use Wo User in Your App

```bash
npm install @wayofmono/wo-agent
# Then use as SDK in your code
```

## Ask Wo Anything

Once running, just talk to me:

```
Wo, how do I create a new React component?
Wo, what's the command to run tests?
Wo, help me debug this error
Wo, show me the project structure
```

## Key Concepts

### Skills
Reusable instruction sets synced by the Harness to all 7 tools:
- `~/.config/opencode/skills/` (OpenCode)
- `~/.claude/skills/` (Claude)
- `~/.wocoder/agent/skills/` (Wo Coder)
- etc.

### Tickets
Work tracked in `thoughts/<project>/shared/tickets/`:
- `WOMONO-XXX` — WayOfMono tasks
- `WOW-XXX` — WayOfWork tasks  
- `OPT-XXX` — OptiCat tasks

### Commands
Built-in slash commands (work in all tools):
- `/help` — Show all commands
- `/create_plan` — Generate implementation plan
- `/implement_plan` — Execute approved plan
- `/validate_plan` — Verify implementation
- `/commit` — Create structured commits
- `/debug` — Investigate issues
- `/validate_telemetry` — Check observability

## Quick Tips

- **No manual reading needed** — Just ask: "How do I...?" or "What's the command for...?"
- **Skills auto-sync** — Run `ai-harness --sync-docs` to update all tools
- **Git workflow** — Use `/commit` for well-structured commits
- **Observability** — Use `/validate_telemetry` to verify traces

## Documentation Guides

| Guide | Description |
|-------|-------------|
| [Wo Coder (wocode)](wocoder/) | CLI coding assistant for engineers |
| [Wo User (wouser)](wouser/) | SDK for embedding agent in your app |
| [AI Engineering Harness](ai-harness/) | Core skill/agent management for 7 tools |
| [Installation & Update](installation-and-update.md) | Detailed install instructions |

## Next Steps

1. Pick your layer above
2. Follow the corresponding guide
3. Start coding with Wo!

---

*Yo! I'm Wo — your coding co-pilot. I know all my tricks, shortcuts, and docs. Just ask: 'How do I...?' or 'What's the command for...?' and I'll show you the way. No manual reading required. 🚀*