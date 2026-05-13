import type { Component } from "./types.js";
import type { MarkdownTheme } from "./types.js";
import { getMarkdownTheme, createDefaultTheme } from "./theme.js";

export class Markdown implements Component {
  private content: string;
  private mdTheme: MarkdownTheme;
  private maxWidth: number;

  constructor(content: string, maxWidth = 80, mdTheme?: MarkdownTheme) {
    this.content = content;
    this.maxWidth = maxWidth;
    this.mdTheme = mdTheme || getMarkdownTheme(createDefaultTheme());
  }

  render(_height?: number): string[] {
    const lines: string[] = [];
    const rawLines = this.content.split("\n");

    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    for (const rawLine of rawLines) {
      if (rawLine.startsWith("```")) {
        if (inCodeBlock) {
          lines.push(this.mdTheme.code(codeBuffer.join("\n")));
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(rawLine);
        continue;
      }

      if (rawLine.startsWith("# ")) {
        lines.push(this.mdTheme.heading(rawLine.slice(2), 1));
      } else if (rawLine.startsWith("## ")) {
        lines.push(this.mdTheme.heading(rawLine.slice(3), 2));
      } else if (rawLine.startsWith("### ")) {
        lines.push(this.mdTheme.heading(rawLine.slice(4), 3));
      } else if (rawLine.startsWith("> ")) {
        lines.push(this.mdTheme.blockquote(rawLine.slice(2)));
      } else if (rawLine.startsWith("- ") || rawLine.startsWith("* ")) {
        lines.push(this.mdTheme.list(rawLine.slice(2), "•"));
      } else if (rawLine.match(/^\d+\. /)) {
        const match = rawLine.match(/^(\d+\.) (.*)/);
        if (match) {
          lines.push(this.mdTheme.list(match[2], match[1]));
        }
      } else if (rawLine === "---" || rawLine === "***") {
        lines.push(this.mdTheme.hr());
      } else if (rawLine.trim() === "") {
        lines.push("");
      } else {
        const processed = this.processInline(rawLine);
        lines.push(this.mdTheme.paragraph(processed));
      }
    }

    if (codeBuffer.length > 0) {
      lines.push(this.mdTheme.code(codeBuffer.join("\n")));
    }

    return lines;
  }

  private processInline(text: string): string {
    let result = text;
    result = result.replace(/\*\*(.+?)\*\*/g, (_, m) => this.mdTheme.bold(m));
    result = result.replace(/\*(.+?)\*/g, (_, m) => this.mdTheme.italic(m));
    result = result.replace(/`([^`]+)`/g, (_, m) => this.mdTheme.inlineCode(m));
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => this.mdTheme.link(text, url));
    return result;
  }

  onKey(_key: import("./types.js").KeyEvent): boolean {
    return false;
  }
}
