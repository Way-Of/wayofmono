---
title: "[WOW-001] Add WayOfTeams MCP Expert and Auth skills/agents for Pi"
type: "Feature"
priority: "High"
status: "Done"
assignee: "@zerwiz"
reporter: "@zerwiz"
project: "WOW"
namespace: "wow"
category: "feature"
parent_ticket: ""
shared_tickets: "[]"
pr_url: ""
github_issue: ""
---

## Context

Created two comprehensive Pi skills with agents for the WayOfTeams platform:

1. **wayofteams-mcp-expert** - Complete reference for WayOfTeams MCP server
2. **wayofteams-auth** - Complete reference for WayOfTeams authentication & authorization

Both skills include executable scripts and asset reference files.

## Requirements

- [x] Create wayofteams-mcp-expert skill with:
  - All 40+ MCP tools documented (tickets, plans, docs, kanban, team, standups, thoughts, memory, knowledge, rules, harness, resources)
  - Agent collaboration MCP spec (8 new tools for AI↔AI)
  - Iroh P2P transport documentation
  - MCP v2 domain split plan
  - Authentication flow reference
  - JSON schemas for all tools
  - 8 executable scripts for common operations

- [x] Create wayofteams-auth skill with:
  - Complete GitHub OAuth flow
  - Session validation (on_mount)
  - Onboarding (create/join/skip company)
  - Access control (superadmin, admin, access codes)
  - Entitlements resolution
  - Dual-tenant model (user_id + company_id)
  - GDPR compliance requirements
  - Workspace vs Company architecture
  - 8 executable scripts for auth operations

- [x] Create corresponding Pi agents (kebab-case naming):
  - .pi/agents/wayofteams-mcp-expert.md
  - .pi/agents/wayofteams-auth.md

- [x] All scripts use environment variables for configuration
- [x] Follow Pi conventions (kebab-case names, PascalCase allowed-tools)
- [x] Pushed to main branch

## Technical Details

### Files Created (38 total)

**wayofteams-mcp-expert skill:**
- SKILL.md (main skill file)
- assets/mcp-context.md
- assets/mcp-architecture.md
- assets/mcp-domain-split-plan.md
- assets/agent-collab-spec.md
- assets/iroh-transport.md
- assets/auth-flow.md
- assets/tool-schemas.json
- scripts/create-ticket.js
- scripts/list-tickets.js
- scripts/get-ticket.js
- scripts/update-ticket.js
- scripts/create-plan.js
- scripts/delegate-agent.js
- scripts/discover-agents.js
- scripts/share-context.js
- scripts/README.md

**wayofteams-auth skill:**
- SKILL.md (main skill file)
- assets/auth-flow.md
- scripts/check-access.js
- scripts/promote-superadmin.js
- scripts/redeem-access-code.js
- scripts/get-entitlements.js
- scripts/create-company.js
- scripts/list-memberships.js
- scripts/leave-company.js
- scripts/check-feature.js
- scripts/README.md

**Agents:**
- .pi/agents/wayofteams-mcp-expert.md
- .pi/agents/wayofteams-auth.md

### Commit
baae3581d - feat(pi): add wayofteams-mcp-expert and wayofteams-auth skills + agents

## Acceptance Criteria

- [x] Both skills load correctly in Pi
- [x] All scripts execute with proper environment variables
- [x] Assets are complete references from source docs
- [x] Agents follow Pi format (kebab-case, PascalCase tools)
- [x] Code pushed to main branch
- [x] No mock data in scripts - all use real API endpoints

## Testing

- Verified directory structure matches Pi conventions
- Scripts have proper help text and error handling
- All asset files copied from authoritative source docs
- JSON schemas validate against actual MCP tool inputs