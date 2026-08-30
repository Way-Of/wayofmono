# CTO Dashboard Architecture

Next.js 16 application serving as the user interface for WayOfMono (Wo), providing ticket management, team collaboration, and skills monitoring capabilities.

## Overview

The CTO Dashboard is a production-ready, enterprise-grade Next.js application with the following characteristics:

- **Framework**: Next.js App Router (React 19, TypeScript)
- **Styling**: Tailwind CSS with custom design system
- **Deployment**: Container-native (Docker/Podman), CI/CD ready
- **Backend**: SQLite database with Prisma ORM
- **Data Source**: File-based storage for tickets, plans, research (thoughts/), structured data for skills reports

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CTO DASHBOARD (Next.js 16)                    │
├─────────────────────────────────────────────────────────────────┤
│  Frontend                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │   Tickets View  │  │   Skills View  │  │   Profile    │  │
│  │   Kanban Board  │  │   Dashboard     │  │   Settings   │  │
│  │   Filters       │  │   Analytics     │  │   Preferences│  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
│                                                              │
│  API Routes                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  GET /api/ideas │  │  GET /api/news  │  │  Auth        │  │
│  │  POST /api/... │  │  GET /api/...   │  │  Middleware  │  │
│  │  GET /api/...  │  │  GET /api/...   │  │  Rate Limit  │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
│                                                              │
│  Internal Storage                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  thoughts/      │  │  db_data/       │  │  cache/      │  │
│  │  bind mount     │  │  SQLite (.db)   │  │  Redis       │  │
│  │  RW access      │  │  custom.db      │  │  session     │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Application Layer

**Root Layout** (`app/layout.tsx`)
- Global providers (theme, toast, query)
- Navigation sidebar
- Auth context
- Error boundaries

**Dashboard Layout** (`components/dashboard/layout.tsx`)
- Main content area with ticket navigation
- Search and filter controls
- Quick actions toolbar

### Views (Pages)

**Tickets View** (`components/dashboard/tickets-view.tsx`)
- Kanban board with drag-and-drop
- Ticket filtering and search
- Quick ticket creation
- Ticket detail panels

**Skills View** (`components/dashboard/skills-view.tsx`)
- Skills grid with platform filtering
- Skill details and metadata
- Install/uninstall controls
- Skills health status

**Developers View** (`components/dashboard/developers-view.tsx`)
- Team member profiles
- Progress tracking
- Assignment management
- Performance metrics

**Ideas View** (`components/dashboard/ideas-view.tsx`)
- Idea submission form
- Idea voting and commenting
- Idea categorization
- Priority management

### API Routes

**Data Access Layer**

```typescript
// app/api/ideas/route.ts
export async function GET(request: NextRequest) {
  // Parse query params
  // Load from thoughts/ideas/*.md
  // Apply filters and pagination
  // Return JSON
}
```

**Skills Report API** (`app/api/skills/report/route.ts`)
- Generates comprehensive skills analytics
- Reads from platform configs
- Calculates health metrics
- Caches results for performance

### Database Layer

**SQLite with Prisma** (`prisma/schema.prisma`)

```prisma
model SkillReport {
  id          String   @id @default(cuid())
  platform    String
  skillName   String
  description String
  version     String
  healthScore Int
  lastUpdated DateTime @default(now())
}

model UserProgress {
  id          String   @id @default(cuid())
  userId      String
  skillName   String
  completedAt DateTime
  progress    Int
}
```

## Data Flow Architecture

```
User Request
    │
    ▼ (HTTPS via Caddy)
Cloudflare Tunnel (cto.wayof.work)
    │
    ▼
Caddy Reverse Proxy (:81) ──► Next.js (:3000)
    │                           │
    │                           ├─► thoughts/ (bind mount, RW)
    │                           │    ├─ tickets/*.md (WOMONO-*, WOW-*, OPT-*)
    │                           │    ├─ shared/*.json (ideas, standups, news)
    │                           │    └─ docs/
    │                           │
    │                           └─► db_data volume (SQLite)
    │                                └─ custom.db (skills reports)
    │
    ▼
Response
```

## Technical Architecture

### Runtime Environment

**Container Configuration**

```yaml
# docker-compose.yml (example)
services:
  nextjs:
    build: .
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
      - THOUGHTS_ROOT=/thoughts
    volumes:
      - ./thoughts:/thoughts:rw
      - db_data:/app/db_data
    ports:
      - "3000:3000"
```

**Build Pipeline**

1. **Builder Stage**: Node.js 22-alpine with Bun
2. **Prisma Generation**: Schema compilation
3. **Next.js Build**: Static optimization + server components
4. **Runtime Stage**: Minimal Node.js with Prisma CLI

### Observability

**Logging**
- Structured JSON logs to stdout
- Log levels: error, warn, info, debug
- Correlation IDs for request tracing
- Performance metrics (response time, error rates)

**Health Checks**
```
GET /api/health
{
  "status": "ok",
  "timestamp": "2026-06-11T17:51:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "pass",
    "cache": "pass",
    "external": "pass"
  }
}
```

**Monitoring**
- Response time tracking
- Error rate monitoring
- API usage analytics
- Database performance metrics

## Deployment Architecture

### Production Deployment

**Steps** (`scripts/deploy-dashboard.sh`):

1. **Git Update**: `git pull` from main branch
2. **Container Rebuild**: `podman-compose up --build -d`
3. **Health Check**: 60-second timeout, curl to `/api/health`
4. **Service Restart**: Graceful reload with podman-compose

### Security Architecture

**Authentication & Authorization**
- Session-based auth with secure cookies
- Role-based access control (admin, user, viewer)
- Rate limiting per IP and user
- Input validation and sanitization

**Network Security**
- Cloudflare Tunnel for TLS termination
- Caddy reverse proxy with automatic HTTPS
- Firewall rules for container networking
- IPv4/IPv6 support

### Scaling Architecture

**Horizontal Scaling**
- Multiple Next.js instances behind Caddy
- Load balancing with health checks
- Database connection pooling
- CDN for static assets

**Vertical Scaling**
- Database sharding for large datasets
- Redis caching for frequently accessed data
- Horizontal pod autoscaling

## Integration Points

### With AI Engineering Harness

**Skills Synchronization**
- Real-time skills health monitoring
- Automatic skill updates from `manifest.json`
- Platform-specific validation

**Ticket Integration**
- Real-time ticket updates via WebSocket
- Assignment tracking
- Progress visualization

### With f-rr-d System

**Read Access**
- All thoughts/ data is read-only for dashboard
- Cached in Redis for performance
- Conflict resolution for concurrent updates

**Write Access**
- User-generated content (ideas, standups, news) written to thoughts/
- Automatic ticket creation from ideas
- Version control via git

## Performance Optimization

### Database Optimization

**Indexing Strategy**
- Composite indexes on query filters
- Materialized views for complex reports
- Partitioning for large tables

**Caching**
- Skills reports: Redis (5-minute TTL)
- API responses: Edge cache
- Static assets: CDN

### Application Optimization

**Rendering Strategy**
- Static site generation for ticket listings
- Server-side rendering for ticket details
- Client-side rendering for interactive components

**Bundle Optimization**
- Tree shaking for unused components
- Code splitting by route
- Dynamic imports for heavy components

## Disaster Recovery

### Backup Strategy

**Database Backups**
- Daily SQLite dumps
- Incremental backups for recent changes
- Retention: 30 days

**File System Backups**
- thoughts/ directory snapshots
- Configuration backups
- Logs and monitoring data

### Recovery Procedures

**RTO**: 4 hours
**RPO**: 15 minutes

1. **Detection**: Health check failures
2. **Isolation**: Container restart
3. **Recovery**: Point-in-time restore
4. **Verification**: Health check validation

## Future Roadmap

### Phase 1 (Q3 2026)
- Real-time collaboration (WebSocket)
- Advanced filtering and search
- Mobile-responsive design

### Phase 2 (Q4 2026)
- AI-powered ticket prioritization
- Automated skill recommendations
- Advanced analytics dashboards

### Phase 3 (Q1 2027)
- Multi-tenancy support
- Enterprise SSO integration
- Advanced reporting features
