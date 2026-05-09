import { useMemo, useState } from "react";
import type { FusionShellApi, ShellConnectionProfile, ShellConnectionState } from "../types/native-shell";
import "./NativeShellConnectionManager.css";

interface NativeShellConnectionManagerProps {
  open: boolean;
  shellApi: FusionShellApi;
  shellState: ShellConnectionState;
  onClose: () => void;
}

export function NativeShellConnectionManager({ open, shellApi, shellState, onClose }: NativeShellConnectionManagerProps) {
  const activeProfile = useMemo(
    () => shellState.profiles.find((profile) => profile.id === shellState.activeProfileId) ?? null,
    [shellState.activeProfileId, shellState.profiles],
  );
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ShellConnectionProfile>>({});
  const [deleteCandidate, setDeleteCandidate] = useState<ShellConnectionProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const isAddingConnection = editingProfileId === "__new__";
  const editingProfile = isAddingConnection
    ? null
    : shellState.profiles.find((profile) => profile.id === editingProfileId) ?? activeProfile;
  const workingName = draft.name ?? editingProfile?.name ?? "";
  const workingUrl = draft.serverUrl ?? editingProfile?.serverUrl ?? "";
  const workingToken = draft.authToken ?? editingProfile?.authToken ?? "";

  const resetEditor = () => {
    setEditingProfileId(null);
    setDraft({});
    setError(null);
  };

  const saveCurrent = async () => {
    setError(null);
    try {
      const parsed = new URL(workingUrl.trim());
      if (!/^https?:$/.test(parsed.protocol)) {
        throw new Error("Server URL must use http or https");
      }
      const saved = await shellApi.saveProfile({
        id: isAddingConnection ? undefined : (editingProfileId ?? editingProfile?.id),
        name: workingName || "Remote Server",
        serverUrl: workingUrl,
        authToken: workingToken || null,
      });
      await shellApi.setActiveProfile(saved.id);
      setEditingProfileId(saved.id);
      setDraft({});
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  };

  const handleScanQr = async () => {
    setError(null);
    try {
      const result = await shellApi.startQrScan();
      setEditingProfileId("__new__");
      setDraft({
        name: "",
        serverUrl: result.serverUrl,
        authToken: result.authToken ?? "",
      });
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) {
      return;
    }
    await shellApi.deleteProfile(deleteCandidate.id);
    setDeleteCandidate(null);
    resetEditor();
  };

  return (
    <div className="modal-overlay open">
      <div className="modal native-shell-connection-manager" role="dialog" aria-label="Connection Manager">
        <div className="modal-header">
          <h2>Connection Manager</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {shellState.host === "desktop-shell" && (
          <div className="native-shell-connection-manager__mode-row">
            <button type="button" className={`btn ${shellState.desktopMode === "local" ? "btn-primary" : ""}`} onClick={() => void shellApi.setDesktopMode("local")}>Local</button>
            <button type="button" className={`btn ${shellState.desktopMode !== "local" ? "btn-primary" : ""}`} onClick={() => void shellApi.setDesktopMode("remote")}>Remote</button>
          </div>
        )}

        <div className="native-shell-connection-manager__profiles">
          {shellState.profiles.length === 0 ? (
            <div className="card native-shell-connection-manager__empty-state">
              <p className="settings-muted">No remote servers saved yet.</p>
              <div className="native-shell-connection-manager__profile-actions">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    setEditingProfileId("__new__");
                    setDraft({ name: "", serverUrl: "", authToken: "" });
                    setError(null);
                  }}
                >
                  Add server
                </button>
                {shellState.host === "mobile-shell" && (
                  <button type="button" className="btn btn-sm" onClick={() => void handleScanQr()}>
                    Scan QR
                  </button>
                )}
              </div>
            </div>
          ) : (
            shellState.profiles.map((profile) => (
              <div className="card native-shell-connection-manager__profile" key={profile.id}>
                <div>
                  <strong>{profile.name}</strong>
                  <div className="settings-muted">{profile.serverUrl}</div>
                  {profile.id === shellState.activeProfileId && <span className="native-shell-connection-manager__active-pill">Active</span>}
                </div>
                <div className="native-shell-connection-manager__profile-actions">
                  <button
                    type="button"
                    className="btn btn-sm"
                    aria-label={`Edit ${profile.name}`}
                    onClick={() => {
                      setEditingProfileId(profile.id);
                      setDraft(profile);
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn btn-sm" aria-label={`Use ${profile.name}`} onClick={() => void shellApi.setActiveProfile(profile.id)}>Use</button>
                  <button type="button" className="btn btn-sm btn-danger" aria-label={`Delete ${profile.name}`} onClick={() => setDeleteCandidate(profile)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="native-shell-connection-manager__mode-row">
          <button
            type="button"
            className="btn"
            onClick={() => {
              setEditingProfileId("__new__");
              setDraft({ name: "", serverUrl: "", authToken: "" });
              setError(null);
            }}
          >
            Add connection
          </button>
          {shellState.host === "mobile-shell" && (
            <button type="button" className="btn" onClick={() => void handleScanQr()}>
              Scan QR
            </button>
          )}
        </div>

        <div className="form-group native-shell-connection-manager__editor">
          <label htmlFor="native-shell-connection-manager-name">Name</label>
          <input id="native-shell-connection-manager-name" className="input" value={workingName} onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))} />
          <label htmlFor="native-shell-connection-manager-url">Server URL</label>
          <input id="native-shell-connection-manager-url" className="input" value={workingUrl} onChange={(event) => setDraft((value) => ({ ...value, serverUrl: event.target.value }))} />
          <label htmlFor="native-shell-connection-manager-token">Auth token (optional)</label>
          <input id="native-shell-connection-manager-token" className="input" type="password" value={workingToken ?? ""} onChange={(event) => setDraft((value) => ({ ...value, authToken: event.target.value }))} />
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>

        {deleteCandidate && (
          <div className="native-shell-connection-manager__delete-confirm" role="alertdialog" aria-label="Delete server confirmation">
            <p>Delete <strong>{deleteCandidate.name}</strong>? This removes the saved profile.</p>
            <div className="native-shell-connection-manager__profile-actions">
              <button type="button" className="btn btn-sm" onClick={() => setDeleteCandidate(null)}>Cancel</button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => void handleConfirmDelete()}>Delete</button>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Close</button>
          <button type="button" className="btn" onClick={resetEditor}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => void saveCurrent()} disabled={!workingUrl.trim()}>Save</button>
        </div>
      </div>
    </div>
  );
}
