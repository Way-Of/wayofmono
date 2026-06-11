---
name: antigravity_keybindings
description: Antigravity keyboard shortcut expert — knows registerShortcut(), Key IDs, modifier combos, reserved keys, terminal compatibility (macOS/Kitty/legacy), and keybindings.json customization. Use when the user needs help with Antigravity keybindings or shortcuts.
docs-url: 
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

## registerShortcut() API
```ts
antigravity.registerShortcut(keyId, { description, handler })
// Handler: async (ctx: ExtensionContext) => void
// Always guard: if (!ctx.hasUI) return;
```

### Key ID Format
`[modifier+[modifier+]]key` — lowercase. Modifiers: `ctrl`, `shift`, `alt`. Base keys: letters a-z, special keys (escape, enter, tab, etc.), function keys f1-f12, symbols.

### Reserved Keys (CANNOT override)
`escape`, `ctrl+c`, `ctrl+d`, `ctrl+z`, `shift+tab`, `ctrl+p`, `ctrl+shift+p`, `ctrl+l`, `ctrl+o`, `ctrl+t`, `ctrl+g`, `alt+enter`, `enter`, `ctrl+k`

### Safe Keys for Extensions
- `ctrl+x` — confirmed working
- Function keys `f1`–`f12` — all unbound

### macOS Compatibility
| Combo | Legacy Terminal | Kitty Protocol |
|-------|----------------|----------------|
| `ctrl+letter` | YES | YES |
| `alt+letter` | NO | YES |
| `ctrl+shift+letter` | NO | YES |
| Function keys | YES | YES |

### Keybindings.json
- Location: `~/.antigravity/keybindings.json`
- Format: `{ "actionName": ["key1", "key2"] }`
- Users can remap any action

### Debugging
Run `agy --verbose` to see shortcut conflicts in `[Extension issues]` section.
