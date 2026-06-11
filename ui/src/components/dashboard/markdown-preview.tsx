'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'github-markdown-css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Eye, Code2 } from 'lucide-react';

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
      <DialogContent className="max-w-5xl max-h-[90vh]">
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

        {/* Mode toggle */}
        <div className="flex items-center gap-1 border-b border-border pb-2">
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

        <ScrollArea className="max-h-[65vh]">
          {mode === 'preview' ? (
            <div className="markdown-body p-4" style={{
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
            <pre className="text-sm text-text-secondary font-mono p-4 overflow-x-auto whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>
              {body}
            </pre>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
