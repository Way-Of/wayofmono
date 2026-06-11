---
name: pi_tui
description: Pi TUI expert — knows all built-in components (Text, Box, Container, Markdown, Image, SelectList, SettingsList, BorderedLoader), custom components, overlays, keyboard input, widgets, footers, and custom editors. Use when the user wants to build Pi TUI components.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

## Component Interface
- `render(width: number): string[]` — lines must not exceed width
- `handleInput?(data: string)` — keyboard input when focused
- `invalidate()` — clear cached render state

## Built-in Components
- **Text**: multi-line with word wrapping, paddingX/Y, background
- **Box**: container with padding and background
- **Container**: groups children vertically
- **Markdown**: renders markdown with syntax highlighting
- **Image**: renders images (Kitty, iTerm2, Ghostty, WezTerm)
- **SelectList**: selection dialog with theme
- **SettingsList**: toggle settings with theme
- **DynamicBorder**: border with color function — type param `(s: string) =>`
- **BorderedLoader**: spinner with abort support
- **CustomEditor**: base class for custom editors

## Keyboard Input
- `matchesKey(data, Key.up/down/enter/escape/etc.)`
- `Key.ctrl("c")`, `Key.shift("tab")`, `Key.alt("left")`, `Key.ctrlShift("p")`

## UI Patterns
1. Selection dialog: SelectList + DynamicBorder + `ctx.ui.custom()`
2. Async with cancel: BorderedLoader with signal
3. Settings/toggles: SettingsList + `getSettingsListTheme()`
4. Status: `ctx.ui.setStatus(key, styledText)`
5. Widgets: `ctx.ui.setWidget(key, lines, { placement })`
6. Footer: `ctx.ui.setFooter(factory)`
7. Custom editor: extend CustomEditor, `ctx.ui.setEditorComponent(factory)`
8. Overlays: `ctx.ui.custom(component, { overlay: true })`

## Theming
- `theme.fg(color, text)` — foreground
- `theme.bg(color, text)` — background
- `theme.bold(text)` — bold
- `getMarkdownTheme()` for Markdown components

## Key Rules
1. Always use theme from callback, not imported directly
2. Always type DynamicBorder color param: `(s: string) =>`
3. Call `tui.requestRender()` after state changes in handleInput
4. Return `{ render, invalidate, handleInput }` for custom components
5. Cache rendered output with cachedWidth/cachedLines pattern
