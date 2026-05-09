import { useCallback } from "react";
import type { ShellConnectionNativeResult } from "../shell-native";
import "./ShellConnectionStatus.css";

export interface ShellConnectionStatusProps {
  status: ShellConnectionNativeResult;
  onError?: (message: string) => void;
}

function buildSummary(status: ShellConnectionNativeResult): { title: string; actionLabel: string; dotClassName: string } {
  if (status.hostKind === "desktop-shell" && status.mode === "local") {
    return { title: "Desktop local mode", actionLabel: "Switch server", dotClassName: "status-dot status-dot--online" };
  }

  const profileText = status.profileLabel ?? status.profileId;
  const originText = status.serverOrigin;
  const summary = profileText && originText ? `${profileText} · ${originText}` : profileText ?? originText;

  if (status.mode === "remote") {
    return {
      title: summary ?? "Connection info unavailable",
      actionLabel: status.hostKind === "desktop-shell" ? "Switch server" : "Manage connections",
      dotClassName: summary ? "status-dot status-dot--online" : "status-dot status-dot--pending",
    };
  }

  return {
    title: summary ?? "Connection info unavailable",
    actionLabel: "Manage connections",
    dotClassName: summary ? "status-dot status-dot--online" : "status-dot status-dot--pending",
  };
}

export function ShellConnectionStatus({ status, onError }: ShellConnectionStatusProps) {
  if (status.hostKind === "browser" || !status.available) {
    return null;
  }

  const view = buildSummary(status);
  const handleClick = useCallback(async () => {
    const result = await status.openConnectionManager();
    if (!result.ok && result.reason === "failed") {
      onError?.(result.error ?? "Failed to open connection manager");
    }
  }, [onError, status]);

  return (
    <button type="button" className="btn shell-connection-status" onClick={() => void handleClick()} data-testid="shell-connection-status-button">
      <span className={view.dotClassName} aria-hidden="true" />
      <span className="shell-connection-status__kind">{status.hostKind === "desktop-shell" ? "Desktop" : "Mobile"}</span>
      <span className="shell-connection-status__summary" title={view.title}>{view.title}</span>
      <span className="shell-connection-status__action">{view.actionLabel}</span>
    </button>
  );
}
