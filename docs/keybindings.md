# Keybindings

Customizable keyboard shortcuts for Wo Coder TUI.

## Overview

Keybindings control all keyboard interactions in the TUI. Configured via `settings.json`.

## Configuration

In `settings.json`:

```json
{
  "keybindings": {
    "global": {
      "quit": ["ctrl+c", "ctrl+q"],
      "help": ["f1", "?"],
      "commandPalette": ["ctrl+p", "ctrl+shift+p"]
    },
    "session": {
      "fork": ["f", "ctrl+f"],
      "resume": ["r", "ctrl+r"],
      "tree": ["t", "ctrl+t"],
      "new": ["n", "ctrl+n"]
    },
    "model": {
      "cycle": ["m", "ctrl+m"],
      "select": ["ctrl+shift+m"]
    },
    "editor": {
      "open": ["e", "ctrl+e"],
      "save": ["ctrl+s"],
      "close": ["ctrl+w"]
    },
    "navigation": {
      "up": ["up", "k"],
      "down": ["down", "j"],
      "left": ["left", "h"],
      "right": ["right", "l"],
      "pageUp": ["pageup", "ctrl+u"],
      "pageDown": ["pagedown", "ctrl+d"]
    },
    "tools": {
      "interrupt": ["ctrl+c"],
      "retry": ["ctrl+r"],
      "expand": ["enter", "space"],
      "collapse": ["backspace", "escape"]
    },
    "ui": {
      "toggleHeader": ["h", "ctrl+h"],
      "toggleSidebar": ["s", "ctrl+b"],
      "fullscreen": ["f11"],
      "theme": ["ctrl+shift+t"]
    }
  }
}
```

## Key Format

- Single keys: `"a"`, `"enter"`, `"escape"`, `"tab"`
- Modifiers: `"ctrl+a"`, `"shift+enter"`, `"alt+f"`, `"meta+k"` (macOS)
- Combinations: `"ctrl+shift+p"`, `"ctrl+alt+delete"`
- Function keys: `"f1"` through `"f12"`

## Reserved Keys

Cannot be overridden:
- `ctrl+c` — Always interrupts (SIGINT)
- `ctrl+d` — EOF (exit stdin)
- `ctrl+z` — Suspend (SIGTSTP)

## Context-Specific Bindings

### Chat Mode
```json
{
  "chat": {
    "submit": ["enter"],
    "newline": ["shift+enter", "alt+enter"],
    "historyUp": ["up"],
    "historyDown": ["down"],
    "clear": ["ctrl+l"],
    "paste": ["ctrl+v"]
  }
}
```

### Tool Display
```json
{
  "toolDisplay": {
    "expand": ["enter", "right"],
    "collapse": ["backspace", "left", "escape"],
    "scrollUp": ["up", "k"],
    "scrollDown": ["down", "j"],
    "retry": ["r"],
    "copy": ["c", "ctrl+c"]
  }
}
```

### Session Tree
```json
{
  "sessionTree": {
    "select": ["enter"],
    "fork": ["f"],
    "delete": ["d", "delete"],
    "rename": ["r"],
    "close": ["escape", "q"]
  }
}
```

## Platform Differences

| Key | Linux/Windows | macOS |
|-----|--------------|-------|
| Meta | `ctrl` | `meta` (⌘) |
| Alt | `alt` | `alt` (⌥) |
| Ctrl | `ctrl` | `ctrl` (^) |

Use `meta` for macOS Command key:
```json
"commandPalette": ["ctrl+p", "meta+p"]
```

## Dynamic Keybindings

Load per-project keybindings:

```json
// .wo/settings.json
{
  "keybindings": {
    "global": {
      "deploy": ["ctrl+d"]  // Project-specific
    }
  }
}
```

## Keybinding Conflicts

Resolution order (highest wins):
1. Current mode (chat, tool, tree)
2. Global bindings
3. Built-in defaults

Conflicts logged on startup.

## Debugging

List all active bindings:
```
Wo, show keybindings
```

Or in TUI: Press `F1` → Keybindings tab.

## Related

- [Wo Coder Guide](guides/wocode/)
- [TUI Components](tui.md)
- [Themes](themes.md)
- [Settings](guides/wocode/#configuration)