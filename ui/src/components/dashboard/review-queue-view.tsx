'use client';

import { useState } from 'react';
import { useDashboardStore, useAuthStore } from '@/store/dashboard-store';
import { developers } from '@/lib/mock-data';
import { ReviewStatus } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  GitPullRequest,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export function ReviewQueueView() {
  const { tickets, updateTicketReview } = useDashboardStore();
  const { currentUser } = useAuthStore();

  const reviewTickets = tickets.filter(t => t.status === 'In Review' && t.reviewStatus === 'Pending');

  const [actionTicket, setActionTicket] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'changes'>('approve');
  const [comments, setComments] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAction = (ticketId: string, type: 'approve' | 'changes') => {
    setActionTicket(ticketId);
    setActionType(type);
    setComments('');
    setDialogOpen(true);
  };

  const submitReview = () => {
    if (!actionTicket) return;
    const reviewStatus: ReviewStatus = actionType === 'approve' ? 'Approved' : 'Changes Requested';
    updateTicketReview(actionTicket, reviewStatus, comments);
    setDialogOpen(false);
    setActionTicket(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date('2026-06-10');
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Review Queue</h2>
          <p className="text-sm text-text-muted mt-0.5">
            {reviewTickets.length} ticket{reviewTickets.length !== 1 ? 's' : ''} awaiting your review
          </p>
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary text-xs">
          CTO Only
        </Badge>
      </div>

      {reviewTickets.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-status-done mx-auto mb-3" />
            <p className="text-foreground font-medium">All caught up!</p>
            <p className="text-sm text-text-muted mt-1">No tickets pending review</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-200px)]">
          <div className="space-y-3">
            {reviewTickets.map(ticket => {
              const assignee = developers.find(d => d.id === ticket.assignee);
              const daysSinceUpdate = formatDate(ticket.updated);
              const isStale = new Date(ticket.updated).getTime() < new Date('2026-06-08').getTime();

              return (
                <Card key={ticket.id} className="bg-card border-border hover:border-border-strong transition-colors">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 mt-0.5">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                          {assignee?.displayName.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-text-muted">{ticket.id}</span>
                          <Badge variant="outline" className="text-[10px] h-5 border-border-strong text-text-muted px-1.5 font-mono">
                            {ticket.project}
                          </Badge>
                          <Badge className={`${ticket.priority === 'Critical' ? 'bg-destructive text-white' : ticket.priority === 'High' ? 'bg-primary text-white' : 'bg-status-review text-black'} text-[10px] px-1.5 py-0 h-5`}>
                            {ticket.priority}
                          </Badge>
                          {isStale && (
                            <Badge variant="outline" className="text-[10px] h-5 border-destructive/50 text-destructive px-1.5">
                              <AlertTriangle className="w-3 h-3 mr-0.5" /> Stale
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">{ticket.title}</h3>
                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 ml-13 pl-13">
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Updated {daysSinceUpdate}
                      </span>
                      <span className="text-xs text-text-muted">
                        by @{ticket.assignee} {assignee ? `(${assignee.displayName})` : ''}
                      </span>
                      {ticket.prUrl && (
                        <a
                          href={ticket.prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-text-muted hover:text-primary flex items-center gap-1 transition-colors"
                        >
                          <GitPullRequest className="w-3 h-3" /> View PR <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                    <Separator className="bg-border my-3" />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                        onClick={() => handleAction(ticket.id, 'changes')}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Request Changes
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                        onClick={() => handleAction(ticket.id, 'approve')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Review dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {actionType === 'approve' ? 'Approve Ticket' : 'Request Changes'}
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              {actionType === 'approve'
                ? 'This will mark the ticket as Done.'
                : 'This will return the ticket to the developer with your feedback.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-sm text-foreground font-medium mb-1.5 block">
              Review comments {actionType === 'changes' ? '*' : '(optional)'}
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={actionType === 'approve'
                ? 'Any notes for the approval...'
                : 'Describe the changes needed...'}
              className="bg-surface border-border-strong text-foreground placeholder:text-text-muted focus:border-primary focus:ring-primary min-h-[100px] text-sm"
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-text-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              className={
                actionType === 'approve'
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'bg-destructive hover:bg-destructive/90 text-white'
              }
            >
              {actionType === 'approve' ? (
                <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve</>
              ) : (
                <><RotateCcw className="w-4 h-4 mr-1.5" /> Request Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}