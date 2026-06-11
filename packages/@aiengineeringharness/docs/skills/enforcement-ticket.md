---
name: enforcement-ticket
description: "Enforce English language requirement across all tickets and skills"
version: 1.0.0
namespace: enforcement
tools: read, write, grep
platforms: [claude, opencode, gemini, pi, wocoder, antigravity, codex]
allowed-tools: [read, write, grep]
dependencies: [ticket-manager]
---

# Enforcement Ticket Skill

Ensures all tickets and skills documentation are in English only.

## Commands

- `/enforce-language <path>` - Check and fix language violations
- `/validate-tickets` - Validate all tickets are in English
- `/update-skills` - Update skill docs to English

## Violations Caught

- Skills with non-English content
- Tickets with mixed languages
- User-facing docs in other languages

## Fix Process

1. Detect non-English content
2. Generate English translation
3. Preserve content structure
4. Commit changes
