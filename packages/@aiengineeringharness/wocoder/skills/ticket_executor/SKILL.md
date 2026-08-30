---
name: ticket_executor
description: "Execute approved plans in phases, validating telemetry and committing changes after each phase completes successfully"
version: 1.0.0
namespace: core
tools: read, write, grep, glob, WebSearch
platforms: [claude, opencode, gemini, pi, wocoder, antigravity, codex]
allowed-tools: [read, write, grep, glob, web_search]
dependencies: [ticket-manager]
---

# Ticket Executor Skill

Executes approved plans in phases, with validation and telemetry tracking after each phase.

## Commands
- `/implement_plan <ticket-id>` - Execute approved plan phase-by-phase
- `/execute_phase <ticket-id> <phase>` - Execute specific phase
