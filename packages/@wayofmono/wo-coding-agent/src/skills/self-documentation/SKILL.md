SKILL.md
name: self-documentation
description: Helps users find commands and get explanations for "How do I...?" and "What's the command for...?" questions
time_created: 2026-06-13
status: planned
allowed_tools:
  - file-processor
  - tools-manager
  - bash

# Self-Documentation Skill

## Overview

This skill enables Wo to answer questions like "How do I...?" and "What's the command for...?" by searching its own documentation, commands, and skills locally without using external API calls.

## When to Use

Use this skill when:
- User asks "How do I...?" (e.g., "How do I list files?")
- User asks "What's the command for...?" (e.g., "What's the command for opening external editor?")
- User needs contextual help for Wo's own commands and features
- User wants to know how to use or extend Wo's capabilities

## Core Functionality

### Pattern Recognition

The skill uses regex patterns to detect and parse user questions:

```
Patterns:
- "How do I (.*?)?"
- "What's the command for (.*?)?"
- "How can I (.*?)?"
- "I want to (.*?)"
- "Show me how to (.*?)"
```

### Information Sources

The skill searches through multiple sources for relevant information:

1. **Builtin Slash Commands**: Search through `BUILTIN_SLASH_COMMANDS`
2. **Extension Commands**: Search through extension-registered commands
3. **Skill Descriptions**: Search through available skills
4. **Keybindings**: Search for relevant keyboard shortcuts
5. **File Documentation**: Search through .md files and comments in the codebase

### Response Format

For each match, the skill provides:
- **Command/Feature**: The relevant command or feature name
- **Description**: Clear explanation of what it does
- **How to Use**: Step-by-step instructions or examples
- **Related Commands**: Similar commands that might be useful
- **File References**: Links to relevant source files
- **Keybindings**: Keyboard shortcuts if applicable

### Example Responses

**Question**: "How do I list files?"

**Response**:
```
📋 **Command: ls**

**Description**: List files and directories in the current location

**How to Use**: Run `ls` to see all files in the current directory

**Related Commands**:
- `ls -la`: Show all files including hidden ones
- `ls --tree`: Show directory structure

**Keybinding**: Ctrl+L (quick access)

**File References**: packages/@wayofmono/wo-coding-agent/src/core/tools/ls.d.ts
```

**Question**: "What's the command for opening external editor?"

**Response**:
```
📝 **Command: external-editor**

**Description**: Open the current session in an external text editor

**How to Use**: Press Ctrl+G or type "external-editor" in the command palette

**Related Commands**:
- `edit`: Edit files inline
- `export`: Export session to file

**Keybinding**: Ctrl+G

**File References**: packages/@wayofmono/wo-coding-agent/src/core/keybindings.ts
```

## Implementation Details

### Command Search Algorithm

1. **Normalize Query**: Convert "How do I list files?" to search term "list files"
2. **Multi-Source Search**: Search through commands, skills, and documentation
3. **Rank Results**: Prioritize exact matches over partial matches
4. **Deduplicate**: Remove duplicate results
5. **Format Response**: Present results in user-friendly format

### File Reference System

The skill maintains a mapping of:
- **Command Names**: To source files
- **Skills**: To their implementation files
- **Themes**: To their configuration files
- **Extensions**: To their registration files

This enables the skill to provide accurate file references for all commands and features.

### Fallback Mechanisms

If exact matches are not found:
1. **Fuzzy Matching**: Use string similarity to find closest matches
2. **Keyword Expansion**: Expand terms to related concepts
3. **Contextual Suggestions**: Provide suggestions based on current context
4. **General Help**: Offer broader categories of commands

## Development Guidelines

### Command Categories

The skill should be organized by command categories:

1. **File Operations**: ls, read, edit, write, bash
2. **Session Management**: new, resume, save, export, import
3. **AI/Assistant**: model, thinking, tools, chat
4. **UI/Navigation**: settings, help, hotkeys, quit
5. **Extensions**: extension, skill, theme, prompt

### File References Format

Each file reference should include:
- Relative path from package root
- Brief description of the file's purpose
- Function/class names relevant to the command
- Any configuration or documentation files

### Performance Considerations

- **Caching**: Cache search results for frequently asked questions
- **Indexing**: Maintain index of commands for faster lookup
- **Lazy Loading**: Load detailed information only when needed
- **Size Limits**: Limit response size to prevent overwhelming users

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
