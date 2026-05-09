# Porting Inventory & Implementation Plan

This document outlines the features and packages from the reference directory (`ref/`) that will be ported into the WayOfMono monorepo, including their target locations and implementation strategy.

## Feature Inventory & Porting Status

| Feature | Source (Reference) | Target Location | Porting Strategy | Status |
|---------|-------------------|-----------------|------------------|--------|
| **Memory Systems** | `ref/pi-memory-master/` | `memory/` | Synthesis | Planned |
| **Web Tools** | `ref/pi-web-access-main/`, `ref/rpiv-mono-main/packages/rpiv-web-tools/` | `tools/web-access/`, `packages/rpiv-web-tools/` | Custom Synthesis | Planned |
| **Todo Management** | `ref/rpiv-mono-main/packages/rpiv-todo/`, `ref/composer-todos.ts` | `packages/rpiv-todo/` | Direct Port + Refactor | Planned |
| **PRD Workflows** | `ref/ai-engineering-harness-main/pi/skills/prd-to-issues/` | `pi/skills/prd_to_issues.md` | Synthesized (DONE) | Done |
| **LSP / Lens** | `ref/pi-lens-master/` | `tools/lens/` | Direct Port | Planned |
| **Markdown Preview**| `ref/pi-markdown-preview-main/` | `tools/markdown-preview/` | Direct Port | Planned |
| **Subagent Extensions** | `ref/pi-extensions-main/` | `pi/extensions/`, `packages/pi-*` | Synthesis | Planned |
| **RPIV Packages** | `ref/rpiv-mono-main/packages/` | `packages/rpiv-*` | Direct Port | Planned |

---

## Detailed Implementation Plans

### 1. Memory Systems (`memory/`)
**Objective:** Consolidate the Pi memory system with long-term context retention and session state management.
- **Porting Logic:** Extract the vector-store and JSONL session logic from `pi-memory-master`.
- **Customization:** Add a unified interface for all tools (Gemini, Claude, OpenCode) to access the shared memory layer.
- **Verification:** Test context retrieval across multi-turn sessions.

### 2. Web Tools (`tools/web-access/`)
**Objective:** Provide high-fidelity web search and content extraction.
- **Porting Logic:** Port `exa.ts` (search), `perplexity.ts`, and the various extractors (PDF, YouTube, GitHub) from `pi-web-access-main`.
- **Customization:** Synthesize a unified `WebResearcher` agent that uses these tools exclusively.
- **Verification:** Verify content extraction from complex URLs (e.g., dynamic GitHub blobs).

### 3. Todo & Workflow Management (`packages/rpiv-todo/`)
**Objective:** Standardize how tasks are tracked across the monorepo.
- **Porting Logic:** Migrate the core `rpiv-todo` package logic.
- **Customization:** Integrate with the `shared/tickets/` structure so that tickets automatically populate the todo list.
- **Verification:** Run `pi todo` and verify it correctly lists items from `thoughts/shared/tickets/`.

### 4. PRD & Ticket Engineering (`pi/skills/`)
**Objective:** Automate the transition from rough ideas to vertical-slice implementations.
- **Status:** **DONE**. Synthesized as `write_a_prd.md` and `prd_to_issues.md`.
- **Verification:** Verified by generating a PRD from a mock brief and breaking it into markdown issues.

### 5. LSP & Diagnostics (`tools/lens/`)
**Objective:** Provide real-time code quality feedback and safety guards.
- **Porting Logic:** Port the LSP clients and the "Read-Before-Edit" guard from `pi-lens-master`.
- **Customization:** Configure the diagnostics pipeline to respect `GEMINI.md` and `AGENTS.md` rules.
- **Verification:** Trigger a diagnostic warning by violating a rule defined in `GEMINI.md`.

---

## Execution Schedule

### Phase 2: Core Packages (Weeks 3-4)
- Port all `rpiv-*` packages to `packages/`.
- Establish the `@wayofmono/telemetry` and `@wayofmono/core` packages.

### Phase 3: Advanced Tools (Weeks 5-7)
- Integrate `markdown-preview`, `lens`, and `web-access`.
- Synthesize the `Memory` system.

### Phase 4: Final Integration (Weeks 8-10)
- Finalize documentation and migration scripts.
- Perform end-to-end validation of the entire "Golden Path" workflow.

## Discovered Advanced Commands & Skills

Based on deep scans of reference projects, the following high-value features will be synthesized:

| Feature | Source | Target | Synthesis Strategy |
|---------|--------|--------|-------------------|
| **Worktree Manager** | `ref/ai-engineering-harness-main/` | `pi/commands/wom-worktree.md` | Synthesize parallel dev workflow |
| **Dependency Graph** | `ref/Fusion-main/plugins/dependency-graph/` | `tools/lens/graph.ts` | Synthesize visual dep mapping |
| **Librarian** | `ref/pi-web-access-main/skills/librarian/` | `pi/skills/wom-librarian.md` | Advanced doc management |
| **Roadmap Engine** | `ref/Fusion-main/plugins/roadmap/` | `pi/skills/wom-roadmap.md` | Automatic feature roadmapping |
| **Booboo (Fast Fix)** | `ref/pi-lens-master/commands/booboo.ts` | `pi/commands/wom-booboo.md` | One-command bug fixing |
| **GitHub Tracker** | `ref/ai-engineering-harness-main/claude/skills/github-tracker/` | `pi/skills/wom-github.md` | Real-time PR/Issue tracking |
| **Worktree** | `ref/ai-engineering-harness-main/pi/prompts/worktree.md` | `pi/commands/wom-worktree.md` | Parallel vertical slices |
| **Troubleshooting Library** | User Example / Synthesis | `pi/skills/troubleshooters/` | Synthesis of common problem solvers |

---

## Synthesis Plan: Advanced Wom Suite

### 1. Wom-Worktree (`/wom-worktree`)
**Objective:** Enable agents to work on multiple vertical slices simultaneously without context pollution.
- **Porting Logic:** Extract git worktree automation from Harness.
- **Synthesis:** Integrate with `wom-plan` to automatically create a new worktree for every approved plan.

### 2. Wom-Roadmap (`wom-roadmap`)
**Objective:** Provide a high-level visual and structural overview of project progress.
- **Porting Logic:** Port the roadmap schema and ordering logic from Fusion.
- **Synthesis:** Automate roadmap updates based on the status of tickets in `thoughts/shared/tickets/`.

### 3. Wom-Booboo (`/wom-booboo`)
**Objective:** Extremely fast, automated bug fixing for small diagnostics.
- **Porting Logic:** Port the 'booboo' logic from Pi-Lens.
- **Synthesis:** Trigger `wom-auditor` automatically to verify the "fast fix" before the user even sees it.

### 4. Wom-Librarian (`wom-librarian`)
**Objective:** Expert-level documentation management and retrieval.
- **Porting Logic:** Port the librarian skill from Web-Access.
- **Synthesis:** Synthesize with the shared memory layer to provide "RAG-like" capabilities for local documentation.

### 5. Wom-Troubleshooters
**Objective:** Provide agents with a library of common error resolutions.
- **Synthesis:** Created `wom-netlify-troubleshooter`, `wom-lsp-troubleshooter`, and `wom-telemetry-troubleshooter`.
- **Strategy:** These skills are `auto-triggered` when agents encounter specific error keywords (e.g., "Build failed", "LSP failed").
