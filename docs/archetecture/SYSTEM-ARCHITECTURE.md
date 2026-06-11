# System Architecture — WayOfMono

This document provides a comprehensive view of the WayOfMono system architecture, covering data flow, component interactions, architectural patterns, and design decisions.

## Executive Summary

WayOfMono is an **AI Engineering Monorepo** that consolidates:
- 7 AI coding tool frontends (OpenCode, Claude Code, Gemini CLI, Pi, Codex, Antigravity, Wo Coder)
- A unified skill/agent orchestration layer (`packages/@aiengineeringharness`)
- A production-ready CTO Dashboard for team management and monitoring

**Architecture Philosophy:**
1. **File-based first** — Human-readable, git-trackable data (Markdown/JSON)
2. **Container-native** — Podman/Docker rootless, multi-stage builds
3. **Observability-driven** — Trace before implementation (ODD pattern)
4. **Multi-tool abstraction** — Single source of truth deployed to 7 platforms

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WAYOFMONO SYSTEM                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐    ┌──────────────────┐    ┌────────────────┐ │
│  │   User Interface │    │   AI Tools       │    │   Data Layer   │ │
│  │  (CTO Dashboard) │◄──►│  (7 Frontends)   │◄──►│  (SQLite +     │ │
│  │                  │    │  - OpenCode      │    │   File-based)  │ │
│  └────────┬─────────┘    │  - Claude Code   │    │                 │ │
│           │              │  - Gemini CLI    │    │  thoughts/     │ │
│           ▼              │  - Pi            │    │  db_data/      │ │
│  ┌──────────────────┐    │  - Codex        │    │                 │ │
│  │   Orchestrator   │    │  - Antigravity  │    │  cache/        │ │
│  │ (skill-adapter)  │    │  - Wo Coder     │    │                 │ │
│  └────────┬─────────┘    └──────────────────┘    └────────────────┘ │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Edge Layer                                 │   │
│  │  Cloudflare Tunnel (TLS) → Caddy Reverse Proxy                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Storage Patterns

| Layer | Technology | Purpose | Persistence |
|-------|------------|---------|-------------|
| **Application Data** | SQLite (Prisma) | Skills reports, user progress | `db_data/custom.db` |
| **Document Store** | File System | Tickets, plans, research | `thoughts/` (Git-backed) |
| **Cache Layer** | Redis / Memory | Session state, API responses | Volatile/Redis |
| **Edge Cache** | Cloudflare CDN | Static assets, edge functions | Distributed |

### Data Flow Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│  Caddy/CF   │────▶│  Next.js     │
│   Request   │◀────│  Reverse    │◀────│  App Router  │
└─────────────┘     │  Proxy      │     └──────┬───────┘
                    └─────────────┘            │
                            │                  │
                    ┌───────▼────────┐         │
                    │   thoughts/    │◀────────┤ (bind mount, RW)
                    │  (Git-backed)  │         │
                    └────────────────┘         │
                            │                  │
                    ┌───────▼────────┐         │
                    │   db_data/     │◀────────┤ (volume)
                    │  (SQLite)      │         │
                    └────────────────┘         │
                            │                  │
                    ┌───────▼────────┐         │
                    │    cache/      │◀────────┤ (Redis/Memory)
                    └────────────────┘         │
```

### Data Models

**Ticket Model** (`thoughts/<project>/shared/tickets/*.md`)
```yaml
---
prefix: WOMONO  # or WOW, OPT
number: "001"
title: "INITIAL-SETUP"
status: in-progress
priority: high
assignee: developer
tags: [setup, initial]
---

# Content...
```

**Skills Report Model** (`db_data/custom.db`)
```prisma
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

---

## API Architecture

### RESTful Design Principles

1. **Resource-oriented** — Nouns for resources, verbs for actions
2. **Versioned endpoints** — `/api/v1/...` with clear versioning strategy
3. **Consistent responses** — Standardized error codes, pagination, filtering
4. **HATEOAS-ready** — Hypermedia controls where applicable

### API Structure

```typescript
// Base structure
interface ApiResponse<T> {
  data?: T | null;
  meta?: {
    page: number;
    perPage: number;
    total: number;
  };
  error?: ApiError;
}

interface ApiError {
  code: string;        // e.g., "VALIDATION_ERROR"
  message: string;     // Human-readable
  details?: any[];    // Optional field-level errors
}
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check (database, cache, storage) |
| `/api/tickets` | GET | List tickets with filters |
| `/api/tickets/:id` | GET | Single ticket details |
| `/api/skills/report` | POST | Generate skills analytics |
| `/api/ideas` | GET/POST | Ideas submission and voting |
| `/api/news` | GET | News feed aggregation |

### API Versioning Strategy

```typescript
// URL-based versioning (recommended)
GET /api/v1/tickets
GET /api/v2/tickets  // Breaking changes go here

// Header-based versioning (alternative)
GET /api/tickets
Header: X-API-Version: 2.0
```

---

## Event-Driven Architecture

### Pub/Sub Pattern for Real-time Updates

WayOfMono uses an **event-driven architecture** for real-time collaboration features.

### Event Schema

```typescript
interface Event {
  id: string;              // UUID
  type: EventType;         // e.g., "TICKET_CREATED", "SKILL_UPDATED"
  timestamp: Date;
  payload: Record<string, any>;
  correlationId?: string;  // For request tracing
}

type EventType = 
  | 'TICKET_CREATED'
  | 'TICKET_UPDATED'
  | 'SKILL_INSTALLED'
  | 'SKILL_UNINSTALLED'
  | 'USER_PROGRESS_CHANGED';
```

### Event Bus Implementation

**Current**: In-memory event bus (for single-instance deployment)

```typescript
// lib/event-bus.ts
class EventBus {
  private subscribers: Map<string, Set<Function>> = new Map();

  subscribe(eventType: EventType, handler: Function): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(handler);
    };
  }

  publish(event: Event): void {
    const handlers = this.subscribers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event.payload);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      }
    }
  }
}

export const eventBus = new EventBus();
```

**Future**: Redis Pub/Sub or NATS for distributed deployments.

---

## Security Architecture

### Authentication & Authorization Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│  Cloudflare │────▶│  Caddy/Next │
│   Browser   │     │  WAF        │     │  Auth       │
└─────────────┘     └─────────────┘     └──────┬───────┘
                    │                          │
                    ▼                          ▼
            ┌─────────────┐          ┌─────────────┐
            │ JWT Token   │◀────────▶│ Session Mgr │
            │ (Secure)    │          │             │
            └─────────────┘          └─────────────┘
```

### Security Layers

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Edge** | Cloudflare WAF | DDoS protection, rate limiting, bot detection |
| **Transport** | TLS 1.3 (Cloudflare) | Encrypted in-transit communication |
| **Application** | JWT + Session Cookies | User authentication and session management |
| **Data** | SQLite encryption | At-rest data encryption for sensitive fields |

### Role-Based Access Control (RBAC)

```typescript
type Role = 'admin' | 'user' | 'viewer';

interface Permission {
  resource: string;      // e.g., "tickets", "skills"
  action: string;        // e.g., "create", "read", "update"
}

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { resource: 'tickets', action: '*' },
    { resource: 'skills', action: '*' },
    { resource: 'users', action: '*' }
  ],
  user: [
    { resource: 'tickets', action: ['read', 'update'] },
    { resource: 'ideas', action: ['create', 'vote'] }
  ],
  viewer: [
    { resource: 'tickets', action: 'read' },
    { resource: 'skills', action: 'read' }
  ]
};

function checkPermission(role: Role, resource: string, action: string): boolean {
  const permissions = rolePermissions[role];
  return permissions.some(
    p => (p.action === '*' || p.action === action) && 
         (p.resource === '*' || p.resource === resource)
  );
}
```

### Secrets Management

| Secret Type | Storage | Rotation |
|-------------|---------|----------|
| **Database** | `.env` file, mounted volume | Manual/CI |
| **JWT Keys** | Environment variable | Quarterly |
| **API Keys** | Platform-specific (e.g., OpenAI) | Per-tool rotation |
| **Cloudflare Tunnel** | `tunnel.yml` config | On credential change |

---

## Observability Architecture

### Three Pillars of Observability

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Tracing   │     │    Metrics  │     │   Logging    │
│  (Distributed)│    │  (Performance)│    │  (Structured)│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Tracing Architecture

**OpenTelemetry-based tracing** with correlation IDs:

```typescript
// lib/tracing.ts
import { trace, Span } from '@opentelemetry/api';

class TraceContext {
  private span?: Span;
  
  static createContext(): string {
    return crypto.randomUUID();  // Correlation ID
  }
  
  static withSpan<T>(correlationId: string, fn: () => T): T {
    const span = trace.getSpan();
    if (span) {
      span.setAttribute('correlation.id', correlationId);
    }
    return fn();
  }
}

// Usage in middleware
export async function tracingMiddleware(request: NextRequest) {
  const correlationId = TraceContext.createContext();
  request.headers.set('X-Correlation-ID', correlationId);
  
  return eventBus.publish({
    type: 'REQUEST_STARTED',
    payload: { correlationId, method: request.method, url: request.url }
  });
}
```

### Metrics Collection

**Prometheus-compatible metrics**:

```typescript
// lib/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const activeRequests = new Gauge({
  name: 'http_requests_active',
  help: 'Number of active HTTP requests'
});

// Export endpoint
export async function getMetrics() {
  return registry.metrics();
}
```

### Structured Logging

**JSON-formatted logs with correlation IDs**:

```typescript
// lib/logger.ts
interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log('error', message, { ...metadata, error: error?.message });
  }

  private log(level: LogEntry['level'], message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: this.correlationId,
      userId: this.userId,
      ...metadata
    };

    console.log(JSON.stringify(entry));  // Or send to ELK/Fluentd
  }
}
```

---

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

| View | Component | Purpose |
|------|-----------|---------|
| **Tickets View** | `tickets-view.tsx` | Kanban board, filtering, quick creation |
| **Skills View** | `skills-view.tsx` | Skills grid, platform filtering, health monitoring |
| **Developers View** | `developers-view.tsx` | Team profiles, progress tracking, assignments |
| **Ideas View** | `ideas-view.tsx` | Idea submission, voting, categorization |

### API Routes Layer

```typescript
// app/api/ideas/route.ts
export async function GET(request: NextRequest) {
  // Parse query params (filters, pagination)
  // Load from thoughts/ideas/*.md
  // Apply filters and pagination
  // Return JSON
}

// app/api/skills/report/route.ts
export async function POST(request: NextRequest) {
  // Generate comprehensive skills analytics
  // Read from platform configs
  // Calculate health metrics
  // Cache results for performance
}
```

### Database Layer

**SQLite with Prisma ORM**:

```prisma
// prisma/schema.prisma
model SkillReport {
  id          String   @id @default(cuid())
  platform    String
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

---

## Performance Architecture

### Caching Strategy

| Cache Type | TTL | Storage | Purpose |
|------------|-----|---------|---------|
| **Skills Reports** | 5 min | Redis/Memory | Heavy analytics queries |
| **API Responses** | 1-60s | Edge (Cloudflare) | Static content, simple queries |
| **Static Assets** | 1h+ | CDN | Images, fonts, JS/CSS bundles |

### Database Optimization

**Indexing Strategy**:
```prisma
model SkillReport {
  id          String   @id @default(cuid())
  platform    String
  skillName   String
  
  // Composite indexes for common query patterns
  @@index([platform, lastUpdated])  // Platform-specific queries
  @@index([healthScore])             // Health score filtering
}
```

**Caching**:
- Skills reports: Redis (5-minute TTL)
- API responses: Edge cache + in-memory
- Static assets: CDN with long TTLs

### Bundle Optimization

- **Tree shaking** for unused components
- **Code splitting** by route
- **Dynamic imports** for heavy components
- **Next.js optimizations**: ISR, SSG, SSR as appropriate

---

## Scalability Architecture

### Horizontal Scaling

```yaml
# Multi-instance deployment
services:
  nextjs-blue:
    build: .
    ports: ["3001:3000"]
  
  nextjs-green:
    build: .
    ports: ["3002:3000"]

caddy:
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile
```

**Load Balancing**:
- Caddy reverse proxy with health checks
- Sticky sessions for WebSocket connections (if used)
- Database connection pooling

### Vertical Scaling

**Database Sharding** (future):
- Partition by `platform` or `userId`
- Read replicas for analytics queries

**Redis Clustering** (future):
- Horizontal scaling of cache layer
- Session affinity for user sessions

---

## Disaster Recovery Architecture

### RTO/RPO Objectives

| Metric | Target | Implementation |
|--------|--------|----------------|
| **RTO** (Recovery Time) | 4 hours | Container restart + data restore |
| **RPO** (Recovery Point) | 15 minutes | Frequent backups + replication |

### Backup Strategy

```bash
# scripts/backup.sh
#!/bin/bash
set -euo pipefail

BACKUP_TYPES=("thoughts" "database" "configuration")

for backup_type in "${BACKUP_TYPES[@]}"; do
  case $backup_type in
    thoughts)
      tar -czf /backups/thoughts/${TIMESTAMP}.tar.gz \
        -C /home/zerwiz/wayofmono thoughts/
      ;;
    database)
      sqlite3 /path/to/custom.db ".backup '/backups/database/${TIMESTAMP}/custom.db'"
      ;;
    configuration)
      cp -r /home/zerwiz/wayofmono/ui/.env* /backups/config/${TIMESTAMP}/
      ;;
  esac
done

# Cleanup old backups (7-day retention for daily, 30-day for weekly)
find /backups/thoughts -name "*.tar.gz" -mtime +7 -delete
```

### Recovery Procedures

**Phase 1: Detection & Isolation**
1. Automated health check failures trigger alert
2. Container stops affected services gracefully
3. Load balancer removes unhealthy nodes

**Phase 2: Recovery**
1. Restore from latest backup (within 15 minutes)
2. Podman compose brings services back
3. Health checks verify system is operational

**Phase 3: Verification**
1. Load tests validate system performance
2. Data consistency checks
3. User acceptance testing

---

## Future Architecture Evolution

### Phase 1 (Q4 2026) — Real-time Collaboration
- WebSocket-based real-time ticket updates
- Advanced filtering and search
- Mobile-responsive design

### Phase 2 (Q1 2027) — Multi-region Deployment
- Geo-distributed databases
- Edge caching at Cloudflare
- Multi-active replication for HA

### Phase 3 (Q2 2027) — AI-Powered Features
- AI-powered ticket prioritization
- Automated skill recommendations
- Predictive analytics dashboards

---

## Architecture Decision Records (ADRs)

See `thoughts/wayofmono/docs/architecture/adrs/` for detailed ADRs covering:
- **ADR-001**: File-based data storage pattern
- **ADR-002**: Container-native deployment strategy
- **ADR-003**: Observability-driven development (ODD)
- **ADR-004**: Multi-tool abstraction layer

---

## Glossary

| Term | Definition |
|------|------------|
| **ODD** | Observability Driven Development — design the trace before implementation |
| **f-rr-d** | förråd (Swedish for "store") — centralized context engineering repository |
| **skill-adapter** | Platform-specific skill/agent loading and format adapter |
| **manifest.json** | Source of truth for skills/components across all platforms |

---

## References

- [OVERVIEW.md](./OVERVIEW.md) — High-level system overview
- [HARNESS.md](./HARNESS.md) — AI Engineering Harness details
- [STRUCTURE.md](./STRUCTURE.md) — File structure and agent interfaces
- [cto-dashboard-architecture.md](./cto-dashboard-architecture.md) — CTO Dashboard specifics
- [deployment-architecture.md](./deployment-architecture.md) — Deployment/CI/CD strategies

---

*Last updated: 2026-06-11*
