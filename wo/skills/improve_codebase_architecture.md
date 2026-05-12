---
name: improve-codebase-architecture
description: Identifies architectural friction and proposes refactors.
trigger: manual
---

# Improve Codebase Architecture

Use this skill to perform "deep-module" refactors and improve the overall structural integrity of the project.

## Goals
- **Deepen Modules:** Simplify public interfaces while hiding complexity.
- **Reduce Coupling:** Identify and break unnecessary dependencies.
- **Enhance Testability:** Make the codebase easier to verify through TDD.

## Process
1. **Analyze:** Identify "shallow" modules (large API, small logic) or complex dependencies.
2. **Propose:** Draft an RFC (Request for Comments) ticket in \`thoughts/shared/research/\`.
3. **Review:** Get architectural approval before starting the refactor.
