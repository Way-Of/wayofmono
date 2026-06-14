# CTO Dashboard — Overview

Production dashboard at **[https://cto.wayof.work](https://cto.wayof.work)** (v0.2.0, Next.js 16, Prisma/SQLite).

## Features

| View | Description |
|------|-------------|
| **Overview** | Ticket stats, velocity, blockers |
| **Tickets** | Full Kanban with filters, review queue |
| **Standup** | Daily check-ins (yesterday/today/blockers) |
| **Skills** | Real-time skill health across all machines |
| **Ideas** | Prioritized idea board with voting |
| **Developers** | Workflow and assignment tracking |
| **Docs** | Architecture docs and decision records |

## Run Locally

```bash
cd ui && pnpm install && pnpm dev
# Quick start script
./scripts/dev-dashboard.sh
# Custom port
./scripts/dev-dashboard.sh 4000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api` | List tickets, developers, docs |
| POST | `/api/ideas` | Create new idea |
| POST | `/api/standup` | Create standup entry |
| POST | `/api/news` | Create news item |
| GET | `/api/news` | List news items |
| GET | `/api/skills/report` | Skills health report |
| POST | `/api/skills/report` | Submit skills report |

## Dashboard Architecture

```
ui/
├── src/app/
│   ├── api/                # API routes
│   │   ├── health/         # Health check
│   │   ├── ideas/          # Idea management
│   │   ├── news/           # News items
│   │   ├── standup/        # Standup entries
│   │   └── skills/         # Skills reporting
│   └── page.tsx            # Main dashboard page
├── src/components/         # Dashboard views
│   ├── tickets/            # Kanban board
│   ├── skills/             # Skills health
│   ├── standup/            # Standup view
│   ├── ideas/              # Idea board
│   └── developers/         # Developer tracking
├── src/lib/                # Data access
│   ├── thoughts.ts         # Thoughts/f-rr-d integration
│   ├── db.ts               # Prisma database
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utilities
├── src/store/              # Zustand state
│   └── dashboard-store.ts  # Global state
├── prisma/                 # SQLite schema
│   └── schema.prisma       # User, Post, SkillReport
└── docker/                 # Docker deployment
    ├── Dockerfile
    ├── entrypoint.sh
    └── Caddyfile
```

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  role      String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SkillReport {
  id        String   @id @default(cuid())
  machineId String
  skills    Json
  createdAt DateTime @default(now())
}
```

## Related

- [Dashboard Deployment](deployment.md)
- [Dashboard Scripts](scripts.md)
- [CTO Dashboard in README](../README.md#-cto-dashboard)