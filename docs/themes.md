# Themes

Wo supports customizable themes for the TUI interface.

## Overview

Themes control:
- Color palette (16 base colors + semantic colors)
- Syntax highlighting
- Component styling
- Status indicators

## Structure

```
themes/
├── my-theme/
│   ├── theme.json          # Theme definition
│   └── preview.png         # Optional preview
```

## Theme Format (theme.json)

```json
{
  "name": "my-theme",
  "version": "1.0.0",
  "description": "Custom theme description",
  "author": "Your Name",
  "colors": {
    "base": {
      "0": "#1a1b26",
      "1": "#16161e",
      "2": "#24283b",
      "3": "#414868",
      "4": "#565f89",
      "5": "#787c99",
      "6": "#a9b1d6",
      "7": "#c0caf5",
      "8": "#f7768e",
      "9": "#ff9e64",
      "10": "#e0af68",
      "11": "#9ece6a",
      "12": "#73daca",
      "13": "#b4f9f8",
      "14": "#2ac3de",
      "15": "#bb9af7"
    },
    "semantic": {
      "background": "base.0",
      "surface": "base.1",
      "border": "base.2",
      "text": "base.7",
      "textMuted": "base.5",
      "primary": "base.14",
      "secondary": "base.13",
      "accent": "base.11",
      "success": "base.11",
      "warning": "base.10",
      "error": "base.8",
      "info": "base.14"
    },
    "syntax": {
      "comment": "base.3",
      "keyword": "base.15",
      "string": "base.11",
      "number": "base.9",
      "function": "base.14",
      "variable": "base.7",
      "type": "base.12",
      "constant": "base.10"
    }
  }
}
```

## Built-in Themes

| Theme | Description |
|-------|-------------|
| `default` | Built-in dark theme |
| `tokyo-night` | Tokyo Night variant |
| `dracula` | Dracula variant |
| `nord` | Nord variant |
| `gruvbox` | Gruvbox variant |
| `catppuccin` | Catppuccin Mocha |

## Installation

### Via Harness

```bash
ai-harness --tool=wocoder --skill=themes --yes
```

### Manual

```bash
# Copy theme file to themes directory
cp my-theme.json ~/.wocoder/agent/themes/my-theme.json

# Or in project
cp my-theme.json .wo/agent/themes/my-theme.json
```

## Configuration

In `settings.json`:

```json
{
  "theme": "my-theme",
  "themeOverrides": {
    "colors.semantic.primary": "#ff6b6b"
  }
}
```

## Creating a Theme

1. Copy an existing theme as base
2. Modify `theme.json` colors
3. Test with `wocode --theme=my-theme`
4. Share or publish

## Theme Variables Reference

### Base Colors (0-15)
Standard 16-color terminal palette

### Semantic Colors
- `background` — Main background
- `surface` — Cards, panels, modals
- `border` — Borders, dividers
- `text` — Primary text
- `textMuted` — Secondary text
- `primary` — Primary actions, links
- `secondary` — Secondary actions
- `accent` — Highlights, focus
- `success` — Success states
- `warning` — Warning states
- `error` — Error states
- `info` — Info states

### Syntax Colors
Used for code highlighting in TUI

## Related

- [Wo Coder Guide](guides/wocoder/)
- [TUI Components](tui.md)
- [Keybindings](keybindings.md)
- [Settings](guides/wocoder/#configuration)