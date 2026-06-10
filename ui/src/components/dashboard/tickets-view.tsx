'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import { useAuthStore } from '@/store/dashboard-store';
import { Ticket, TicketStatus, TicketPriority, TicketType } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  ExternalLink,
  GitPullRequest,
  FileText,
  Calendar,
  User,
  Tag,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const statusColors: Record<TicketStatus, string> = {
  'Backlog': 'bg-status-backlog text-white',
  'In Progress': 'bg-status-inprogress text-white',
  'In Review': 'bg-status-review text-black',
  'Done': 'bg-status-done text-white',
  'Blocked': 'bg-status-blocked text-white',
};

const priorityConfig: Record<TicketPriority, { color: string; order: number }> = {
  'Critical': { color: 'text-destructive', order: 0 },
  'High': { color: 'text-primary', order: 1 },
  'Medium': { color: 'text-status-review', order: 2 },
  'Low': { color: 'text-text-muted', order: 3 },
};

const typeIcons: Record<TicketType, string> = {
  'Feature': 'F',
  'Bug': 'B',
  'Task': 'T',
  'Research': 'R',
  'Refactor': 'Ref',
  'Docs': 'D',
};

function TicketRow({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const pCfg = priorityConfig[ticket.priority];
  const dev = useDashboardStore.getState().developers.find(d => d.id === ticket.assignee);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-elevated border border-transparent hover:border-border-strong transition-all cursor-pointer group"
    >
      {/* Type badge */}
      <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-[10px] font-bold text-text-secondary flex-shrink-0">
        {typeIcons[ticket.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono text-text-muted">{ticket.id}</span>
          <Badge variant="outline" className="text-[10px] h-5 border-border-strong text-text-muted px-1.5 font-mono">
            {ticket.project}
          </Badge>
        </div>
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {ticket.title}
        </p>
      </div>

      {/* Assignee */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-text-secondary">
          {dev?.displayName.charAt(0) || '?'}
        </div>
        <span className="text-xs text-text-muted">@{ticket.assignee}</span>
      </div>

      {/* Priority */}
      <span className={`text-xs font-medium flex-shrink-0 ${pCfg.color}`}>
        {ticket.priority}
      </span>

      {/* Status */}
      <Badge className={`${statusColors[ticket.status]} text-[10px] px-2 py-0.5 h-6 flex-shrink-0`}>
        {ticket.status}
      </Badge>

      {/* PR link */}
      {ticket.prUrl && (
        <a
          href={ticket.prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <GitPullRequest className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

function TicketDetailDialog({ ticket, open, onClose }: { ticket: Ticket | null; open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  if (!ticket) return null;
  const pCfg = priorityConfig[ticket.priority];
  const reporter = useDashboardStore.getState().developers.find(d => d.id === ticket.reporter);
  const assignee = useDashboardStore.getState().developers.find(d => d.id === ticket.assignee);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-mono text-xs border-border-strong text-text-muted">
              {ticket.id}
            </Badge>
            <Badge className={`${statusColors[ticket.status]} text-[10px]`}>{ticket.status}</Badge>
            <Badge variant="outline" className="text-[10px] border-border-strong text-text-muted">{ticket.type}</Badge>
          </div>
          <DialogTitle className="text-lg text-foreground">{ticket.title}</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">{ticket.description}</DialogDescription>
        </DialogHeader>

        <Separator className="bg-border" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3" /> Assignee</p>
            <p className="text-sm text-foreground">@{ticket.assignee} {assignee ? `(${assignee.displayName})` : ''}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3" /> Reporter</p>
            <p className="text-sm text-foreground">@{ticket.reporter}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1"><Tag className="w-3 h-3" /> Priority</p>
            <p className={`text-sm font-medium ${pCfg.color}`}>{ticket.priority}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Updated</p>
            <p className="text-sm text-foreground">{ticket.updated}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-border text-text-muted text-xs">{ticket.namespace}/{ticket.category}</Badge>
          <Badge variant="outline" className="border-border text-text-muted text-xs">{ticket.project}</Badge>
          {ticket.prUrl && (
            <a href={ticket.prUrl} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="border-primary/50 text-primary text-xs hover:bg-primary/10 cursor-pointer">
                <GitPullRequest className="w-3 h-3 mr-1" /> View PR
              </Badge>
            </a>
          )}
          {ticket.githubIssue && (
            <a href={ticket.githubIssue} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="border-border text-text-muted text-xs hover:bg-accent cursor-pointer">
                <ExternalLink className="w-3 h-3 mr-1" /> GitHub Issue
              </Badge>
            </a>
          )}
        </div>

        {/* Review info */}
        {ticket.status === 'In Review' && (
          <>
            <Separator className="bg-border" />
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Review</h4>
              <div className="flex items-center gap-3">
                <Badge className={
                  ticket.reviewStatus === 'Approved' ? 'bg-status-done text-white text-xs' :
                  ticket.reviewStatus === 'Changes Requested' ? 'bg-destructive text-white text-xs' :
                  'bg-status-review text-black text-xs'
                }>
                  {ticket.reviewStatus}
                </Badge>
                {ticket.reviewedBy && (
                  <span className="text-xs text-text-muted">Reviewed by @{ticket.reviewedBy} on {ticket.reviewedAt}</span>
                )}
              </div>
              {ticket.reviewComments && (
                <p className="text-sm text-text-secondary bg-surface p-3 rounded-lg border border-border">
                  &ldquo;{ticket.reviewComments}&rdquo;
                </p>
              )}
            </div>
          </>
        )}

        {/* Personal TODO */}
        {ticket.personalBreakdown.length > 0 && (
          <>
            <Separator className="bg-border" />
            <div className="space-y-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <FileText className="w-3 h-3" />
                Task Breakdown ({ticket.personalBreakdown.length} items)
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {expanded && (
                <ul className="space-y-1.5">
                  {ticket.personalBreakdown.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <div className="w-1.5 h-1.5 rounded-full bg-text-muted mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* Linked docs */}
        {ticket.linkedDocs.length > 0 && (
          <>
            <Separator className="bg-border" />
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3" /> Linked Docs
              </h4>
              <div className="flex flex-wrap gap-2">
                {ticket.linkedDocs.map(docId => (
                  <Badge key={docId} variant="outline" className="border-border text-text-muted text-xs cursor-pointer hover:bg-accent">
                    {docId}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TicketsView() {
  const {
    searchQuery, setSearchQuery,
    filterProject, setFilterProject,
    filterStatus, setFilterStatus,
    filterPriority, setFilterPriority,
    filterCategory, setFilterCategory,
    getFilteredTickets,
    setSelectedTicket,
  } = useDashboardStore();
  const { currentUser, isCTO } = useAuthStore();

  const [selectedTicket, setSelectedTicketState] = useState<Ticket | null>(null);

  const filteredTickets = getFilteredTickets()
    .sort((a, b) => priorityConfig[a.priority].order - priorityConfig[b.priority].order);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedTicketState(ticket);
  };

  // Get unique categories from tickets
  const allTickets = useDashboardStore(s => s.tickets);
  const categories = [...new Set(allTickets.map(t => t.category))].sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Tickets</h2>
          <p className="text-sm text-text-muted mt-0.5">{filteredTickets.length} tickets across all projects</p>
        </div>
        <Badge variant="outline" className="border-border text-text-muted text-xs">
          f-rr-d &middot; Live
        </Badge>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets by ID, title, assignee..."
                className="pl-9 bg-surface border-border-strong text-foreground placeholder:text-text-muted focus:border-primary focus:ring-primary h-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="w-[130px] bg-surface border-border-strong text-foreground h-9 text-xs">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Projects</SelectItem>
                  {[{ slug: 'wayofmono', name: 'WayOfMono' }, { slug: 'wow', name: 'WoW' }, { slug: 'opticat', name: 'OptiCat' }].map(p => (
                    <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px] bg-surface border-border-strong text-foreground h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {(['Backlog', 'In Progress', 'In Review', 'Done', 'Blocked'] as TicketStatus[]).map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[120px] bg-surface border-border-strong text-foreground h-9 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Priorities</SelectItem>
                  {(['Critical', 'High', 'Medium', 'Low'] as TicketPriority[]).map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[120px] bg-surface border-border-strong text-foreground h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket list */}
      <ScrollArea className="max-h-[calc(100vh-320px)]">
        <div className="space-y-2">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tickets match your filters</p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <TicketRow key={ticket.id} ticket={ticket} onClick={() => handleTicketClick(ticket)} />
            ))
          )}
        </div>
      </ScrollArea>

      <TicketDetailDialog
        ticket={selectedTicket}
        open={!!selectedTicket}
        onClose={() => setSelectedTicketState(null)}
      />
    </div>
  );
}