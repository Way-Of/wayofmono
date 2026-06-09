---
title: "[PROJ-024] AI Harness /help Command"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@zerwiz"
created: "2026-06-09"
---

## Context

The AI Engineering Harness has grown to 7+ system skills, 59+ imported ref skills, 6 core agents, and cross-platform support across 7 frontends (claude, opencode, gemini, pi, wocoder, antigravity). Users need a unified `/help` command that documents available skills, commands, and workflows without having to read AGENTS.md.

## Requirements

- `/help` — Top-level overview of the harness, quick links to major subsystems
- `/help skills` — List all available skills (system + ref), categorized by namespace (core, wow, opticat, project)
- `/help commands` — List all slash commands with descriptions (/init_harness, /create_plan, /work, /commit, etc.)
- `/help agents` — List core agents with their purpose
- `/help <skill-name>` — Detailed help for a specific skill (extracted from SKILL.md frontmatter)
- `/help ticket` — Ticket workflow overview (PROJ-013)
- `/help team` — Team setup overview (PROJ-018)
- `/help dashboard` — CTO dashboard usage (PROJ-019)

## Implementation

The help system should:
1. Read from `skill-registry.json` and `agent-registry.json` for canonical data
2. Dynamically scan installed skills per platform for `--help` flags
3. Provide a unified entry point: `deno run -A help.ts <topic>`
4. Generate cross-platform wrappers (.sh, .bat, .ps1) for each frontend

## Success Criteria

- All 7+ system skills documented with usage examples
- All 59+ ref skills listed with descriptions
- All 6 core agents listed with purposes
- Ticket workflow summarized (create -> plan -> implement -> validate -> commit)
- Works identically across all 7 platforms
- `/help` with no args shows a useful top-level overview (not just a wall of text)
