'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MarkdownPreviewProps {
  title: string;
  body: string;
  type?: string;
  project?: string;
  author?: string;
  updated?: string;
  open: boolean;
  onClose: () => void;
}

export function MarkdownPreview({ title, body, type, project, author, updated, open, onClose }: MarkdownPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <DialogTitle className="text-lg text-foreground">{title}</DialogTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {type && <Badge variant="outline" className="text-[10px] border-border-strong text-text-muted">{type}</Badge>}
            {project && <Badge variant="outline" className="text-[10px] border-border-strong text-text-muted">{project}</Badge>}
            {author && <span className="text-xs text-text-muted">@{author}</span>}
            {updated && <span className="text-xs text-text-muted">{updated}</span>}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh]">
          <div className="prose prose-sm dark:prose-invert max-w-none p-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {body}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
