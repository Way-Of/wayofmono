# Project Structure Guide

> Understanding the WayOfMono monorepo layout

## Root Structure

```
/home/zerwiz/wayofmono/
├── packages/
│   ├── @aiengineeringharness/     # Harness core (1,226 files)
│   └── @wayofmono/                # 13 NPM packages
├── ui/                            # CTO Dashboard (Next.js 16)
├── thoughts/                      # f-rr-d context engineering (115 files)
├── docs/                          # Documentation (173 files)
│   └── guides/                    # You are here
├── scripts/                       # Deploy, dev, stats scripts
├── test/                          # Integration tests
├── ref/                           # Historical reference archives (7,628 files)
├── planning/                      # Planning documents
├── .github/workflows/             # CI/CD
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

## Harness Core (`packages/@aiengineeringharness/`)

```
@aiengineeringharness/
├── manifest.json                  # Source of truth (v1.3.0)
├── install.ts                     # Deno CLI installer
├── setup.sh                       # GNU Stow installer
├── scripts/                       # 14 pipeline scripts
├── skills/                        # 81 canonical skills
├── agents/                        # 6 subagents
├── commands/                      # Slash commands
├── themes/                        # Theme definitions
├── extensions/                    # Extension definitions
├── keybindings/                   # Keybinding definitions
├── prompts/                       # Prompt templates
├── opencode/      → ~/.config/opencode/    # 180 files, 91 SKILL.md
├── claude/        → ~/.claude/             # 167 files, 90 SKILL.md
├── gemini/        → ~/.gemini/             # 145 files, 90 SKILL.md
├── pi/            → ~/.pi/agent/           # 174 files, 85 SKILL.md
├── codex/         → ~/.codex/              # 186 files, 90 SKILL.md
├── antigravity/   → ~/.antigravity/        # 146 files, 89 SKILL.md
└── wocode/       → ~/.wocode/            # 182 files, 85 SKILL.md
```

## NPM Packages (`packages/@wayofmono/`)

| Package | Description | Size |
|---------|-------------|------|
| `wo-ai` | Multi-Provider LLM API | 4.0M |
| `wo-tui` | Terminal UI Library | 1.5M |
| `wo-agent-core` | Agent Runtime | 1.1M |
| `wo-agent` | wouser SDK + CLI | 8.2M |
| `wo-coding-agent` | wocode CLI | 8.2M |
| `wo-skill-docs` | Documentation Expert | 148K |
| `wo-mermaid` | Mermaid Renderer | 3.9M |
| `web-access` | Web tools | 7.7M |
| `lens` | Codebase Analysis | 2.1M |
| `wo-web-ui` | React Web UI | 224K |
| `telemetry` | Telemetry & metrics | 188K |
| `telegram` | Telegram bot | 88K |
| `whatsapp` | WhatsApp bot | 88K |

## CTO Dashboard (`ui/`)

```
ui/
├── src/
│   ├── app/
│   │   ├── api/              # API routes (health, ideas, news, standup, skills)
│   │   └── page.tsx          # Main page
│   ├── components/           # Dashboard views
│   ├── lib/                  # Data access (thoughts.ts, db.ts, types.ts)
│   └── store/                # Zustand state management
├── prisma/                   # SQLite schema
└── docker/                   # Dockerfile, entrypoint.sh, Caddyfile
```

## f-rr-d Thoughts (`thoughts/`)

```
thoughts/
├── global/                    # Cross-project concerns
├── shared/                    # Templates only
├── wayofmono/                 # WOMONO-XXX tickets
│   ├── docs/                  # Architecture, decisions, guides, references
│   ├── shared/tickets/        # 17+ WOMONO tickets
│   ├── shared/plans/
│   ├── shared/research/
│   └── <developer>/           # Per-developer tickets
├── wow/                       # WOW-XXX tickets
└── opticat/                   # OPT-XXX tickets
```

## Documentation (`docs/`)

```
docs/
├── architecture/              # OVERVIEW, HARNESS, INDEX
├── skills/                    # Per-skill SKILL.md files
├── tools/                     # AI coding tool references
├── agents/                    # Agent definitions
└── guides/                    # User guides (this folder)
```

## Key Conventions

### Naming
| Artifact | Convention | Example |
|----------|-----------|---------|
| Code files | camelCase | `dashboardStore.ts` |
| Config files | kebab-case | `ticket-template.md` |
| Scripts | snake_case | `deploy_dashboard.sh` |
| Projects | kebab-case | `wo-ai`, `wo-coding-agent` |
| Skills | `SKILL.md` | uppercase extension |
| Tickets | `XXX-NNNN` | `WOMONO-150` |

### Git Commits
```
feat: Add feature description
fix: Fix bug description
docs: Add/update documentation
chore: Update dependencies
refactor: Refactor code
test: Add/update tests
perf: Improve performance
```

### Tool Config Structure
```
<tool>/
├── skills/          # Skill directories
├── tools/           # Tool-specific scripts
├── settings.json    # User configuration
└── .mcp.json        # MCP configuration
```

## Quick Navigation

| Need | Go To |
|------|-------|
| Install harness | `packages/@aiengineeringharness/install.ts` |
| Add skill | `packages/@aiengineeringharness/skills/` |
| Sync skills | `ai-harness --sync-docs` |
| Create ticket | `thoughts/wayofmono/shared/tickets/` |
| Update dashboard | `ui/` |
| Publish package | `packages/@wayofmono/<pkg>/` |
| Write guide | `docs/guides/` |