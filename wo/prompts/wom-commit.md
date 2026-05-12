---
description: Prepare and execute a structured WayOfMono git commit.
---
# /wom-commit

Formalize changes into the repository with a high-quality, descriptive WayOfMono (Wom) commit message.

## Goal
Maintain a clean and informative git history that explains the "why" behind changes.

## Process
1. **Diff:** Review all staged and unstaged changes.
2. **Summarize:** Use the `git-commit-helper` skill to draft a concise, meaningful commit message.
3. **Verify:** Perform a final check of the changes against the plan and linting rules.
4. **Execute:** Commit the changes to the current feature branch.

## Instructions
- Follow the project's commit message convention (Conventional Commits).
- Ensure no sensitive information or temporary files are included.
- Verify that the current branch is correct before committing.

## Output
The result of the commit operation and the final commit hash.
