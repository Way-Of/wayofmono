'use client';

import { useAuthStore, useDashboardStore } from '@/store/dashboard-store';
import { ViewMode } from '@/lib/types';
import {
  LayoutDashboard,
  Ticket,
  Users,
  ClipboardCheck,
  FileText,
  User,
  Cpu,
  Lightbulb,
  LogOut,
  ChevronLeft,
  RefreshCw,
  MessageSquareText,
  Newspaper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SyncFörrådButton } from '@/components/ui/sync-forrad-button';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: { id: ViewMode; label: string; icon: React.ElementType; ctoOnly?: boolean; reviewOnly?: boolean }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'developers', label: 'Developers', icon: Users, reviewOnly: true },
  { id: 'review', label: 'Review Queue', icon: ClipboardCheck, reviewOnly: true },
  { id: 'docs', label: 'Docs', icon: FileText },
  { id: 'my-view', label: 'My View', icon: User },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'standup', label: 'Standup', icon: MessageSquareText },
  { id: 'skills', label: 'Skills', icon: Cpu, reviewOnly: true },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { currentUser, canReview, logout } = useAuthStore();
  const { currentView, setCurrentView } = useDashboardStore();
  const tickets = useDashboardStore((s) => s.tickets);
  const reviewCount = tickets.filter(t => t.status === 'In Review' && t.reviewStatus === 'Pending').length;

  const developers = useDashboardStore(s => s.developers);
  const dev = developers.find(d => d.id === currentUser);

  const visibleItems = navItems.filter(item => {
    if (item.reviewOnly && !canReview) return false;
    return true;
  });

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-sidebar border-r border-sidebar-border
          flex flex-col transition-all duration-200
          ${collapsed ? 'w-16' : 'w-60'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center h-14 px-4 border-b border-sidebar-border ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">WO</span>
              </div>
              <span className="font-semibold text-sm text-sidebar-foreground">WayOfMono</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">WO</span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const badge = item.id === 'review' ? reviewCount : 0;

            const btn = (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors relative group
                  ${isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
                {badge > 0 && (
                  <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold`}>
                    {badge}
                  </span>
                )}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-surface-elevated text-foreground border-border">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return btn;
          })}
        </nav>

        {/* Sync button */}
        <div className="px-2 mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <SyncFörrådButton />
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-surface-elevated text-foreground border-border">
              Pull latest from f-rr-d
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* User section */}
        <div className={`flex items-center h-14 px-3 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {!collapsed && dev && (
            <>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {dev.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{dev.displayName}</p>
                <p className="text-xs text-sidebar-foreground/50">@{dev.githubUsername}</p>
              </div>
            </>
          )}
          {collapsed && dev && (
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {dev.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground/50 hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? 'right' : 'top'} className="bg-surface-elevated text-foreground border-border">
              Sign out
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={`
          fixed top-4 z-50 w-6 h-6 rounded-full bg-card border border-border
          flex items-center justify-center text-text-muted hover:text-foreground
          transition-all hover:border-border-strong
          ${collapsed ? 'left-[72px]' : 'left-[248px]'}
        `}
      >
        <ChevronLeft className={`w-3 h-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>
    </TooltipProvider>
  );
}