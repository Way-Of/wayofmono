# WayOfMono Architecture Overview

WayOfMono (Wo) is a monorepo consolidating high-performance coding agents, tooling, and the CTO Dashboard into a single repository with shared infrastructure.

## High-Level Structure

```
wayofmono/
├── packages/@aiengineeringharness/   # AI Engineering Harness (core)
│   ├── install.ts                    # CLI installer (Deno)
│   ├── setup.sh                      # GNU Stow installer
│   ├── manifest.json                 # Skill/component manifest
│   ├── opencode/                     # → ~/.config/opencode/
│   ├── claude/                       # ~/.claude/
│   ├── gemini/                       # ~/.gemini/
│   ├── pi/                           # ~/.pi/agent/
│   ├── wocoder/                      # ~/.wocoder/
│   ├── antigravity/                  # ~/.antigravity/
│   ├── codex/                        # ~/.codex/
│   └── scripts/                      # Pipeline tools (docs-sync, compliance, migrate)
├── ui/                               # CTO Dashboard (Next.js 16)
├── docs/                             # Documentation
├── thoughts/                         # Context engineering (f-rr-d)
│   ├── global/                       # Cross-project
│   ├── wayofmono/                    # WOMONO-XXX tickets
│   ├── wow/                          # WOW-XXX tickets
│   └── opticat/                      # OPT-XXX tickets
└── .github/workflows/                # CI/CD
```

## Core Components

### 1. AI Engineering Harness (`packages/@aiengineeringharness/`)

The central orchestration layer that manages skills, agents, and configurations across 7 AI coding tools:
- OpenCode, Claude Code, Gemini CLI, Pi, Codex, Antigravity, Wo Coder

Key responsibilities:
- **Skill synchronization** — Single source of truth in `manifest.json`, deployed to all 7 frontends
- **Installer** — Deno-based CLI (`install.ts`) and GNU Stow (`setup.sh`) for dotfile management
- **Agent/skill templates** — Standardized frontmatter formats per platform
- **Pipeline tools** — `docs-sync`, compliance checks, migration scripts

### 2. CTO Dashboard (`ui/`)

Next.js 16 application providing:
- Ticket overview (Kanban, lists, filters)
- Developer progress tracking
- Review queue management
- GitHub PR integration
- Skills health monitoring
- Standups, ideas, news feeds

Architecture: Next.js App Router, React 19, TypeScript, Tailwind CSS
- **Production**: Standalone output, Docker/Podman, Caddy reverse proxy
- **Data**: File-based (markdown/JSON) + SQLite (Prisma) for skills reports

### 3. f-rr-d / Thoughts Repository (`thoughts/`)

Centralized context engineering storage:
- **Tickets** — Structured markdown with YAML frontmatter (`WOMONO-XXX`, `WOW-XXX`, `OPT-XXX`)
- **Plans** — Implementation plans with phase breakdowns
- **Research** — Technical evaluations, comparisons
- **Documentation** — Architecture, decisions, guides, references
- **Personal TODOs** — Per-developer task breakdowns

Git workflow: Feature branches, semantic naming, PR-based reviews

### 4. Shared Infrastructure

- **Devbox** — Reproducible Nix-based shell environment (Node, pnpm, tools)
- **Podman** — Container runtime (rootless, no daemon)
- **Cloudflare Tunnel** — Secure ingress (TLS termination at edge)
- **Caddy** — Reverse proxy with automatic HTTPS (dev) or pass-through (prod)

## Data Flow

```
User Request
    │
    ▼
Cloudflare Tunnel (cto.wayof.work)
    │
    ▼
Caddy (:81) ──reverse_proxy──► Next.js (:3000)
    │                              │
    │                              ├─► thoughts/ (bind mount, RW)
    │                              │    ├─ tickets/*.md
    │                              │    ├─ shared/*.json (ideas, standups, news)
    │                              │    └─ docs/
    │                              │
    │                              └─► db_data volume (SQLite)
    │                                   └─ custom.db (skills reports)
    │
    ▼
Response
```

## Deployment Model

**Current**: Manual `./scripts/deploy-dashboard.sh` on server
- Git pull → podman-compose rebuild → health check

**Target**: GitHub Actions CI/CD
- Build standalone → rsync/scp → systemd restart

## Key Design Principles

1. **File-based first** — Markdown/JSON for human-readable, git-trackable data
2. **Container-native** — Podman rootless, multi-stage Docker builds
3. **Observability** — Health endpoints, structured logging, healthchecks
4. **Portability** — Devbox for local parity, no host dependencies
5. **Multi-tool** — Harness abstracts platform differences (7 frontends)