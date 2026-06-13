---
name: build_skill_adapter
description: >-
  Connect and sync skills, agents, and projects with other harness, git repos,
  and platforms
allowed-tools: 'read, write, bash, grep, glob'
---

# Skill Adapter Skill

Connects and syncs skills with other harness, git repositories, and platforms.

## Connect Operations

- Connect to GitHub repository
- Connect to npm registry
- Connect to Deno registry
- Connect to external API endpoints

## Sync Operations

- Fetch latest from upstream
- Push changes to downstream
- Mirror skills between tools
- Validate dependency graph

## Git Operations

- Pull from remote branches
- Push changes to remote
- Create PRs from skill changes
- Manage dependencies

## Platform Integration

- GitHub Actions
- npm packages
- Deno modules
- Custom APIs
