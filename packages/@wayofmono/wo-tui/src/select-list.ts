import type { Component, SelectItem, KeyEvent } from "./types.js";
import { visibleWidth, truncateToWidth } from "./truncate.js";
import { createDefaultTheme } from "./theme.js";

export interface SelectListOptions {
  items: SelectItem[];
  selected?: number;
  prompt?: string;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
}

export class SelectList implements Component {
  private items: SelectItem[];
  private selected: number;
  private prompt?: string;
  private onSubmit?: (value: string) => void;
  private onCancel?: () => void;
  private theme = createDefaultTheme();

  constructor(opts: SelectListOptions) {
    this.items = opts.items;
    this.selected = opts.selected ?? 0;
    this.prompt = opts.prompt;
    this.onSubmit = opts.onSubmit;
    this.onCancel = opts.onCancel;
  }

  render(height?: number): string[] {
    const lines: string[] = [];

    if (this.prompt) {
      lines.push(this.theme.bold(this.prompt));
      lines.push("");
    }

    const maxLines = height ? height - lines.length - 1 : this.items.length;
    const start = Math.max(0, this.selected - Math.floor(maxLines / 2));
    const end = Math.min(this.items.length, start + maxLines);

    for (let i = start; i < end; i++) {
      const item = this.items[i];
      const prefix = i === this.selected ? "▸ " : "  ";
      const label = truncateToWidth(item.label, 80);

      if (i === this.selected) {
        lines.push(this.theme.fg("cyan", prefix + label));
      } else {
        lines.push(prefix + label);
      }
    }

    return lines;
  }

  onKey(key: KeyEvent): boolean {
    if (key.key === "ArrowUp" || key.key === "k") {
      this.selected = Math.max(0, this.selected - 1);
      return true;
    }
    if (key.key === "ArrowDown" || key.key === "j") {
      this.selected = Math.min(this.items.length - 1, this.selected + 1);
      return true;
    }
    if (key.key === "Enter" || key.key === " ") {
      this.onSubmit?.(this.items[this.selected].value);
      return true;
    }
    if (key.key === "Escape") {
      this.onCancel?.();
      return true;
    }
    return false;
  }

  getSelectedValue(): string {
    return this.items[this.selected]?.value || "";
  }
}
