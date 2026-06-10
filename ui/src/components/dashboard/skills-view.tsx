'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/dashboard-store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  FileText,
  Terminal,
} from 'lucide-react';

interface SkillInfo {
  name: string;
  description: string;
  allowedTools: string;
  docsUrl: string;
  fileCount: number;
  lastModified: string;
  hasFrontmatter: boolean;
}

interface ToolInfo {
  name: string;
  path: string;
  exists: boolean;
  skillCount: number;
  skills: SkillInfo[];
  health: 'healthy' | 'partial' | 'missing' | 'empty';
}

const toolColors: Record<string, string> = {
  Pi: 'from-blue-500 to-blue-600',
  OpenCode: 'from-green-500 to-green-600',
  'Gemini CLI': 'from-yellow-500 to-yellow-600',
  Codex: 'from-purple-500 to-purple-600',
  'Claude Code': 'from-orange-500 to-orange-600',
  Antigravity: 'from-red-500 to-red-600',
};

const toolIcons: Record<string, React.ElementType> = {
  Pi: Cpu,
  OpenCode: Terminal,
  'Gemini CLI': Cpu,
  Codex: FileText,
  'Claude Code': Terminal,
  Antigravity: Cpu,
};

export function SkillsView() {
  const canReview = useAuthStore(s => s.canReview);
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api?type=skills');
      const data = await res.json();
      setTools(data);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSkills(); }, []);

  const healthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle2 className="w-4 h-4 text-status-done" />;
      case 'partial': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'empty': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const healthLabel = (health: string) => {
    switch (health) {
      case 'healthy': return 'Healthy';
      case 'partial': return 'Partial';
      case 'empty': return 'Empty';
      default: return 'Missing';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Harness Skills</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Skill health across all 6 AI tools{canReview ? ' — click to expand' : ''}
          </p>
        </div>
        <button
          onClick={fetchSkills}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-surface hover:bg-surface-elevated border border-border text-text-secondary hover:text-foreground transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && tools.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Scanning skill directories...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tools.map((tool) => {
            const Icon = toolIcons[tool.name] || Cpu;
            const isExpanded = expanded === tool.name;

            return (
              <Card
                key={tool.name}
                className={`bg-card border-border cursor-pointer transition-all hover:border-border-strong ${isExpanded ? 'md:col-span-2' : ''}`}
                onClick={() => setExpanded(isExpanded ? null : tool.name)}
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${toolColors[tool.name] || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          {tool.name}
                          {!tool.exists && <Badge variant="outline" className="ml-2 text-[10px] border-destructive/30 text-destructive">Not found</Badge>}
                        </CardTitle>
                        <p className="text-[10px] text-text-muted mt-0.5 font-mono truncate max-w-[200px]">
                          {tool.path.replace('/home/', '~')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums text-text-muted">{tool.skillCount} skills</span>
                      {healthIcon(tool.health)}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="border-t border-border pt-3 mt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-[10px] ${
                          tool.health === 'healthy' ? 'border-status-done/30 text-status-done' :
                          tool.health === 'partial' ? 'border-yellow-500/30 text-yellow-500' :
                          'border-destructive/30 text-destructive'
                        }`}>
                          {healthLabel(tool.health)}
                        </Badge>
                        <span className="text-[10px] text-text-muted">{tool.skillCount} skill directories</span>
                      </div>

                      {tool.skills.length === 0 ? (
                        <p className="text-xs text-text-muted py-4 text-center">No skills found in this directory.</p>
                      ) : (
                        <ScrollArea className="max-h-[300px]">
                          <div className="space-y-1">
                            {tool.skills.map((skill) => (
                              <div
                                key={skill.name}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-surface transition-colors"
                              >
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  skill.hasFrontmatter && skill.description && skill.description !== '>' ? 'bg-status-done' :
                                  skill.hasFrontmatter ? 'bg-yellow-500' : 'bg-status-backlog'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{skill.name}</p>
                                  {skill.description && (
                                    <p className="text-[10px] text-text-muted truncate">{skill.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-text-muted flex-shrink-0">
                                  {skill.docsUrl && (
                                    <a
                                      href={skill.docsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className="underline hover:text-foreground"
                                    >
                                      docs
                                    </a>
                                  )}
                                  <span>{skill.fileCount}f</span>
                                  {skill.lastModified && <span>{skill.lastModified}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
