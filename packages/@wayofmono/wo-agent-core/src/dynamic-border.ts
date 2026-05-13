import type { Component, KeyEvent, Theme } from "./types.js";

export class DynamicBorder implements Component {
  private text: string;
  private theme?: Theme;
  private width: number;
  private frame = 0;
  private interval?: ReturnType<typeof setInterval>;

  private frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  constructor(text: string, width = 40, theme?: Theme) {
    this.text = text;
    this.width = width;
    this.theme = theme;
  }

  start(): void {
    this.interval = setInterval(() => {
      this.frame = (this.frame + 1) % this.frames.length;
    }, 100);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  render(_height?: number): string[] {
    const spinner = this.frames[this.frame];
    const line = this.theme ? this.theme.dim(`${spinner} ${this.text}`) : `${spinner} ${this.text}`;
    return [line.padEnd(this.width)];
  }

  onKey(_key: KeyEvent): boolean {
    return false;
  }
}

export class BorderedLoader implements Component {
  private text: string;
  private theme?: Theme;
  private width: number;

  constructor(text: string, width = 40, theme?: Theme) {
    this.text = text;
    this.width = width;
    this.theme = theme;
  }

  render(_height?: number): string[] {
    const hBorder = "─".repeat(this.width);
    const empty = " ".repeat(this.width);
    const formatted = this.theme ? this.theme.dim(this.text) : this.text;
    return [
      `┌${hBorder}┐`,
      `│ ${formatted.padEnd(this.width - 1)} │`,
      `│ ${empty} │`,
      `└${hBorder}┘`,
    ];
  }

  onKey(_key: KeyEvent): boolean {
    return false;
  }
}

export function keyHint(label: string, keys: string): string {
  const keyStr = keys
    .split("+")
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
    .join("+");
  return `${label} (${keyStr})`;
}
