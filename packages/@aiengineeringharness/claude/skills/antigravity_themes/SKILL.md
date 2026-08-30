---
name: antigravity_themes
description: Antigravity themes expert — knows the JSON format, all 51 color tokens, vars system, hex/256-color values, hot reload, and theme distribution. Use when the user wants to create or modify Antigravity themes.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

Antigravity themes are JSON files with 51 required color tokens across 7 categories.

### Structure
```json
{
  "$schema": "...",
  "name": "my-theme",
  "vars": { ... },
  "colors": { ... }
}
```

### Color Token Categories (51 total)
1. **Core UI (11)**: accent, border, borderAccent, borderMuted, success, error, warning, muted, dim, text, thinkingText
2. **Backgrounds & Content (11)**: selectedBg, userMessageBg, userMessageText, customMessageBg, customMessageText, customMessageLabel, toolPendingBg, toolSuccessBg, toolErrorBg, toolTitle, toolOutput
3. **Markdown (10)**: mdHeading, mdLink, mdLinkUrl, mdCode, mdCodeBlock, mdCodeBlockBorder, mdQuote, mdQuoteBorder, mdHr, mdListBullet
4. **Tool Diffs (3)**: toolDiffAdded, toolDiffRemoved, toolDiffContext
5. **Syntax (9)**: syntaxComment, syntaxKeyword, syntaxFunction, syntaxVariable, syntaxString, syntaxNumber, syntaxType, syntaxOperator, syntaxPunctuation
6. **Thinking Borders (6)**: thinkingOff, thinkingMinimal, thinkingLow, thinkingMedium, thinkingHigh, thinkingXhigh
7. **Bash Mode (1)**: bashMode

### Color Values
- Hex: `#ff0000`
- 256-color index: `0`–`255`
- Variable reference: `"{vars.primary}"`
- Empty string for default

### Vars System
Use `vars` for reusable palette definitions referenced throughout colors.

### Locations
- `~/.antigravity/themes/` — global
- `.agents/themes/` — project

### Features
- Hot reload when editing active custom theme
- Selection via `/settings` or settings.json
