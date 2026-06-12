# System Architecture — WayOfMono

This document describes the WayOfMono system architecture for the AI Engineering Monorepo.

## What Is WayOfMono?

WayOfMono is a monorepo that consolidates:
- 7 AI coding tools: OpenCode, Claude Code, Gemini CLI, Pi, Codex, Antigravity, Wo Coder
- A unified skill/agent orchestration layer (`packages/@aiengineeringharness`)
- A production CTO Dashboard (`ui/`)
- A centralized context repository (`thoughts/`)

## High-Level Architecture

```
wayofmono/
├── packages/@aiengineeringharness/   # Core orchestration
│   ├── install.ts                     # CLI installer
│   ├── manifest.json                  # Skills source of truth
│   ├── skills/                        # Skill definitions
│   └── scripts/                       # Pipeline tools (docs-sync, compliance)
├── ui/                                # CTO Dashboard (Next.js 16)
│   ├── app/                           # Next.js app router
│   ├── prisma/                        # Database schema
│   └── db_data/                       # SQLite storage
├── thoughts/                          # Context engineering
│   ├── global/                        # Cross-project docs
│   ├── wayofmono/                     # WOMONO-XXX tickets
│   └── shared/                        # Templates
├── pi/                                # Pi compatibility
├── gemini/                            # Gemini compatibility
├── opencode/                          # OpenCode compatibility
├── claude/                            # Claude compatibility
├── memory/                            # Session storage
├── test/                              # Integration tests
└── docs/                              # Documentation
    └── archetecture/                   # These docs
```

## Component Architecture

### 1. AI Engineering Harness (`packages/@aiengineeringharness/`)

The harness manages skills and agents across all 7 AI tool platforms.

**Key Files:**
- `install.ts` — Deno-based CLI installer
- `setup.sh` — GNU Stow shell script
- `manifest.json` — Single source of truth for all skills

**Installation:**
```bash
deno run -A packages/@aiengineeringharness/install.ts --tool=all --yes
```

**Supported Platforms:**
| Platform | Config Directory |
|----------|---------------|
| OpenCode | `~/.config/opencode/` |
| Claude Code | `~/.claude/` |
| Gemini CLI | `~/.gemini/` |
| Pi | `~/.pi/agent/` |
| Codex | `~/.codex/` |
| Antigravity | `~/.antigravity/` |
| Wo Coder | `~/.wocoder/` |

### 2. CTO Dashboard (`ui/`)

Next.js 16 application for team management and monitoring.

**Features:**
- Ticket overview (Kanban, lists, filters)
- Skills health monitoring
- Developer progress tracking
- Standups, ideas, news feeds

**Technology Stack:**
- Framework: Next.js App Router (React 19, TypeScript)
- Styling: Tailwind CSS
- Database: SQLite with Prisma ORM
- Container: Docker/Podman

**Deployment:**
```bash
./scripts/deploy-dashboard.sh
```

### 3. Context Engineering (`thoughts/`)

Centralized markdown repository acting as a "f-rr-d" (förråd = Swedish for "store"):

**Structure:**
- `thoughts/global/` — Cross-project documentation
- `thoughts/wayofmono/` — WOMONO-XXX tickets
- `thoughts/wo/` — WO-related content
- `thoughts/opticat/` — OPT-XXX tickets

**Git Workflow:**
- Feature branches for major changes
- Pull requests for reviews
- Semantic commit messages

## Data Architecture

### File-Based Storage

| Directory | Purpose |
|--|--|
| `thoughts/` | Tickets, plans, research, documentation (Git-backed) |
| `db_data/custom.db` | SQLite for skills reports and user progress |
| `thoughts/shared/*` | JSON files for ideas, standups, news |

### Database Schema

```prisma
// prisma/schema.prisma
model SkillReport {
  id          String   @id @default(cuid())
  platform    String   // opencode, claude, gemini, pi, codex, antigravity, wocoder
  skillName   String
  description String
  version     String
  healthScore Int      // 0-100
  lastUpdated DateTime @default(now())
}

model UserProgress {
  id          String   @id @default(cuid())
  userId      String
  skillName   String
  completedAt DateTime
  progress    Int      // 0-100
}
```

## API Architecture

### REST API (Next.js App Router)

| Route | Method | Purpose |
|--|--|--|
| `/api/health` | GET | Health check |
| `/api/tickets` | GET | List tickets |
| `/api/tickets/:id` | GET | Single ticket |
| `/api/ideas` | GET/POST | Ideas submission |
| `/api/news` | GET | News feed |

### Data Flow

```
User Request
    ↓
Cloudflare Tunnel (TLS termination)
    ↓
Caddy Reverse Proxy (:81)
    ↓
Next.js Application (:3000)
    ├── thoughts/ (bind mount, RW)
    └── db_data/ (SQLite volume)
```

## Observability

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET(request: NextRequest) {
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    storage: await checkStorage(),
    external: await checkExternalServices()
  };
  
  return {
    status: 'ok',
    checks,
    responseTime: Date.now() - startTime
  };
}
```

### Logging

Structured JSON logs with correlation IDs:
```typescript
{
  timestamp: "2026-06-11T...",
  level: "info" | "warn" | "error",
  message: "...",
  correlationId: "uuid-1234"
}
```

## Deployment Architecture

### Local Development

```bash
# Dev environment
./scripts/dev-dashboard.sh

# Manual deployment
./scripts/deploy-dashboard.sh
```

### CI/CD Pipeline (GitHub Actions)

**Stages:**
1. Validate (lint, typecheck)
2. Test (unit tests)
3. Build (Next.js prod build)
4. Deploy (podman-compose rebuild)

**Workflow:**
```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run test
      - run: pnpm run build
```

## Container Architecture

### Production Compose

```yaml
# ui/podman-compose.yml
services:
  nextjs:
    build: .
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./thoughts:/thoughts:rw
      - db_data:/app/db_data
    ports:
      - "3000:3000"
```

### Caddy Configuration

```
:81 {
  reverse_proxy localhost:3000 {
    header_up Host {host}
    header_up X-Forwarded-For {remote_host}
  }
}
```

## Security Architecture

### Layers

| Layer | Protection |
|--|--|
| **Edge** | Cloudflare WAF, rate limiting |
| **Transport** | TLS 1.3 (automatic via Cloudflare) |
| **Application** | JWT sessions, input validation |
| **Data** | SQLite at-rest encryption |

### Authentication

Session-based with secure cookies:
- JWT verification for API routes
- Rate limiting per user/IP
- Role-based access control (admin, user, viewer)

## Performance Optimization

### Caching Strategy

| Cache Type | TTL | Location |
|--|--|--|
| Skills reports | 5 min | Redis/Memory |
| API responses | Edge | Cloudflare CDN |
| Static assets | 1h+ | CDN |

### Database Indexing

```prisma
model SkillReport {
  id          String   @id @default(cuid())
  platform    String
  
  // Composite index for platform queries
  @@index([platform, lastUpdated])
}
```

## Disaster Recovery

### RTO/RPO Objectives

- **RTO** (Recovery Time): 4 hours
- **RPO** (Recovery Point): 15 minutes

### Backup Strategy

```bash
# Daily backups
./scripts/backup.sh all
```

**Retained:**
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months

## Future Roadmap

### Q4 2026
- Real-time collaboration (WebSocket)
- Advanced filtering and search
- Mobile-responsive design

### Q1 2027
- Multi-region deployment
- Serverless functions
- AI-powered recommendations

## Glossary

| Term | Definition |
|--|--|
| **f-rr-d** | förråd (Swedish for "store") — centralized context repository |
| **skill-adapter** | Harness layer that loads skills for each platform |
| **manifest.json** | Canonical skills list deployed to all 7 platforms |
| **thoughts/** | Centralized markdown for tickets, plans, research |
| **db_data/** | SQLite directory for skills reports |

## Related Documentation

- [OVERVIEW.md](./OVERVIEW.md) — High-level overview
- [HARNESS.md](./HARNESS.md) — AI Engineering Harness details
- [STRUCTURE.md](./STRUCTURE.md) — File structure guide
- [cto-dashboard-architecture.md](./cto-dashboard-architecture.md) — Dashboard specifics
- [deployment-architecture.md](./deployment-architecture.md) — Deployment strategies

---

*Last updated: 2026-06-11*
