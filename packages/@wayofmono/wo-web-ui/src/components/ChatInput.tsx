import React, { useState, useRef, useEffect, type KeyboardEvent } from "react";
import type { ThemeConfig } from "../types.js";

const styles = {
  container: (theme: ThemeConfig) => ({
    borderTop: `1px solid ${theme.mode === "dark" ? "#333" : "#e0e0e0"}`,
    padding: "12px",
    background: theme.mode === "dark" ? "#1a1a1a" : "#fff",
  }),
  wrapper: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end" as const,
  },
  input: (theme: ThemeConfig) => ({
    flex: 1,
    padding: "10px 14px",
    border: `1px solid ${theme.mode === "dark" ? "#444" : "#d0d0d0"}`,
    borderRadius: "8px",
    fontSize: `${theme.fontSize || 14}px`,
    fontFamily: "system-ui, -apple-system, sans-serif",
    background: theme.mode === "dark" ? "#2d2d2d" : "#f5f5f5",
    color: theme.mode === "dark" ? "#e0e0e0" : "#1a1a1a",
    outline: "none",
    resize: "none" as const,
    minHeight: "40px",
    maxHeight: "120px",
    lineHeight: "1.4",
  }),
  button: {
    padding: "8px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: 500,
    height: "40px",
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};

export function ChatInput({ onSend, onCommand, disabled, theme }: {
  onSend: (text: string) => void;
  onCommand?: (command: string, args: string) => void;
  disabled?: boolean;
  theme: ThemeConfig;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    if (trimmed.startsWith("/") && onCommand) {
      const spaceIndex = trimmed.indexOf(" ");
      const command = spaceIndex > 0 ? trimmed.slice(1, spaceIndex) : trimmed.slice(1);
      const args = spaceIndex > 0 ? trimmed.slice(spaceIndex + 1) : "";
      onCommand(command, args);
    } else {
      onSend(trimmed);
    }

    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={styles.container(theme)}>
      <div style={styles.wrapper}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.input(theme)}
          placeholder="Type a message... (/ for commands)"
          rows={1}
          disabled={disabled}
        />
        <button
          onClick={handleSubmit}
          style={{ ...styles.button, ...(disabled ? styles.disabled : {}) }}
          disabled={disabled}
        >
          Send
        </button>
      </div>
    </div>
  );
}
