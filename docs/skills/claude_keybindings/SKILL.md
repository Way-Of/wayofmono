---
name: claude_keybindings
description: Claude Code keyboard shortcut expert — knows all default keybindings, context scopes, rebindable vs non-rebindable keys, terminal/OS reserved conflicts, and keybindings.json customization. Use when the user needs help with Claude Code keybindings or shortcuts.
docs-url: https://code.claude.com/docs/en/
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

# Claude Code Keybindings Reference

Claude Code supports custom keyboard shortcuts. Custom bindings are defined in `~/.claude/keybindings.json` and override the defaults.

## Configuration Format (`~/.claude/keybindings.json`)
The mapping matches action identifiers to key strings:
```json
{
  "chat:externalEditor": "ctrl+g",
  "chat:cancel": "escape",
  "app:toggleTodos": "ctrl+t"
}
```

---

## Reserved & Non-Rebindable Keys

### 1. Hardcoded Non-Rebindable (Cannot be overridden)
- `ctrl+c` — `app:interrupt` (interrupts current prompt/agents)
- `ctrl+d` — `app:exit` (exits the CLI application)
- `ctrl+m` — Identical to Enter in terminals (both send CR)

### 2. Terminal-Reserved Conflicts
- `ctrl+z` — Unix process suspend (SIGTSTP)
- `ctrl+\\` — Unix process quit (SIGQUIT)

### 3. macOS System Intercepts
- `cmd+c` / `cmd+v` / `cmd+x` — System clipboard operations.
- `cmd+q` / `cmd+w` — Quit app / Close window.
- `cmd+tab` / `cmd+space` — OS switcher / Spotlight search.

---

## Default Keyboard Shortcuts by Context

### 1. Global Actions
- `ctrl+l` — Redraw terminal window.
- `ctrl+t` — Toggle showing tasks/todos board.
- `ctrl+o` — Toggle displaying interactive transcript log view.
- `ctrl+shift+o` — Toggle teammate/agent swarm preview.
- `ctrl+r` — Open command history search.
- `ctrl+shift+f` — Global search across files.
- `ctrl+shift+p` — Quick open file picker.
- `meta+j` — Toggle terminal panel (if terminal panel feature is active).

### 2. Chat Mode Actions
- `escape` — Cancel current input / operation.
- `ctrl+x ctrl+k` — Kill all currently running subagents.
- `shift+tab` (or `meta+m` on Windows without VT) — Cycle mode (Interactive <-> Scripted).
- `meta+p` — Open model picker dropdown.
- `meta+o` — Toggle fast mode.
- `meta+t` — Toggle thinking model capability.
- `enter` — Submit prompt.
- `up` / `down` — Navigate through prompt history.
- `ctrl+x ctrl+e` (or `ctrl+g`) — Open prompt in your `$EDITOR` (external editor).
- `ctrl+s` — Stash current prompt input buffer.
- `ctrl+v` (or `alt+v` on Windows) — Paste image path.
- `shift+up` — Show message actions menu.
- `space` — Hold-to-talk voice activation (when voice mode is enabled).

### 3. Autocomplete Panel
- `tab` — Accept auto-completed suggestion.
- `escape` — Dismiss auto-completed suggestions list.
- `up` / `down` — Navigate through suggestion items.

### 4. Settings Configuration Panel
- `escape` — Cancel / Exit settings list.
- `up` / `down` (or `j` / `k` / `ctrl+n` / `ctrl+p`) — Move focus between items.
- `space` — Accept or toggle the selected settings parameter.
- `enter` — Save and close settings panel.
- `/` — Enter query search mode.
- `r` — Retry loading usage data.

### 5. Confirmation / Dialog Modals
- `y` / `n` / `enter` / `escape` — Agree / Disagree.
- `up` / `down` — Navigate dialog choices.
- `tab` — Move focus to the next input field.
- `space` — Toggle boolean checkboxes.
- `shift+tab` — Cycle permission dialog modes.
- `ctrl+e` — Toggle details or explanation.
- `ctrl+d` — Toggle permission debug output view.
