---
name: build_auto_ticket_creator
description: "Monitor codebase, dependencies, and external sources to auto-create tickets for agent updates, skill updates, dep updates, security advisories"
version: 1.0.0
namespace: core
tools: read, write, grep, glob, WebSearch
platforms: [claude, opencode, gemini, pi, wocoder, antigravity, codex]
allowed-tools: [read, write, grep, glob, web_search]
dependencies: [ticket-manager]
---

# Build Auto-Ticket Creation Skill

Autonomously monitors the codebase, dependencies, and external sources for updates, and automatically creates tickets.
