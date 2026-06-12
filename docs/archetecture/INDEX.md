# Architecture Documentation Index

WayOfMono system architecture — covering all major components including the AI Engineering Harness, CTO Dashboard, deployment, thoughts/f-rr-d system, and data storage.

## Document Map

```
docs/
└── archetecture/
    ├── INDEX.md                   ← You are here
    ├── OVERVIEW.md                # High-level system overview
    └── HARNESS.md                 # AI Engineering Harness (core orchestration)
├── cto-dashboard-architecture.md  # CTO Dashboard (Next.js 16)
├── deployment-architecture.md     # Deployment & CI/CD
├── thoughts-architecture.md       # f-rr-d context engineering system
└── data-storage-architecture.md   # File-based + SQLite hybrid storage
```

## Component Overview

### Core Systems

| Document | Description | Key Technologies |
|----------|-------------|-----------------|
| [OVERVIEW.md](archetecture/OVERVIEW.md) | High-level system architecture, component relationships, data flow | All |
| [HARNESS.md](archetecture/HARNESS.md) | AI Engineering Harness — skill/agent management across 7 frontends | Deno, GNU Stow, manifest.json |
| [cto-dashboard-architecture.md](cto-dashboard-architecture.md) | Next.js 16 application with ticket management, skills monitoring, team collaboration | Next.js 16, React 19, Tailwind CSS, TypeScript |
| [deployment-architecture.md](deployment-architecture.md) | Container-native deployment, CI/CD pipelines, security, observability | Podman/Docker, GitHub Actions, Caddy, Cloudflare |
| [thoughts-architecture.md](thoughts-architecture.md) | f-rr-d context engineering — tickets, plans, research as markdown | Git, YAML frontmatter, bind mounts |
| [data-storage-architecture.md](data-storage-architecture.md) | Hybrid file-based + SQLite storage strategy | Markdown, JSON, Prisma, SQLite, Zustand |

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        CTO DASHBOARD                             │
│                   (cto-dashboard-architecture.md)                │
│   Next.js 16 · React 19 · Tailwind CSS · TypeScript             │
├─────────────────────────────────────────────────────────────────┤
│                    AI ENGINEERING HARNESS                        │
│                       (HARNESS.md)                               │
│   7 Frontends · manifest.json · skill-adapter · install.ts      │
├─────────────────────────────────────────────────────────────────┤
│                       f-rr-d / THOUGHTS                          │
│                    (thoughts-architecture.md)                    │
│   WOMONO-XXX · WOW-XXX · OPT-XXX · Git workflow                 │
├─────────────────────────────────────────────────────────────────┤
│                       DATA STORAGE                               │
│                 (data-storage-architecture.md)                    │
│   SQLite (Prisma) · Markdown files · Zustand state · JSON       │
├─────────────────────────────────────────────────────────────────┤
│                        DEPLOYMENT                                │
│                  (deployment-architecture.md)                    │
│   Podman/Docker · GitHub Actions · Caddy · Cloudflare            │
└─────────────────────────────────────────────────────────────────┘
```

## Reading Order

1. **Start with** [OVERVIEW.md](archetecture/OVERVIEW.md) for the big picture
2. **Deep dive**: Choose by area of interest:
   - **Skills/agents**: [HARNESS.md](archetecture/HARNESS.md)
   - **UI/team tools**: [cto-dashboard-architecture.md](cto-dashboard-architecture.md)
   - **Context/tickets**: [thoughts-architecture.md](thoughts-architecture.md)
   - **Infrastructure**: [deployment-architecture.md](deployment-architecture.md)
   - **Data**: [data-storage-architecture.md](data-storage-architecture.md)

## Cross-Cutting Concerns

### Security
- **Network**: Cloudflare Tunnel TLS → Caddy reverse proxy → Next.js
- **Auth**: Session-based pincode login, role-based access control
- **Data**: SQLite at rest, bind mount isolation, git commit verification

### Observability
- **Health checks**: `/api/health` with component status checks
- **Logging**: Structured JSON to stdout, correlation IDs
- **Monitoring**: Docker healthchecks, container restart policies

### Performance
- **Caching**: Zustand client-state, Next.js data cache, future Redis
- **Optimization**: File-system batch reads, Prisma singleton, deduplication
- **Scalability**: Horizontal pods, load balancing, CDN for static assets

## Key Decisions

| Decision | Rationale | Documented In |
|----------|-----------|---------------|
| Hybrid storage (files + SQLite) | Git-trackable tickets + structured reports | data-storage-architecture.md |
| Podman over Docker | Rootless, daemonless, daemonless container runtime | deployment-architecture.md |
| Caddy reverse proxy | Auto HTTPS, simple config, X-TransformPort support | deployment-architecture.md |
| Zustand over Redux | Lightweight, TypeScript-native, tree-shakeable | cto-dashboard-architecture.md |
| YAML frontmatter in markdown | Human-readable, git-diffable, AI-parsable | thoughts-architecture.md |

## Related Documentation

- **Skills**: `docs/skills/` — per-skill SKILL.md files
- **Tools**: `docs/tools/` — AI coding tool reference (`opencode.md`, `claude-code.md`, etc.)
- **Agents**: `docs/agents/` — agent definitions (`codebase-locator.md`, `web-search-researcher.md`, etc.)
- **External**: `thoughts/` — live context engineering repository
