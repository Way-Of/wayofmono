---
name: session-export
description: "Capture the current working session and export as structured session history in the f-rr-d thoughts folder. Auto-captures git metrics, problems solved, files changed, commits, architecture decisions, and next steps. Follows canonical template at assets/session-template.md."
allowed-tools: read, write, grep, glob, bash
---

# Session Export skill

Export working session history to `thoughts/<project>/docs/sessions/<YYYY-MM-DD>-<session-slug>.md`.

## Commands

| Command | Description |
|---------|-------------|
| `/sessionexport` | Export current session (interactive + auto-capture) |
| `/sessionexport --compact` | Condensed export — drops intermediate reasoning, keeps resolution |
| `/sessionexport --from-git <range>` | Rebuild export from git history (post-session) |
| `/session history` | Alias for `/sessionexport view` |

## Canonical Template

See `assets/session-template.md` — the source of truth for the output format.

## Data Sources

| Section | Source |
|---------|--------|
| Overview | Prompted (epic goal) + git stats (auto) |
| Problems Solved | Agent's reasoning trace (auto) or prompted |
| Files Changed | `git diff --stat <range>` (auto) |
| Commits | `git log --oneline <range>` (auto) |
| Architecture Notes | Agent context + prompted |
| Verification Checklist | Agent's verification steps (auto) |
| Known Limitations | Prompted |
| Next Steps | Prompted |
| Run Book | Auto-generated from Problems Solved |
| References | Prompted + auto-captured URLs |

## Context Compaction

`--compact` mode drops intermediate reasoning steps from the Problems Solved section, keeping only final resolution per issue. Use for long sessions where token budget is tight.

## Git-History Mode

`--from-git <range>` rebuilds the export from `git log` and `git diff` when agent context is no longer available. Sections that require agent reasoning (Problems Solved, Architecture Notes) are prompted fresh.
