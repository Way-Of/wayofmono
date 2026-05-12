---
name: code-rewiew
description: Code review and validation service for pull requests, quality checks, and code quality assurance using AST parsing and linter integration. Use for pull request reviews, static analysis, and code quality checks.
license: MIT
metadata:
  buddybot:
    emoji: 🔍
    requires:
      bins: []
    os: ["linux", "darwin", "win32"]
allowed-tools: Bash(code-rewiew:*)
---

# Code Review

## Setup

```bash
cd ~/.pi/agent/skills/code-rewiew && npm install
```

## Usage

```bash
# Review a pull request
code-rewiew review "pr_id"

# Static analysis
code-rewiew analyze "path/to/code"

# Quality checks
code-rewiew lint "file.js"
```

## Features

- AST-based code parsing
- Security vulnerability detection
- Code quality metrics
- Best practices compliance

## Notes

- Supports TypeScript, JavaScript, and more
- Integration with CI/CD workflows
- Quality gate assessments
