# TUI Components

Wo Coder's Terminal User Interface built with React Ink.

## Overview

The TUI provides:
- Real-time tool execution display
- Expandable header with help
- Session management (fork, tree, resume)
- Model cycling and selection
- Custom component support

## Architecture

```
packages/@wayofmono/wo-tui/
├── src/
│   ├── components/         # React Ink components
│   │   ├── Header.tsx      # Expandable header
│   │   ├── ToolDisplay.tsx # Tool execution view
│   │   ├── SessionTree.tsx # Session visualization
│   │   ├── ModelSelector.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── themes/             # Theme integration
│   └── index.ts            # Public API
```

## Built-in Components

### Header

Expandable header showing:
- Project name
- Current model
- Session status
- Help toggle (press `?`)

```tsx
import { Header } from '@wayofmono/wo-tui';

<Header
  projectName="my-project"
  model="qwen3.5:9b"
  sessionId="abc-123"
  onHelpToggle={() => {}}
/>
```

### ToolDisplay

Real-time tool execution with:
- Tool name and parameters
- Streaming output
- Duration timing
- Error states

```tsx
import { ToolDisplay } from '@wayofmono/wo-tui';

<ToolDisplay
  tools={toolExecutions}
  onExpand={handleExpand}
/>
```

### SessionTree

Visual session history with:
- Fork points
- Branch visualization
- Resume capability

```tsx
import { SessionTree } from '@wayofmono/wo-tui';

<SessionTree
  sessions={sessionHistory}
  currentSessionId="abc-123"
  onSelect={handleSelect}
/>
```

### ModelSelector

Cycle through configured models:
- Provider switching
- Model selection
- Quick switch (press `M`)

```tsx
import { ModelSelector } from '@wayofmono/wo-tui';

<ModelSelector
  models={configuredModels}
  currentModel="qwen3.5:9b"
  onChange={handleModelChange}
/>
```

## Custom Components

Create custom TUI components:

```tsx
// MyComponent.tsx
import { useApp } from 'ink';
import { Box, Text } from '@wayofmono/wo-tui';

export const MyComponent = ({ data }) => {
  const { theme } = useApp();
  
  return (
    <Box borderStyle="round" borderColor={theme.colors.semantic.border}>
      <Text color={theme.colors.semantic.primary}>
        {data.title}
      </Text>
    </Box>
  );
};
```

Register in settings:

```json
{
  "tui": {
    "customComponents": {
      "my-component": "./MyComponent"
    }
  }
}
```

## Hooks

### useTheme

```tsx
import { useTheme } from '@wayofmono/wo-tui';

const { colors, spacing } = useTheme();
```

### useKeybindings

```tsx
import { useKeybindings } from '@wayofmono/wo-tui';

useKeybindings({
  'ctrl+c': handleCancel,
  'ctrl+r': handleRefresh,
});
```

### useSession

```tsx
import { useSession } from '@wayofmono/wo-tui';

const { session, fork, resume } = useSession();
```

## Theming

TUI components automatically adapt to theme:

```json
{
  "colors": {
    "semantic": {
      "background": "base.0",
      "surface": "base.1",
      "border": "base.2",
      "text": "base.7",
      "primary": "base.14",
      "accent": "base.11"
    }
  }
}
```

## Keybindings (Default)

| Key | Action |
|-----|--------|
| `?` | Toggle help |
| `M` | Cycle model |
| `F` | Fork session |
| `R` | Resume session |
| `T` | Session tree |
| `Ctrl+C` | Cancel/interrupt |
| `Ctrl+L` | Clear screen |

Customize in `settings.json`:

```json
{
  "keybindings": {
    "toggleHelp": "f1",
    "cycleModel": "f2"
  }
}
```

## Extending TUI

### Custom Renderer

```typescript
import { render } from 'ink';
import { App } from './App';

render(<App />, {
  patchConsole: true,
  stdout: process.stdout
});
```

### Custom Layout

```tsx
import { Box, Flex } from 'ink';
import { Header, ToolDisplay, SessionTree } from '@wayofmono/wo-tui';

export const CustomLayout = () => (
  <Flex direction="column">
    <Header />
    <Flex direction="row">
      <Box width="70%">
        <ToolDisplay />
      </Box>
      <Box width="30%">
        <SessionTree />
      </Box>
    </Flex>
  </Flex>
);
```

## Related

- [Wo Coder Guide](guides/wocoder/)
- [Themes](themes.md)
- [Keybindings](keybindings.md)
- [wo-tui package](https://www.npmjs.com/package/@wayofmono/wo-tui)