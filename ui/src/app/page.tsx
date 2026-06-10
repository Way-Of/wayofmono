'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useDashboardStore } from '@/store/dashboard-store';
import { LoginPage } from '@/components/dashboard/login-page';
import { Sidebar } from '@/components/dashboard/sidebar';
import { OverviewView } from '@/components/dashboard/overview-view';
import { TicketsView } from '@/components/dashboard/tickets-view';
import { DevelopersView } from '@/components/dashboard/developers-view';
import { ReviewQueueView } from '@/components/dashboard/review-queue-view';
import { DocsView } from '@/components/dashboard/docs-view';
import { MyView } from '@/components/dashboard/my-view';
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
};

export default function DashboardPage() {
  const { currentUser, isCTO } = useAuthStore();
  const { currentView, tickets, viewHistory, goBack, fetchData } = useDashboardStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!currentUser) return <LoginPage />;

  const reviewCount = tickets.filter(t => t.status === 'In Review' && t.reviewStatus === 'Pending').length;

  const renderView = () => {
    switch (currentView) {
      case 'overview': return <OverviewView />;
      case 'tickets': return <TicketsView />;
      case 'developers': return isCTO ? <DevelopersView /> : <OverviewView />;
      case 'review': return isCTO ? <ReviewQueueView /> : <OverviewView />;
      case 'docs': return <DocsView />;
      case 'my-view': return <MyView />;
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative h-8 w-8 text-text-muted hover:text-foreground">
              <Bell className="w-4 h-4" />
              {reviewCount > 0 && isCTO && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />}
            </Button>
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
