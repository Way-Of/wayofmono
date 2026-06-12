---
name: team-setup
description: >-
  Initialize and manage team configuration: developers, roles, projects, and
  ticket assignments
allowed-tools: 'Read, Write, Grep, Glob, Ls'
---

# Team Setup Skill

You manage the team configuration for the AI Engineering Harness. This skill initializes and maintains the team structure.

## Configuration

Team config is stored in `.wo/config/team-config.json` (gitignored, actual config) and `.wo/config/team-config.template.json` (committed, template).

## Commands

### `ai-harness team init`
Initialize team config from template. Creates `.wo/config/team-config.json` if it doesn't exist.

### `ai-harness team add <name> --role=<role> --projects=<projects>`
Add a new developer to the team.

### `ai-harness team list`
Show all team members with roles and projects.

### `ai-harness team assign <ticket-id> <developer-id>`
Assign a ticket to a developer.

## Roles

| Role | Permissions |
|------|-------------|
| cto | read-all, write-all, approve-reviews, assign-any, manage-team |
| lead | read-project, write-project, approve-reviews, assign-project, manage-skills |
| senior | read-project, write-assigned, request-review, create-tickets |
| junior | read-assigned, write-assigned, request-review, create-personal-tickets |

## Developer Structure

Each developer has (per project):
- `thoughts/<project-slug>/<id>/TODO.md` - Auto-generated personal TODO
- `thoughts/<project-slug>/<id>/tickets/` - Personal ticket breakdowns
- `thoughts/<project-slug>/<id>/plans/` - Personal plans
- `thoughts/<project-slug>/<id>/research/` - Personal research

## Project Structure (per WOMONO-001)

```
thoughts/
├── global/                          # Cross-project global thoughts (architecture, standards, conventions)
├── shared/                          # Cross-project templates ONLY (ticket-template.md)
├── <project-slug>/                  # Project-specific (WOMONO-XXX, WOW-XXX, OPT-XXX tickets)
│   ├── global/                      # Project-specific global thoughts
│   ├── shared/                      # SHARED RESPONSIBILITY tickets (all devs in project)
│   │   ├── tickets/                 # Project tickets
│   │   ├── plans/
│   │   └── research/
│   ├── <dev-id>/                    # Personal dirs (all developers)
│   │   ├── tickets/
│   │   ├── plans/
│   │   └── research/
```
