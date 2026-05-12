---
name: indexer
description: Scans a requested directory, reads key files, and writes INDEX.md — a navigable map of folders, files, and what each part does for other agents. Creates project indexes for fast navigation.
license: MIT
metadata:
  buddybot:
    emoji: 🗺️
    requires:
      bins: []
    os: ["linux", "darwin", "win32"]
allowed-tools: Bash(indexer:*)
---

# Indexer

## Setup

```bash
cd ~/.pi/agent/skills/indexer && npm install
```

## Usage

```bash
# Index a directory
indexer index "path/to/project"

# Generate navigation map
indexer map "path/to/project"

# Export index
indexer export "index.json"
```

## Features

- Recursively scans directories
- Reads KEY files (README, package.json, etc.)
- Generates INDEX.md for navigation
- Maps folder/file structures
- Describes component purposes

## Workflow

1. Request indexing of a directory
2. Scan recursively for files
3. Read key documentation files
4. Generate INDEX.md output

## Notes

- Creates navigable maps for agents
- Fast project lookup
- Supports any directory structure
