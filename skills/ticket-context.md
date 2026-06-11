---
name: ticket-context
description: Updates ticket contexts following each tool's rules
version: 1.0.0
depends_on: [WOMONO-046-PRODUCTION-HOSTING-FOR-CTO-DASHBOARD]
---

# Ticket Context Guide

## Purpose

This skill helps ensure that all work performed is explicitly linked to an approved ticket within the project's ticketing system. By requiring a ticket association, it reinforces the mandatory project workflow and prevents the creation of untracked or "random" work.

## Workflow

1. **Activation**: This skill should be activated when starting any new task, feature implementation, or bug fix.
2. **Ticket ID Prompt**: Upon activation, the skill will prompt for the relevant ticket ID.
3. **Context Storage**: The provided ticket ID will be stored as session-specific context.
4. **Compliance Reminder**: All work must align with the objectives and acceptance criteria defined in the referenced ticket.

## Usage

To use this skill:
- When beginning a new task, activate this skill.
- The skill will prompt you to enter the ticket ID.
- Enter the ticket ID (e.g., `WOMONO-001-election`, `WOW-112-design-tool-googlstitch`, `OPT-XXX-*`) corresponding to the task you are working on.

## Ticket Detection

### Project Context

Determine project context from harness config:
- **WOMONO**: `thoughts/wayofmono/`
- **OPTICAT**: `thoughts/opticat/`
- **WAYOFOWORK**: `thoughts/wow/`
- **TEAM**: `thoughts/team/`
- **PERSONAL**: `thoughts/<project-slug>/<dev>/`

### Storage Paths

| Namespace | Path | Example |
|-----------|------------------|---------|
| **WOW** | `thoughts/wow/shared/tickets/` | `thoughts/wow/shared/tickets/WOW-XXX-*.md` |
| **OPT** | `thoughts/opticat/shared/tickets/` | `thoughts/opticat/shared/tickets/OPT-XXX-*.md` |
| **WOMONO** | `thoughts/wayofmono/shared/tickets/` | `thoughts/wayofmono/shared/tickets/WOMONO-XXX-*.md` |
| **TEAM** | `thoughts/team/shared/tickets/` | `thoughts/team/shared/tickets/TEAM-XXX-*.md` |
| **PERSONAL** | `thoughts/<project-slug>/<dev>/tickets/` | `thoughts/wayofmono/zerwiz/tickets/` |

### Format Detection

```bash
# Detect active tool from config
CLAUDE=/.claude/settings.json
OPENCODE=/.opencode/opencode.json
ANTIGRAVITY=/.antigravity/settings.json
CODEX=/.codex/config.toml

if [[ -f "$CLAUDE" ]]; then
  echo "Active tool: Claude"
elif [[ -f "$OPENCODE" ]]; then
  echo "Active tool: OpenCode"
elif [[ -f "$ANTIGRAVITY" ]]; then
  echo "Active tool: Antigravity"
elif [[ -f "$CODEX" ]]; then
  echo "Active tool: Codex"
else
  echo "Active tool: Unknown/Manual"
fi
```

## Rules

- All code changes, feature implementations, and bug fixes **must** be associated with an existing ticket.
- Refer to the `<thoughts/<project-slug>/shared/tickets/<namespace>-.md` ticket file within each project.
- If no ticket exists:
  - **WOMONO/TEAM**: Create new ticket first
  - **OPTICAT/WAYOFOWORK**: Update existing ticket
  - **PERSONAL**: Optional, but recommended for tracking

## Enforcement Commands

### Check for Active Ticket

```bash
# Find active ticket for current namespace
find thoughts/ -name "*.md" \
  -path "*/shared/tickets/*" \
  ! -path "*/legacy-*/" \
  ! -path "*/node_modules/*" \
  | xargs grep -l "^---$" \
  | head -1
```

### Validate Ticket Format

```bash
# Validate ticket has YAML frontmatter
for file in $(find thoughts/ -name "*.md" -path "*/shared/tickets/*"); do
  if ! head -3 "$file" | grep -q "^---"; then
    echo "Missing frontmatter: $file" >&2
  fi
done
```

## Related Documentation

- Ticket Template: `thoughts/shared/tickets/ticket-template.md`
- Project Architecture: `thoughts/shared/tickets/009-consolidated-system-architecture.md`
- OpenCode Skills: https://opencode.ai/docs/
- Claude Skills: https://code.claude.com/docs/en/skills
- Codex Skills: https://developers.openai.com/codex/cli/skills
- Antigravity Skills: https://antigravity.google/docs/cli-skills
- WayOfMono: /home/zerwiz/wayofmono/
- Project Home: /home/zerwiz/wayofmono/thoughts/

---

*Generated: "$(date '+%Y-%m-%d')"*
*Ticket Context Guide*
