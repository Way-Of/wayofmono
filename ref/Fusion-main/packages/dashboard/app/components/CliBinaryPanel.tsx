import { useCallback, useEffect, useState } from "react";
import {
  fetchFnBinaryStatus,
  installFnBinary,
  type FnBinaryInstallResult,
  type FnBinaryStatus,
} from "../api/legacy";
import "./CliBinaryPanel.css";

interface Props {
  /**
   * When true, the panel is mounted but should not auto-fetch on render.
   * Used by the first-launch banner so it can show a button without
   * forcing a probe before the user opts in.
   */
  defer?: boolean;
}

const STATE_LABELS: Record<FnBinaryStatus["state"], { text: string; tone: "ok" | "warn" | "err" }> = {
  installed: { text: "Installed", tone: "ok" },
  missing: { text: "Not installed", tone: "err" },
  "version-mismatch": { text: "Version mismatch", tone: "warn" },
  skipped: { text: "Check disabled", tone: "warn" },
};

/**
 * Settings panel for the `fn` / `fusion` global CLI binary.
 *
 * Shows current install state, a one-click install button (runs
 * `npm install -g runfusion.ai` server-side), and two copy-to-clipboard
 * commands so users with non-default npm setups can install themselves.
 */
export function CliBinaryPanel({ defer = false }: Props) {
  const [status, setStatus] = useState<FnBinaryStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<FnBinaryInstallResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchFnBinaryStatus();
      setStatus(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (defer) return;
    void refresh();
  }, [defer, refresh]);

  const onInstall = useCallback(async () => {
    setInstalling(true);
    setInstallResult(null);
    setError(null);
    try {
      const response = await installFnBinary();
      setStatus({
        binary: response.binary,
        expectedVersion: response.expectedVersion,
        state: response.state,
        install: response.install,
      });
      setInstallResult(response.installResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setInstalling(false);
    }
  }, []);

  const copy = useCallback(async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1500);
    } catch {
      // Clipboard API unavailable — leave button silent rather than throwing.
    }
  }, []);

  const stateMeta = status ? STATE_LABELS[status.state] : null;

  return (
    <div className="cli-binary-panel">
      <div className="cli-binary-header">
        <h4 className="settings-section-heading">CLI Binary</h4>
        {stateMeta && (
          <span className={`cli-binary-pill cli-binary-pill--${stateMeta.tone}`}>
            {stateMeta.text}
          </span>
        )}
      </div>
      <small className="cli-binary-help">
        Installing the global CLI lets you run <code>fn</code> and <code>fusion</code> from any
        terminal. Automations and scripts work without it via <code>npx</code>, but a global
        install is faster and more convenient.
      </small>

      {loading && !status && <p className="cli-binary-status-line">Checking…</p>}

      {status && (
        <div className="cli-binary-detail">
          {status.binary.installed ? (
            <ul className="cli-binary-info-list">
              <li>
                <span>Binary:</span>
                <code>{status.binary.binary}</code>
              </li>
              {status.binary.path && (
                <li>
                  <span>Path:</span>
                  <code>{status.binary.path}</code>
                </li>
              )}
              <li>
                <span>Version:</span>
                <code>{status.binary.version ?? "unknown"}</code>
                <span className="cli-binary-expected">
                  (expected {status.expectedVersion})
                </span>
              </li>
            </ul>
          ) : (
            <p className="cli-binary-status-line">
              Neither <code>fn</code> nor <code>fusion</code> was found on PATH.
            </p>
          )}

          <div className="cli-binary-actions">
            <button
              type="button"
              className="cli-binary-install-btn"
              onClick={onInstall}
              disabled={installing}
            >
              {installing
                ? "Installing…"
                : status.binary.installed
                  ? "Reinstall"
                  : "Install with npm"}
            </button>
            <button
              type="button"
              className="cli-binary-refresh-btn"
              onClick={() => void refresh()}
              disabled={loading || installing}
            >
              Refresh
            </button>
          </div>

          <div className="cli-binary-commands">
            <label>Or copy and run yourself:</label>
            {[
              { label: "npm", command: status.install.npm },
              { label: "curl", command: status.install.curl },
            ].map(({ label, command }) => (
              <div key={label} className="cli-binary-command-row">
                <code>{command}</code>
                <button
                  type="button"
                  onClick={() => void copy(label, command)}
                  className="cli-binary-copy-btn"
                >
                  {copied === label ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {installResult && (
        <details className="cli-binary-install-log" open={!installResult.success}>
          <summary>
            {installResult.success
              ? `Install succeeded in ${(installResult.durationMs / 1000).toFixed(1)}s`
              : `Install failed (exit ${installResult.exitCode ?? "n/a"})`}
          </summary>
          {installResult.permissionsHint && (
            <p className="cli-binary-permissions-hint">{installResult.permissionsHint}</p>
          )}
          {installResult.stdout && (
            <pre className="cli-binary-install-output">{installResult.stdout}</pre>
          )}
          {installResult.stderr && (
            <pre className="cli-binary-install-output cli-binary-install-output--err">
              {installResult.stderr}
            </pre>
          )}
        </details>
      )}

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
