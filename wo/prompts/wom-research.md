---
description: Conduct deep WayOfMono codebase research.
---
# /wom-research

Perform a comprehensive WayOfMono (Wom) investigation into a feature, module, or architectural pattern.

## Goal
Build a deep understanding of how a part of the system works to inform future changes or troubleshooting.

## External Knowledge & Alignment
When researching architectural patterns or tool integrations, you MUST ensure alignment with official standards. Use the `web_fetch` tool to check for the latest updates from:
- **Pi:** `https://github.com/earendil-works/pi-mono`
- **Gemini CLI:** `https://geminicli.com/docs/`
- **OpenCode:** `https://opencode.ai/docs`

Integrating official best practices ensures our monorepo remains a state-of-the-art synthesis of these technologies.

## Process
1. **Scope:** Define the boundaries of the research.
2. **Recon:** Use the `wom-recon` agent to map out the relevant files and logic.
3. **Align:** Check official documentation URLs for relevant standards or new features.
4. **Analyze:** Deep dive into critical files and their interactions.
5. **Document:** Save findings to `shared/research/`.

## Instructions
- Focus on identifying core logic, dependencies, and potential bottlenecks.
- Use visualization or diagrams where helpful (e.g., Mermaid).
- Link to relevant source files and external documentation.
