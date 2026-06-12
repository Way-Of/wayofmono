# f-rr-d (förråd) Context Engineering Architecture

Centralized thoughts repository for all Way-Of projects, providing structured context engineering for AI agents and human collaborators.

## Overview

f-rr-d (Swedish: "förråd" — store/supply) is the centralized context engineering backbone for WayOfMono. It stores tickets, plans, research, decisions, and personal work items as structured markdown files with YAML frontmatter, enabling AI agents and humans to share a common operational context.

```
                     ┌─────────────────────────────────────┐
                     │          f-rr-d (förråd)            │
                     │      Centralized Thoughts Storage   │
                     └─────────────────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
     ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
     │   wayofmono  │   │    wow       │   │   opticat    │
     │  WOMONO-XXX  │   │   WOW-XXX    │   │   OPT-XXX    │
     └──────────────┘   └──────────────┘   └──────────────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │       global/             │
                     │  Cross-project concerns   │
                     └──────────────────────────┘
```

## Repository Structure

```
thoughts/
├── AGENTS.md                    # Instructions for AI agents interacting with this repo
├── README.md                    # Project overview and conventions
├── .git/                        # Git repository (separate from wayofmono)
│
├── global/                      # Cross-project concerns (standards, patterns, templates)
│   ├── ticket-template.md       # Base ticket template
│   ├── best-practices/          # General best practices
│   └── standards/               # Cross-project standards
│
├── shared/                      # Cross-project templates only
│   ├── tickets/
│   │   └── ticket-template.md   # Canonical template for all projects
│   ├── plans/                   # Plan templates
│   └── research/                # Research templates
│
├── wayofmono/                   # WayOfMono (WOMONO-XXX)
│   ├── docs/                    # Architecture, decisions, guides, references
│   │   ├── tools/               # AI tools documentation
│   │   ├── best-practices/      # Project-specific best practices
│   │   └── references/          # Reference materials
│   ├── shared/                  # Shared tickets, plans, research
│   │   ├── tickets/             # WOMONO-* tickets
│   │   ├── plans/               # Implementation plans
│   │   └── research/            # Technical evaluations
│   ├── <developer>/             # Per-developer work items
│   ├── global/                  # WayOfMono-specific global items
│   └── tomas/                   # Developer: Tomas
│       ├── WOMONO-064-TOMAS-OPTICAT-VERIFICATION.md
│       └── ticket-template.md
│
├── wow/                         # WayOfWork (WOW-XXX)
│   ├── docs/                    # WOW-specific documentation
│   ├── shared/tickets/          # WOW-* tickets
│   ├── shared/plans/            # Implementation plans
│   └── <developer>/             # Per-developer work items
│
└── opticat/                     # OptiCat (OPT-XXX)
    ├── docs/                    # OptiCat-specific docs
    ├── shared/tickets/          # OPT-* tickets
    ├── shared/plans/            # Implementation plans
    └── <developer>/             # Per-developer work items
```

## Ticket System

### Ticket Naming Convention

```
<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md
```

| Prefix | Project | Namespace | Example |
|--------|---------|-----------|---------|
| WOMONO | wayofmono | womono | `WOMONO-054-DOCUMENT-GENERATION-SKILL-OVERHAUL.md` |
| WOW    | wow      | wow       | `WOW-010-HUMAN-IN-THE-LOOP.md` |
| OPT    | opticat  | opticat   | `OPT-001-FIX-ALL-OPTICAT-TICKETS.md` |
| PROJ   | cross-project | shared  | `PROJ-001-CROSS-PROJECT-INITIATIVE.md` |

### Ticket Template

```markdown
---
id: WOMONO-054
title: Document Generation Skill Overhaul
status: draft | in_progress | review | done | archived
priority: P1 | P2 | P3
assignee: @developer
type: feature | bug | chore | research
created: 2026-06-10
updated: 2026-06-11
depends_on: [WOMONO-048]
tags: [skill, documentation, automation]
---

# WOMONO-054: Document Generation Skill Overhaul

## Objective
What this ticket aims to achieve. Concise, actionable, testable.

## Context
Why this matters. Links to decisions, research, or related tickets.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Implementation Notes
Key technical decisions, architectural approach, etc.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

### Ticket Lifecycle

```
Draft ──→ In Progress ──→ Review ──→ Done ──→ Archived
  │           │              │
  └──→        │              │
   Cancelled  └──→ Blocked ──┘
                      │
                      └──→ (unblocked)
```

## Agent Instructions

The `AGENTS.md` file at the repository root defines operating instructions for AI agents:

```markdown
# AI Agents Working with f-rr-d

1. **Pull before read**: `git -C thoughts/ pull --ff-only`
2. **Write to correct project folder**: `thoughts/<project>/shared/tickets/`
3. **Use proper naming**: `<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md`
4. **Commit + push after write**: Use semantic branch names
5. **Never store skills/agents here** — they live in `packages/@aiengineeringharness/`
```

## Git Workflow

### Branch Naming

```
<prefix>/<project>/<ticket-id>-<short-description>
```

Examples:
- `feat/wayofmono/WOMONO-054-skill-overhaul`
- `fix/wow/WOW-010-hitl-bug`
- `docs/opticat/OPT-001-readme-update`

### Git Operations

**Pull before read**: Always pull the latest before reading or writing:
```bash
git -C thoughts/ pull --ff-only
```

**Commit conventions**:
```bash
git add thoughts/wayofmono/shared/tickets/WOMONO-054-*.md
git commit -m "womono(WOMONO-054): document generation skill overhaul"
git push origin feat/wayofmono/WOMONO-054-skill-overhaul
```

**Pull request workflow**:
1. Create feature branch
2. Open PR against `main`
3. Automated checks: frontmatter validation, naming convention, merge conflicts
4. Merge via "Squash and Merge"

## Developer Structure

Each developer gets a personal directory under each project namespace for their work items, progress tracking, and notes:

```
thoughts/wayofmono/
├── craig/
│   ├── WOMONO-057-VALIDATE-INIT-HARNESS-GITHUB-INTEGRATION.md
│   ├── WOMONO-058-DOCUMENTATION-BEST-PRACTICES.md
│   ├── WOMONO-059-DOCUMENTATION-GUIDES.md
│   ├── WOMONO-060-DOCUMENTATION-SETUP.md
│   ├── WOMONO-062-FIX-WOW-TICKETS.md
│   └── ticket-template.md
├── tomas/
│   ├── WOMONO-064-TOMAS-OPTICAT-VERIFICATION.md
│   └── ticket-template.md
├── andre/
│   ├── OPT-001-FIX-ALL-OPTICAT-TICKETS.md
│   └── ticket-template.md
└── global/
    └── ticket-template.md
```

### Developer Workflow

1. **Start work**: Find or create ticket in `shared/tickets/`
2. **Claim ticket**: Copy to personal directory
3. **Create plan**: Write plan to `shared/plans/` or personal directory
4. **Implement**: Reference plan and ticket throughout implementation
5. **Validate**: Mark checklist items complete
6. **Close**: Move ticket to `done` status

## Integration with CTO Dashboard

The f-rr-d repository is mounted as a read-write bind mount into the CTO Dashboard container:

```yaml
volumes:
  - ./thoughts:/thoughts:rw
```

### Read Operations

The dashboard reads:
- `tickets/*.md` — Ticket listings, Kanban board, filters
- `shared/*.json` — Ideas, standups, news feeds
- `docs/` — Documentation and references

### Write Operations

The dashboard writes:
- `shared/ideas/*.md` — New ideas from the Ideas view
- `shared/standups/*.md` — Daily standup entries
- `tickets/*.md` — Status updates (status, assignee changes)

### Sync Mechanism

**Automatic Sync**: Changes to thoughts/ are committed periodically:
```bash
# scripts/sync-thoughts.sh
#!/bin/bash
cd /thoughts
git add -A
git commit -m "sync: auto-sync $(date +%Y-%m-%d_%H:%M:%S)"
git push origin main
```

**Manual Sync**: Via the "Sync to f-rr-d" button in the dashboard:
```typescript
// lib/thoughts.ts
const SYNC_SCRIPT = `git -C ${THOUGHTS_ROOT} add -A && git -C ${THOUGHTS_ROOT} commit -m "sync: manual sync" && git -C ${THOUGHTS_ROOT} push origin main`

export async function syncThoughts() {
  const result = await execSync(SYNC_SCRIPT)
  return { success: true, output: result }
}
```

## Best Practices

### When Working with f-rr-d

1. **Always pull first**: Avoid conflicts by pulling before reading
2. **Use templates**: Start from the canonical ticket template
3. **Keep tickets focused**: One ticket = one vertical slice
4. **Update status**: Keep ticket status current for the dashboard
5. **Link related items**: Use `depends_on` and cross-references
6. **Write for AI**: Structure content for both human and AI consumption
7. **Include context**: Why, not just what

### Ticket Quality Standards

- **Title**: Clear, action-oriented, matches filename
- **Objective**: One paragraph, testable
- **Context**: Links to decisions, PRDs, or research
- **Requirements**: Checklist format, atomic items
- **Acceptance Criteria**: Verifiable, ideally automated

## Git Submodule Strategy

The thoughts/ directory can be referenced as a git submodule in the main wayofmono repository:

```bash
git submodule add git@github.com:Way-Of/f-rr-d.git thoughts
git submodule update --init --recursive
```

This keeps the thoughts repo separate while providing a consistent path for the CTO Dashboard and AI agents.

## Future Enhancements

### Phase 2 (Q3 2026)
- **Cross-referencing engine**: Auto-link tickets based on keywords
- **Timeline view**: Gantt-like visualization of ticket dependencies
- **AI agent metadata**: Track which tickets an agent has worked on

### Phase 3 (Q4 2026)
- **Analytics dashboard**: Ticket velocity, cycle time, bottlenecks
- **Automated ticket closing**: Based on commit messages and PR merges
- **Metrics export**: JSON/CSV for external analysis
