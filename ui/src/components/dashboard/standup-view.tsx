'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useDashboardStore } from '@/store/dashboard-store';
import { StandupEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function StandupView() {
  const { currentUser } = useAuthStore();
  const developers = useDashboardStore(s => s.developers);
  const dev = developers.find(d => d.id === currentUser);

  const [entries, setEntries] = useState<StandupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/standup');
      setEntries(await res.json());
    } catch (err) {
      console.error('Failed to fetch standups:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysEntry = entries.find(e => e.author === dev?.githubUsername && e.date === todayStr);
  const todayEntries = entries.filter(e => e.date === todayStr);

  const handleSubmit = async () => {
    if (!dev || !today.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/standup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: dev.githubUsername,
          yesterday: yesterday.trim(),
          today: today.trim(),
          blockers: blockers.trim(),
        }),
      });
      if (res.ok) {
        setYesterday('');
        setToday('');
        setBlockers('');
        await fetchEntries();
      }
    } catch (err) {
      console.error('Failed to submit standup:', err);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daily Standup</h2>
          <p className="text-sm text-text-muted mt-0.5">
            {todayStr} — {todayEntries.length} check-in{todayEntries.length !== 1 ? 's' : ''} today
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEntries}
          disabled={loading}
        >
          <Loader2 className={`w-3 h-3 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {dev && (
        <Card className="bg-card border-border">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {todaysEntry ? 'Update your standup' : 'Submit your standup'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">What did you do yesterday?</label>
              <textarea
                value={yesterday}
                onChange={e => setYesterday(e.target.value)}
                placeholder="e.g., Completed the skill sync pipeline, fixed 3 bugs in the dashboard..."
                className="w-full min-h-[60px] px-3 py-2 text-xs rounded-lg bg-surface border border-border text-foreground placeholder:text-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                rows={2}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">What will you do today? *</label>
              <textarea
                value={today}
                onChange={e => setToday(e.target.value)}
                placeholder="e.g., Implement the standup view, review PR #42..."
                className="w-full min-h-[60px] px-3 py-2 text-xs rounded-lg bg-surface border border-border text-foreground placeholder:text-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                rows={2}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">Any blockers?</label>
              <textarea
                value={blockers}
                onChange={e => setBlockers(e.target.value)}
                placeholder="e.g., Waiting on API review from @cto..."
                className="w-full min-h-[60px] px-3 py-2 text-xs rounded-lg bg-surface border border-border text-foreground placeholder:text-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                rows={2}
              />
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !today.trim() || !!todaysEntry}
              >
                {submitting ? (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                ) : (
                  <Send className="w-3 h-3 mr-1.5" />
                )}
                {todaysEntry ? 'Already checked in today' : 'Submit standup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading standups...
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Users className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-medium text-foreground mb-1">No standup entries yet</p>
          <p className="text-xs max-w-md text-center">
            Team members can submit their daily standup check-ins above.
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-2">
            {entries.map((entry) => {
              const entryDev = developers.find(d => d.githubUsername === entry.author);
              return (
                <Card key={entry.id} className="bg-card border-border">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-primary">
                            {(entryDev?.displayName || entry.author).charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {entryDev?.displayName || entry.author}
                          </p>
                          <p className="text-[10px] text-text-muted">@{entry.author}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-text-muted">{entry.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-2">
                    {entry.yesterday && (
                      <div>
                        <p className="text-[10px] font-medium text-text-secondary flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-status-done" /> Yesterday
                        </p>
                        <p className="text-xs text-foreground mt-0.5">{entry.yesterday}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-medium text-text-secondary flex items-center gap-1">
                        <Send className="w-3 h-3 text-primary" /> Today
                      </p>
                      <p className="text-xs text-foreground mt-0.5">{entry.today}</p>
                    </div>
                    {entry.blockers && (
                      <div>
                        <p className="text-[10px] font-medium text-text-secondary flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-500" /> Blockers
                        </p>
                        <p className="text-xs text-foreground mt-0.5">{entry.blockers}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
