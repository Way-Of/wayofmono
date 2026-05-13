import React from "react";
import type { SessionInfo, ThemeConfig } from "../types.js";

const styles = {
  container: (theme: ThemeConfig) => ({
    width: "260px",
    borderRight: `1px solid ${theme.mode === "dark" ? "#333" : "#e0e0e0"}`,
    background: theme.mode === "dark" ? "#1a1a1a" : "#fafafa",
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
  }),
  header: (theme: ThemeConfig) => ({
    padding: "16px",
    borderBottom: `1px solid ${theme.mode === "dark" ? "#333" : "#e0e0e0"}`,
    fontWeight: 600,
    fontSize: "14px",
    color: theme.mode === "dark" ? "#e0e0e0" : "#1a1a1a",
  }),
  list: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "4px 0",
  },
  item: (active: boolean, theme: ThemeConfig) => ({
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "13px",
    color: theme.mode === "dark" ? "#c0c0c0" : "#333",
    background: active ? (theme.mode === "dark" ? "#2a2a2a" : "#e8f0fe") : "transparent",
    borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
    transition: "background 0.15s",
  }),
  newButton: {
    margin: "12px",
    padding: "8px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
  time: (theme: ThemeConfig) => ({
    fontSize: "11px",
    color: theme.mode === "dark" ? "#666" : "#999",
    marginTop: "2px",
  }),
};

export function SessionList({ sessions, activeSessionId, onSelect, onNew, theme }: {
  sessions: SessionInfo[];
  activeSessionId?: string;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
  theme: ThemeConfig;
}) {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={styles.container(theme)}>
      <div style={styles.header(theme)}>
        Sessions
      </div>
      <div style={styles.list}>
        {sessions.map((session) => (
          <div
            key={session.id}
            style={styles.item(session.id === activeSessionId, theme)}
            onClick={() => onSelect(session.id)}
          >
            <div>{session.name}</div>
            <div style={styles.time(theme)}>{formatTime(session.updatedAt)}</div>
          </div>
        ))}
      </div>
      <button style={styles.newButton} onClick={onNew}>
        + New Session
      </button>
    </div>
  );
}
