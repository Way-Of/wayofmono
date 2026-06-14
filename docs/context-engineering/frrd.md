# f-rr-d (förråd) — Centralized Thoughts Repository

The single source of truth for all thoughts, tickets, plans, research, and personal TODOs across Way-Of projects.

## What Is f-rr-d?

**förråd** (Swedish for "storage/depot") — Centralized context engineering repository at `github.com/Way-Of/f-r-r-d`.

- **115 files** across 3 namespaces
- **Append-only** — never delete, rename, or move anything inside `thoughts/`
- Shared across WayOfMono, WayOfWork, and OptiCat

## How It Works

### Clone on Init

```bash
ai-harness --init
# Clones f-rr-d into thoughts/
```

### Project-Scoped Tickets

| Project | Directory | Ticket Prefix |
|---------|-----------|---------------|
| WayOfMono | `thoughts/wayofmono/shared/tickets/` | `WOMONO-XXX` |
| WayOfWork | `thoughts/wow/shared/tickets/` | `WOW-XXX` |
| OptiCat | `thoughts/opticat/shared/tickets/` | `OPT-XXX` |

### Multi-Project Structure

```
thoughts/
├── global/                    # Cross-project concerns
├── wayofmono/                 # WOMONO-XXX (WayOfMono)
│   ├── shared/tickets/        # 17+ WOMONO tickets
│   ├── shared/plans/
│   ├── shared/research/
│   ├── craig/                 # 5 WOMONO tickets assigned
│   ├── tomas/                 # 1 WOMONO ticket
│   ├── andre/                 # 1 OPT ticket
│   └── zerwiz/                # 1 WOMONO + 1 WOW ticket
├── wow/                       # WOW-XXX (WayOfWork)
│   ├── shared/tickets/
│   ├── andre/, craig/, tomas/, zerwiz/
└── opticat/                   # OPT-XXX (Opticat)
    ├── shared/tickets/
    └── andre/, craig/, tomas/, zerwiz/
```

### Git Workflow

- **Branch naming**: `<project-slug>/<namespace>/<ticket-id>-<short-desc>`
  - Example: `wayofmono/womono/WOMONO-001-centralized-repo`
- **Never commit directly to main** — use feature branches
- **Pull before read**: `git -C thoughts/ pull --ff-only`
- **Push after write**: Commit + push with semantic branch names

### Config

`.wo/config/harness.json` stores:
- `f_rrd_url` — Repository URL
- `project_slug` — Project identifier for the harness

## What This Repo Stores

- **Tickets** — Feature requests, bugs, tasks organized by project and namespace
- **Plans** — Implementation plans and roadmaps
- **Research** — Technical research, evaluations, comparisons
- **Documentation** — Project docs (architecture, decisions, guides, references)
- **Personal TODOs** — Per-developer task breakdowns

## What This Repo Does NOT Store

- ❌ Skills (live in `wayofmono/packages/@aiengineeringharness/skills/`)
- ❌ Agents (live in `wayofmono/packages/@aiengineeringharness/agents/`)
- ❌ Platform configs (live in `wayofmono/packages/@aiengineeringharness/<platform>/`)
- ❌ Code (live in respective project repos)

## Agent Instructions

Any AI agent working with this repo:

1. **Pull before read**: `git -C thoughts/ pull --ff-only`
2. **Write to correct project folder**: `thoughts/<project-slug>/shared/tickets/` for tickets, `thoughts/<project-slug>/docs/` for docs
3. **Commit + push after write**: Use semantic branch names
4. **Never store skills/agents here** — wrong repo

## Related

- [Slash Commands](slash-commands.md)
- [Ticket Format](guides/getting-started.md#tickets)
- [AI Engineering Harness](guides/ai-harness/)