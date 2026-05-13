import type { Component } from "./types.js";

export interface TextOptions {
  x?: number;
  y?: number;
  color?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  width?: number;
}

export class Text implements Component {
  private content: string;
  private x: number;
  private y: number;
  private color?: string;
  private bold: boolean;
  private dim: boolean;
  private italic: boolean;
  private width: number;

  constructor(content: string, x = 0, y = 0, opts?: TextOptions) {
    this.content = content;
    this.x = opts?.x ?? x;
    this.y = opts?.y ?? y;
    this.color = opts?.color;
    this.bold = opts?.bold ?? false;
    this.dim = opts?.dim ?? false;
    this.italic = opts?.italic ?? false;
    this.width = opts?.width ?? 0;
  }

  render(_height?: number): string[] {
    let text = this.content;

    if (this.width > 0 && text.length > this.width) {
      text = text.slice(0, this.width);
    }

    if (this.color) {
      const colors: Record<string, string> = {
        black: "30", red: "31", green: "32", yellow: "33",
        blue: "34", magenta: "35", cyan: "36", white: "37",
        gray: "90", grey: "90",
      };
      const code = colors[this.color] || "37";
      text = `\x1b[${code}m${text}\x1b[39m`;
    }
    if (this.bold) text = `\x1b[1m${text}\x1b[22m`;
    if (this.dim) text = `\x1b[2m${text}\x1b[22m`;
    if (this.italic) text = `\x1b[3m${text}\x1b[23m`;

    const lines: string[] = [];
    for (let i = 0; i < (this.y > 0 ? this.y + 1 : 1); i++) {
      if (i === (this.y > 0 ? this.y : 0)) {
        const padding = this.x > 0 ? " ".repeat(this.x) : "";
        lines.push(padding + text);
      } else {
        lines.push("");
      }
    }
    return lines;
  }

  onKey(_key: import("./types.js").KeyEvent): boolean {
    return false;
  }

  setContent(content: string): void {
    this.content = content;
  }

  getContent(): string {
    return this.content;
  }
}
