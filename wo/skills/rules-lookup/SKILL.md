---
name: rules-lookup
description: Lookup and retrieve Pi CLI agent rules, skills, and metadata from the knowledge base. Use for understanding agent capabilities, permissions, and available tools.
license: MIT
metadata:
  buddybot:
    emoji: 📜
    requires:
      bins: []
    os: ["linux", "darwin", "win32"]
allowed-tools: Bash(rules-lookup:*)
---

# Rules Lookup

## Setup

```bash
cd ~/.pi/agent/skills/rules-lookup && npm install
```

## Usage

```bash
# List all agent rules
rules-lookup list

# View specific rule
rules-lookup view "rule-name"

# Check available skills
rules-lookup skills

# Show tool permissions
rules-lookup tools
```

## Features

- Rule retrieval from knowledge base
- Agent capabilities display
- Permissions lookup
- Available tools listing
- Skill metadata access

## Workflow

1. Query rules or skills
2. Retrieve metadata from KB
3. Display capabilities/permissions
4. Present available tools

## Notes

- Query agent knowledge base
- Understand permissions
- See available capabilities
- Tool usage guidance
