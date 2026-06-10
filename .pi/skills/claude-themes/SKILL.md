---
name: claude-themes
description: Claude Code themes expert — knows all 7 built-in theme presets, RGB true color definitions, ANSI-only fallbacks, daltonized (color-blind friendly) options, and interactive /theme picker usage. Use when the user wants to inspect or switch Claude Code themes.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

# Claude Code Themes Reference

Unlike Antigravity which allows 51-token custom JSON themes, Claude Code relies on a set of 7 pre-defined, high-quality themes. These themes support both 24-bit true color (RGB) systems and 16-color legacy ANSI terminals.

---

## The 7 Built-in Theme Presets

### 1. Auto (`auto`)
Dynamically matches the host terminal's background dark/light mode preference.

### 2. Dark Mode (`dark`)
High-contrast dark mode. Uses explicit true color RGB values for main text, code blocks, diff highlighting, and subagents.
- Claude brand color: `rgb(215, 119, 87)` (orange)
- Success: `rgb(78, 186, 101)` (green)
- Error: `rgb(255, 107, 128)` (red)

### 3. Light Mode (`light`)
High-contrast light mode optimized for light backgrounds.
- Claude brand color: `rgb(215, 119, 87)`
- Success: `rgb(44, 122, 57)` (dark green)
- Error: `rgb(171, 43, 63)` (dark red)

### 4. Dark Daltonized (`dark-daltonized`)
Colorblind-friendly dark theme adjusted for deuteranopia/protanopia.
- Replaces success greens with distinct blue hues: `rgb(51, 153, 255)`.
- Adjusts yellows and reds for maximum readability.

### 5. Light Daltonized (`light-daltonized`)
Colorblind-friendly light theme optimized for light backgrounds.
- Replaces success green with blue: `rgb(0, 102, 153)`.

### 6. Dark ANSI (`dark-ansi`)
Fallback theme for terminals without true-color (24-bit) capabilities. Restricts colors to standard 16 ANSI escape codes.
- Success: `ansi:greenBright`
- Error: `ansi:redBright`

### 7. Light ANSI (`light-ansi`)
Fallback light theme for terminals lacking true-color support.
- Success: `ansi:green`
- Error: `ansi:red`

---

## Managing Themes

### Selection Command
Run the theme picker command in conversation:
```
/theme
```
This launches the interactive Ink-based dropdown list selector. Press `Up`/`Down` (or `j`/`k`/`ctrl+n`/`ctrl+p`) to navigate, `Space` to preview and apply, or `Enter` to save and exit.

### Configuration file (`settings.json`)
You can manually define your theme in the config file using the `theme` key:
```json
{
  "theme": "dark-daltonized"
}
```
If you wish to disable syntax highlighting entirely across all themes, add:
```json
{
  "syntaxHighlightingDisabled": true
}
```
