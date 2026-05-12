# File Structure for WayOfMono Monorepo

This document defines the authoritative file structure for the WayOfMono monorepo, consolidating the AI Engineering Harness, Core Packages, and specialized agent interfaces.

## Repository Layout

```
/home/zerwiz/wayofmono/
├── packages/                      # Core and feature-specific npm packages
│   ├── @wayofmono/wo-ai/          # Unified multi-provider LLM API
│   ├── @wayofmono/wo-agent-core/  # Core agent runtime
│   ├── @wayofmono/wo-tui/         # High-performance TUI library
│   ├── @wayofmono/wo-web-ui/      # Web UI components
│   ├── @wayofmono/telemetry/      # ODD-first instrumentation
│   └── rpiv-*/                    # Consolidated RPIV packages
├── tools/                         # Specialized tool integrations (Shared)
│   ├── lens/                      # LSP diagnostics & safety guards (Wom-Lens)
│   ├── web-access/                # Brave-backed search & extractors
│   └── markdown-preview/          # Terminal/Browser rendering
├── memory/                        # Shared memory & session management
├── shared/                        # Shared resources and templates
│   ├── tickets/                   # Work item templates
│   ├── plans/                     # Plan templates
│   ├── research/                  # Research documentation
│   ├── wo/                        # Wo-specific shared resources
│   ├── pi/                        # Pi-specific shared resources
│   ├── gemini/                    # Gemini-specific shared resources
│   └── opencode/                  # OpenCode-specific shared resources
├── wo/                            # Wo Agent (Primary Synthesized Interface)
│   ├── agents/                    # Wom-Architect, Wom-Coder, etc.
│   ├── commands/                  # Slash commands (/wom-*)
│   ├── skills/                    # Native Wo skills
│   └── extensions/                # Subagent extensions (.ts)
├── pi/                            # Pi Agent (Reference Interface)
│   ├── agents/                    # Original Pi agents
│   ├── commands/                  # Reference pi-commands
│   └── skills/                    # Pi-native skills
├── gemini/                        # Gemini CLI Interface
│   ├── agents/                    # Gemini-specific agents
│   ├── commands/                  # TOML format commands
│   └── skills/                    # TOML format skills
├── opencode/                      # OpenCode Interface
│   ├── agents/                    # OpenCode-specific agents
│   ├── commands/                  # Slash commands
│   └── skills/                    # Markdown skills
├── thoughts/                      # Context engineering artifacts
│   ├── shared/                    # Team-wide documents
│   └── {username}/                # Personal workspace
└── docs/                          # Comprehensive monorepo documentation
    ├── wo/                        # Ported & Rebranded Pi documentation
    └── README.md
```

## Agent Interface Philosophy

WayOfMono provides a shared "Intelligence Backend" (Backend, Tools, Memory) that serves four distinct "Agent Frontends":

1.  **Wo (Way of Coding):** The primary, highly-tuned synthesized interface. Native to this monorepo.
2.  **Pi:** Full compatibility with the official Pi Agent standards.
3.  **OpenCode:** Privacy-first, TUI-driven interaction following the OpenCode standard.
4.  **Gemini CLI:** Multimodal, high-velocity automation using the Gemini CLI standard.

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
