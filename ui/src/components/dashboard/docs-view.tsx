'use client';

import { useDashboardStore, useAuthStore } from '@/store/dashboard-store';
import { developers, docs } from '@/lib/mock-data';
import { ProjectDoc } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Scale,
  BookOpen,
  Bookmark,
  Search,
  FolderOpen,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  architecture: { icon: FileText, label: 'Architecture', color: 'text-status-inprogress' },
  decision: { icon: Scale, label: 'ADR', color: 'text-primary' },
  guide: { icon: BookOpen, label: 'Guide', color: 'text-status-done' },
  reference: { icon: Bookmark, label: 'Reference', color: 'text-status-review' },
};

function DocCard({ doc }: { doc: ProjectDoc }) {
  const cfg = typeConfig[doc.type];
  const Icon = cfg.icon;
  const author = developers.find(d => d.id === doc.author);
  const tickets = useDashboardStore.getState().tickets.filter(t =>
    t.linkedDocs.includes(doc.id)
  );

  return (
    <div className="kanban-card p-4 rounded-lg bg-card border border-border hover:border-border-strong transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] h-5 border-border-strong text-text-muted px-1.5 font-mono">
              {doc.project}
            </Badge>
            <Badge className={`${cfg.color} bg-accent text-[10px] px-1.5 py-0 h-5 border-0`}>
              {cfg.label}
            </Badge>
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">{doc.title}</h4>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
            {doc.summary}
          </p>
          <div className="flex items-center gap-3 mt-2.5 text-[10px] text-text-muted">
            <span>@{doc.author} {author ? `(${author.displayName})` : ''}</span>
            <span>&middot;</span>
            <span>{doc.updated}</span>
            {tickets.length > 0 && (
              <>
                <span>&middot;</span>
                <span className="text-primary">{tickets.length} linked ticket{tickets.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocsView() {
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = docs.filter(d => {
    if (filterProject !== 'all' && d.project !== filterProject) return false;
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q);
    }
    return true;
  });

  // Group by project
  const grouped = filtered.reduce<Record<string, ProjectDoc[]>>((acc, doc) => {
    if (!acc[doc.project]) acc[doc.project] = [];
    acc[doc.project].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Documentation</h2>
        <p className="text-sm text-text-muted mt-0.5">
          f-rr-d docs/ &middot; {docs.length} documents across {new Set(docs.map(d => d.project)).size} projects
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search docs..."
                className="pl-9 bg-surface border-border-strong text-foreground placeholder:text-text-muted focus:border-primary focus:ring-primary h-9 text-sm"
              />
            </div>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-[140px] bg-surface border-border-strong text-foreground h-9 text-xs">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="wayofmono">WayOfMono</SelectItem>
                <SelectItem value="wow">WoW</SelectItem>
                <SelectItem value="opticat">OptiCat</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px] bg-surface border-border-strong text-foreground h-9 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="architecture">Architecture</SelectItem>
                <SelectItem value="decision">ADR</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="reference">Reference</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Directory structure */}
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="w-4 h-4 text-text-muted" />
            <span className="text-xs font-medium text-text-muted">f-rr-d structure</span>
          </div>
          <pre className="text-xs text-text-secondary font-mono bg-surface p-3 rounded-lg leading-relaxed overflow-x-auto">
{`thoughts/
  wayofmono/
    docs/
      architecture/    (2 docs)
      decisions/       (2 ADRs)
      guides/
      references/
    shared/
    zerwiz/
    global/
  wow/
    docs/
      architecture/    (1 doc)
      guides/          (1 guide)
      decisions/
      references/
    shared/
    andre/
  opticat/
    docs/
      architecture/    (2 docs)
      decisions/       (1 ADR)
      guides/
      references/
    tomas/`}
          </pre>
        </CardContent>
      </Card>

      {/* Docs by project */}
      {Object.entries(grouped).length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No documents match your filters</p>
        </div>
      ) : (
        Object.entries(grouped).map(([project, projectDocs]) => (
          <div key={project}>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{project}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projectDocs.map(doc => (
                <DocCard key={doc.id} doc={doc} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}