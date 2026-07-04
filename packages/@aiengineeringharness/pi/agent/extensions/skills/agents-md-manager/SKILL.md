---
name: agents-md-manager
description: Create, update, and maintain AGENTS.md files across projects and subdirectories. Ensures every AGENTS.md follows the Agent Ecosystem Manifest format and contains accurate agent, command, and skill references.
allowed-tools: read, write, bash, glob, grep
---
# AGENTS.md Manager

Create, update, and maintain AGENTS.md files across projects and subdirectories. Ensures every AGENTS.md follows the standard format and contains accurate agent/command/skill references.

## What This Skill Does

1. Creates AGENTS.md files at any level (monorepo root, project root, `thoughts/<project>/`)
2. Updates existing AGENTS.md with current agent, command, and skill lists
3. Ensures correct frontmatter format per tool
4. Knows per-tool project memory filename conventions

## Tool Project Memory Filenames

| Tool | Project Memory File |
|------|-------------------|
| OpenCode | `AGENTS.md` |
| Claude Code | `CLAUDE.md` |
| Gemini CLI | `GEMINI.md` |
| Pi | `AGENTS.md` |
| Wo Coder | `AGENTS.md` |
| Antigravity | `ANTIGRAVITY.md` |
| Codex CLI | `RULES.md` |

## AGENTS.md Standard Structure

### Root-Level (Monorepo/Project)

A well-formed AGENTS.md includes:

```markdown
# <Project Name> — AGENTS.md

## AGENTS.md Architecture Standard
<explanation of the Agent Ecosystem Manifest pattern>

### Global Orchestration Rules
<rules for all agents>

### Agent Directory
<per-agent definitions with Identifier, Runtime, Responsibility, Constraints>

## Non-Orchestrated AGENTS.md Blueprint (Static Reference)
<when orchestration layer is stripped away>

### Integration Standards
<standards for hardcoded prompts, error handling>

### Component Directory (Code-Coupled)
<per-component with code paths>

### Non-Orchestrated Maintenance Protocol
<maintenance without orchestration>

## Project Overview
<project description, structure, key info>

## Repository Structure
<tree view of the repository>

## Commands & Skills
<table of available commands and skills>

## Agents
<table of available agents with descriptions>

## Workflow
<primary workflow>

## MCP Configuration
<if applicable>

## Tool-Specific Notes
<if applicable>
```

### Per-Project (in `thoughts/<project>/AGENTS.md`)

```markdown
---
name: <project-slug>
description: <project description>
version: "<semver>"
---

# <Project Name>

<description>

## Purpose
<what this file guides agents on>

## Critical Convention: Thoughts Folder
<artifacts go in thoughts folder, not code repo>

## Project Structure
<tree view>

## Agent Workflow
<how agents work with this project>

## Available Skills
<list from harness>
```

## AGENTS.md Architecture Standard (Agent Ecosystem Manifest)

The AGENTS.md format follows the **Agent Ecosystem Manifest** blueprint:

### Global Orchestration Rules
- All agents must output structured JSON when interacting with the execution layer
- If an agent encounters an unrecoverable validation error, it must route state back to the coordinator
- No agent may invoke an external tool without an explicit schema check
- Negative constraints are mandatory: every agent must define what it is *not* allowed to do

### Agent Definition Format

Each agent in the Agent Directory must follow this structure:

```markdown
#### Agent: <Name> (<identifier>)
- **Identifier:** `<identifier>_v1`
- **Primary Runtime:** <Platform-native, Deno, Next.js, etc.>
- **Target Model:** <Host tool's model, N/A, etc.>

**Core Responsibility:** <one-line description>

**Inputs & Outputs:**
- **Upstream:** <what feeds this agent>
- **Downstream:** <what this agent produces>

**Constraints:**
- <what the agent is NOT allowed to do>
```

### Non-Orchestrated Blueprint (Static)

When no dynamic orchestration layer exists:

- Every LLM interaction in code must be wrapped in deterministic error-handling blocks
- Raw prompts in code must remain identical to prompt signatures documented below
- Changes to token budgets or models require corresponding AGENTS.md updates
- Each component must specify exact code path (`file_path:line_number`) where LLM interaction occurs

## Instructions

### Step 1: Determine Scope

Ask the user:
1. Where should the AGENTS.md be created/updated? (e.g., project root, `thoughts/<project>/`, subdirectory)
2. Is this a new file or updating an existing one?

### Step 2: Detect the Tool

Determine which AI coding tool is running (check tool config directories, `.claude/`, `.gemini/`, etc.) to use the correct project memory filename (AGENTS.md, CLAUDE.md, GEMINI.md, etc.).

### Step 3: Discover Available Resources

```bash
# List installed skills
ls -d <TOOL_CONFIG_DIR>/skills/*/ 2>/dev/null | xargs -n1 basename | sort

# List installed commands (if tool has commands/ dir)
ls <TOOL_CONFIG_DIR>/commands/ 2>/dev/null | sed 's/\.md$//' | sort

# List installed agents
ls <TOOL_CONFIG_DIR>/agents/ 2>/dev/null | sed 's/\.md$//' | grep -vi readme | sort
```

### Step 4: Build the AGENTS.md

Use the standard structure from the sections above. For a root-level AGENTS.md:
1. Start with the `# <Project> — AGENTS.md` header
2. Include the AGENTS.md Architecture Standard section
3. List all agents with the Agent Directory format
4. Include the Non-Orchestrated Blueprint section
5. Add project overview, structure, commands, skills, agents
6. Add workflow, MCP config, tool-specific notes

For a per-project AGENTS.md (in `thoughts/<project>/`):
1. Add frontmatter with name, description, version
2. Explain the project's purpose and artifact conventions
3. List project structure
4. Document agent workflow for this project
5. List available skills/commands/agents

### Step 5: Save the File

Write the file to the specified path. Use `write` tool, never `bash echo/cat`.

### Step 6: Verify

Read back the file to confirm it was written correctly.

## Edge Cases

### Non-Git Repository
Create the AGENTS.md anyway — it's documentation, not a git hook.

### No AI Engineering Harness Installed
If no harness config directory is found, create a minimal AGENTS.md with just the project overview and architecture standard. The user can enrich it later.

### Per-Tool Frontmatter Differences
OpenCode and Claude support YAML frontmatter in AGENTS.md. Some tools may not support frontmatter — detect and adapt.

### Multiple Tools Active
If multiple harness config directories are detected (e.g., both `.claude/` and `.config/opencode/` exist), generate AGENTS.md as the primary file (used by OpenCode, Pi, Wo Coder) and note that other tools use their own filename (CLAUDE.md, GEMINI.md, etc.).

## Known Patterns

### f-rr-d Per-Project AGENTS.md
Every project in the f-rr-d thoughts repo has a per-project AGENTS.md at `thoughts/<project>/AGENTS.md` that:
- Documents the project's folder structure within f-rr-d
- Lists available skills from the AI Engineering Harness
- Describes the agent workflow for that project
- Is created/updated by `init-harness` using standard templates

### Harness AGENTS.md
The AI Engineering Harness has its own AGENTS.md at `packages/@aiengineeringharness/AGENTS.md` that:
- Serves as structured reference data for AI coding assistants
- Contains repository structure, commands/skills table, agent table, workflow
- Is maintained manually alongside the code
