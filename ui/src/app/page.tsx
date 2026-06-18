'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore, useDashboardStore, useNotificationStore } from '@/store/dashboard-store';
import { LoginPage } from '@/components/dashboard/login-page';
import { Sidebar } from '@/components/dashboard/sidebar';
import { OverviewView } from '@/components/dashboard/overview-view';
import { TicketsView, TicketDetailView } from '@/components/dashboard/tickets-view';
import { DevelopersView } from '@/components/dashboard/developers-view';
import { ReviewQueueView } from '@/components/dashboard/review-queue-view';
import { DocsView } from '@/components/dashboard/docs-view';
import { MyView } from '@/components/dashboard/my-view';
import { SkillsView } from '@/components/dashboard/skills-view';
import { IdeasView } from '@/components/dashboard/ideas-view';
import { StandupView } from '@/components/dashboard/standup-view';
import { NewsView } from '@/components/dashboard/news-view';
import { ProfileView } from '@/components/dashboard/profile-view';
import { SettingsView } from '@/components/dashboard/settings-view';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const viewLabels: Record<string, string> = {
  overview: 'Overview',
  tickets: 'Tickets',
  developers: 'Developer Workflow',
  review: 'Review Queue',
  docs: 'Documentation',
  'my-view': 'My View',
  skills: 'AI Harness Skills',
  'ticket-detail': 'Ticket Details',
  ideas: 'Ideas & Prioritization',
  standup: 'Daily Standup',
  news: 'News',
  profile: 'Profile',
  settings: 'Settings',
};

export default function DashboardPage() {
  const { currentUser, canReview } = useAuthStore();
  const { currentView, tickets, viewHistory, goBack, fetchData, setSelectedTicket, setCurrentView, actualSource } = useDashboardStore();
  const { readNotificationIds, markAsRead, markAllAsRead } = useNotificationStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const fromPop = useRef(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { useNotificationStore.getState().loadReadState(); }, []);

  useEffect(() => {
    if (!currentUser) return;
    const handler = () => {
      fromPop.current = true;
      const history = useDashboardStore.getState().viewHistory;
      if (history.length > 0) useDashboardStore.getState().goBack();
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || fromPop.current) {
      fromPop.current = false;
      return;
    }
    window.history.pushState(null, '');
  }, [currentView, currentUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    if (bellOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  if (!currentUser) return <LoginPage />;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const notifId = (t: typeof tickets[0], isReview: boolean) => isReview ? `review-${t.id}` : `update-${t.id}`;
  const isUnread = (t: typeof tickets[0], isReview: boolean) => !readNotificationIds.has(notifId(t, isReview));

  const reviewQueue = tickets.filter(t => t.status === 'In Review' && t.reviewStatus === 'Pending');
  const unreadReviewCount = canReview ? reviewQueue.filter(t => isUnread(t, true)).length : 0;

  const recentTickets = tickets.filter(t => {
    if (!t.updated) return false;
    const d = new Date(t.updated);
    return d >= weekAgo;
  }).filter(t => !(canReview && t.status === 'In Review' && t.reviewStatus === 'Pending'))
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());

  const unreadRecentCount = recentTickets.filter(t => isUnread(t, false)).length;
  const totalUnreadNotifications = unreadReviewCount + unreadRecentCount;

  const allNotifIds = (t: typeof tickets[0]) => notifId(t, t.status === 'In Review' && t.reviewStatus === 'Pending');

  const handleUpdateForrad = async () => {
    setUpdating(true);
    setUpdateMessage(null);
    try {
      const res = await fetch('/api/update-forrad', { method: 'POST' });
      const data = await res.json();
      setUpdateMessage(data.message);
      if (data.success) {
        fetchData();
      }
    } catch {
      setUpdateMessage('Failed to update f-rr-d');
    } finally {
      setUpdating(false);
      setTimeout(() => setUpdateMessage(null), 5000);
    }
  };

  const openTicket = (ticket: typeof tickets[0]) => {
    const id = notifId(ticket, ticket.status === 'In Review' && ticket.reviewStatus === 'Pending');
    markAsRead(id);
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-read', notificationId: id }),
    }).catch(() => {});
    setSelectedTicket(ticket);
    setCurrentView('ticket-detail');
    setBellOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview': return <OverviewView />;
      case 'tickets': return <TicketsView />;
      case 'developers': return canReview ? <DevelopersView /> : <OverviewView />;
      case 'review': return canReview ? <ReviewQueueView /> : <OverviewView />;
      case 'docs': return <DocsView />;
      case 'my-view': return <MyView />;
      case 'skills': return canReview ? <SkillsView /> : <OverviewView />;
      case 'ideas': return <IdeasView />;
      case 'standup': return <StandupView />;
      case 'news': return <NewsView />;
      case 'ticket-detail': return <TicketDetailView />;
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      default: return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-200 min-h-screen ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {viewHistory.length > 0 && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-foreground" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-sm font-semibold text-foreground">{viewLabels[currentView] || 'Dashboard'}</h1>
            <Badge variant="outline" className="text-[10px] h-5 border-border text-text-muted font-mono">f-rr-d</Badge>
          </div>
          <div className="flex items-center gap-3" ref={bellRef}>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-text-muted hover:text-foreground"
                onClick={() => {
                  const ids = [...reviewQueue, ...recentTickets].map(t => allNotifIds(t));
                  markAllAsRead(ids);
                  fetch('/api/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'mark-all-read', notificationIds: ids }),
                  }).catch(() => {});
                  setBellOpen(!bellOpen);
                }}
              >
                <Bell className="w-4 h-4" />
                {totalUnreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalUnreadNotifications > 9 ? '9+' : totalUnreadNotifications}
                  </span>
                )}
              </Button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  {recentTickets.length > 0 && (
                    <>
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground">Recent Updates</p>
                          {unreadRecentCount > 0 && (
                            <span className="text-[10px] font-medium text-primary">{unreadRecentCount} new</span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-muted">{recentTickets.length} ticket{recentTickets.length !== 1 ? 's' : ''} updated this week</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-border">
                        {recentTickets.slice(0, 5).map(t => (
                          <button
                            key={t.id}
                            onClick={() => openTicket(t)}
                            className={`w-full text-left p-2.5 transition-colors ${isUnread(t, false) ? 'ring-1 ring-primary/30 bg-primary/5' : 'hover:bg-surface'}`}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                t.status === 'Done' ? 'bg-status-done' :
                                t.status === 'In Progress' ? 'bg-status-inprogress' :
                                t.status === 'Blocked' ? 'bg-status-blocked' :
                                'bg-status-backlog'
                              }`} />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">
                                  {t.status} &middot; @{t.assignee || 'unassigned'} &middot; {t.project}
                                </p>
                              </div>
                              <span className="text-[10px] text-text-muted flex-shrink-0">{t.updated}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {canReview && reviewQueue.length > 0 && (
                    <>
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground">Pending Reviews</p>
                          {unreadReviewCount > 0 && (
                            <span className="text-[10px] font-medium text-primary">{unreadReviewCount} new</span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-muted">{reviewQueue.length} ticket{reviewQueue.length !== 1 ? 's' : ''} awaiting review</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-border">
                        {reviewQueue.map(t => (
                          <button
                            key={t.id}
                            onClick={() => openTicket(t)}
                            className={`w-full text-left p-2.5 transition-colors ${isUnread(t, true) ? 'ring-1 ring-primary/30 bg-primary/5' : 'hover:bg-surface'}`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-status-review mt-1.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">
                                  @{t.assignee} &middot; {t.priority} &middot; {t.project}
                                </p>
                              </div>
                              <span className="text-[10px] text-text-muted flex-shrink-0">{t.updated}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {totalUnreadNotifications === 0 && (
                    <div className="p-6 text-center text-text-muted text-sm">All caught up</div>
                  )}

                  <div className="p-2 border-t border-border bg-surface flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs text-text-muted hover:text-foreground"
                      onClick={() => { setCurrentView('review'); setBellOpen(false); }}
                    >
                      Review Queue
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs text-text-muted hover:text-foreground"
                      onClick={() => { setCurrentView('tickets'); setBellOpen(false); }}
                    >
                      All Tickets
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {updateMessage && (
                <span className="text-[10px] text-text-muted max-w-40 truncate">{updateMessage}</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                disabled={updating}
                onClick={handleUpdateForrad}
                className="h-7 text-[10px] gap-1 text-text-muted hover:text-foreground px-2"
              >
                <RefreshCw className={`w-3 h-3 ${updating ? 'animate-spin' : ''}`} />
                {updating ? 'Syncing...' : 'Update'}
              </Button>
              <div className="flex items-center gap-1.5 text-text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-status-done" />
                <span className="text-[10px]">Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Source info banner — shows when actual source differs from requested or is unauthenticated */}
        {actualSource && (actualSource.actual !== actualSource.requested || actualSource.actual === 'github-unauth') && (
          <div className={`px-6 py-1.5 flex items-center gap-2 text-[11px] border-b ${
            actualSource.actual === 'local'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
          }`}>
            <span className="font-medium">
              {actualSource.actual === 'local' ? '⚠️ FALLBACK' : 'ℹ️ GitHub (unauthenticated)'}
            </span>
            <span className="opacity-80">&mdash; {actualSource.reason}</span>
          </div>
        )}

        <div className="p-6">{renderView()}</div>
      </main>
    </div>
  );
}
