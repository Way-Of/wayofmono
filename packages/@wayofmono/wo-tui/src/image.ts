import type { Component } from "./types.js";

let imageIdCounter = 0;

export function allocateImageId(): number {
  return ++imageIdCounter;
}

export function deleteKittyImage(id: number): void {
  process.stdout.write(`\x1b_Ga=d,i=${id}\x1b\\`);
}

export function getCapabilities(): { kitty: boolean; sixel: boolean; trueColor: boolean } {
  const term = process.env.TERM || "";
  const colorterm = process.env.COLORTERM || "";

  return {
    kitty: term.includes("kitty"),
    sixel: term.includes("sixel") || false,
    trueColor: colorterm === "truecolor" || colorterm === "24bit",
  };
}

export class Image implements Component {
  private data: Buffer;
  private width: number;
  private height: number;
  private id: number;

  constructor(data: Buffer, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
    this.id = allocateImageId();
  }

  render(_height?: number): string[] {
    const caps = getCapabilities();
    if (!caps.kitty) {
      return [`[Image: ${this.width}x${this.height}]`];
    }

    const base64 = this.data.toString("base64");
    const chunkSize = 4096;
    const chunks: string[] = [];

    for (let i = 0; i < base64.length; i += chunkSize) {
      const chunk = base64.slice(i, i + chunkSize);
      const isFirst = i === 0;
      const isLast = i + chunkSize >= base64.length;

      let payload = `\x1b_G`;
      payload += `a=${isLast ? "c" : isFirst ? "t" : "m"}`;
      payload += `,i=${this.id}`;
      payload += `,f=100`;
      payload += `,w=${this.width}`;
      payload += `,h=${this.height}`;
      payload += `;${chunk}\x1b\\`;

      chunks.push(payload);
    }

    return chunks;
  }

  onKey(_key: import("./types.js").KeyEvent): boolean {
    return false;
  }
}
