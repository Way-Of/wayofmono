'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useDashboardStore } from '@/store/dashboard-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, KeyRound } from 'lucide-react';

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const developers = useDashboardStore((s) => s.developers);
  const loading = useDashboardStore((s) => s.loading);
  const fetchData = useDashboardStore((s) => s.fetchData);
  const [username, setUsername] = useState('');
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('Enter a GitHub username'); return; }
    if (!pincode.trim()) { setError('Enter your pincode'); return; }
    const result = login(username.trim(), pincode.trim());
    if (result.success) return;
    if (result.reason === 'loading') setError('Loading team data...');
    else if (result.reason === 'wrong_pincode') setError('Wrong pincode');
    else setError('Unrecognized developer');
  };

  const isDisabled = loading && developers.length === 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="text-3xl font-bold text-primary">WO</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">WayOfMono</h1>
          <p className="text-text-secondary text-sm mt-1">CTO Dashboard & Developer Portal</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">GitHub username</label>
                <Input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="GitHub username"
                  className="bg-surface border-border-strong text-foreground placeholder:text-text-muted focus:border-primary focus:ring-primary"
                  autoFocus
                  disabled={isDisabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Pincode</label>
                <Input
                  type="password"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value); setError(''); }}
                  placeholder="Enter your pincode"
                  className="bg-surface border-border-strong text-foreground placeholder:text-text-muted focus:border-primary focus:ring-primary"
                  disabled={isDisabled}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isDisabled}>
              {isDisabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <><KeyRound className="w-4 h-4 mr-1.5" /> Sign In</>}
            </Button>

            {error && (
              <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </form>


        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          Data sourced from förråd (f-rr-d) · No separate database
        </p>
      </div>
    </div>
  );
}
