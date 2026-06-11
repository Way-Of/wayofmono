---
name: build_ticket_executor
description: "Execute approved plans in phases, validating telemetry and committing changes for OpenCode"
version: 1.0.0
namespace: core
tools: read, write, grep, glob, WebSearch
platforms: [claude, opencode, gemini, pi, wocoder, antigravity, codex]
allowed-tools: [read, write, grep, glob, web_search]
dependencies: [ticket-manager]
---

# Build Ticket Executor Skill

Executes approved plans in phases.

## Commands
- /implement_plan <ticket-id> - Execute approved plan phase-by-phase
