# @wayofmono/wo-tui

High-Performance Terminal UI Library for the Wo ecosystem. ANSI rendering primitives, widgets, text utilities, and theme support.

```
npm install @wayofmono/wo-tui
```

## Usage

```ts
import { Text, Box, Container, SelectList, Markdown, truncateToWidth, createDefaultTheme, matchesKey, Key } from "@wayofmono/wo-tui";

// Render components
const text = new Text("Hello World", 0, 0, { color: "cyan", bold: true });
const lines = text.render(); // => ["\x1b[36m\x1b[1mHello World\x1b[22m\x1b[39m"]

// Box with border
const box = new Box({ width: 40, height: 5, border: true, title: "Status" });
box.add(new Text("Running...", 1, 0));
box.render();

// Container layout
const container = new Container({ direction: "vertical", gap: 1 });
container.add(new Text("Line 1"));
container.add(new Text("Line 2"));

// Interactive select list
const list = new SelectList({
  items: [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ],
  prompt: "Choose:",
  onSubmit: (value) => console.log("Selected:", value),
});
list.onKey({ key: "ArrowDown" }); // navigate
list.onKey({ key: "Enter" }); // submit

// Markdown rendering
const md = new Markdown("# Hello\nThis is **bold** and `code`");
console.log(md.render().join("\n"));

// Text utilities
truncateToWidth("Long text here", 10); // "Long text…"
visibleWidth("\x1b[31mRed\x1b[39m"); // 3
wrapTextWithAnsi("Long line to wrap", 20); // string[]
matchesKey({ key: "c", ctrl: true }, "ctrl+c"); // true
```

## API

### Components
| Class | Description |
|-------|-------------|
| `Text` | Styled text element with color, bold, dim, italic |
| `Box` | Bordered container with title and padding |
| `Container` | Flexbox-like layout (horizontal/vertical) |
| `Spacer` | Empty space element |
| `SelectList` | Interactive selectable list with keyboard nav |
| `Markdown` | Markdown to ANSI renderer |
| `Image` | Kitty protocol image display |

### Text Utilities
| Function | Description |
|----------|-------------|
| `truncateToWidth(text, maxWidth)` | Truncate with ellipsis by visible width |
| `visibleWidth(text)` | Visible character width (accounts for ANSI) |
| `wrapTextWithAnsi(text, width)` | Word-wrap preserving ANSI codes |
| `stripAnsi(text)` | Strip all ANSI escape codes |

### Theme
| Function | Description |
|----------|-------------|
| `createDefaultTheme()` | Create default ANSI theme |
| `getMarkdownTheme(theme)` | Create markdown theme from base theme |

### Keyboard
| Function | Description |
|----------|-------------|
| `Key` | Key constants (Enter, Escape, ArrowUp, etc.) |
| `matchesKey(event, keyDef)` | Check if event matches key definition (e.g. `"ctrl+c"`) |
| `getKeybindings()` | Get default keybinding map |

### Image / Terminal
| Function | Description |
|----------|-------------|
| `allocateImageId()` | Allocate Kitty protocol image ID |
| `deleteKittyImage(id)` | Delete displayed Kitty image |
| `getCapabilities()` | Detect terminal capabilities (kitty, sixel, trueColor) |

## Types

`Component`, `KeyEvent`, `SelectItem<T>`, `AutocompleteItem`, `Theme`, `MarkdownTheme`, `TUI`, `Input`, `OverlayOptions`, `Severity`, `TextOptions`, `BoxOptions`, `ContainerOptions`, `Direction`, `SelectListOptions`
