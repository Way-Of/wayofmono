import React from "react";
import type { ChatMessage, ThemeConfig } from "../types.js";

const styles = {
  container: (role: string) => ({
    display: "flex",
    justifyContent: role === "user" ? "flex-end" as const : "flex-start" as const,
    marginBottom: "12px",
  }),
  bubble: (role: string, theme: ThemeConfig) => ({
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
    background: role === "user" ? "#2563eb" : theme.mode === "dark" ? "#2d2d2d" : "#f0f0f0",
    color: role === "user" ? "#fff" : theme.mode === "dark" ? "#e0e0e0" : "#1a1a1a",
    fontSize: `${theme.fontSize || 14}px`,
    lineHeight: "1.5",
    whiteSpace: "pre-wrap" as const,
    fontFamily: "system-ui, -apple-system, sans-serif",
  }),
  streaming: {
    borderRight: "2px solid #2563eb",
    animation: "blink 1s infinite",
  },
};

export function MessageBubble({ message, theme }: { message: ChatMessage; theme: ThemeConfig }) {
  return (
    <div style={styles.container(message.role)}>
      <div
        style={{
          ...styles.bubble(message.role, theme),
          ...(message.streaming ? styles.streaming : {}),
        }}
      >
        {message.content}
        {message.streaming && <span style={{ opacity: 0.5 }}>▍</span>}
      </div>
    </div>
  );
}
