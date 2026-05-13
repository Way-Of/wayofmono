import type { KeyEvent } from "./types.js";

export const Key = {
  Enter: "Enter",
  Escape: "Escape",
  Tab: "Tab",
  Backspace: "Backspace",
  Delete: "Delete",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Space: " ",
} as const;

export function matchesKey(event: KeyEvent, keyDef: string): boolean {
  const parts = keyDef.toLowerCase().split("+");
  let key = parts.pop() || "";

  const ctrl = parts.includes("ctrl");
  const meta = parts.includes("meta") || parts.includes("alt");
  const shift = parts.includes("shift");

  if (event.ctrl !== ctrl) return false;
  if (event.meta !== meta) return false;

  if (key === "enter") return event.key === "Enter";
  if (key === "escape") return event.key === "Escape";
  if (key === "tab") return event.key === "Tab";
  if (key === "backspace") return event.key === "Backspace";
  if (key === "delete") return event.key === "Delete";
  if (key === "up") return event.key === "ArrowUp";
  if (key === "down") return event.key === "ArrowDown";
  if (key === "left") return event.key === "ArrowLeft";
  if (key === "right") return event.key === "ArrowRight";
  if (key === "home") return event.key === "Home";
  if (key === "end") return event.key === "End";
  if (key === "space") return event.key === " ";

  if (ctrl) {
    const code = key.charCodeAt(0);
    if (code >= 97 && code <= 122) {
      return event.key.toLowerCase() === key;
    }
    return event.key.toLowerCase() === key;
  }

  return event.key === key;
}

export function getKeybindings(): Record<string, string> {
  return {
    "submit": "Enter",
    "cancel": "Escape",
    "navigate_up": "ArrowUp",
    "navigate_down": "ArrowDown",
    "navigate_left": "ArrowLeft",
    "navigate_right": "ArrowRight",
    "search": "ctrl+f",
    "quit": "ctrl+c",
    "help": "ctrl+h",
  };
}
