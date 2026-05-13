import React, { useState } from "react";
import type { ToolCall, ThemeConfig } from "../types.js";

const styles = {
  container: (theme: ThemeConfig) => ({
    border: `1px solid ${theme.mode === "dark" ? "#333" : "#e0e0e0"}`,
    borderRadius: "8px",
    margin: "8px 0",
    overflow: "hidden" as const,
    background: theme.mode === "dark" ? "#252525" : "#f8f8f8",
  }),
  header: (theme: ThemeConfig) => ({
    display: "flex",
    alignItems: "center" as const,
    gap: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    userSelect: "none" as const,
    fontSize: "13px",
    color: theme.mode === "dark" ? "#ccc" : "#555",
  }),
  statusDot: (status: string) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: status === "done" ? "#22c55e" : status === "error" ? "#ef4444" : status === "running" ? "#3b82f6" : "#9ca3af",
    flexShrink: 0,
  }),
  body: {
    padding: "8px 12px 12px",
    fontSize: "13px",
    fontFamily: "ui-monospace, monospace",
    lineHeight: "1.5",
    overflowX: "auto" as const,
    maxHeight: "200px",
    overflowY: "auto" as const,
  },
  args: (theme: ThemeConfig) => ({
    color: theme.mode === "dark" ? "#aaa" : "#666",
    marginTop: "4px",
    fontSize: "12px",
  }),
  result: (theme: ThemeConfig) => ({
    borderTop: `1px solid ${theme.mode === "dark" ? "#333" : "#eee"}`,
    marginTop: "8px",
    paddingTop: "8px",
    color: theme.mode === "dark" ? "#ccc" : "#444",
    whiteSpace: "pre-wrap" as const,
  }),
};

export function ToolCallCard({ toolCall, theme }: { toolCall: ToolCall; theme: ThemeConfig }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={styles.container(theme)}>
      <div style={styles.header(theme)} onClick={() => setExpanded(!expanded)}>
        <span style={styles.statusDot(toolCall.status)} />
        <span>Tool: {toolCall.name}</span>
        <span style={{ marginLeft: "auto", opacity: 0.5 }}>
          {expanded ? "▼" : "▶"}
        </span>
      </div>
      {expanded && (
        <div style={styles.body}>
          <div style={styles.args(theme)}>
            {JSON.stringify(toolCall.args, null, 2)}
          </div>
          {toolCall.result && (
            <div style={styles.result(theme)}>
              {toolCall.result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
