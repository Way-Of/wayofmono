---
name: self-documentation
description: Enables Wo to answer "How do I...?" and "What's the command for...?" questions by searching its own commands, skills, and documentation locally
allowed-tools: read, write, bash, glob, grep
---

# Self-Documentation skill

## Overview

This skill enables Wo (the coding agent) to answer questions like "How do I...?" and "What's the command for...?" by searching its own built-in commands, extension commands, skills, keybindings, and documentation locally — without any external API calls.

## When to Use

This skill auto-triggers when the user asks:
- "How do I...?"
- "What's the command for...?"
- "How can I...?"
- "I want to..."
- "Show me how to..."
- "What is Wo?" / "Who built Wo?" / "Tell me about Wo" / "About Wo"

## Core Functionality

Search through built-in slash commands, extension commands, skills, keybindings, and file documentation to answer "How do I...?" questions.

### Sources Searched
1. Builtin slash commands
2. Extension commands
3. Available skills
4. Keybindings
5. Markdown documentation files

### Search Algorithm
1. Normalize query (e.g., "How do I list files?" → "list files")
2. Multi-source search
3. Rank results (exact matches first)
4. Deduplicate
5. Format response

### Response Format
For each match, provide:
- Command/skill name
- Description
- How to use
- Keybinding (if applicable)
- Related commands
- File references

## Fallback

If no exact match found:
1. Fuzzy matching via string similarity
2. Keyword expansion
3. Contextual suggestions
4. General help categories

## Configuration

```json
{
  "self-documentation": {
    "enabled": true,
    "max_results": 5,
    "include_keybindings": true,
    "include_file_references": true,
    "fuzzy_threshold": 0.6
  }
}
```
