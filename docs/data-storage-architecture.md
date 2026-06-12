# Data Storage Architecture

WayOfMono employs a hybrid data storage strategy combining file-based storage for human-readable, git-trackable content with a relational database for structured application data.

## Overview

The storage architecture is designed around the principle of "file-based first" — leveraging markdown and JSON files for content that benefits from human readability and version control, while using SQLite for structured data that requires relational queries and Prisma ORM.

```
┌────────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE LAYER                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   File-Based       │  │   SQLite (Prisma) │  │   In-Memory  │  │
│  │                    │  │                   │  │              │  │
│  │  thoughts/         │  │  custom.db        │  │  Zustand     │  │
│  │  ├─ tickets/*.md   │  │  ├─ SkillReport   │  │  State Store │  │
│  │  ├─ shared/*.json  │  │  ├─ User          │  │              │  │
│  │  ├─ docs/*.md      │  │  └─ Post          │  │  Cache       │  │
│  │  └─ configs/       │  │                   │  │              │  │
│  │                    │  │  Read/Write via    │  │  Client-side │  │
│  │  Mounted: RW       │  │  Prisma Client    │  │  State       │  │
│  └────────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Storage Types

| Storage Type | Technology | Location | Purpose | Backed Up |
|-------------|-----------|---------|---------|-----------|
| File-based | Markdown/JSON | `thoughts/` | Tickets, plans, docs, ideas, standups, news | Git (daily) |
| Relational | SQLite (Prisma) | `ui/db_data/custom.db` | Skills reports, user data, posts | Daily dump |
| Client-side | Zustand | Browser memory | UI state, filtered views, temporary caches | No |
| Session | Cookies/LocalStorage | Browser | Auth tokens, preferences | No |

## File-Based Storage (thoughts/)

### Directory Layout

```
thoughts/
├── global/                 # Cross-project concerns
│   ├── standards/
│   ├── best-practices/
│   └── templates/
│
├── shared/                 # Cross-project templates
│   ├── tickets/
│   ├── plans/
│   └── research/
│
├── wayofmono/              # WOMONO project
│   ├── docs/
│   │   ├── tools/
│   │   └── best-practices/
│   ├── shared/
│   │   ├── tickets/        # WOMONO-*.md
│   │   ├── plans/
│   │   └── research/
│   ├── global/
│   └── <developer>/        # Per-developer tickets
│
├── wow/                    # WOW project
│   └── (same structure)
│
└── opticat/                # OPT project
    └── (same structure)
```

### File Formats

**Ticket Files** (`WOMONO-054-DOCUMENT-GENERATION-SKILL-OVERHAUL.md`)

```markdown
---
id: WOMONO-054
title: Document Generation Skill Overhaul
status: in_progress
priority: P1
assignee: @developer
type: feature
created: 2026-06-10
updated: 2026-06-11
depends_on: [WOMONO-048]
tags: [skill, documentation]
---

# WOMONO-054: Document Generation Skill Overhaul

## Objective
Complete overhaul of the document generation skill with new templates.

## Requirements
- [ ] New template engine integration
- [ ] Multi-format output support
```

**JSON Structured Data** (`shared/ideas.json`)

```json
[
  {
    "id": "IDEA-1718112000000",
    "title": "Automated ticket triage",
    "description": "Use AI to automatically categorize tickets",
    "author": "craig",
    "created": "2026-06-11",
    "priority": 5,
    "status": "proposed",
    "votes": 3,
    "voters": ["craig", "tomas", "andre"]
  }
]
```

**Shared Configuration** (`shared/tickets/ticket-template.md`)

```markdown
---
id: TEMPLATE
title: "Ticket Name"
status: draft
priority: P2
assignee: @developer
type: task
created: {{date}}
---

# {{id}}: {{title}}

## Objective

## Context

## Requirements

## Acceptance Criteria
```

### Access Layer

The `lib/thoughts.ts` module provides the primary access layer:

```typescript
// Import and usage
import { getTickets, getDevelopers, getDocs, getSkills } from '@/lib/thoughts'

// Reading tickets
const tickets = await getTickets()
// Returns: parsed frontmatter + body for each ticket

// Reading developers
const developers = await getDevelopers()
// Returns: developer profiles from directory structure

// Reading docs
const docs = await getDocs()
// Returns: frontmatter + body for each doc file

// Reading skills
const skills = await getSkills()
// Returns: skills health from ~/.config/opencode/skills/, etc.
```

**Frontmatter Parsing** (`lib/thoughts.ts:12-38`)

```typescript
function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  // Extracts YAML-like frontmatter between --- delimiters
  // Supports: string values, JSON arrays, quoted strings
  // Returns: { frontmatter: Record<string, unknown>, body: string }
}
```

**Tickets Discovery** (`lib/thoughts.ts:107-119`)

```typescript
export async function getTickets() {
  // Walks each project's shared/tickets/ directory
  // Parses frontmatter from each .md file
  // Deduplicates by ticket ID
  // Returns: array of parsed ticket objects
}
```

## Relational Database (SQLite)

### Schema Design

**Prisma Schema** (`ui/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SkillReport {
  id        String   @id @default(cuid())
  clientId  String
  tool      String
  count     Int
  skills    String   @default("[]")
  createdAt DateTime @default(now())
}
```

### Database Location

- **Path**: `ui/db_data/custom.db` (relative to UI directory)
- **Environment Variable**: `DATABASE_URL=file:../db/custom.db`
- **Deployment Mount**: Volume `db_data` persisted across restarts

### Connection Management

**Client Singleton** (`lib/db.ts`)

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

Uses the singleton pattern via `globalThis` to avoid creating multiple Prisma clients during hot reload in development.

### Database Lifecycle

**Startup** (in `docker/entrypoint.sh`)

```bash
#!/bin/sh
set -e

echo "→ Applying database schema..."
npx prisma db push --skip-generate 2>&1 || echo "⚠ db push failed (non-fatal)"

echo "→ Starting server..."
exec node server.js
```

The database schema is applied automatically on startup using `prisma db push` (not migrations, since SQLite schema changes are additive).

## Client-Side State (Zustand)

### State Store Architecture

The `lib/dashboard-store.ts` manages client-side application state:

```typescript
interface DashboardState {
  // Navigation
  currentView: ViewMode
  viewHistory: ViewMode[]
  
  // Data
  tickets: Ticket[]
  developers: Developer[]
  docs: ProjectDoc[]
  ideas: Idea[]
  newsItems: NewsItem[]
  
  // UI State
  selectedDeveloper: string | null
  selectedTicket: Ticket | null
  searchQuery: string
  
  // Filters
  filterProject: string
  filterStatus: string
  filterPriority: string
  filterCategory: string
  
  // Actions
  updateTicketStatus(ticketId, status)
  updateTicketReview(ticketId, reviewStatus, comments)
  addIdea(idea)
  voteIdea(id, user)
  addNewsItem(item)
  getFilteredTickets()
  fetchData()
}
```

### Data Flow

```
Initial Load
    │
    ▼
fetchData() ──▶ GET /api?type=tickets
                    │
                    ├──▶ thoughts.ts:getTickets()
                    │       ├── fs.readdir(thoughts/<project>/shared/tickets/)
                    │       ├── parseFrontmatter()
                    │       └── return array
                    │
                    ├──▶ thoughts.ts:getDevelopers()
                    │       ├── fs.readdir(thoughts/<project>/*/)
                    │       └── return array
                    │
                    └──▶ thoughts.ts:getDocs()
                            ├── fs.readdir(thoughts/<project>/docs/)
                            └── return array
```

### Authentication State

```typescript
interface AuthState {
  currentUser: string | null
  isCTO: boolean
  canReview: boolean
  
  login(username, pincode?)  // Validates against developers list
  logout()                   // Clears auth state
}
```

Login flow:
1. User enters github username + optional pincode
2. Store checks against developer directory names
3. CTO role grants full access; Lead/Senior grants review access
4. State persists in session

## Data Flow Diagram

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐
│  Browser │     │  Next.js     │     │  Storage Layer    │
│  (Zustand)│     │  Server      │     │                  │
└────┬─────┘     └──────┬───────┘     └────────┬─────────┘
     │                  │                      │
     │  fetchData()     │                      │
     │─────────────────▶│                      │
     │                  │                      │
     │                  │  GET /api            │
     │                  │─────────────────────▶│
     │                  │                      │
     │                  │     thoughts.ts      │
     │                  │──────────────────    │
     │                  │  │ fs.readdir()      │
     │                  │  │ parseFrontmatter()│
     │                  │◀──────────────────   │
     │                  │                      │
     │                  │     db.ts            │
     │                  │──────────────────    │
     │                  │  │ Prisma Client     │
     │                  │  │ SQLite queries    │
     │                  │◀──────────────────   │
     │                  │                      │
     │  JSON Response   │                      │
     │◀─────────────────│                      │
     │                  │                      │
     │  Zustand Store   │                      │
     │  ────────────    │                      │
     │  │ Update state  │                      │
     │  │ Re-render UI  │                      │
     │◀─────────────────│                      │
```

## Performance Considerations

### Caching

**Server-side**: API responses are cached per-request using Next.js data cache:
```typescript
// API routes automatically cache GET responses
export const dynamic = 'force-dynamic'  // opt-out for dynamic data
```

**Client-side**: Zustand store provides in-memory cache:
- Ticket data cached on initial load
- Developers list cached per session
- Docs cached per session

### Optimizations

**File System**:
- Batch reads: `Promise.all` for parallel directory walks
- Deduplication: `seenIds` Set prevents processing same ticket twice
- Lazy loading: Doc bodies fetched on demand, not metadata

**Database**:
- Singleton client prevents connection overhead
- `prisma db push` handles schema drift on startup
- Indexed on `@id` and `@unique` fields for fast single-row lookups

## Data Consistency

### Race Conditions

The file-based storage is susceptible to race conditions when multiple processes write simultaneously:
- **Dashboard writes**: Series of sequential writes (git add → commit → push)
- **Agent writes**: git pull → write → git push
- **Manual writes**: Direct file system edits

**Mitigation strategy**:
1. Dashboard uses optimistic updates for UI responsiveness
2. Git handles merge conflicts with manual resolution
3. Periodic `git pull --ff-only` before writes

### Data Integrity

**Validation points**:
1. Frontmatter parsing validates required fields
2. Ticket ID format is enforced by naming convention
3. Developer names must match directory names
4. Status transitions are validated client-side

## Backup and Recovery

### Strategy

| Component | Frequency | Method | Retention |
|-----------|-----------|--------|-----------|
| thoughts/ | Continuous | Git version control | Full history |
| custom.db | Daily | `sqlite3 .backup` | 30 days |
| .env | Monthly | Manual copy | 90 days |
| Config | Monthly | Snapshot | 90 days |

### Recovery Procedures

**File System Recovery**:
```bash
# Restore from git
cd /thoughts
git reset --hard HEAD
git clean -fd
git pull --ff-only
```

**Database Recovery**:
```bash
# Restore from backup
cd /backups/database/20260611
cp custom.db /app/db_data/custom.db
npx prisma db push --skip-generate
```

## Future Data Storage

### Phase 2 (Q3 2026)

**PostgreSQL Migration**
```prisma
// Migration path: SQLite → PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Benefits**:
- Concurrent write access
- Row-level locking
- Connection pooling
- Advanced indexing (GIN, GiST)

**Redis Cache Layer**
```typescript
const cache = await redis.get('tickets:view')
if (cache) return JSON.parse(cache)

const tickets = await getTickets()
await redis.set('tickets:view', JSON.stringify(tickets), { EX: 300 })
return tickets
```

### Phase 3 (Q4 2026)

**Blob Storage** (for large assets)
- Backblaze B2 or S3 for attachments
- CDN for static assets
- Git LFS for large thoughts/ files

**Full-Text Search**
- FTS5 extension for SQLite
- Elasticsearch for production
- Hybrid search (keyword + vector)
