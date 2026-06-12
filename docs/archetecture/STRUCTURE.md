# File Structure for WayOfMono Monorepo

This document defines the authoritative file structure for the WayOfMono monorepo, consolidating the AI Engineering Harness, Core Packages, and specialized agent interfaces.

## Repository Layout

```
./
├── packages/                      # Core and feature-specific npm packages
│   ├── @wayofmono/wo-ai/          # Unified multi-provider LLM API
│   ├── @wayofmono/wo-agent-core/  # Core agent runtime
│   ├── @wayofmono/wo-agent/       # User Agent SDK & CLI (wouser)
│   ├── @wayofmono/wo-coding-agent/# Coding Agent CLI (wocode)
│   ├── @wayofmono/wo-skill-docs/  # Documentation engineering skill
│   ├── @wayofmono/wo-mermaid/     # Mermaid diagram renderer
│   ├── @wayofmono/wo-tui/         # High-performance TUI library
│   └── @wayofmono/telemetry/      # ODD-first instrumentation
├── tools/                         # Specialized tool integrations (Shared)
│   ├── lens/                      # LSP diagnostics & safety guards
│   ├── web-access/                # Brave-backed search & extractors
│   └── markdown-preview/          # Terminal/Browser rendering
├── thoughts/                      # Context engineering artifacts
│   ├── global/                    # Global user preferences
│   └── shared/                    # Universal templates (Tickets, Plans, Research)
├── pi/                            # Pi Agent Standards Compatibility
├── gemini/                        # Gemini CLI Standards Compatibility
├── opencode/                      # OpenCode Agent Standards Compatibility
├── claude/                        # Claude Agent Standards Compatibility
├── memory/                        # Shared memory & session management
├── ref/                           # Historical reference & legacy artifacts
│   └── wo/                        # Legacy Wo agent configuration
├── test/                          # Local deployment & integration tests
│   ├── coding-agent/              # Self-contained wocode test environment
│   └── user-agent/                # Self-contained wouser test environment
└── docs/                          # Comprehensive monorepo documentation
    ├── INSTALL.md                 # Flawless installation guide
    └── README.md                  # Documentation index
```

## Agent Interface Philosophy

WayOfMono provides a shared "Intelligence Backend" (Packages, Tools, Memory) that serves five distinct "Agent Frontends":

1.  **WayOfMono (Primary):** The flagship **wocode** and **wouser** interfaces.
2.  **Pi:** Full compatibility with the official Pi Agent standards.
3.  **OpenCode:** Privacy-first, TUI-driven interaction following the OpenCode standard.
4.  **Gemini CLI:** Multimodal, high-velocity automation using the Gemini CLI standard.
5.  **Claude:** Support for Claude-native orchestration patterns.

## Component Naming Conventions

| Tool | Location | Agent/Skill Naming | File Extensions |
|------|----------|-------------------|----------------|
| **Wo** | `wo/` | kebab-case | `.md` / `.ts` (ext) |
| **Pi** | `pi/` | kebab-case | `.md` / `.ts` (ext) |
| **Gemini** | `gemini/` | snake_case | `.toml` |
| **OpenCode** | `opencode/` | snake_case | `.md` |

## Required Files Checklist

### Shared Backend Packages
- [x] `packages/@wayofmono/telemetry`
- [ ] `packages/@wayofmono/wo-ai`
- [ ] `packages/@wayofmono/wo-agent-core`

### Wo Primary Squad (The Core)
- [x] `wo/agents/wom-architect.md`
- [x] `wo/agents/wom-auditor.md`
- [x] `wo/agents/wom-recon.md`
- [x] `wo/agents/wom-coder.md`

### Universal Commands (/wom-*)
- [x] `wo/commands/wom-init.md`
- [x] `wo/commands/wom-plan.md`
- [x] `wo/commands/wom-build.md`
- [x] `wo/commands/wom-audit.md`
- [x] `wo/commands/wom-commit.md`
- [x] `wo/commands/wom-debug.md`
- [x] `wo/commands/wom-research.md`
- [x] `wo/commands/wom-telemetry.md`
- [x] `wo/commands/wom-worktree.md`
- [x] `wo/commands/wom-booboo.md`

## Next Steps

1. **Port Pi Documentation:** Synthesize and rebrand `https://pi.dev/docs/latest` into `docs/wo/`.
2. **Move synthesized work to `wo/`**: (COMPLETED)
3. **Re-initialize `pi/` from reference**: Populate the `pi/` directory with pure reference-aligned agents and commands.
4. **Port Gemini/OpenCode Logic**: Synthesize the counterparts for the remaining two interfaces.
