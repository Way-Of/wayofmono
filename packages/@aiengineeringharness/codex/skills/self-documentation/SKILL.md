---
name: self_documentation
description: Enables Wo to answer "How do I...?" and "What's the command for...?" questions by searching its own commands, skills, and documentation locally
---

# Self-Documentation Guide

## Overview

This skill enables Wo (the coding agent) to answer questions like "How do I...?" and "What's the command for...?" by searching its own built-in commands, skills, and documentation locally.

## When to Use

This skill triggers when the user asks:
- "How do I...?"
- "What's the command for...?"
- "How can I...?"
- "I want to..."
- "Show me how to..."

## Sources Searched

1. Builtin slash commands
2. Extension commands
3. Available skills
4. Keybindings
5. Markdown documentation files

## Search Algorithm

1. Normalize query
2. Multi-source search
3. Rank results (exact matches first)
4. Deduplicate
5. Format response

## Response Format

For each match, provide:
- Command/skill name
- Description
- Keybinding (if applicable)
- Related commands
- File references
