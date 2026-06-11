# AI Engineering Harness — AGENTS.md

This is the **AGENTS.md for förråd (f-rr-d)** — the centralized thoughts repository for all Way-Of projects.

## Project Overview

**WayOfMono (Wo)** — Ultimate monorepo consolidation for high-performance coding agents.
- **AI Engineering Harness**: 81 battle-tested skills, 6 subagents, workflows across 7 tools
- **CTO Dashboard**: Telemetry, standups, tickets, review queues, skills health
- **f-rr-d (förråd)**: Centralized thoughts storage at `github.com/Way-Of/f-rr-d`

## Repository Structure

```
./
├── packages/@aiengineeringharness/   # AI Engineering Harness (core)
│   ├── install.ts                    # CLI installer (deno)
│   ├── setup.sh                      # GNU Stow installer
│   ├── manifest.json                 # Skill/component manifest
│   ├── opencode/        → ~/.config/opencode/
│   ├── claude/          → ~/.claude/
│   ├── gemini/          → ~/.gemini/
│   ├── pi/              → ~/.pi/agent/
│   ├── wocoder/         → ~/.wocoder/
│   ├── antigravity/     → ~/.antigravity/
│   ├── codex/           → ~/.codex/
│   └── scripts/         # Pipeline tools (docs-sync, compliance, migrate)
├── ui/                              # CTO Dashboard (Next.js 16)
├── docs/                            # Documentation
├── thoughts/                        # Context engineering (f-rr-d)
│   ├── global/                      # Cross-project
│   ├── wayofmono/                   # WOMONO-XXX tickets
│   ├── wow/                         # WOW-XXX tickets
│   └── opticat/                     # OPT-XXX tickets
└── .github/workflows/               # CI/CD
```

## Key Workflow: f-rr-d Context Engineering

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

### Built-in Slash Commands

| Command | Description |
|---------|-------------|
| `/init_harness` | Initialize harness (AGENTS.md + thoughts/) |
| `/create_plan` | Generate implementation plan from ticket |
| `/implement_plan` | Execute approved plan phase-by-phase |
| `/validate_plan` | Verify implementation against plan |
| `/commit` | Create well-structured git commits |
| `/debug` | Investigate issues during testing |
| `/validate_telemetry` | Validate telemetry against narrative spec |
| `/help` | Unified help system |
| `/sync skills` | Sync all skills to all frontends |

## Supported Tools & Install

```bash
# Install CLI
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts

# Per tool
ai-harness --tool=opencode
ai-harness --tool=claude
ai-harness --tool=gemini
ai-harness --tool=pi
ai-harness --tool=codex
ai-harness --tool=antigravity
ai-harness --tool=wocoder
ai-harness --tool=all --yes

# Update all
ai-harness --update

# Report skills to CTO Dashboard
ai-harness --report-skills
```

## Naming Conventions

| Tool | Skill/Dir Naming | Config Dir |
|------|------------------|------------|
| OpenCode | snake_case | `~/.config/opencode/` |
| Claude Code | snake_case | `~/.claude/` |
| Gemini CLI | snake_case | `~/.gemini/` |
| Pi | kebab-case | `~/.pi/agent/` |
| Codex | snake_case | `~/.codex/` |
| Antigravity | snake_case | `~/.antigravity/` |
| Wo Coder | snake_case | `~/.wocoder/` |

**OpenCode Critical**: Skill directory name MUST match frontmatter `name` exactly (regex `^[a-z0-9]+(-[a-z0-9]+)*$`)

## f-rr-d (förråd) Structure

```
thoughts/
├── global/                    # Cross-project global concerns
├── shared/                    # Cross-project templates only
│   ├── tickets/ticket-template.md
│   ├── plans/
│   └── research/
├── wayofmono/                 # WayOfMono (WOMONO-XXX)
│   ├── docs/                  # Architecture, decisions, guides, references
│   ├── shared/tickets/        # WOMONO tickets
│   ├── shared/plans/
│   ├── shared/research/
│   └── <developer>/
├── wow/                       # WayOfWork (WOW-XXX)
│   ├── docs/
│   ├── shared/tickets/
│   ├── shared/plans/
│   └── <developer>/
└── opticat/                   # Opticat (OPT-XXX)
    ├── docs/
    ├── shared/tickets/
    ├── shared/plans/
    └── <developer>/
```

## Ticket Format

```
<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md
```

| Prefix | Project | Namespace |
|--------|---------|-----------|
| WOMONO | wayofmono | womono |
| WOW | wow | wow |
| OPT | opticat | opticat |

Template: `thoughts/shared/tickets/ticket-template.md`

## Agent Instructions

Any AI agent working with this repo:

1. **Pull before read**: `git -C thoughts/ pull --ff-only`
2. **Write to correct project folder**: `thoughts/<project>/shared/tickets/` for tickets
3. **Commit + push after write**: Use semantic branch names
4. **Never store skills/agents here** — wrong repo (they live in `packages/@aiengineeringharness/`)

## Critical Files

- `packages/@aiengineeringharness/manifest.json` — Source of truth for skills
- `packages/@aiengineeringharness/install.ts` — Installer logic
- `thoughts/wayofmono/shared/tickets/ticket-template.md` — Canonical ticket template
- `thoughts/wayofmono/docs/best-practices/` — Production-ready standards

## Production-Ready Mandate

All code must be:
- No mock data in application code
- Enterprise-grade error handling
- Observable (logging, metrics, traces)
- Secure (input validation, auth, rate limiting)
- Edge cases handled (empty states, timeouts, duplicates)
- Tests for failure modes (not just happy path)