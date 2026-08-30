'use client';

import { useState } from 'react';
import { useDashboardStore, useAuthStore } from '@/store/dashboard-store';
import { TicketStatus } from '@/lib/types';
import { MarkdownPreview } from './markdown-preview';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ClipboardCheck,
  ExternalLink,
  GitPullRequest,
  ListTodo,
  BarChart3,
} from 'lucide-react';

const statusColors: Record<TicketStatus, string> = {
  'Backlog': 'bg-status-backlog text-white',
  'In Progress': 'bg-status-inprogress text-white',
  'In Review': 'bg-status-review text-black',
  'Done': 'bg-status-done text-white',
  'Blocked': 'bg-status-blocked text-white',
};

export function MyView() {
  const { currentUser, isCTO } = useAuthStore();
  const { tickets, updateTicketStatus, setCurrentView } = useDashboardStore();

  const dev = useDashboardStore.getState().developers.find(d => d.id === currentUser);
  const myTickets = tickets.filter(t => t.assignee === currentUser);

  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<typeof tickets[0] | null>(null);

  const filtered = myTickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (projectFilter !== 'all' && t.project !== projectFilter) return false;
    return true;
  });

  // Compute stats
  const activeTickets = myTickets.filter(t => t.status === 'In Progress').length;
  const reviewTickets = myTickets.filter(t => t.status === 'In Review').length;
  const blockedTickets = myTickets.filter(t => t.status === 'Blocked').length;
  const doneTickets = myTickets.filter(t => t.status === 'Done').length;
  const backlogTickets = myTickets.filter(t => t.status === 'Backlog').length;
  const totalTodoItems = myTickets.reduce((sum, t) => sum + t.personalBreakdown.length, 0);

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateTicketStatus(ticketId, newStatus);
  };

  if (!dev) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-text-muted">Unable to load your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="w-14 h-14">
          <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
            {dev.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{dev.displayName}</h2>
          <p className="text-sm text-text-muted">
            @{dev.githubUsername} &middot; {dev.role} &middot;{' '}
            {dev.projects.map(p => p).join(', ')}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Backlog', value: backlogTickets, color: 'text-status-backlog', icon: Circle },
          { label: 'Active', value: activeTickets, color: 'text-status-inprogress', icon: Clock },
          { label: 'In Review', value: reviewTickets, color: 'text-status-review', icon: ClipboardCheck },
          { label: 'Blocked', value: blockedTickets, color: 'text-destructive', icon: AlertTriangle },
          { label: 'Done', value: doneTickets, color: 'text-status-done', icon: CheckCircle2 },
        ].map(item => (
          <Card key={item.label} className="bg-card border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                item.value > 0 ? 'bg-accent' : 'bg-surface'
              }`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-text-muted uppercase">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personal TODO */}
      {totalTodoItems > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-primary" />
                Personal TODO Breakdown
              </CardTitle>
              <span className="text-xs text-text-muted">{totalTodoItems} items across {myTickets.filter(t => t.personalBreakdown.length > 0).length} tickets</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-4">
              {myTickets
                .filter(t => t.personalBreakdown.length > 0 && t.status !== 'Done')
                .map(ticket => (
                  <div key={ticket.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-text-muted">{ticket.id}</span>
                      <Badge className={`${statusColors[ticket.status]} text-[9px] px-1.5 py-0 h-4`}>
                        {ticket.status}
                      </Badge>
                      <span className="text-xs text-text-secondary font-medium">{ticket.title}</span>
                    </div>
                    <ul className="space-y-1.5 ml-4">
                      {ticket.personalBreakdown.map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm text-text-secondary">
                          <Circle className="w-3 h-3 text-text-muted flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-surface border-border-strong text-foreground h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Statuses</SelectItem>
            {(['Backlog', 'In Progress', 'In Review', 'Done', 'Blocked'] as TicketStatus[]).map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[140px] bg-surface border-border-strong text-foreground h-8 text-xs">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Projects</SelectItem>
            {dev.projects.map(p => {
              const proj = undefined;
              return (
                <SelectItem key={p} value={p}>{proj?.name || p}</SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-text-muted">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Ticket list */}
      <ScrollArea className="max-h-[500px]">
        <div className="space-y-2">
          {filtered.map(ticket => (
            <Card key={ticket.id} className="bg-card border-border hover:border-border-strong transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-text-muted">{ticket.id}</span>
                      <Badge variant="outline" className="text-[10px] h-5 border-border-strong text-text-muted px-1.5 font-mono">
                        {ticket.project}
                      </Badge>
                      <Badge className={`${statusColors[ticket.status]} text-[10px] px-1.5 py-0 h-5`}>
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-5 border-border text-text-muted px-1.5">
                        {ticket.priority}
                      </Badge>
                    </div>
                    <button
                      className="text-left w-full"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <h4 className="text-sm font-medium text-foreground hover:text-primary transition-colors">{ticket.title}</h4>
                      <div className="text-xs text-text-muted mt-1 overflow-x-auto max-w-full">
                        <div className="line-clamp-3" style={{ wordBreak: 'break-word' }}>
                          {ticket.description}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Status actions */}
                {ticket.status !== 'Done' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Move to:</span>
                    {ticket.status !== 'In Progress' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-status-inprogress hover:text-status-inprogress hover:bg-status-inprogress/10 px-2"
                        onClick={() => handleStatusChange(ticket.id, 'In Progress')}
                      >
                        In Progress
                      </Button>
                    )}
                    {ticket.status !== 'In Review' && ticket.status !== 'Backlog' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-status-review hover:text-status-review hover:bg-status-review/10 px-2"
                        onClick={() => handleStatusChange(ticket.id, 'In Review')}
                      >
                        Submit for Review
                      </Button>
                    )}
                    {ticket.status !== 'Blocked' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                        onClick={() => handleStatusChange(ticket.id, 'Blocked')}
                      >
                        Block
                      </Button>
                    )}
                    {ticket.prUrl && (
                      <a
                        href={ticket.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-[10px] text-text-muted hover:text-primary transition-colors"
                      >
                        <GitPullRequest className="w-3 h-3" /> PR <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      {/* Markdown preview dialog */}
      {selectedTicket && (
        <MarkdownPreview
          title={`${selectedTicket.id} - ${selectedTicket.title}`}
          body={selectedTicket.description}
          type={selectedTicket.type}
          project={selectedTicket.project}
          author={selectedTicket.assignee}
          updated={selectedTicket.updated}
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}