import type { Component } from "./types.js";

export type Direction = "horizontal" | "vertical";

export interface ContainerOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  direction?: Direction;
  gap?: number;
}

export class Container implements Component {
  private children: Component[] = [];
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private direction: Direction;
  private gap: number;

  constructor(opts?: ContainerOptions) {
    this.x = opts?.x ?? 0;
    this.y = opts?.y ?? 0;
    this.width = opts?.width ?? 80;
    this.height = opts?.height ?? 10;
    this.direction = opts?.direction ?? "vertical";
    this.gap = opts?.gap ?? 0;
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

    if (this.direction === "vertical") {
      let gapAdded = false;
      for (const child of this.children) {
        if (gapAdded && this.gap > 0) {
          for (let i = 0; i < this.gap; i++) lines.push("");
        }
        const rendered = child.render();
        lines.push(...rendered);
        gapAdded = true;
      }
    } else {
      const allLines: string[][] = [];
      let maxHeight = 0;

      for (const child of this.children) {
        const rendered = child.render();
        allLines.push(rendered);
        maxHeight = Math.max(maxHeight, rendered.length);
      }

      for (let i = 0; i < maxHeight; i++) {
        let line = "";
        for (let j = 0; j < allLines.length; j++) {
          const childLine = allLines[j][i] || "";
          line += childLine;
          if (j < allLines.length - 1 && this.gap > 0) {
            line += " ".repeat(this.gap);
          }
        }
        lines.push(line);
      }
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
