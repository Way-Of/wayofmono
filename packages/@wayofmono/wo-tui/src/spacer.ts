import type { Component } from "./types.js";

export class Spacer implements Component {
  private height: number;
  private width: number;

  constructor(height = 1, width = 1) {
    this.height = height;
    this.width = width;
  }

  render(_height?: number): string[] {
    const lines: string[] = [];
    for (let i = 0; i < this.height; i++) {
      lines.push(this.width > 0 ? " ".repeat(this.width) : "");
    }
    return lines;
  }

  onKey(_key: import("./types.js").KeyEvent): boolean {
    return false;
  }
}
