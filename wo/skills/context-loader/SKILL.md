---
name: context-loader
description: Read the AGENTS.md project layout file and return the content to get project structure, skills, and available tools. When used with triggers, load AGENTS.md for agent context in multi-session runtime.
license: MIT
metadata:
  buddybot:
    emoji: 📂
    requires:
      bins: []
    os: ["linux", "darwin", "win32"]
allowed-tools: Bash(context-loader:*)
---

## Trigger Conditions

**on_keyword**: `["context", "layout", "project structure"]`

## Actions

- **read_agents_md**: Read `~/.pi/AGENTS.md`
- **format_response**: Output in markdown format

## Validation

- ✅ **description**: Required (1024 chars max)
- ✅ **license**: MIT or file reference
- ✅ **name**: 1-64 chars, lowercase alphanumeric + hyphens