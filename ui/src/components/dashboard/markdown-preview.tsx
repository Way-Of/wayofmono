'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'github-markdown-css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Eye, Code2, X } from 'lucide-react';

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
  const [mode, setMode] = useState<'preview' | 'raw'>('preview');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!p-0 max-w-5xl max-h-[90vh] overflow-hidden" showCloseButton={false}>
        <div className="bg-background rounded-lg flex flex-col max-h-[90vh] relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 h-7 w-7 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted hover:text-foreground hover:border-border-strong transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <DialogHeader className="px-6 pt-6 pb-0 pr-14">
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

          {/* Mode toggle */}
          <div className="flex items-center gap-1 border-b border-border pb-2 px-6 pt-4">
            <Button
              variant={mode === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => setMode('preview')}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </Button>
            <Button
              variant={mode === 'raw' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => setMode('raw')}
            >
              <Code2 className="w-3.5 h-3.5" />
              Raw
            </Button>
          </div>

          <ScrollArea className="flex-1 bg-background">
            {mode === 'preview' ? (
              <div className="markdown-body p-4 md:p-6" style={{
                color: 'inherit',
                fontSize: '14px',
                lineHeight: 1.6,
              }}>
                <style>{`
                  .markdown-body {
                    background-color: transparent !important;
                  }
                  .markdown-body table {
                    display: block;
                    overflow-x: auto;
                    max-width: 100%;
                    white-space: nowrap;
                    -webkit-overflow-scrolling: touch;
                  }
                  .markdown-body table td,
                  .markdown-body table th {
                    white-space: normal;
                    min-width: 80px;
                    padding: 6px 12px;
                  }
                  .markdown-body pre {
                    overflow-x: auto;
                    max-width: 100%;
                  }
                  .markdown-body code {
                    word-break: break-word;
                  }
                `}</style>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                >
                  {body}
                </ReactMarkdown>
              </div>
            ) : (
              <pre className="text-sm text-text-secondary font-mono p-4 md:p-6 overflow-x-auto whitespace-pre-wrap bg-background" style={{ wordBreak: 'break-word' }}>
                {body}
              </pre>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
