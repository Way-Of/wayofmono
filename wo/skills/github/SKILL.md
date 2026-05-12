---
name: github
description: GitHub operations including repository cloning, issue management, pull request creation, and codebase integration with proper authentication and rate limiting.
license: MIT
metadata:
  buddybot:
    emoji: 🐙
    requires:
      bins: ["gh"]
    os: ["linux", "darwin", "win32"]
allowed-tools: Bash(github:*)
---

# GitHub Operations

## Setup

```bash
cd ~/.pi/agent/skills/github && npm install
```

## Usage

```bash
# Clone a repository
github clone https://github.com/owner/repo

# Create issue
github issue create "title" body

# Review pull requests
github pr review "pr_number"

# Search issues/PRs
github search "query"
```

## Features

- Repository cloning and management
- Issue tracking and management
- Pull request workflows
- Codebase integration
- Rate limit handling

## Authentication

- Uses gh CLI for authentication
- Supports personal access tokens
- Handles OAuth flows

## Notes

- Respects GitHub API rate limits
- Uses cached credentials from gh CLI
- Supports private repositories
