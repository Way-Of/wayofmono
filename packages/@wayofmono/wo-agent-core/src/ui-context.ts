import type { ExtensionUIContext, Theme } from "./types.js";
import type { Component } from "@wayofmono/wo-tui";

const defaultTheme: Theme = {
  fg: (color: string, text: string) => {
    const colors: Record<string, string> = { red: "31", green: "32", yellow: "33", blue: "34", cyan: "36", gray: "90" };
    return `\x1b[${colors[color] || "37"}m${text}\x1b[39m`;
  },
  bg: (color: string, text: string) => {
    const colors: Record<string, string> = { red: "41", green: "42", blue: "44" };
    return `\x1b[${colors[color] || "40"}m${text}\x1b[49m`;
  },
  bold: (text: string) => `\x1b[1m${text}\x1b[22m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[22m`,
  italic: (text: string) => `\x1b[3m${text}\x1b[23m`,
  link: (text: string, url: string) => `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`,
};

export class ExtensionUIContextImpl implements ExtensionUIContext {
  theme: Theme = defaultTheme;
  private terminalInputHandlers = new Set<(input: string) => void>();
  private widgets = new Map<string, Component>();
  private statusText = "";

  notify(message: string, severity: "info" | "warning" | "error" | "success"): void {
    const prefix = severity === "error" ? "✗" : severity === "warning" ? "!" : severity === "success" ? "✓" : "•";
    console.error(`${this.theme.fg(severity === "error" ? "red" : severity === "warning" ? "yellow" : "green", prefix)} ${message}`);
  }

  async confirm(message: string): Promise<boolean> {
    console.error(`${message} (y/N): `);
    return new Promise((resolve) => {
      process.stdin.once("data", (data) => {
        const input = data.toString().trim().toLowerCase();
        resolve(input === "y" || input === "yes");
      });
    });
  }

  async input(prompt: string, defaultValue?: string): Promise<string> {
    const defaultStr = defaultValue ? ` (${defaultValue})` : "";
    console.error(`${prompt}${defaultStr}: `);
    return new Promise((resolve) => {
      process.stdin.once("data", (data) => {
        const input = data.toString().trim();
        resolve(input || defaultValue || "");
      });
    });
  }

  async select<T>(items: Array<{ value: T; label: string }>, options?: { prompt?: string }): Promise<T | undefined> {
    if (options?.prompt) console.error(options.prompt);
    for (let i = 0; i < items.length; i++) {
      console.error(`  ${i + 1}. ${items[i].label}`);
    }
    return new Promise((resolve) => {
      process.stdin.once("data", (data) => {
        const input = parseInt(data.toString().trim(), 10);
        if (input >= 1 && input <= items.length) {
          resolve(items[input - 1].value);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  setWidget(key: string, component: Component | null): void {
    if (component === null) {
      this.widgets.delete(key);
    } else {
      this.widgets.set(key, component);
    }
  }

  setStatus(text: string): void {
    this.statusText = text;
    console.error(`\x1b[2m${text}\x1b[22m`);
  }

  setWorkingMessage(text: string): void {
    console.error(`\x1b[3m${text}\x1b[23m`);
  }

  setHiddenThinkingLabel(text: string): void {
    console.error(`\x1b[2m[${text}]\x1b[22m`);
  }

  onTerminalInput(handler: (input: string) => void): () => void {
    this.terminalInputHandlers.add(handler);
    return () => this.terminalInputHandlers.delete(handler);
  }

  pasteToEditor(text: string): void {
    process.stdout.write(text);
  }

  getStatus(): string {
    return this.statusText;
  }

  getWidgets(): Map<string, Component> {
    return this.widgets;
  }
}
