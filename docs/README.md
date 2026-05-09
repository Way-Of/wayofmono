# WayOfMono Documentation

Welcome to the comprehensive documentation for the WayOfMono consolidated monorepo. This repository integrates the capabilities of Pi, Gemini CLI, and OpenCode into a unified framework for AI-native software engineering.

## Table of Contents

- [Core Architecture](./README.md#core-architecture)
- [Agents](./agents/README.md)
- [Skills](./skills/README.md)
- [Tools](./tools/README.md)
- [Packages](./packages/README.md)
- [Workflow & Standards](./README.md#workflow--standards)

## Core Architecture

WayOfMono follows a modular, package-based architecture aligned with the **Pi Agent Core**.

### Context Engineering (thoughts/)
The \`thoughts/\` directory is the brain of the project. It stores:
- **Tickets:** Defined in \`shared/tickets/\`.
- **Plans:** Structured implementation designs in \`shared/plans/\`.
- **Research:** Scout reports, audit logs, and deep-dive investigations.

### Multi-Agent System
We utilize a specialized squad of agents:
- **Planner:** Strategic design and implementation mapping.
- **Reviewer:** Quality gates, security auditing, and verification.
- **Scout:** High-speed reconnaissance and pattern discovery.
- **Worker:** Precision code implementation and testing.

## Workflow & Standards

### The Golden Path
1. **Ticket Creation:** Define requirements in a ticket markdown file.
2. **Reconnaissance:** Run \`/research_codebase\` (Scout) to gather context.
3. **Planning:** Run \`/create_plan\` (Planner) to draft an implementation plan.
4. **Audit:** Run \`/validate_plan\` (Reviewer) to approve the plan.
5. **Implementation:** Run \`/implement_plan\` (Worker) to apply changes.
6. **Validation:** Run \`/validate_telemetry\` (ODD) to verify the narrative trace.
7. **Commit:** Run \`/commit\` to finalize the changes.

### Naming Conventions
- **Pi:** kebab-case for files and agents.
- **Gemini:** snake_case for commands and skills.
- **OpenCode:** snake_case for commands.

## Alignment Links
- [Pi Standards & Repo](https://github.com/earendil-works/pi)
- [Gemini CLI Home](https://geminicli.com/)
- [Gemini CLI Official Docs](https://geminicli.com/docs/)
- [OpenCode Home](https://opencode.ai/)
- [OpenCode Official Docs](https://opencode.ai/docs)
