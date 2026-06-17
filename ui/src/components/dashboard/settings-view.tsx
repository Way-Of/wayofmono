'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Settings,
  Github,
  GitBranch,
  Database,
  RefreshCw,
  Server,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export function SettingsView() {
  const { ticketSource, setTicketSource, ticketBranch, setTicketBranch, fetchData } = useDashboardStore();

  const [repo, setRepo] = useState('Way-Of/f-rr-d');
  const [branch, setBranch] = useState(ticketBranch);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setTicketBranch(branch);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Data Source */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          Data Source
        </h3>

        <div>
          <label className="text-xs text-text-muted block mb-2">Source</label>
          <div className="flex rounded-lg bg-surface p-1 w-fit">
            <button
              type="button"
              onClick={() => setTicketSource('github')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                ticketSource === 'github'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              <Github className="w-4 h-4 inline mr-1.5" />
              GitHub
            </button>
            <button
              type="button"
              onClick={() => setTicketSource('local')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                ticketSource === 'local'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              <Server className="w-4 h-4 inline mr-1.5" />
              Local
            </button>
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            {ticketSource === 'github'
              ? 'Fetches tickets and developers from the f-rr-d GitHub repository'
              : 'Reads from the local thoughts/ directory on disk'}
          </p>
        </div>
      </div>

      {/* Repository config */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Github className="w-4 h-4 text-primary" />
          Repository
        </h3>

        <div>
          <label className="text-xs text-text-muted block mb-1">Repository</label>
          <Input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="font-mono text-sm max-w-md"
            placeholder="owner/repo"
          />
          <p className="text-xs text-text-muted mt-1">
            Set via <code className="text-primary">GITHUB_REPO</code> env var or{' '}
            <code className="text-primary">~/.config/wodev/config.json</code>
          </p>
        </div>

        <div>
          <label className="text-xs text-text-muted block mb-1">Branch</label>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-text-muted" />
            <Input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="font-mono text-sm max-w-xs"
              placeholder="main"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="gap-1.5"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'Saved' : 'Apply'}
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Branch in the f-rr-d repository to fetch data from
          </p>
        </div>
      </div>

      {/* Cache */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary" />
          Cache
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">GitHub API responses are cached for 5 minutes</p>
            <p className="text-xs text-text-muted mt-0.5">
              Set via <code className="text-primary">GITHUB_CACHE_TTL</code> env var (milliseconds)
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* App info */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          About
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs text-text-muted block mb-1">App</label>
            <p className="text-foreground">CTO Dashboard</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Package</label>
            <p className="text-foreground font-mono">@wayofmono/wo-cto-dashboard</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Data Source</label>
            <p className="text-foreground font-mono text-xs break-all">{ticketSource === 'github' ? 'GitHub (api.github.com)' : 'Local (thoughts/)'}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Config File</label>
            <p className="text-foreground font-mono text-xs break-all">~/.config/wodev/config.json</p>
          </div>
        </div>
      </div>

      {/* Config override hint */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-text-muted">
              These settings can be overridden via environment variables or{' '}
              <code className="text-primary">~/.config/wodev/config.json</code>. UI changes apply
              to the current session only. To make permanent changes, edit the config file or set env vars.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
