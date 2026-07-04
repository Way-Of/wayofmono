---
name: postmortem_manager
description: "Generate, update, and maintain incident postmortems per project in the f-rr-d thoughts folder. Interactive flow covers What Went Well, What Could Be Better, Root Cause Analysis, Tech Debt, Knowledge, Action Items, and Metrics. Follows canonical template at assets/postmortem-template.md."
allowed-tools: read, write, grep, glob, bash
---

# Postmortem Manager skill

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

## Git Metrics Auto-Capture

```bash
git log --oneline --stat <range>    # Commit count, files changed, lines ±
git log --oneline <range>           # Timeline
```

## Action Items → Tickets

Pass `--create-tickets` to auto-create WOMONO/WOW/OPT tickets from action items.
