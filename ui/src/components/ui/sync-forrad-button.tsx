'use client';

import { useState } from 'react';
import { GitPullRequest, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';

interface SyncResult {
  success: boolean;
  output: string;
  error?: string;
}

export function SyncFörrådButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await window.electronAPI.syncFörråd() as SyncResult;
      if (result.success) {
        toast.success('Förråd synced successfully', {
          description: result.output || 'Already up to date.',
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
        });
      } else {
        toast.error('Sync failed', {
          description: result.error || result.output || 'Unknown error',
        });
      }
    } catch (err) {
      toast.error('Sync failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (typeof window === 'undefined' || !window.electronAPI) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      className="gap-2"
    >
      {isSyncing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <GitPullRequest className="w-4 h-4" />
      )}
      <span>Sync Förråd</span>
    </Button>
  );
}

export function SyncFörrådToaster() {
  return <Toaster position="top-right" theme="system" />;
}