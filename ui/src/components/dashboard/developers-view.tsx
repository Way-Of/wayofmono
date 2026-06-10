'use client';

import { useDashboardStore, useAuthStore } from '@/store/dashboard-store';
import { Ticket, TicketStatus, ProjectSlug } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';

const columns: { status: TicketStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'Backlog', label: 'Backlog', icon: Clock, color: 'text-status-backlog' },
  { status: 'In Progress', label: 'In Progress', icon: Loader2, color: 'text-status-inprogress' },
  { status: 'In Review', label: 'In Review', icon: ClipboardCheck, color: 'text-status-review' },
  { status: 'Done', label: 'Done', icon: CheckCircle2, color: 'text-status-done' },
  { status: 'Blocked', label: 'Blocked', icon: AlertTriangle, color: 'text-status-blocked' },
];

const statusColors: Record<TicketStatus, string> = {
  'Backlog': 'bg-status-backlog text-white',
  'In Progress': 'bg-status-inprogress text-white',
  'In Review': 'bg-status-review text-black',
  'Done': 'bg-status-done text-white',
  'Blocked': 'bg-status-blocked text-white',
};

function KanbanColumn({ status, label, icon: Icon, color, tickets, onTicketClick }: {
  status: TicketStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  tickets: Ticket[];
  onTicketClick: (t: Ticket) => void;
}) {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="ml-auto text-xs text-text-muted bg-surface px-2 py-0.5 rounded-full">
          {tickets.length}
        </span>
      </div>
      <ScrollArea className="max-h-[calc(100vh-280px)]">
        <div className="space-y-2">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => onTicketClick(ticket)}
              className="kanban-card p-3 rounded-lg bg-card border border-border hover:border-border-strong cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono text-text-muted">{ticket.id}</span>
                <Badge className={`${statusColors[ticket.status]} text-[9px] px-1.5 py-0 h-4`}>
                  {ticket.type}
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground leading-snug mb-2">
                {ticket.title}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] h-5 border-border-strong text-text-muted px-1.5 font-mono">
                  {ticket.project}
                </Badge>
                <span className={`text-[10px] font-medium ${
                  ticket.priority === 'Critical' ? 'text-destructive' :
                  ticket.priority === 'High' ? 'text-primary' :
                  ticket.priority === 'Medium' ? 'text-status-review' : 'text-text-muted'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="text-center py-6 text-text-muted text-xs">No tickets</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function DeveloperProfile({ devId }: { devId: string }) {
  const dev = developers.find(d => d.id === devId);
  if (!dev) return null;

  const devTickets = useDashboardStore.getState().tickets.filter(t => t.assignee === devId);
  const inProgress = devTickets.filter(t => t.status === 'In Progress').length;
  const inReview = devTickets.filter(t => t.status === 'In Review').length;
  const blocked = devTickets.filter(t => t.status === 'Blocked').length;
  const done = devTickets.filter(t => t.status === 'Done').length;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
              {dev.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-semibold text-foreground">{dev.displayName}</h3>
            <p className="text-xs text-text-muted">@{dev.githubUsername} &middot; {dev.role}</p>
          </div>
          <Badge className="ml-auto bg-primary/15 text-primary text-[10px] border-0">
            {dev.projects.length} project{dev.projects.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Active', value: inProgress, color: 'text-status-inprogress' },
            { label: 'Review', value: inReview, color: 'text-status-review' },
            { label: 'Blocked', value: blocked, color: 'text-destructive' },
            { label: 'Done', value: done, color: 'text-status-done' },
          ].map(item => (
            <div key={item.label} className="text-center p-2 rounded-lg bg-surface">
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-text-muted uppercase">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {dev.projects.map(p => {
            const proj = projects.find(pr => pr.slug === p);
            return (
              <Badge key={p} variant="outline" className="text-[10px] border-border text-text-muted">
                {proj?.name || p}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function DevelopersView() {
  const { tickets, selectedDeveloper, setSelectedDeveloper, setCurrentView } = useDashboardStore();
  const { isCTO } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState('all');

  const activeDev = selectedDeveloper || developers[0].id;
  const devTickets = tickets.filter(t => {
    if (t.assignee !== activeDev) return false;
    if (selectedProject !== 'all' && t.project !== selectedProject) return false;
    return true;
  });

  const handleTicketClick = (ticket: Ticket) => {
    setCurrentView('tickets');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Developer Workflow</h2>
          <p className="text-sm text-text-muted mt-0.5">Per-developer view of tickets and progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[140px] bg-surface border-border-strong text-foreground h-8 text-xs">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Developer selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {developers.map(dev => (
          <button
            key={dev.id}
            onClick={() => setSelectedDeveloper(dev.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeDev === dev.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface text-text-secondary hover:bg-surface-elevated hover:text-foreground'
              }
            `}
          >
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-[10px] bg-background/20">
                {dev.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {dev.displayName}
            {dev.role === 'CTO' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-background/20">CTO</span>
            )}
          </button>
        ))}
      </div>

      {/* Profile */}
      <DeveloperProfile devId={activeDev} />

      <Separator className="bg-border" />

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <KanbanColumn
            key={col.status}
            {...col}
            tickets={devTickets.filter(t => t.status === col.status)}
            onTicketClick={handleTicketClick}
          />
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';