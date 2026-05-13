export interface Component {
  render(height?: number): string[];
  onKey?(key: KeyEvent): boolean;
}

export interface KeyEvent {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
}

export interface SelectItem<T = string> {
  value: T;
  label: string;
}

export interface AutocompleteItem {
  value: string;
  label: string;
}

export interface Theme {
  fg(color: string, text: string): string;
  bg(color: string, text: string): string;
  bold(text: string): string;
  dim(text: string): string;
  italic(text: string): string;
  link(text: string, url: string): string;
}

export interface MarkdownTheme {
  heading: (text: string, level: number) => string;
  code: (text: string) => string;
  inlineCode: (text: string) => string;
  link: (text: string, url: string) => string;
  list: (text: string, prefix: string) => string;
  bold: (text: string) => string;
  italic: (text: string) => string;
  blockquote: (text: string) => string;
  hr: () => string;
  paragraph: (text: string) => string;
}

export interface TUI {
  width: number;
  height: number;
  on(event: string, handler: (...args: unknown[]) => void): void;
  render(component: Component): void;
}

export interface Input {
  value: string;
  cursor: number;
  onKey(event: KeyEvent): boolean;
}

export interface OverlayOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  title?: string;
  border?: boolean;
  closeOnEscape?: boolean;
}

export type Severity = "info" | "warning" | "error" | "success";
