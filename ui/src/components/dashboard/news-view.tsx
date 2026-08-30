'use client';

import { useState } from 'react';
import { useDashboardStore, useAuthStore } from '@/store/dashboard-store';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Newspaper,
  Plus,
  Pin,
  PinOff,
  Send,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function NewsView() {
  const { newsItems, addNewsItem } = useDashboardStore();
  const { currentUser, isCTO } = useAuthStore();
  const { developers } = useDashboardStore();
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formPinned, setFormPinned] = useState(false);

  const currentUsername = developers.find(d => d.id === currentUser)?.githubUsername || currentUser || '';

  const handleSubmit = () => {
    if (!formTitle.trim() || !formBody.trim()) return;
    addNewsItem({
      title: formTitle.trim(),
      body: formBody.trim(),
      author: currentUsername,
      pinned: formPinned,
    });
    setFormTitle('');
    setFormBody('');
    setFormPinned(false);
    setShowForm(false);
  };

  const sorted = [...newsItems].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">News</h2>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" />
          Post News
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post News</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="Headline..."
              className="bg-surface border-border-strong text-foreground h-9 text-sm"
            />
            <Textarea
              value={formBody}
              onChange={e => setFormBody(e.target.value)}
              placeholder="Write your news (markdown supported)..."
              className="bg-surface border-border-strong text-foreground min-h-[120px] text-sm"
            />
            <div className="flex items-center gap-2">
              {isCTO && (
                <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPinned}
                    onChange={e => setFormPinned(e.target.checked)}
                    className="rounded border-border-strong"
                  />
                  <Pin className="w-3 h-3" />
                  Pin to top
                </label>
              )}
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                className="h-8 text-xs gap-1.5"
                disabled={!formTitle.trim() || !formBody.trim()}
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No news yet</p>
          <p className="text-xs mt-1">Post the first news item to notify the team</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(item => (
            <Card
              key={item.id}
              className={`bg-card border-border hover:border-border-strong transition-colors ${
                item.pinned ? 'border-primary/50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {item.pinned && (
                    <Pin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      {item.pinned && (
                        <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 h-5 border-0">
                          <PinOff className="w-2.5 h-2.5 mr-1" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <div className="markdown-body text-sm text-text-secondary leading-relaxed mb-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.body}
                      </ReactMarkdown>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                      <span>@{item.author}</span>
                      <span>&middot;</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
