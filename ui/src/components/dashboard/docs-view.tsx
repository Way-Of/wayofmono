'use client';

import { useDashboardStore } from '@/store/dashboard-store';
import { ProjectDoc } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  ChevronRight,
  ChevronDown,
  File,
  Folder,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { MarkdownPreview } from './markdown-preview';

type DocTypeConfig = {
  icon: React.ElementType;
  label: string;
  color: string;
};

const typeConfig: Record<string, DocTypeConfig> = {
  architecture: { icon: FileText, label: 'Architecture', color: 'text-status-inprogress' },
  decision: { icon: Scale, label: 'ADR', color: 'text-primary' },
  guide: { icon: BookOpen, label: 'Guide', color: 'text-status-done' },
  reference: { icon: Bookmark, label: 'Reference', color: 'text-status-review' },
  readme: { icon: FileText, label: 'README', color: 'text-foreground' },
};

type TreeNode = {
  name: string;
  type: 'folder' | 'file';
  children: TreeNode[];
  doc?: ProjectDoc;
  count?: number;
};

function buildTree(docs: ProjectDoc[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const doc of docs) {
    const parts = doc.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      let existing = current.find(n => n.name === parts[i] && n.type === 'folder');
      if (!existing) {
        existing = { name: parts[i], type: 'folder', children: [] };
        current.push(existing);
      }
      current = existing.children;
    }
    const fileName = parts[parts.length - 1];
    current.push({ name: fileName, type: 'file', children: [], doc });
  }
  const countDocs = (nodes: TreeNode[]): number => {
    let c = 0;
    for (const n of nodes) {
      if (n.type === 'file') c++;
      c += countDocs(n.children);
    }
    return c;
  };
  const addCounts = (nodes: TreeNode[]) => {
    for (const n of nodes) {
      if (n.type === 'folder') {
        addCounts(n.children);
        n.count = countDocs(n.children);
      }
    }
  };
  addCounts(root);
  return root;
}

function FileTree({
  nodes,
  depth = 0,
  filterProject,
  filterType,
  onOpenDoc,
}: {
  nodes: TreeNode[];
  depth?: number;
  filterProject: string;
  filterType: string;
  onOpenDoc: (doc: ProjectDoc) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const matchesFilter = (doc: ProjectDoc) => {
    if (filterProject !== 'all' && doc.project !== filterProject) return false;
    if (filterType !== 'all' && doc.type !== filterType) return false;
    return true;
  };

  return (
    <div className="font-mono text-xs">
      {nodes.map((node, i) => {
        const key = `${depth}-${i}-${node.name}`;
        const isCollapsed = collapsed.has(key);

        if (node.type === 'folder') {
          const hasVisibleDocs = node.children.some(
            n => n.doc && matchesFilter(n.doc)
          ) || node.children.some(
            n => n.type === 'folder' && n.children.some(c => c.doc && matchesFilter(c.doc))
          );
          if (!hasVisibleDocs && filterProject !== 'all') return null;

          return (
            <div key={key}>
              <button
                onClick={() => toggle(key)}
                className="flex items-center gap-1 py-0.5 hover:text-foreground transition-colors w-full text-left"
              >
                <span className="w-4 flex-shrink-0">
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
                <Folder className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-text-secondary">{node.name}/</span>
                {node.count !== undefined && (
                  <span className="text-text-muted ml-1">
                    ({node.count} doc{node.count !== 1 ? 's' : ''})
                  </span>
                )}
              </button>
              {!isCollapsed && (
                <div className="pl-4">
                  <FileTree
                    nodes={node.children}
                    depth={depth + 1}
                    filterProject={filterProject}
                    filterType={filterType}
                    onOpenDoc={onOpenDoc}
                  />
                </div>
              )}
            </div>
          );
        }

        if (node.doc && !matchesFilter(node.doc)) return null;

        return (
          <button
            key={key}
            onClick={() => node.doc && onOpenDoc(node.doc)}
            className="flex items-center gap-1 py-0.5 hover:text-foreground transition-colors w-full text-left"
          >
            <span className="w-4 flex-shrink-0" />
            <File className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="text-text-secondary truncate">{node.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function DocCard({ doc, onOpen }: { doc: ProjectDoc; onOpen: (doc: ProjectDoc) => void }) {
  const cfg = typeConfig[doc.type] || typeConfig.readme;
  const Icon = cfg.icon;
  const label = cfg.label;
  const color = cfg.color;
  const author = useDashboardStore.getState().developers.find(d => d.id === doc.author);
  const tickets = useDashboardStore.getState().tickets.filter(t =>
    t.linkedDocs.includes(doc.id)
  );

  return (
    <div
      className="kanban-card p-4 rounded-lg bg-card border border-border hover:border-border-strong transition-colors cursor-pointer"
      onClick={() => onOpen(doc)}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] h-5 border-border text-text-muted px-1.5 font-mono">
              {doc.project}
            </Badge>
            <Badge className={`${color} bg-accent text-[10px] px-1.5 py-0 h-5 border-0`}>
              {label}
            </Badge>
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">{doc.title}</h4>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
            {doc.summary || doc.body?.slice(0, 100)}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
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
  const docs = useDashboardStore(s => s.docs);
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<ProjectDoc | null>(null);

  const filtered = docs.filter(d => {
    if (filterProject !== 'all' && d.project !== filterProject) return false;
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.summary?.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = useMemo(() => {
    const seen = new Set<string>();
    const result = filtered.reduce<Record<string, ProjectDoc[]>>((acc, doc) => {
      const key = `${doc.project}::${doc.id}`;
      if (seen.has(key)) return acc;
      seen.add(key);
      if (!acc[doc.project]) acc[doc.project] = [];
      acc[doc.project].push(doc);
      return acc;
    }, {});
    return result;
  }, [filtered]);

  const tree = useMemo(() => buildTree(filtered), [filtered]);

  const openDoc = (doc: ProjectDoc) => setPreviewDoc(doc);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Documentation</h2>
        <p className="text-sm text-text-muted mt-0.5">
          f-rr-d docs/ &middot; {filtered.length} documents across {new Set(filtered.map(d => d.project)).size} projects
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
                <SelectItem value="readme">README</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive file tree */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-medium text-text-muted">f-rr-d structure</span>
            </div>
            <div className="bg-surface p-3 rounded-lg max-h-[500px] overflow-y-auto">
              <FileTree
                nodes={tree}
                filterProject={filterProject}
                filterType={filterType}
                onOpenDoc={openDoc}
              />
            </div>
          </CardContent>
        </Card>

        {/* Docs by project */}
        <div className="lg:col-span-2">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents match your filters</p>
            </div>
          ) : (
            Object.entries(grouped).map(([project, projectDocs]) => (
              <div key={project} className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{project}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectDocs.map(doc => (
                    <DocCard key={doc.id} doc={doc} onOpen={openDoc} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Markdown preview dialog */}
      {previewDoc && (
        <MarkdownPreview
          title={previewDoc.title}
          body={previewDoc.body || previewDoc.summary || ''}
          type={previewDoc.type}
          project={previewDoc.project}
          author={previewDoc.author}
          updated={previewDoc.updated}
          open={true}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
