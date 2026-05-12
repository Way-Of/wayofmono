---
name: experimental-pr-workflow
description: Formalizes experimental work into tickets and PRs.
trigger: manual
---

# Experimental PR Workflow

Use this skill when you have been working "out of bounds" (no ticket/plan) and need to formalize your work.

## Process
1. **Inventory:** \`git diff main\` to see all experimental changes.
2. **Backfill:** Create a new ticket in \`thoughts/shared/tickets/\` describing the work.
3. **Plan:** Create a retroactive \`implementation.md\` plan.
4. **Formalize:** Move the code to a proper feature branch and create a PR using the \`pr-description-generator\`.
