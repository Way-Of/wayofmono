# API Endpoints

## Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api` | Dashboard data (tickets, devs, docs) |
| GET | `/api?type=tickets&source=github&branch=main` | Tickets from GitHub |
| GET | `/api?type=developers&source=github` | Developers from GitHub |
| GET | `/api?type=docs` | Documentation |
| POST | `/api/ideas` | Create idea |
| POST | `/api/standup` | Create standup entry |
| POST | `/api/news` | Create news item |
| GET | `/api/skills/report` | Skills health |

## Query Parameters

| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `type` | `tickets`, `developers`, `docs`, `dashboard`, `skills`, `ideas` | `dashboard` | Data type |
| `source` | `local`, `github` | `local` | Data source |
| `branch` | `main`, `develop`, `staging` | `main` | GitHub branch |

## Authentication

- **NextAuth.js** with GitHub OAuth
- Scopes: `read:user user:email repo`
- Session includes `accessToken` for GitHub API calls
- 5000 req/hr authenticated vs 60 unauthenticated

## Response Format

```typescript
interface Ticket {
  id: string;
  title: string;
  type: 'Feature' | 'Bug' | 'Task' | 'Research' | 'Refactor' | 'Docs';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Backlog' | 'In Progress' | 'In Review'In Review' | 'Done' | 'Blocked';
  assignee: string;
  reporter: string;
  project: 'wayofmono' | 'wow' | 'opticat';
  namespace: string;
  category: string;
  // ... more fields
}
```