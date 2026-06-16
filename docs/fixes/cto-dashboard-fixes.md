# CTO Dashboard Fixes & Release Notes

## v0.4.7 (2026-06-16) — Wodev Character + Process Exit Fix

### Fixes
- **Build no longer killed immediately**: Removed `process.exit(0)` after `runNext('build')` — was terminating the parent Node.js process right after spawning the child, killing `next build` before it could run
- **Same fix for `wodev --dev`**: Removed premature `process.exit(0)`
- **`npx prisma generate` no longer hangs**: Uses direct prisma binary path via `require.resolve()` first, falls back to `npx --yes`

### Features
- **Wodev character greeting**: Rotating welcome messages on startup, matching WoCode's "Yo! I'm Wo" style:
  - 🤖 "Yo! I'm Wodev — your deploy dashboard..."
  - ☕ "Wodev online. I handle the deploys so you can handle the important stuff..."
  - 🚀 "Ship it! Oh wait, that's my line..."
  - 🎩 "Ah, the CTO arrives..."
  - 🔥 "Wodev here. Your PR queue is glowing..."
- Funny messages now appear in ALL modes: production, dev, and the "no build found" hint screen

### Migration from v0.4.6
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard@0.4.7
sudo wodev --build
wodev
```

---

## v0.4.6 (2026-06-16) — [BROKEN - do not use] Syntax Error

### Known Issues
- Syntax error: missing closing brace in `bin/wodev.js` — crashes on startup
- Use v0.4.7 instead

---

## v0.4.5 (2026-06-16) — Welcome Messages (First Attempt)

### Features
- Welcome messages on startup (non-build modes)

### Known Issues
- Messages were one-liners, not character-style like WoCode
- `process.exit(0)` after `runNext()` killed child processes immediately
- Use v0.4.7 instead

---

## v0.4.4 (2026-06-16) — Prisma Generate Fix

### Fixes
- `wodev --build` now runs `npx prisma generate` before `next build` (required for global installs where Prisma client is not pre-generated)
- `postinstall` script now runs `prisma generate` + `electron-builder install-app-deps` (gracefully handles missing electron-builder)

### Migration from v0.4.3
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard@0.4.4
sudo wodev --build
wodev
```

---

## v0.4.3 (2026-06-16) — Dependency Fix

### Fixes
- `@tailwindcss/postcss`, `tailwindcss`, `tw-animate-css`, `typescript`, `@types/react`, `@types/react-dom` moved from `devDependencies` → `dependencies` so global npm installs can build

### Migration from v0.4.2
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard@0.4.3
sudo wodev --build
wodev
```

---

## v0.4.2 (2026-06-16) — node-fetch Removal

### Fixes
- Removed `import fetch from 'node-fetch'` in `src/lib/thoughts.ts` — uses global `fetch` (Node 18+) instead

### Migration from v0.4.1
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard@0.4.2
sudo wodev --build
wodev
```

---

## v0.4.1 (2026-06-16) — Build Flag Fix + ASCII Art Logo

### Fixes
- `wodev --build` no longer passes `-p` flag to `next build` (which doesn't accept it) — build now actually runs
- Build was silently failing because `next build -p 6969` doesn't recognize `-p`

### Features
- **Orange ASCII art logo**: WODEV banner displayed on startup (matching harness install.ts orange theme)
- **Colorful terminal output**: Orange, green, yellow, dim ANSI helpers throughout all messages
- **Better error messages**: Boxed hints with sudo vs local-prefix guidance

### Migration from v0.4.0
```bash
sudo npm update -g @wayofmono/wo-cto-dashboard
sudo wodev --build    # actually works now
wodev
```

---

## v0.4.0 (2026-06-16) — Production Mode Fix

### Breaking Changes
- `wodev` now defaults to **production mode** (`next start`, read-only) instead of dev mode
- `wodev --dev` required for development server with hot reload

### Features
- **Production mode**: `wodev` runs `next start` — no `.next` writes, works as normal user after sudo install
- **`wodev --build`**: One-time production build (`next build`, needs write access)
- **`wodev --dev`**: Dev server with Turbopack hot reload (`next dev --turbopack`)
- **Build check**: Detects missing `.next/` and prompts user to run `wodev --build` first
- **Recommended install**: `npm config set prefix ~/.npm-global` — no sudo at all, everything writable by user

### Fixes
- EACCES error when running `wodev` after `sudo npm install -g` (`.next/` was root-owned)
  - Workflow: `sudo npm install -g` → `sudo wodev --build` → `wodev` (as user)
  - Better: use local prefix install (no sudo)

### Migration from v0.3.x
```bash
# Update
sudo npm update -g @wayofmono/wo-cto-dashboard

# If using sudo install, rebuild:
sudo wodev --build

# Then run as normal user:
wodev
```

---

## v0.3.1 (2026-06-16) — npm Registry Propagation Fix + Self-Update

### Features
- **`wodev --update`**: Self-update command that runs `npm update -g @wayofmono/wo-cto-dashboard`

### Fixes
- Resolved npm registry CDN cache propagation issue after initial v0.3.0 publish
- Package now immediately visible via `npm view` and installable worldwide

### Known Issues
- `npm install -g` may fail with EACCES on systems without write access to `/usr/lib/node_modules/`
  - Fix: `sudo npm install -g @wayofmono/wo-cto-dashboard`
  - Fix: `npm config set prefix ~/.npm-global && export PATH=$PATH:~/.npm-global/bin`
- Both READMEs updated with EACCES workaround instructions (`npx` preferred, or sudo/local-prefix)

---

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