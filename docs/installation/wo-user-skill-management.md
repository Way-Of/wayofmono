# wo-user Skill Management Documentation

## Overview

The `@wayofmono/wo-user-extra` package provides additional agents and skills for the `@wayofmono/wo-agent` runtime. This package contains specialized capabilities commonly needed for enterprise integration, testing, research, and platform integration workflows while keeping the core `@wayofmono/wo-agent` package lean and focused.

This package solves the problem of **selective capability installation** — users can now install exactly the agents and skills they need without loading unnecessary functionality.

## Key Features

### Selective Installation
Install only the capabilities you need:
- Core capabilities in `@wayofmono/wo-agent` (6 essential agents)
- Extended capabilities in `@wayofmono/wo-user-extra` (15+ agents, 40+ skills)
- Install exactly what your project requires

### Three-Layer Architecture
The wo-user package system follows the three-layer model:

```
.wo/
├── agents/
│   └── [agent-name]/              ← Agent definitions
│       └── SKILL.md
├── extensions/                    ← Custom tools
│   ├── pipeline-tools.ts
│   ├── document-tools.ts
│   └── search-tools.ts
├── settings.json
├── models.json
└── manifest.json                  ← Package tracking (skills, agents, extensions)
```

**Layers:**
1. **Agent** (`.wo/agents/*`) — AI persona and behavior definitions
2. **Skills** (`node_modules/@wayofmono/skill-*`) — Capabilities from npm packages
3. **Extensions** (`.wo/extensions/`) — Custom LLM-callable tools

### Package Structure

#### Core wo-package (`@wayofmono/wo-agent`)
- 6 essential agents (codebase_analyzer, codebase_locator, etc.)
- Basic skill runtime with manifest-based loading

#### Extension wo-package (`@wayofmono/wo-user-extra`)
- 6 specialized agents (codebase_investigator, codebase_pattern_finder, etc.)
- 40+ advanced skills (tdd, validate_manifest, codebase_analyzer, etc.)
- Enterprise-grade debugging, testing, compliance, and analysis tools

### Benefit: Clean Dependencies
```bash
# Install only what you need
npm install @wayofmono/wo-agent @wayofmono/wo-user-extra
npx wouser skill install tdd validate_manifest

# OR install investigation capabilities only
npm install @wayofmono/wo-agent @wayofmono/wo-user-extra
npx wouser skill install codebase_analyzer thoughts_analyzer
```

## Installation Commands

### Step 1: Install the packages
```bash
cd your-project
npm install @wayofmono/wo-agent @wayofmono/wo-user-extra
```

### Step 2: Register skills you need
```bash
# Testing and validation tools
npx wouser skill install tdd validate_manifest

# Code analysis and investigation tools  
npx wouser skill install codebase_analyzer codebase_investigator

# Platform integration tools
npx wouser skill install womono_version_updater observability_driven_development

# All at once
npx wouser skill install tdd validate_manifest codebase_analyzer codebase_investigator thoughts_analyzer
```

### Step 3: Register agents (if needed)
```bash
# Register specialized agents for enhanced capabilities
npx wouser agent install codebase_analyzer
title: "[WOMONO-110] wo-agent Skill Manifest Loading"
type: "Feature"
priority: "High"
status: "In Progress"
assignee: "@zerwiz"
reporter: "@zerwiz"
project: "WOMONO"
namespace: "womono"
category: "feature"
parent_ticket: ""
shared_tickets: '["WOMONO-109"]'
pr_url: ""
github_issue: ""
created: "2026-06-28"
updated: "2026-06-28"
reviewed_by: ""
reviewed_at: ""
completed: ""
---

# ⚠️ MANDATORY: UPDATE STATUS ON EVERY WORK SESSION ⚠️

**CRITICAL RULE**: You MUST update the `status` field and `updated` timestamp in the frontmatter EVERY TIME you work on this ticket. No exceptions.

| When | Action |
|------|--------|
| Start work | Set `status: "In Progress"`, `updated: "YYYY-MM-DD"` |
| Submit for review | Set `status: "Submitted for Review"`, `updated: "YYYY-MM-DD"` |
| Approved | Set `status: "Approved"`, `updated: "YYYY-MM-DD"` |
| Done/Complete | Set `status: "Done"`, `completed: "YYYY-DD"`, `updated: "YYYY-MM-DD"` |
| Blocked | Add `blocked: true` and `blocked_reason: "..."` to frontmatter |

**NEVER leave a ticket in "To Do" or "Backlog" if work has been done on it.**

---

# wo-agent Skill Manifest Loading

## Description

The `@wayofmono/wo-agent` runtime needs to support loading skills, agents, and extensions from npm packages via `.wo/manifest.json`. Currently, `wo-agent` only loads skills from local `.wo/skills/` directories and cannot consume third-party skills like `@wayofmono/skill-investor-ready-doc-gen`.

## Current State

**wo-agent** provides CLI (`wouser`) to manage resources:

```bash
wouser skill install npm:@wayofmono/skill-investor-ready-doc-gen
wouser agent install npm:@wayofmono/agent-expert-coder
wouser extension install npm:@wayofmono/extension-web-search

wouser skill list
wouser agent list
wouser extension list
```

But at runtime, `wo-agent`'s `loadSkills()` function only loads from:
- `~/.wocode/skills/` (user skills)
- `.wocode/skills/` (project skills)
- Explicit skill paths provided via CLI flags

It does NOT load skills registered in `.wo/manifest.json`, preventing projects like **investready** from using third-party skills as npm dependencies.

## Client Experience (What Users Actually See)

### Zero Complexity Installation
```bash
# Client workflow - simple, minimal steps
cd my-project
npm install @wayofmono/skill-investor-ready-doc-gen
npx wouser skill install investor-ready-doc-gen
```

**What clients actually do:**
1. Install the npm package - one line
2. Run `wouser skill install` - one command
3. Done! Skills immediately available

**No folder structure maze, no copying files, no symlinks** - just clean, simple dependency management.

### Flexible Skill Installation
```bash
# Install three skills if needed
npm install @wayofmono/skill-investor-ready-doc-gen @wayofmono/agent-expert-coder @wayofmono/extension-web-search
npx wouser skill install investor-ready-doc-gen expert-coder web-search
```

**Clients can install just 1 skill, or 3 if they need multiple capabilities - no complexity in how they install.**

## Requirements

### 1. Runtime Manifest-Based Skill Loading
Update `wo-agent`'s `loadSkills()` function to read `.wo/manifest.json` and load all registered resources (skills, agents, extensions) automatically.

### 2. Simplified Client Experience
- Clean `npm install` for package dependency resolution
- Simple `wouser skill install <skill-name>` for registration
- Zero folder structure complexity or file copying
- Automatic skill loading at runtime without manual configuration

### 3. Three-Layer Architecture Support
Support the complete three-layer model:

```
.wo/
├── agents/
│   └── investready/            ← Agent definition (persona)
│       └── SKILL.md
├── extensions/                 ← Custom tools
│   ├── pipeline-tools.ts
│   ├── document-tools.ts
│   └── search-tools.ts
├── settings.json
├── models.json
└── manifest.json               ← npm package tracking
```

**Layers to support:**
1. **Agent** (`.wo/agents/*/SKILL.md`) — AI persona definition
2. **Skills** (`node_modules/@wayofmono/skill-*/SKILL.md`) — Capabilities from npm
3. **Extensions** (`.wo/extensions/*.ts`) — Custom LLM-callable tools

### 4. Seamless Third-Party Integration
Third-party projects should be able to:

```bash
cd /path/to/investready
npm install @wayofmono/skill-investor-ready-doc-gen
npx wouser skill install investor-ready-doc-gen
cat .wo/manifest.json | grep investor-ready-doc-gen
```

And have skills automatically available in chat without manual copying.

### 5. Consistent API
Maintain existing `wouser` CLI commands while adding runtime loading:

```bash
# Register skills (CLI-based)
wouser skill install investor-ready-doc-gen

# At runtime, skills load automatically:
# No --skill flags required when manifest exists
```

## Acceptance Criteria

- [ ] `wo-agent`'s `loadSkills()` loads skills from `.wo/manifest.json` at runtime
- [ ] Manifest entries automatically populate skill list without CLI flags
- [ ] Three-layer architecture (agent + skills + extensions) fully supported
- [ ] Third-party projects can consume skills as npm dependencies
- [ ] `wouser skill install`, `wouser agent install`, `wouser extension install` work with npm packages
- [ ] `.wo/manifest.json` format maintained per [WOMONO-108](WOMONO-108) spec
- [ ] Skill name validation works with npm package directories (e.g., `skill-investor-ready-doc-gen`)
- [ ] Installers (deno install, `ai-harness`) include manifest for third-party projects
- [ ] Integration with [WOMONO-107](WOMONO-107) (SKILL.md bundled in npm packages)

## Technical Notes

### Current Architecture

**File**: `packages/@wayofmono/wo-agent/src/core/skills.ts`
- Lines 406-514: `loadSkills()` function
- Lines 452-459: Reads manifest but doesn't load skills

**Gap**: Manifest is read but skills are not actually loaded into the system.

### Required Changes

1. **Modify `loadSkills()` in `skills.ts`**:
   - Read `.wo/manifest.json` using existing `readManifest()` from `skill-manifest.ts`
   - Load skills from `manifest.entries` where `type: "skill"`
   - Same pattern for agents and extensions

2. **Update `readManifest()` in `skill-manifest.ts`**:
   - Ensure proper path resolution for npm packages
   - Validate SKILL.md name matches directory (see validation in `skills.ts:94-117`)

3. **Package Structure Updates**:
   - Bundle SKILL.md in npm packages (WOMONO-107)
   - Ensure `wouser` CLI can discover and register npm packages

### Three-Layer Integration

**Layer 1 - Agent**: `.wo/agents/*/SKILL.md` (existing)
**Layer 2 - Skills**: `node_modules/@wayofmono/skill-*/SKILL.md` (via manifest)
**Layer 3 - Extensions**: `.wo/extensions/*.ts` (existing)

## Dependencies

| Ticket | What's Needed | Status |
|--------|---------------|--------|
| WOMONO-103 | Skill assets npm package structure | ✅ Done |
| WOMONO-104 | Web-access build fix | ✅ Done |
| WOMONO-105 | CLI interfaces for cross-language use | 🔽 Low priority |
| WOMONO-106 | Pipeline runner agent for investready docs | In Progress |
| WOMONO-107 | SKILL.md bundled in npm packages | Backlog |
| WOMONO-108 | wo-agent CLI for manifest-based skill management | Backlog |
| WOMONO-109 | Runtime integration of manifest-based loading | In Progress |

## Work Log

| Date | Status Change | Notes |
|------|---------------|-------|
| 2026-06-28 | Backlog → In Progress | Created — manifest-based runtime loading for wo-agent |
| 2026-06-28 | In Progress | Clarity: wo-agent is separate from AI Engineering Harness. wo-agent (wouser) manages `.wo/` resources for single-tool projects, not multi-tool harness deployment. Ticket updated to reflect WoM (WOMONO) responsibility boundaries. |
| 2026-06-28 | In Progress | Integration: wo-agent reads `.wo/manifest.json` at startup (WOMONO-108) and loads skills/agents/extensions from registered npm packages into the wouser CLI system. This is a WoM core responsibility — projects like investready use wo-agent's runtime, not the 7-frontend harness. |
---

**WORK NOTES UPDATE REQUIRED:** Remember to update this status and timestamp every time you work on this ticket.