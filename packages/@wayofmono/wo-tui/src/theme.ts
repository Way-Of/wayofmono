import type { Theme, MarkdownTheme } from "./types.js";

function escapeAnsi(text: string): string {
  return text.replace(/\x1b/g, "\\x1b");
}

export function createDefaultTheme(): Theme {
  return {
    fg(color: string, text: string): string {
      const colors: Record<string, string> = {
        black: "30", red: "31", green: "32", yellow: "33",
        blue: "34", magenta: "35", cyan: "36", white: "37",
        gray: "90", grey: "90",
      };
      const code = colors[color] || "37";
      return `\x1b[${code}m${text}\x1b[39m`;
    },
    bg(color: string, text: string): string {
      const colors: Record<string, string> = {
        black: "40", red: "41", green: "42", yellow: "43",
        blue: "44", magenta: "45", cyan: "46", white: "47",
      };
      const code = colors[color] || "40";
      return `\x1b[${code}m${text}\x1b[49m`;
    },
    bold(text: string): string {
      return `\x1b[1m${text}\x1b[22m`;
    },
    dim(text: string): string {
      return `\x1b[2m${text}\x1b[22m`;
    },
    italic(text: string): string {
      return `\x1b[3m${text}\x1b[23m`;
    },
    link(text: string, url: string): string {
      return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;
    },
  };
}

export function getMarkdownTheme(theme: Theme): MarkdownTheme {
  return {
    heading: (text: string, level: number) => {
      const prefix = "#".repeat(level);
      return theme.bold(`${prefix} ${text}`);
    },
    code: (text: string) => {
      return theme.fg("cyan", text);
    },
    inlineCode: (text: string) => {
      return theme.fg("green", text);
    },
    link: (text: string, url: string) => {
      return theme.link(text, url);
    },
    list: (text: string, prefix: string) => {
      return `${prefix} ${text}`;
    },
    bold: (text: string) => theme.bold(text),
    italic: (text: string) => theme.italic(text),
    blockquote: (text: string) => {
      return theme.dim(`> ${text}`);
    },
    hr: () => {
      return theme.dim("─".repeat(40));
    },
    paragraph: (text: string) => text,
  };
}
