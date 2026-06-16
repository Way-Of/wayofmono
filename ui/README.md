# WayOfDev CTO Dashboard

> Production CTO Dashboard & Developer Portal for Way-Of projects (WayOfMono, WayOfWork, OptiCat)

## 🚀 Quick Start

### One-liner (no clone, no install)
```bash
npx @wayofmono/wo-cto-dashboard
```

### Global install (use `wodev` anywhere)

```bash
# Option A: local prefix (recommended — no sudo, everything works)
npm config set prefix ~/.npm-global
echo 'export PATH="$PATH:~/.npm-global/bin"' >> ~/.bashrc
source ~/.bashrc
npm install -g @wayofmono/wo-cto-dashboard
wodev                      # production server (default)

# Option B: sudo global install
sudo npm install -g @wayofmono/wo-cto-dashboard
sudo wodev --build         # one-time build (needs root for .next/)
wodev                      # production server (read-only, works as user)

# Option C: development mode (hot reload)
wodev --dev
```

### From source (clone)
```bash
git clone https://github.com/Way-Of/wayofdev.git
cd wayofdev
pnpm install
pnpm dev
```

### CLI Reference

| Command | Mode | Description |
|---------|------|-------------|
| `wodev` | production | Starts production server (read-only, requires build) |
| `wodev --dev` | development | Starts dev server with hot reload (writes .next/) |
| `wodev --build` | build | Builds for production (writes .next/) |
| `wodev --update` | — | Updates to latest npm version |
| `wodev --setup` | — | Configure GitHub OAuth (per-user, one-time) |
| `wodev --uninstall` | — | Remove dashboard globally |
| `wodev --version` | — | Prints version |
| `wodev --help` | — | Shows help |

Port: **http://localhost:6969** (override with `PORT=8080 wodev`)

## 📋 Features

| View | Description |
|------|-------------|
| **Overview** | Ticket stats, velocity, blockers |
| **Tickets** | Kanban with filters, review queue, **GitHub/Local source switch + branch selector** |
| **Standup** | Daily async check-ins (yesterday/today/blockers) |
| **Skills** | Real-time skill health across all machines |
| **Ideas** | Prioritized idea board with voting |
| **Developers** | Workflow and assignment tracking |
| **Docs** | Architecture docs and decision records |

## 🔐 GitHub Authentication

**Optional** — the dashboard works with pincode login alone. GitHub login is only
needed for authenticated API calls (private repo ticket fetching, 5000 req/hr vs 60).

### Per-User Setup

Each user needs their **own** GitHub OAuth App because the callback URL is
tied to your machine's `localhost`. No shared credentials.

```bash
# 1. Create your OAuth App at https://github.com/settings/developers
#    Callback URL: http://localhost:6969/api/auth/callback/github

# 2. Run the setup wizard
wodev --setup
# Enter your Client ID and Client Secret when prompted

# 3. Rebuild & enjoy
sudo wodev --build
wodev
```

Credentials are saved to `~/.config/wodev/.env` and auto-loaded on every run.

### How Developer Mapping Works

When you sign in with GitHub, the dashboard looks up your GitHub username in
the team's developer list (`thoughts/` repo). If your GitHub username matches
a registered developer, you're recognized with your role and permissions.

### Without GitHub Auth

Use the **pincode login** with your GitHub username + team pincode. All features
work normally; only the "GitHub source" ticket switcher requires OAuth.

## 📦 Data Source

Tickets loaded from **f-rr-d** (förråd) GitHub repo: https://github.com/Way-Of/f-rr-d

- **Projects**: WayOfMono (WOMONO), WayOfWork (WOW), OptiCat (OPT)
- **Source switch**: Local filesystem ↔ GitHub (main/develop/staging branches)
- **Fallback**: Auto-falls back to local if GitHub unavailable

## 🛠️ Commands

```bash
pnpm dev          # Start dev server (port 6969)
pnpm build        # Production build
pnpm start        # Run production build
pnpm lint         # Run ESLint
pnpm db:push      # Push Prisma schema to SQLite
```

## 🖥️ Electron App

```bash
pnpm electron:dev    # Dev with Electron wrapper
pnpm electron:build  # Build distributable
pnpm electron:dist   # Build + package (no publish)
```

## 📁 Project Structure

```
wayofdev/
├── src/
│   ├── app/              # Next.js 16 App Router
│   │   ├── api/          # API routes (tickets, developers, docs, auth)
│   │   └── page.tsx      # Login page
│   ├── components/
│   │   ├── dashboard/    # Dashboard views
│   │   └── ui/           # Radix UI components
│   ├── lib/
│   │   ├── auth.ts       # NextAuth.js GitHub provider
│   │   ├── thoughts.ts   # f-rr-d data fetching (GitHub API)
│   │   └── types.ts      # TypeScript types
│   └── store/
│       └── dashboard-store.ts  # Zustand state
├── prisma/
│   └── schema.prisma     # SQLite schema
├── electron/             # Electron main/preload
├── public/               # Static assets
└── .github/workflows/    # CI/CD
```

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: NextAuth.js (GitHub OAuth)
- **Database**: Prisma + SQLite (dev), PostgreSQL (prod)
- **State**: Zustand
- **UI**: Radix UI + Tailwind CSS
- **Icons**: Lucide React
- **Desktop**: Electron 30

## 🌐 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```
Add env vars in Vercel dashboard.

### Docker
```bash
docker build -t wayofdev .
docker run -p 6969:6969 --env-file .env wayofdev
```

### Electron Auto-Updates
Built with electron-builder, publishes to GitHub Releases on `wayofdev` repo.

## 📊 API Endpoints

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

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_CLIENT_ID` | No* | GitHub OAuth App Client ID (set via `wodev --setup`) |
| `GITHUB_CLIENT_SECRET` | No* | GitHub OAuth App Secret (set via `wodev --setup`) |
| `NEXTAUTH_SECRET` | No | Auto-generated as random hex |
| `NEXTAUTH_URL` | No | Auto-set to `http://localhost:{PORT}` |
| `DATABASE_URL` | No | SQLite: `file:./dev.db` |

*Only needed for private GitHub repo access

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Make changes
4. Run `pnpm lint` and `pnpm build`
5. Open PR

## 📄 License

MIT © Way-Of