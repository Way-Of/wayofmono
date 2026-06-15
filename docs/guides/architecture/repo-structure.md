# Repository Structure

Complete directory tree for WayOfMono monorepo.

## Root Structure

```
/home/zerwiz/wayofmono/
│
├── packages/
│   ├── @aiengineeringharness/     # 1,226 files — Harness (core)
│   │   ├── manifest.json          # Source of truth (v1.3.0)
│   │   ├── install.ts             # Deno CLI installer
│   │   ├── setup.sh               # GNU Stow installer
│   │   ├── scripts/               # 14 pipeline scripts
│   │   ├── opencode/    → ~/.config/opencode/    # 180 files
│   │   ├── claude/      → ~/.claude/             # 167 files
│   │   ├── gemini/      → ~/.gemini/             # 145 files
│   │   ├── pi/          → ~/.pi/agent/           # 174 files
│   │   ├── codex/       → ~/.codex/              # 186 files
│   │   ├── antigravity/ → ~/.antigravity/        # 146 files
│   │   └── wocoder/     → ~/.wocoder/            # 182 files
│   │
│   ├── @wayofmono/                 # 13 NPM packages
│   │   ├── wo-ai/                  # 4.0M — Multi-Provider LLM API
│   │   ├── wo-tui/                 # 1.5M — Terminal UI Library
│   │   ├── wo-agent-core/          # 1.1M — Agent Runtime
│   │   ├── wo-agent/               # 8.2M — wouser (SDK + CLI)
│   │   ├── wo-coding-agent/        # 8.2M — wocode (CLI)
│   │   ├── wo-skill-docs/          # 148K — Documentation Expert
│   │   ├── wo-mermaid/             # 3.9M — Mermaid Renderer
│   │   ├── web-access/             # 7.7M — Web tools
│   │   ├── lens/                   # 2.1M — Codebase Analysis
│   │   ├── wo-web-ui/              # 224K — React Web UI
│   │   ├── telemetry/              # 188K — Telemetry
│   │   ├── telegram/               # 88K — Telegram bot
│   │   └── whatsapp/               # 88K — WhatsApp bot
│   │
│   └── ui/                         # CTO Dashboard (v0.2.0, 131 source files)
│       ├── src/app/                # Next.js App Router
│       │   ├── api/                # API routes (health, ideas, news, standup, skills)
│       │   └── page.tsx            # Main page
│       ├── src/components/         # Dashboard views (tickets, skills, standup, ideas, etc.)
│       ├── src/lib/                # Data access layer (thoughts.ts, db.ts, types.ts, utils.ts)
│       ├── src/store/              # Zustand state management (dashboard-store.ts)
│       ├── prisma/                 # SQLite schema (User, Post, SkillReport)
│       └── docker/                 # Dockerfile, entrypoint.sh, Caddyfile
│
├── thoughts/                       # 115 files — f-rr-d context engineering
├── docs/                           # 173 files — Architecture & reference
│   ├── archetecture/               # Architecture docs (OVERVIEW, HARNESS, INDEX)
│   ├── skills/                     # Per-skill SKILL.md files
│   ├── tools/                      # AI coding tool references
│   └── agents/                     # Agent definitions
│
├── scripts/                        # deploy.sh, dev.sh, stats.ts, sync-versions.js
├── test/                           # Integration tests
├── ref/                            # 7,628 files — Historical reference archives
├── planning/                       # Planning documents
│
├── .github/workflows/              # ci.yml, cd.yml
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md                       # This file
```

## Key Directories

### packages/@aiengineeringharness/
The AI Engineering Harness core — canonical skills, agents, commands, themes, extensions for all 7 tools.

### packages/@wayofmono/
13 NPM packages published to npmjs.com under `@wayofmono` scope.

### packages/ui/
CTO Dashboard — Next.js 16, Prisma/SQLite, deployed via Podman/Caddy.

### thoughts/
f-rr-d (förråd) — Centralized thoughts repository cloned from github.com/Way-Of/f-r-r-d.

### docs/
Authoritative reference documentation for all 7 AI coding tools, architecture, guides.

## Related

- [Pipeline Tools](../pipeline/tools.md)
- [Packages Overview](../../packages.md)
- [CTO Dashboard](../dashboard/overview.md)