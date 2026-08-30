---
description: Review staged git changes
argument-hint: [focus-area]
---

Review the staged changes (`git diff --cached`). Focus on:
- Bugs and logic errors
- Security issues
- Error handling gaps
- Performance problems
- Code style and consistency

Provide a structured review with severity levels:
- **Critical**: Must fix before merging
- **Warning**: Should fix
- **Suggestion**: Consider improving

If `$1` is provided, focus specifically on: $1
