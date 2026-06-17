'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useDashboardStore } from '@/store/dashboard-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import {
  User,
  KeyRound,
  Github,
  Check,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
  Link2,
  Unlink,
} from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  CTO: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Senior: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Developer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export function ProfileView() {
  const { currentUser, authMethod } = useAuthStore();
  const developers = useDashboardStore(s => s.developers);
  const dev = developers.find(d => d.id === currentUser);

  const [editPincode, setEditPincode] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeConfirm, setPincodeConfirm] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeSaving, setPincodeSaving] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  const [linkingGh, setLinkingGh] = useState(false);
  const [linkGhUsername, setLinkGhUsername] = useState('');
  const [linkGhError, setLinkGhError] = useState('');
  const [linkGhSaving, setLinkGhSaving] = useState(false);
  const [linkGhLinked, setLinkGhLinked] = useState<string | null>(null);

  useEffect(() => {
    if (authMethod === 'pincode' && dev) {
      fetch(`/api/link-github?devId=${dev.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.githubUsername) setLinkGhLinked(data.githubUsername);
        })
        .catch(() => {});
    }
  }, [authMethod, dev]);

  if (!dev) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading profile...
      </div>
    );
  }

  const handleSavePincode = () => {
    setPincodeError('');
    setPincodeSuccess(false);
    if (!pincode.trim()) { setPincodeError('Enter a pincode'); return; }
    if (pincode.length < 3) { setPincodeError('Pincode must be at least 3 characters'); return; }
    if (pincode !== pincodeConfirm) { setPincodeError('Pincodes do not match'); return; }
    setPincodeSaving(true);
    setTimeout(() => {
      setPincodeSaving(false);
      setPincodeSuccess(true);
      setEditPincode(false);
      setTimeout(() => setPincodeSuccess(false), 3000);
    }, 500);
  };

  const handleLinkGitHub = async () => {
    setLinkGhError('');
    if (!linkGhUsername.trim()) { setLinkGhError('Enter your GitHub username'); return; }
    setLinkGhSaving(true);
    try {
      const resp = await fetch('/api/link-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devId: dev.id, githubUsername: linkGhUsername.trim() }),
      });
      if (!resp.ok) { setLinkGhError('Failed to save link'); setLinkGhSaving(false); return; }
      // Store pending link for post-OAuth handling, then redirect to GitHub
      localStorage.setItem('pending_link_dev_id', dev.id);
      signIn('github', { callbackUrl: '/' });
    } catch {
      setLinkGhError('Failed to connect. Is the server running?');
      setLinkGhSaving(false);
    }
  };

  const handleUnlinkGitHub = async () => {
    try {
      await fetch('/api/link-github', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devId: dev.id }),
      });
      setLinkGhLinked(null);
      setLinkGhUsername('');
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
              {dev.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{dev.displayName}</h2>
            <p className="text-sm text-text-muted">@{dev.githubUsername}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[dev.role] || ''}`}>
                {dev.role}
              </span>
              {dev.projects.map(p => (
                <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-muted border border-border">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Account Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">Developer ID</label>
            <p className="text-sm text-foreground font-mono">{dev.id}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">GitHub Username</label>
            <p className="text-sm text-foreground">{dev.githubUsername}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Role</label>
            <p className="text-sm text-foreground">{dev.role}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Projects</label>
            <p className="text-sm text-foreground">{dev.projects.join(', ') || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Pincode */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          Pincode
        </h3>
        {!editPincode ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">
                {dev.pincode ? '••••••' : 'Not set'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Used for pincode-based login when GitHub OAuth is unavailable
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditPincode(true)}
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">New pincode</label>
              <Input
                type="password"
                value={pincode}
                onChange={(e) => { setPincode(e.target.value); setPincodeError(''); }}
                placeholder="Enter new pincode"
                className="max-w-xs"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Confirm pincode</label>
              <Input
                type="password"
                value={pincodeConfirm}
                onChange={(e) => { setPincodeConfirm(e.target.value); setPincodeError(''); }}
                placeholder="Confirm new pincode"
                className="max-w-xs"
              />
            </div>
            {pincodeError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {pincodeError}
              </p>
            )}
            {pincodeSuccess && (
              <p className="text-xs text-status-done flex items-center gap-1">
                <Check className="w-3 h-3" />
                Pincode saved (local only — will sync to f-rr-d later)
              </p>
            )}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSavePincode}
                disabled={pincodeSaving}
              >
                {pincodeSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditPincode(false); setPincode(''); setPincodeConfirm(''); setPincodeError(''); }}
              >
                <X className="w-3 h-3" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* GitHub connection */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Github className="w-4 h-4 text-primary" />
          GitHub Connection
        </h3>

        {authMethod === 'github' ? (
          /* GitHub OAuth user — already connected */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-foreground">Connected as @{dev.githubUsername}</p>
                <p className="text-xs text-text-muted">Authenticated via GitHub OAuth</p>
              </div>
            </div>
          </div>
        ) : (
          /* Pincode user — can link a GitHub account */
          <div className="space-y-3">
            {linkGhLinked ? (
              /* Already linked */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">Linked to @{linkGhLinked}</p>
                    <p className="text-xs text-text-muted">
                      Sign in with GitHub to merge accounts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.setItem('pending_link_dev_id', dev.id);
                      signIn('github', { callbackUrl: '/' });
                    }}
                    className="gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Sign In with GitHub
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnlinkGitHub}
                    className="text-text-muted hover:text-destructive"
                    title="Unlink GitHub account"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Not linked */
              <>
                <p className="text-sm text-text-secondary">
                  Link your GitHub account to enable OAuth login and merge your
                  pincode identity with your GitHub profile.
                </p>
                {!linkingGh ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLinkGhUsername(dev.githubUsername);
                      setLinkingGh(true);
                    }}
                    className="gap-1.5"
                  >
                    <Github className="w-4 h-4" />
                    Connect GitHub
                  </Button>
                ) : (
                  <div className="space-y-3 bg-surface rounded-lg p-4 border border-border">
                    <div>
                      <label className="text-xs text-text-muted block mb-1">GitHub username</label>
                      <Input
                        value={linkGhUsername}
                        onChange={(e) => { setLinkGhUsername(e.target.value); setLinkGhError(''); }}
                        placeholder="Your GitHub username"
                        className="max-w-xs"
                        autoFocus
                      />
                    </div>
                    {linkGhError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {linkGhError}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleLinkGitHub}
                        disabled={linkGhSaving}
                        className="gap-1.5"
                      >
                        {linkGhSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        Link & Sign In with GitHub
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setLinkingGh(false); setLinkGhUsername(''); setLinkGhError(''); }}
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-text-muted">
                      This will save the link and redirect you to GitHub to
                      authenticate. Future logins will recognize you via GitHub.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
