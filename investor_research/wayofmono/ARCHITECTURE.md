# WayOfMono Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 7 Agent Frontends                        │
│  wocode │ wouser │ Claude │ OpenCode │ Gemini │ Pi │ Codex │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│            AI Engineering Harness (Deno)                 │
│  81 Skills │ 6 Subagents │ 11 Commands │ Shared Config   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              13 @wayofmono NPM Packages                  │
│  wo-ai │ wo-agent │ wo-coding-agent │ wo-tui │ lens     │
│  web-access │ telemetry │ wo-web-ui │ telegram │ ...    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              CTO Dashboard (Next.js 16)                  │
│  Tickets │ Standups │ Skills Health │ Reviews │ Ideas    │
│  SQLite (cache) ← Markdown files (source of truth)      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│           f-rr-d Context Engineering (Git)               │
│  wayofmono/ │ wow/ │ opticat/ │ global/                  │
│  Tickets → Plans → Implement → Validate → Commit         │
└─────────────────────────────────────────────────────────┘
```

## Key Architectural Patterns

1. **Interface-Agnostic Design**: Core logic and tools are shared across all 7 AI coding platforms. Skills, agents, commands, and configurations are defined once and deployed to all tools via the harness installer.

2. **Markdown-First + SQLite Read-Cache**: Tickets are persisted as Markdown files (source of truth) with SQLite via Prisma as a fast read-cache. The system uses `gray-matter` for YAML frontmatter parsing and `chokidar` file watching for real-time sync.

3. **ODD (Observability-Driven Development)**: Design traces before features. Local OpenTelemetry feedback loop using `@wayofmono/telemetry`.

4. **Multi-Provider LLM Abstraction**: 30+ LLM providers under a single unified API via `@wayofmono/wo-ai`. Supports streaming, tool calling, thinking budgets, and OAuth.

5. **Context Compaction**: Branch summarization and token estimation to manage LLM context windows across long agent sessions.

6. **Skill System**: 81 canonical skills adapted for all 7 tool formats. Each skill is a directory containing SKILL.md (frontmatter + instructions) plus optional scripts and assets.

## Data Flow
```
User → Agent Frontend → Skill/Agent → Tool Execution → LLM Call → Response
                              ↓
                      Telemetry/Logging
                              ↓
                      CTO Dashboard (analytics)
```
