# File Structure Per Tool

Standard directory structure for each AI coding tool.

## Template

```
<tool>/
├── skills/          # Skill directories
├── tools/           # Tool-specific scripts
│   ├── init
│   ├── sync
│   └── validate
├── settings.json    # User configuration
└── .mcp.json        # MCP configuration
```

## Per-Tool Structures

### OpenCode (`~/.config/opencode/`)

```
opencode/
├── skills/
│   ├── create_plan/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── scripts/
│   └── validate_plan/
├── tools/
│   ├── init.ts
│   ├── sync.ts
│   └── validate.ts
├── settings.json
└── .mcp.json
```

### Claude Code (`~/.claude/`)

```
claude/
├── skills/
├── tools/
├── settings.json
└── .mcp.json
```

### Gemini CLI (`~/.gemini/`)

```
gemini/
├── skills/
├── tools/
├── settings.json
└── .mcp.json
```

### Pi (`~/.pi/agent/`)

```
pi/
├── agent/
│   ├── skills/
│   ├── tools/
│   └── settings.json
└── .mcp.json
```

### Codex (`~/.codex/`)

```
codex/
├── skills/
├── tools/
├── settings.json
└── .mcp.json
```

### Antigravity (`~/.antigravity/`)

```
antigravity/
├── skills/
├── tools/
├── settings.json
└── .mcp.json
```

### Wo Coder (`~/.wocode/`)

```
wocode/
├── agent/
│   ├── skills/
│   ├── tools/
│   ├── extensions/
│   ├── themes/
│   ├── keybindings/
│   └── settings.json
└── .mcp.json
```

## Shared Cross-Tool Location

All tools also discover skills from:
```
~/.agents/skills/
```

## Project-Local Overrides

Each tool supports project-local config:
```
<project>/
├── .opencode/          # OpenCode
├── .claude/            # Claude Code
├── .gemini/            # Gemini CLI
├── .pi/agent/          # Pi
├── .codex/             # Codex
├── .antigravity/       # Antigravity
└── .wo/agent/          # Wo Coder
```

## Related

- [Naming Conventions](naming.md)
- [Git Commits](git-commits.md)
- [AI Engineering Harness](../ai-harness/)
- [Skill Loading Paths](../getting-started.md#skill-loading-paths)