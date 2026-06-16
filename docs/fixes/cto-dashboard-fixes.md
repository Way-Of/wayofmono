# CTO Dashboard Fixes & Release Notes

## v0.3.0 (2026-06-16) — Standalone npm Package + Port Change

### Breaking Changes
- **Port changed**: 3000 → 6969 (uncommon port, avoids conflicts with common dev servers)

### Features
- **npm Package**: Published `@wayofmono/wo-cto-dashboard@0.3.0` on npm registry
- **Standalone Repo**: UI extracted to `github.com/Way-Of/wayofdev` (128 files)
- **CLI Entry Point**: `wodev` command via `npx @wayofmono/wo-cto-dashboard` or `npm install -g @wayofmono/wo-cto-dashboard`
- **Zero bun dependency**: `wodev` uses node + next from node_modules instead of bun

### Files Changed
- `package.json` - name: `@wayofmono/wo-cto-dashboard`, version 0.3.0, private:false, type:module, added files[] field
- `bin/wodev.js` - rewritten to use `process.execPath` + `require.resolve('next/dist/bin/next')` instead of bun
- `.gitignore` - fixed to not ignore project's own docs/ and .env.example
- `.env.example` - port updated to 6969
- `electron/main.ts` - port updated to 6969
- `Dockerfile`, `Caddyfile`, `docker-compose.yml` - port updated to 6969
- All scripts (dev.sh, .zscripts/) - port updated to 6969
- `README.md` - all port references updated to 6969
- All docs - port references updated to 6969

### Installation
```bash
# Global install
npm install -g @wayofmono/wo-cto-dashboard
wodev

# Or npx
npx @wayofmono/wo-cto-dashboard

# From source (GitHub)
git clone https://github.com/Way-Of/wayofdev.git
cd wayofdev
npm install
npm run dev
```

### New Files
- `bin/wodev.js` — CLI entry point

---

## v0.2.1 (2026-06-16) — GitHub Ticket Source & Authentication

### Features
- **GitHub Ticket Source**: Fetch tickets directly from private `f-rr-d` GitHub repo (main branch)
- **Source Switch**: Toggle between Local (`thoughts/`) and GitHub in Tickets view
- **Branch Selector**: Dropdown to select branch (main, develop, staging) with auto-refetch
- **5-min Caching**: In-memory cache with branch-aware invalidation
- **Fallback**: Auto-falls back to local filesystem if GitHub returns no tickets
- **GitHub OAuth**: NextAuth.js with GitHub provider for private repo access
  - Scopes: `read:user user:email repo`
  - Maps GitHub users to developers in `thoughts/` repo
  - JWT session includes access token for authenticated API calls

### API Changes
- `GET /api?type=tickets&source=github&branch=main` — Fetch from GitHub
- `GET /api?type=tickets&source=local` — Fetch from local filesystem (default)
- `GET /api/auth/[...nextauth]` — NextAuth.js handler

### New Files
-Environment Variables
```bash
GITHUB_CLIENT_ID=xxx          # GitHub OAuth App Client ID
GITHUB_CLIENT_SECRET=xxx      # GitHub OAuth App Client Secret
NEXTAUTH_SECRET=xxx           # Generate with: openssl rand -base64 32
```

### Files Changed
- `ui/src/lib/thoughts.ts` — GitHub fetching logic, caching, fallback
- `ui/src/app/api/route.ts` — Added source/branch query params
- `ui/src/store/dashboard-store.ts` — Added ticketSource, ticketBranch state
- `ui/src/components/dashboard/tickets-view.tsx` — Source switch, branch selector, refresh button
- `ui/src/lib/types.ts` — Added TicketSource type
- `ui/src/lib/auth.ts` — NextAuth.js GitHub provider config
- `ui/src/app/api/auth/[...nextauth]/route.ts` — Auth handler

---

## v0.2.0 (Previous) — Initial Dashboard Release

### Features
- Team visibility: tickets, velocity, blockers across projects
- Skill health: real-time skill installation status across machines
- Standups: daily async check-ins (yesterday/today/blockers)
- Idea board: prioritized ideas with voting
- Review queue: PRs waiting for review
- Multi-project: WayOfMono (WOMONO), WayOfWork (WOW), Opticat (OPT)

### Tech Stack
- Next.js 16 (App Router)
- Prisma + SQLite
- Zustand for state management
- Radix UI + Tailwind CSS
- Lucide React icons

### Run Locally
```bash
cd ui && pnpm install && pnpm dev
# Starts on http://localhost:3000
```

### API Endpoints
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