---
name: claude-tui
description: Claude Code TUI expert — knows React Ink framework, design system components, hooks (useInput, useTerminalFocus, etc.), and custom terminal rendering. Use when the user wants to build or modify Claude Code TUI components.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

# Claude Code TUI Reference

Claude Code constructs its terminal user interface (TUI) using **React** and **Ink** (a React-based terminal rendering library). Ink translates React component trees into ANSI escape sequences.

---

## TUI Architecture & Layout

### 1. The Core Design System (`src/components/design-system/`)
Claude Code wraps default Ink components with a `ThemeProvider` to automatically apply the user's active theme.
- **ThemedBox** (`Box`) — Layout container supporting standard Flexbox options (row, column, align, justify).
- **ThemedText** (`Text`) — Typography rendering with colors matching semantic theme variables (success, error, warning, permission, text, suggestion).
- **Pane** (`Pane`) — Bordered panel components used to enclose specific dialog scopes.
- **Divider** (`Divider`) — Horizontal terminal line splitters.
- **KeyboardShortcutHint** — Renders button key suggestions (e.g., `[y/n]`).

### 2. High-Level Interactive Controls
- **Dialog** — Handles permission confirmations, yes/no queries, and alert prompts.
- **FuzzyPicker** — Interactive autocomplete filter list (used for model picker, fast mode switches).
- **Tabs** — Multi-tab layouts for navigating workspace lists (like sessions or configs).
- **LoadingState** / **ProgressBar** — UI spinners and progress bars.
- **Ratchet** — Animated visual transitions.

---

## Standard React Ink Hooks (`src/ink.ts`)

- `useInput(handler: (input: string, key: Key) => void)` — Listens for interactive keyboard keys:
  - Check modifiers: `key.ctrl`, `key.meta`, `key.shift`.
  - Check specific actions: `key.upArrow`, `key.downArrow`, `key.escape`, `key.return`.
- `useTerminalViewport()` — Returns dynamic terminal dimensions: `{ columns, rows }`.
- `useTerminalFocus()` — Tracks active focus state of widgets.
- `useAnimationFrame(callback: () => void)` — Renders animation loop updates.
- `useApp()` — Hook to programmatically trigger application exit.

---

## Code Example: Basic Component
```tsx
import * as React from 'react';
import { Box, Text, useInput, useApp } from './ink.js';

export function QuitNotifier() {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="success" bold>Hello World from Claude Code!</Text>
      <Text dimColor>Press 'q' to exit this view.</Text>
    </Box>
  );
}
```

---

## Custom CLI Render Rules
1. **Never write raw ANSI strings** — Always use the theme-aware `<Text>` or color helper functions.
2. **Handle Terminal Resizing** — Observe columns/rows from `useTerminalViewport` to avoid text wrapping bugs.
3. **Guard Inputs** — Ensure keyboard listeners from `useInput` only intercept inputs when the component is focused.
