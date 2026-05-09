import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchCursorCliStatus, setCursorCliEnabled, type CursorCliStatus } from "../api";
import { ProviderIcon } from "./ProviderIcon";
import "./CursorCliProviderCard.css";

interface CursorCliProviderCardProps {
  authenticated: boolean;
  compact?: boolean;
  onToggled?: (nextEnabled: boolean) => void;
}

export function CursorCliProviderCard({ authenticated, compact = false, onToggled }: CursorCliProviderCardProps) {
  const [status, setStatus] = useState<CursorCliStatus | null>(null);
  const [busy, setBusy] = useState<"enabling" | "disabling" | "testing" | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchCursorCliStatus();
      if (mountedRef.current) setStatus(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleToggle = useCallback(
    async (next: boolean) => {
      setBusy(next ? "enabling" : "disabling");
      try {
        const result = await setCursorCliEnabled(next);
        onToggled?.(result.enabled);
        await refresh();
      } finally {
        if (mountedRef.current) setBusy(null);
      }
    },
    [onToggled, refresh],
  );

  const currentlyEnabled = status?.enabled ?? authenticated;
  const binaryAvailable = status?.binary.available ?? false;

  const actions = (
    <>
      <button type="button" className="btn btn-sm" onClick={() => {
        setBusy("testing");
        void refresh().finally(() => {
          if (mountedRef.current) setBusy(null);
        });
      }} disabled={busy !== null}>
        {busy === "testing" ? <><Loader2 size={12} className="animate-spin" /> Testing…</> : "Test"}
      </button>
      {currentlyEnabled ? (
        <button type="button" className="btn btn-sm" onClick={() => void handleToggle(false)} disabled={busy !== null}>
          {busy === "disabling" ? "Disabling…" : "Disable"}
        </button>
      ) : (
        <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleToggle(true)} disabled={busy !== null || !binaryAvailable}>
          {busy === "enabling" ? "Enabling…" : "Enable"}
        </button>
      )}
    </>
  );

  const statusText = !status
    ? "Probing local CLI…"
    : !status.binary.available
      ? status.binary.reason ?? "`cursor-agent` not found on PATH"
      : currentlyEnabled
        ? `Connected${status.binary.version ? ` — ${status.binary.version}` : ""}`
        : "Detected. Click Enable to route calls through Cursor CLI.";

  if (compact) {
    return (
      <div className={`cursor-cli-provider-card auth-provider-card auth-provider-card--cli${authenticated ? " auth-provider-card--authenticated" : ""}`} data-testid="cursor-cli-provider-card">
        <div className="auth-provider-header">
          <div className="auth-provider-info">
            <ProviderIcon provider="cursor-cli" size="sm" />
            <strong>Cursor — via Cursor CLI</strong>
            <span className={`auth-status-badge ${currentlyEnabled ? "authenticated" : "not-authenticated"}`}>{currentlyEnabled ? "✓ Active" : "✗ Not connected"}</span>
          </div>
          <div className="auth-provider-cli-actions">{actions}</div>
        </div>
        <small className="settings-muted">{statusText}</small>
      </div>
    );
  }

  return (
    <div className={`cursor-cli-provider-card onboarding-provider-card${authenticated ? " onboarding-provider-card--connected" : ""}`} data-testid="cursor-cli-provider-card">
      <div className="onboarding-provider-card__icon">
        <ProviderIcon provider="cursor-cli" size="md" />
      </div>
      <div className="onboarding-provider-card__body">
        <strong className="onboarding-provider-card__name">Cursor — via Cursor CLI</strong>
        <span className="onboarding-provider-card__description">Route AI calls through your local Cursor agent runtime.</span>
        <small className="settings-muted">{statusText}</small>
      </div>
      <div className="onboarding-provider-card__actions">{actions}</div>
    </div>
  );
}
