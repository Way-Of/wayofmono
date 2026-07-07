---
name: postmortem-manager
description: "Generate, update, and maintain incident postmortems per project in the f-rr-d thoughts folder. Interactive flow covers What Went Well, What Could Be Better, Root Cause Analysis, Tech Debt, Knowledge, Action Items, and Metrics. Follows canonical template at assets/postmortem-template.md."
version: "1.0"
tools: [read, write, grep, glob, bash]
platforms: [opencode, claude, pi, wocode, antigravity, codex]
allowed-tools: read, write, grep, glob, bash
---

# Postmortem Manager Skill

Generate incident postmortems at `thoughts/<project>/docs/postmortem/<YYYY-MM-DD>-<incident-slug>.md` per project.

## Commands

| Command | Description |
|---------|-------------|
| `/create_postmortem` | Interactive walkthrough to generate a postmortem |
| `/update_postmortem <file>` | Append new findings to an existing postmortem |
| `/list_postmortems <project>` | Show all postmortems for a project |

## Canonical Template

See `assets/postmortem-template.md` — the source of truth for the output format.

## Interactive Flow

1. Prompt for incident date, duration, status
2. Auto-capture git metrics from working branch (commits, files, lines ±)
3. Prompt for What Went Well (free-form bullets)
4. Prompt for What Could Be Better (structured: Issue, Impact, Fix)
5. Build Root Cause Analysis timeline from commit history
6. Prompt for Technical Debt Created (Debt, Reason, Mitigation)
7. Prompt for Knowledge Gained (code snippets, configs, patterns)
8. Generate Action Items as checkboxes, optionally create tickets
9. **Store knowledge entries** in `thoughts/global/knowledge/` for root causes and solutions
10. **Link knowledge entries** to postmortem via `knowledge_entries` frontmatter

## Git Metrics Auto-Capture

```bash
git log --oneline --stat <range>    # Commit count, files changed, lines ±
git log --oneline <range>           # Timeline
```

## Knowledge Integration

After generating the postmortem, store key learnings in the knowledge base:

```
Postmortem generated:
  → Review "Root Cause Analysis" section
  → Review "Knowledge Gained" section
  → For each non-obvious finding:
      → Determine topic (docker, postgres, elixir, devops, etc.)
      → Call: knowledge.py store <topic> "<title>" --content "<markdown>"
      → Link: Add entry ID to postmortem's knowledge_entries field
  → Report: "Stored <N> knowledge entries from postmortem"
```

### Knowledge Entry Format for Postmortems

```yaml
---
id: <topic>-<NNN>
title: "<Incident-related insight>"
topic: "<topic>"
tags: ["incident", "<specific-tags>"]
source: "debugging"
date: "YYYY-MM-DD"
confidence: "high"
related: ["<POSTMORTEM-TICKET-ID>"]
deprecated: false
---

# <Title>

## Problem
<What happened during the incident>

## Root Cause
<Why it happened>

## Solution
<How it was fixed>

## Prevention
<How to prevent recurrence>
```

## Action Items → Tickets

Pass `--create-tickets` to auto-create WOMONO/WOW/OPT tickets from action items.

## Postmortem → Knowledge Flow

```
Incident occurs
  → Create postmortem via /create_postmortem
  → Generate postmortem with all sections
  → Store root causes in knowledge base
  → Store solutions in knowledge base
  → Store prevention patterns in knowledge base
  → Link knowledge entries to postmortem
  → Create action item tickets
  → Next incident: search knowledge base for similar patterns
```
