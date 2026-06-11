'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore, useDashboardStore } from '@/store/dashboard-store';
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
import { Badge } from '@/components/ui/badge';
import { Bell, ArrowLeft } from 'lucide-react';
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
};

export default function DashboardPage() {
  const { currentUser, canReview } = useAuthStore();
  const { currentView, tickets, viewHistory, goBack, fetchData, setSelectedTicket, setCurrentView } = useDashboardStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const fromPop = useRef(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const reviewQueue = tickets.filter(t => t.status === 'In Review' && t.reviewStatus === 'Pending');
  const reviewCount = canReview ? reviewQueue.length : 0;

  const recentTickets = tickets.filter(t => {
    if (!t.updated) return false;
    const d = new Date(t.updated);
    return d >= weekAgo;
  }).filter(t => !(canReview && t.status === 'In Review' && t.reviewStatus === 'Pending'))
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());

  const totalNotifications = reviewCount + recentTickets.length;

  const openTicket = (ticket: typeof tickets[0]) => {
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
                onClick={() => setBellOpen(!bellOpen)}
              >
                <Bell className="w-4 h-4" />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                  </span>
                )}
              </Button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  {recentTickets.length > 0 && (
                    <>
                      <div className="p-3 border-b border-border">
                        <p className="text-xs font-semibold text-foreground">Recent Updates</p>
                        <p className="text-[10px] text-text-muted">{recentTickets.length} ticket{recentTickets.length !== 1 ? 's' : ''} updated this week</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-border">
                        {recentTickets.slice(0, 5).map(t => (
                          <button
                            key={t.id}
                            onClick={() => openTicket(t)}
                            className="w-full text-left p-2.5 hover:bg-surface transition-colors"
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
                        <p className="text-xs font-semibold text-foreground">Pending Reviews</p>
                        <p className="text-[10px] text-text-muted">{reviewCount} ticket{reviewCount !== 1 ? 's' : ''} awaiting review</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-border">
                        {reviewQueue.map(t => (
                          <button
                            key={t.id}
                            onClick={() => openTicket(t)}
                            className="w-full text-left p-2.5 hover:bg-surface transition-colors"
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

                  {totalNotifications === 0 && (
                    <div className="p-6 text-center text-text-muted text-sm">No notifications</div>
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
            <div className="flex items-center gap-1.5 text-text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-status-done" />
              <span className="text-[10px]">Live</span>
            </div>
          </div>
        </header>

        <div className="p-6">{renderView()}</div>
      </main>
    </div>
  );
}
