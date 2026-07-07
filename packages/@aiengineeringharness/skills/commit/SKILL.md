---
name: commit
description: "Create structured git commits. Delegates to the git-commit-helper skill."
allowed-tools: Read, Bash, Glob, Grep
disable-model-invocation: true
---

# /commit — Create structured git commits

Activates the [git-commit-helper](skills/git_commit_helper/SKILL.md) skill to perform this operation.

## Usage
```
/commit
```

## Process
1. This command activates the `git-commit-helper` skill
2. Follow that skill's workflow to complete the operation
3. Report results to the user
