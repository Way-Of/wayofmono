---
name: knowledge
description: "Store, fetch, search, and manage learned knowledge in a structured, growing cross-project database at thoughts/global/knowledge/."
allowed-tools: read, write, bash, grep, glob
---

# Knowledge Database

Store, fetch, search, and manage learned knowledge in a structured, growing database.

## What This Skill Does

1. **Store** — Capture knowledge from sessions, research, debugging into structured entries
2. **Fetch** — Read specific entries, all entries in a topic, or the entire database
3. **Search** — Full-text search across all knowledge entries with filters
4. **List** — Browse entries by topic or view all topics
5. **Stats** — See database growth, entry counts, topic breakdown
6. **Anchor Sync** — Store entries in both file system AND Anchor MCP server

Knowledge lives at `thoughts/global/knowledge/` — a cross-project resource shared across all namespaces.

## Database Structure

```
thoughts/global/knowledge/
├── knowledge-registry.json
├── ash/
│   ├── index.json
│   └── ash-001.md
├── docker/
│   ├── index.json
│   └── docker-001.md
├── frontend/
├── backend/
├── security/
├── testing/
├── architecture/
├── anchor/
├── mcp/
├── phoenix/
├── womono/
├── wow/
├── opticat/
└── ...
```

## Entry Format

```yaml
---
id: docker-001
title: Docker compose volume permissions fix
topic: docker
tags: ["compose", "volumes", "permissions"]
source: debugging
date: 2026-07-06
confidence: high
related: ["WOMONO-162"]
source_ticket: "WOMONO-162"
deprecated: false
---

# Docker Compose Volume Permissions

## Problem
<What was happening>

## Root Cause
<Why it was happening>

## Solution
<What we did to fix it>

## Gotchas
<Non-obvious details>

## Context
- **Ticket**: WOMONO-162
- **Date discovered**: 2026-07-06
```

## Entry Quality Rules

Before storing, validate:
- Title is descriptive (not "fix" or "issue")
- Problem section is filled
- Root cause section is filled
- Solution has actionable steps
- Tags array has at least 1 tag
- Confidence is set

If incomplete, prompt user to fill missing sections.

## Seed Topics (20+)

| Topic | Domain |
|-------|--------|
| `ash`, `ash-framework` | Elixir Ash framework |
| `docker` | Docker, compose, containers |
| `postgres` | PostgreSQL, SQL, migrations |
| `opentelemetry` | OTel, tracing, metrics |
| `elixir` | Elixir language |
| `phoenix` | Phoenix framework |
| `deno` | Deno runtime, TypeScript |
| `react` | React, frontend |
| `frontend` | UI, CSS, layouts |
| `backend` | APIs, database, auth |
| `devops` | CI/CD, deployment |
| `security` | Auth, access control |
| `testing` | Tests, validation |
| `architecture` | System design |
| `ai-tools` | Harness, skills, agents |
| `mcp` | Model Context Protocol |
| `anchor` | Anchor MCP server |
| `womono` | WayOfMono project |
| `wow` | WayOfWork project |
| `opticat` | OptiCat project |

New topics auto-created on first entry.

## Commands

### Store Knowledge

```bash
# Interactive
echo "content" | python3 skills/knowledge/scripts/knowledge.py store docker "Title"

# With flags
python3 skills/knowledge/scripts/knowledge.py store postgres "PgBouncer setup" \
  --tags "pgbouncer,connection-pool" \
  --source research \
  --confidence high \
  --content "PgBouncer sits between app and Postgres..."

# With ticket reference
python3 skills/knowledge/scripts/knowledge.py store docker "Volume fix" \
  --tags "compose,volumes" \
  --content "Run chown on volume mount..."
```

### Fetch Knowledge

```bash
python3 skills/knowledge/scripts/knowledge.py fetch docker-001
python3 skills/knowledge/scripts/knowledge.py fetch --topic docker
python3 skills/knowledge/scripts/knowledge.py fetch
```

### Search (with filters)

```bash
# Full-text search
python3 skills/knowledge/scripts/knowledge.py search "connection pool"

# Search by tag
python3 skills/knowledge/scripts/knowledge.py search --tag docker

# Search by confidence
python3 skills/knowledge/scripts/knowledge.py search --confidence high

# Search by source
python3 skills/knowledge/scripts/knowledge.py search --source debugging

# Search by ticket
python3 skills/knowledge/scripts/knowledge.py search --ticket WOMONO-162
```

### List & Stats

```bash
python3 skills/knowledge/scripts/knowledge.py topics
python3 skills/knowledge/scripts/knowledge.py list docker
python3 skills/knowledge/scripts/knowledge.py stats
```

### Maintenance

```bash
python3 skills/knowledge/scripts/knowledge.py rebuild
python3 skills/knowledge/scripts/knowledge.py init
```

## Anchor MCP Integration

Store entries in BOTH file system AND Anchor MCP:

```
Step 1: Store in file system via knowledge.py
Step 2: Store in Anchor MCP:
    → anchors/create with title, content, metadata
    → memory_note with knowledge_id, topic, tags
Step 3: Confirm both stored
```

Search via Anchor for semantic results:
```
memory/search({query: "<description>"})
→ Returns vector-similar results
→ Map back to knowledge files
```

## Ticket Workflow Integration

Before storing new knowledge:
1. Search for existing entries on the same topic
2. If found, ask: "Update existing entry or create new?"
3. Link new entry to the ticket that discovered it

After solving a problem during ticket work:
1. Check: "Did this take >2 attempts? Is the error misleading? Is there a gotcha?"
2. If yes, store the knowledge
3. Set `source_ticket` to current ticket ID

## Agent Instructions

When user says "store this" or "save this knowledge":
1. Validate entry quality (title, problem, root cause, solution)
2. Search for existing similar entries
3. Determine topic from context
4. Extract tags
5. Run `knowledge.py store`
6. Store in Anchor MCP
7. Confirm stored

When user says "look up" or "what do we know about":
1. Run `knowledge.py search`
2. Also search Anchor MCP: `memory/search`
3. Present combined results

When user says "what's in the knowledge base":
1. Run `knowledge.py topics` and `knowledge.py stats`
2. Summarize

## Rules

- Entries are append-only — never delete, only deprecate
- Entry IDs are auto-incrementing: `<topic>-<NNN>`
- Topics auto-created on first entry
- Index rebuilt on every store
- Registry is source of truth for counts
- Quality validation before every store
- Link entries to tickets when possible
