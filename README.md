# WayOfMono

A unified monorepo consolidation for elite coding agents. WayOfMono provides a shared "Intelligence Backend" that serves four distinct "Agent Frontends."

## Vision
WayOfMono brings together the most powerful coding agent technologies into a single, cohesive ecosystem. We move beyond simple tool collection to **Custom Synthesis**—creating our own solutions by combining the self-extensibility of Pi, the large-scale context of Gemini, and the privacy-first architecture of OpenCode.

## The Interface-Agnostic Philosophy
Our core logic, tools, and memory are built as a shared backend. This allows you to interact with your codebase using your preferred interface:

1.  **Wo (Way of Coding):** The primary, highly-tuned synthesized interface. Native to this monorepo.
2.  **Pi:** Full compatibility with the official Pi Agent standards.
3.  **OpenCode:** Privacy-first, TUI-driven interaction following the OpenCode standard.
4.  **Gemini CLI:** Multimodal, high-velocity automation using the Gemini CLI standard.

---

## Official Alignments
This monorepo is designed to be fully compatible and aligned with the following official standards:
- **Pi:** [github.com/earendil-works/pi](https://github.com/earendil-works/pi) — The self-extensible agent harness.
- **Gemini CLI:** [geminicli.com](https://geminicli.com/) | [Docs](https://geminicli.com/docs/) — The high-velocity, multimodal automation CLI.
- **OpenCode:** [opencode.ai](https://opencode.ai/) | [Docs](https://opencode.ai/docs) — The privacy-first, universal agent standard.

## Core Philosophies
- **Custom Synthesis:** We don't just copy; we synthesize. Every agent, skill, and template in this repo is custom-crafted to leverage the best of all worlds.
- **Context Engineering:** Leveraging the `thoughts/` directory for deep project memory and strategic planning.
- **Agent Orchestration:** A multi-agent system (Architect, Auditor, Recon, Coder) designed for complex, vertical-slice implementations.
- **Observability-Driven:** Telemetry and traces are first-class design artifacts (ODD).

## Repository Structure
```
/home/zerwiz/wayofmono/
├── packages/          # Reusable npm packages (Wo/Pi-aligned)
├── tools/             # Tool integrations (Lens, Web Access, etc.)
├── shared/            # Shared templates for tickets, plans, and research
├── wo/                # Wo Agent (Synthesized Primary Interface)
├── pi/                # Pi Agent (Reference Interface)
├── gemini/            # Gemini CLI Interface (TOML)
├── opencode/          # OpenCode Interface (Markdown)
├── thoughts/          # Context engineering artifacts (Tickets, Plans, Research)
└── docs/              # Comprehensive monorepo documentation
```

## Getting Started
1. **Initialize:** Run `/wom-init` to set up the context engine.
2. **Explore:** Use `wom-recon` to map the codebase.
3. **Plan:** Use `wom-architect` via `/wom-plan` to design your implementation.
4. **Execute:** Use `wom-coder` via `/wom-build` to write verified code.
5. **Audit:** Use `wom-auditor` via `/wom-audit` to ensure quality and security.

## Installation
```bash
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/zerwiz/wayofmono/main/wo/install.ts
```

---
*Built as a unified toolset for the next generation of AI engineering.*
