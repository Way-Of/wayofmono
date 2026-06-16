# Architecture

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: NextAuth.js (GitHub OAuth)
- **Database**: Prisma + SQLite (dev), PostgreSQL (prod)
- **State**: Zustand
- **UI**: Radix UI + Tailwind CSS
- **Icons**: Lucide React
- **Desktop**: Electron 30

## Project Structure

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

## Data Flow

1. **GitHub OAuth** → User signs in with GitHub
2. **Session** → JWT with access token stored
3. **API Calls** → `/api?type=tickets&source=github&branch=main` with Bearer token
4. **GitHub API** → Fetches from `f-rr-d` repo (thoughts/)
4. **Cache** → 5-min in-memory cache with branch invalidation
5. **UI** → Displays tickets, developers, docs

## f-rr-d Integration

- **Repo**: https://github.com/Way-Of/f-rr-d
- **Projects**: WayOfMono (WOMONO), WayOfWork (WOW), OptiCat (OPT)
- **Source Switch**: Local ↔ GitHub (main/develop/staging)
- **Fallback**: Auto-falls back to local if GitHub unavailable