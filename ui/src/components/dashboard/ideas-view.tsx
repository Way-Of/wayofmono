'use client';

import { useState } from 'react';
import { useDashboardStore, useAuthStore } from '@/store/dashboard-store';
import { IdeaStatus } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Lightbulb,
  ThumbsUp,
  ArrowUp,
  ArrowDown,
  Plus,
} from 'lucide-react';

const statusConfig: Record<IdeaStatus, { label: string; color: string }> = {
  'proposed': { label: 'Proposed', color: 'bg-status-backlog text-white' },
  'under-review': { label: 'Under Review', color: 'bg-status-review text-black' },
  'accepted': { label: 'Accepted', color: 'bg-status-inprogress text-white' },
  'implemented': { label: 'Implemented', color: 'bg-status-done text-white' },
  'declined': { label: 'Declined', color: 'bg-destructive text-white' },
};

const priorityColor = (p: number) => {
  if (p >= 9) return 'text-destructive';
  if (p >= 7) return 'text-primary';
  if (p >= 5) return 'text-status-review';
  return 'text-text-muted';
};

export function IdeasView() {
  const { ideas, addIdea, updateIdeaPriority, updateIdeaStatus, voteIdea } = useDashboardStore();
  const { currentUser } = useAuthStore();
  const { developers } = useDashboardStore();

  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'votes' | 'newest'>('priority');

  const currentUsername = developers.find(d => d.id === currentUser)?.githubUsername || currentUser || '';

  const handleSubmit = () => {
    if (!formTitle.trim()) return;
    addIdea({ title: formTitle.trim(), description: formDescription.trim(), author: currentUsername });
    setFormTitle('');
    setFormDescription('');
    setShowForm(false);
  };

  const sorted = [...ideas].sort((a, b) => {
    if (sortBy === 'priority') return b.priority - a.priority;
    if (sortBy === 'votes') return b.votes - a.votes;
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Ideas & Prioritization</h2>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" />
          New Idea
        </Button>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Sort by:</span>
        {(['priority', 'votes', 'newest'] as const).map(s => (
          <Button
            key={s}
            variant={sortBy === s ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs capitalize"
            onClick={() => setSortBy(s)}
          >
            {s}
          </Button>
        ))}
        <span className="ml-auto text-xs text-text-muted">{ideas.length} idea{ideas.length !== 1 ? 's' : ''}</span>
      </div>

      <Separator />

      {/* Idea list */}
      <ScrollArea className="max-h-[calc(100vh-280px)]">
        <div className="space-y-3">
          {sorted.map(idea => (
            <Card key={idea.id} className="bg-card border-border hover:border-border-strong transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Priority indicator */}
                  <div className="flex flex-col items-center gap-1 min-w-[48px] pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-text-muted hover:text-primary"
                      onClick={() => updateIdeaPriority(idea.id, Math.min(10, idea.priority + 1))}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <span className={`text-lg font-bold tabular-nums ${priorityColor(idea.priority)}`}>
                      {idea.priority}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-text-muted hover:text-primary"
                      onClick={() => updateIdeaPriority(idea.id, Math.max(1, idea.priority - 1))}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-text-muted">{idea.id}</span>
                      <Badge className={`${statusConfig[idea.status].color} text-[10px] px-1.5 py-0 h-5`}>
                        {statusConfig[idea.status].label}
                      </Badge>
                      <span className="text-xs text-text-muted">by @{idea.author}</span>
                      <span className="text-xs text-text-muted">{idea.created}</span>
                    </div>
                    <h4 className="text-sm font-medium text-foreground">{idea.title}</h4>
                    {idea.description && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">{idea.description}</p>
                    )}
                  </div>

                  {/* Vote + Status actions */}
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 text-xs gap-1 ${idea.voters.includes(currentUsername) ? 'text-primary' : 'text-text-muted'}`}
                      onClick={() => voteIdea(idea.id, currentUsername)}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${idea.voters.includes(currentUsername) ? 'fill-primary' : ''}`} />
                      {idea.votes}
                    </Button>
                    <select
                      value={idea.status}
                      onChange={e => updateIdeaStatus(idea.id, e.target.value as IdeaStatus)}
                      className="text-[10px] bg-surface border border-border-strong rounded px-1 py-0.5 text-text-secondary cursor-pointer"
                    >
                      {(['proposed', 'under-review', 'accepted', 'implemented', 'declined'] as IdeaStatus[]).map(s => (
                        <option key={s} value={s}>{statusConfig[s].label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <Lightbulb className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No ideas yet</p>
              <p className="text-xs mt-1">Submit the first idea to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* New Idea dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-background border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Submit a New Idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-secondary block mb-1">Title</label>
              <input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="What's your idea?"
                className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-muted outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">Description</label>
              <textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Describe your idea in detail..."
                rows={4}
                className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={handleSubmit} disabled={!formTitle.trim()}>
                Submit Idea
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
