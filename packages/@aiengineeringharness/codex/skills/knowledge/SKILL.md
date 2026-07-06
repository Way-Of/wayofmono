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
3. **Search** — Full-text search across all knowledge entries
4. **List** — Browse entries by topic or view all topics
5. **Stats** — See database growth, entry counts, topic breakdown

Knowledge lives at `thoughts/global/knowledge/` — a cross-project resource shared across all namespaces.

## Database Structure

```
thoughts/global/knowledge/
├── knowledge-registry.json          # All topics, counts, timestamps
├── docker/
│   ├── index.json                   # Topic index (fast lookups)
│   ├── docker-001.md               # Knowledge entry
│   └── docker-002.md
├── postgres/
│   ├── index.json
│   └── postgres-001.md
├── ash/
│   ├── index.json
│   └── ash-001.md
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
related: []
deprecated: false
---

# Docker Compose Volume Permissions

When running containers with named volumes...
```

## Commands

### Store Knowledge

```bash
python3 skills/knowledge/scripts/knowledge.py store <topic> "<title>" --tags "..." --content "..."
```

### Fetch Knowledge

```bash
python3 skills/knowledge/scripts/knowledge.py fetch <entry-id>
python3 skills/knowledge/scripts/knowledge.py fetch --topic <topic>
```

### Search

```bash
python3 skills/knowledge/scripts/knowledge.py search "<query>"
```

### List & Stats

```bash
python3 skills/knowledge/scripts/knowledge.py topics
python3 skills/knowledge/scripts/knowledge.py list [topic]
python3 skills/knowledge/scripts/knowledge.py stats
```

## Rules

- Entries are append-only — never delete, only deprecate via `deprecated: true`
- Entry IDs are auto-incrementing: `<topic>-<NNN>`
- Topics are auto-created when first entry is stored
