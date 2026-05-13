import type { Component } from "./types.js";
import type { Text } from "./text.js";

export interface BoxOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  title?: string;
  border?: boolean;
  color?: string;
  padding?: number;
}

export class Box implements Component {
  private children: Component[] = [];
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private title?: string;
  private border: boolean;
  private color?: string;
  private padding: number;

  constructor(opts?: BoxOptions) {
    this.x = opts?.x ?? 0;
    this.y = opts?.y ?? 0;
    this.width = opts?.width ?? 80;
    this.height = opts?.height ?? 10;
    this.title = opts?.title;
    this.border = opts?.border ?? false;
    this.color = opts?.color;
    this.padding = opts?.padding ?? 0;
  }

  add(child: Component): void {
    this.children.push(child);
  }

  render(_height?: number): string[] {
    const lines: string[] = [];

    const topPad = this.y > 0 ? this.y : 0;
    for (let i = 0; i < topPad; i++) {
      lines.push("");
    }

    if (this.border) {
      const horizontalBorder = this.color
        ? `\x1b[${this.color === "gray" ? "90" : "37"}m${"─".repeat(this.width)}\x1b[39m`
        : "─".repeat(this.width);

      if (this.title) {
        const titleStr = this.color
          ? `\x1b[${this.color === "gray" ? "90" : "37"}m┌── ${this.title} ─${"─".repeat(Math.max(0, this.width - this.title.length - 5))}┐\x1b[39m`
          : `┌── ${this.title} ─${"─".repeat(Math.max(0, this.width - this.title.length - 5))}┐`;
        lines.push(titleStr);
      } else {
        const topBorder = this.color
          ? `\x1b[${this.color === "gray" ? "90" : "37"}m┌${horizontalBorder}┐\x1b[39m`
          : `┌${horizontalBorder}┐`;
        lines.push(topBorder);
      }
    } else if (this.x > 0) {
      lines.push(" ".repeat(this.x));
    }

    const contentHeight = this.border ? this.height - 2 : this.height;
    const childLines: string[] = [];

    for (const child of this.children) {
      const rendered = child.render(contentHeight);
      childLines.push(...rendered);
    }

    const pad = this.padding > 0 ? " ".repeat(this.padding) : "";
    const indent = this.x > 0 ? " ".repeat(this.x) : "";

    for (let i = 0; i < contentHeight; i++) {
      const childLine = childLines[i] || "";
      const content = `${indent}${pad}${childLine}`;

      if (this.border) {
        const line = this.color
          ? `\x1b[${this.color === "gray" ? "90" : "37"}m│\x1b[39m ${content.padEnd(this.width - 1)} ${this.color ? `\x1b[${this.color === "gray" ? "90" : "37"}m│\x1b[39m` : "│"}`
          : `│ ${content.padEnd(this.width - 1)} │`;
        lines.push(line);
      } else {
        lines.push(content);
      }
    }

    if (this.border) {
      const horizontalBorder = this.color
        ? `\x1b[${this.color === "gray" ? "90" : "37"}m${"─".repeat(this.width)}\x1b[39m`
        : "─".repeat(this.width);
      const bottomBorder = this.color
        ? `\x1b[${this.color === "gray" ? "90" : "37"}m└${horizontalBorder}┘\x1b[39m`
        : `└${horizontalBorder}┘`;
      lines.push(bottomBorder);
    }

    return lines;
  }

  onKey(key: import("./types.js").KeyEvent): boolean {
    for (const child of this.children) {
      if (child.onKey?.(key)) return true;
    }
    return false;
  }
}
