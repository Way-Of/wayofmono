---
name: pr-description-generator
description: Generates professional PR descriptions.
trigger: auto
---

# PR Description Generator

This skill automates the creation of detailed pull request descriptions.

## Process
1. **Analyze:** Review all commits on the current branch compared to \`main\`.
2. **Context:** Read the corresponding \`implementation.md\` plan.
3. **Draft:** Generate a PR description with the following sections:
   - **Summary:** High-level overview.
   - **Changes:** Bulleted list of specific modifications.
   - **Verification:** Links to test results and audit reports.
   - **Checklist:** Standard project checklist.

## Rules
- Keep descriptions clear and technical.
- Link to the original ticket and implementation plan.
- Include a "How to test" section.
