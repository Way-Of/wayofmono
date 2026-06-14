---
name: self-documentation
description: Enables Wo to answer "How do I...?" and "What's the command for...?" questions by searching its own commands, skills, and documentation locally
version: 1.0.0
namespace: wocoder
category: help
tags:
  - help
  - documentation
  - self-help
  - commands
  - skills
  - about
author: WayOfMono
status: active
---

# Self-Documentation Skill

## Overview

This skill enables Wo (the coding agent) to answer questions like "How do I...?" and "What's the command for...?" by searching its own built-in commands, extension commands, skills, keybindings, and documentation locally — without any external API calls.

It also knows **what Wo Coder is**, **who built it**, and **how it fits into the WayOfMono ecosystem**.

## When to Use

This skill auto-triggers when the user asks:
- "How do I...?" (e.g., "How do I list files?")
- "What's the command for...?" (e.g., "What's the command for opening external editor?")
- "How can I...?" (e.g., "How can I search my codebase?")
- "I want to...?" (e.g., "I want to export my session")
- "Show me how to...?" (e.g., "Show me how to use skills")

## Core Functionality

### Pattern Recognition

The skill uses regex patterns to detect and parse user questions:

```regex
# Question patterns
- "How do I (.*?)\??"
- "What'?s the command for (.*?)\??"
- "How can I (.*?)\??"
- "I want to (.*?)"
- "Show me how to (.*?)\??"
```

### Information Sources

The skill searches through multiple local sources:

1. **Builtin Slash Commands** — From `packages/@wayofmono/wo-coding-agent/src/core/slash-commands.ts`
2. **Extension Commands** — Commands registered by loaded extensions
3. **Skills** — Available skills from the skill registry
4. **Keybindings** — Keyboard shortcuts from `packages/@wayofmono/wo-coding-agent/src/core/keybindings.ts`
5. **File Documentation** — Markdown files and code comments in the codebase

### Response Format

For each match, the skill provides a structured response:

```
📋 **Command: [command-name]**

**Description**: [What the command does]

**How to Use**: [Step-by-step instructions or examples]

**Keybinding**: [Keyboard shortcut if applicable]

**Related Commands**: [Similar commands that might be useful]

**File References**: [Links to relevant source files]
```

## Example Responses

### Example 1: "How do I list files?"

```
📋 **Command: ls**

**Description**: List files and directories in the current location

**How to Use**: Run `ls` to see all files in the current directory

**Keybinding**: Ctrl+L (quick access)

**Related Commands**:
- `ls -la`: Show all files including hidden ones
- `ls --tree`: Show directory structure

**File References**: packages/@wayofmono/wo-coding-agent/src/core/tools/ls.d.ts
```

### Example 2: "What's the command for opening external editor?"

```
📝 **Command: external-editor**

**Description**: Open the current session in an external text editor

**How to Use**: Press Ctrl+G or type "external-editor" in the command palette

**Keybinding**: Ctrl+G

**Related Commands**:
- `edit`: Edit files inline
- `export`: Export session to file

**File References**: packages/@wayofmono/wo-coding-agent/src/core/keybindings.ts
```

### Example 3: "How do I search my codebase?"

```
🔍 **Skill: research_codebase**

**Description**: Conduct comprehensive codebase research by delegating to parallel sub-agents

**How to Use**: Ask Wo "Research how X works" or use `/research_codebase` command

**Keybinding**: None (slash command)

**Related Commands**:
- `/help search <term>`: Search across skills/commands/agents/docs
- `codebase_pattern_finder`: Find similar implementations

**File References**: packages/@aiengineeringharness/skills/research_codebase/SKILL.md
```

## Implementation

The skill consists of:

1. **SKILL.md** — This definition file (frontmatter + documentation)
2. **self-documentation.ts** — Deno/TypeScript implementation that:
   - Parses user questions using regex patterns
   - Searches through builtin commands, skills, and keybindings
   - Returns formatted responses with file references
   - Works entirely locally (no external API calls)

### Command Search Algorithm

1. **Normalize Query**: Convert "How do I list files?" to search term "list files"
2. **Multi-Source Search**: Search through commands, skills, keybindings, and documentation
3. **Rank Results**: Prioritize exact matches over partial matches
4. **Deduplicate**: Remove duplicate results
5. **Format Response**: Present results in user-friendly format

### File Reference System

The skill maintains a mapping of:
- Command Names → Source files
- Skills → Their implementation files
- Themes → Their configuration files
- Extensions → Their registration files
- Keybindings → Their definition files

### Fallback Mechanisms

If exact matches are not found:
1. **Fuzzy Matching**: Use string similarity to find closest matches
2. **Keyword Expansion**: Expand terms to related concepts
3. **Contextual Suggestions**: Provide suggestions based on current context
4. **General Help**: Offer broader categories of commands

## Development Guidelines

### Command Categories

The skill is organized by command categories:

1. **File Operations**: ls, read, edit, write, bash, glob, grep
2. **Session Management**: new, resume, save, export, import, fork, clone
3. **AI/Assistant**: model, thinking, tools, chat, thinking-level
4. **UI/Navigation**: settings, help, hotkeys, quit, theme
5. **Extensions**: extension, skill, prompt, agent

### File References Format

Each file reference includes:
- Relative path from package root
- Brief description of the file's purpose
- Function/class names relevant to the command

### Performance Considerations

- **Caching**: Cache search results for frequently asked questions
- **Indexing**: Maintain index of commands for faster lookup
- **Lazy Loading**: Load detailed information only when needed
- **Size Limits**: Limit response size to prevent overwhelming users

## Configuration

The skill can be configured via settings:

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

## Testing

### Test Cases

1. **Exact Matches**: Test with exact command names
2. **Partial Matches**: Test with partial command descriptions
3. **Fuzzy Matching**: Test with typos or similar commands
4. **Pattern Recognition**: Test with different question formats
5. **Edge Cases**: Test with ambiguous or unclear questions

### Acceptance Criteria

- [ ] Skill correctly parses "How do I...?" questions
- [ ] Skill correctly parses "What's the command for...?" questions
- [ ] Skill provides accurate command descriptions
- [ ] Skill includes file references for all commands
- [ ] Skill provides related commands when appropriate
- [ ] Skill handles ambiguous queries gracefully
- [ ] Skill works without external API calls
- [ ] Skill responses are user-friendly and well-formatted