---
name: runbook-manager
description: "Generate, update, and maintain production runbooks per project in the f-rr-d thoughts folder. Generates from infra configs, deploy scripts, and team contacts. Follows canonical template at assets/runbook-template.md."
version: "1.0"
tools: [read, write, grep, glob, bash]
platforms: [opencode, claude, gemini, pi, wocode, antigravity, codex]
allowed-tools: read, write, grep, glob, bash
---

# Runbook Manager Skill

Generate, update, and maintain production runbooks at `thoughts/<project>/docs/runbook.md` per project.

## Commands

| Command | Description |
|---------|-------------|
| `/create_runbook <project>` | Generate runbook from project infra/config scan |
| `/update_runbook <project>` | Diff existing runbook vs current infra, update auto sections |
| `/update_runbook --add-issue` | Append a new issue/fix entry manually |
| `/update_runbook --add-contact` | Add an emergency contact |

## Canonical Template

See `assets/runbook-template.md` — the source of truth for the output format.

## Section Sources

| Section | Source |
|---------|--------|
| Quick Reference | `infra/quadlets/*.container`, `justfile`, `config/*.exs`, cloudflared config |
| Common Issues & Fixes | Manual entries via `--add-issue` |
| Deploy Procedure | Dockerfile multi-stage, justfile, Makefile |
| Config Files Reference | Read relevant config files, include as code blocks |
| Verification Checklist | Derive from Caddyfile routes + quadlet port mappings |
| Rollback Procedure | Standard podman image tagging pattern |
| Emergency Contacts | `thoughts/global/team.md` or manual |

## Update Strategy

Runbook sections are stored as discrete blocks with markers:
- `<!-- AUTO -->` sections regenerated on `/update_runbook`
- `<!-- MANUAL -->` sections preserved across updates
