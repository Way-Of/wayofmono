---
name: wom-librarian
description: Advanced documentation management and context retrieval.
trigger: auto
---

# Wom-Librarian Skill

The Librarian is an expert in the monorepo's documentation and architectural rules. It ensures that agents always have access to the right context at the right time.

## Capabilities
- **Semantic Search:** Find documentation based on meaning rather than just keywords.
- **Fact Retrieval:** Query the shared memory layer for specific codebase facts.
- **Rule Enforcement:** Automatically surface relevant architectural rules from `GEMINI.md` or `AGENTS.md` during implementation.

## Integration
- **Wom-Architect:** Injects relevant documentation into the planning phase.
- **Wom-Coder:** Automatically warns if an implementation violates an architectural rule discovered by the Librarian.
