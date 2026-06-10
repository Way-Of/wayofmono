'use client';

import { useDashboardStore } from '@/store/dashboard-store';
import { Project, Ticket } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Ticket as TicketIcon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  'In Progress': { color: 'bg-status-inprogress', icon: Loader2 },
  'In Review': { color: 'bg-status-review', icon: ClipboardCheck },
  'Blocked': { color: 'bg-status-blocked', icon: AlertTriangle },
  'Done': { color: 'bg-status-done', icon: CheckCircle2 },
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${accent || 'text-foreground'}`}>{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? 'bg-primary/10' : 'bg-accent'}`}>
            <Icon className={`w-5 h-5 ${accent ? 'text-primary' : 'text-text-secondary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectHealthCard({ project }: { project: Project }) {
  const maxVelocity = 10;
  const velocityPercent = Math.min((project.velocity / maxVelocity) * 100, 100);

  return (
    <Card className="bg-card border-border hover:border-border-strong transition-colors">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">{project.name}</CardTitle>
          <Badge variant="outline" className="text-[10px] border-border-strong text-text-secondary font-mono">
            {project.slug}
          </Badge>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">{project.description}</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Velocity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Velocity</span>
            <span className="text-foreground font-medium">{project.velocity}/{maxVelocity} pts/wk</span>
          </div>
          <div className="h-1.5 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${velocityPercent}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-surface">
            <p className="text-lg font-bold text-foreground">{project.openTickets}</p>
            <p className="text-[10px] text-text-muted uppercase">Open</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-surface">
            <p className="text-lg font-bold text-status-done">{project.closedThisWeek}</p>
            <p className="text-[10px] text-text-muted uppercase">Done/wk</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-surface">
            <p className={`text-lg font-bold ${project.blockers > 0 ? 'text-status-blocked' : 'text-status-done'}`}>
              {project.blockers}
            </p>
            <p className="text-[10px] text-text-muted uppercase">Blocked</p>
          </div>
        </div>

        {/* Blockers */}
        {project.blockers > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
            <span className="text-xs text-destructive">{project.blockers} blocker(s) need attention</span>
          </div>
        )}

        {/* Milestones */}
        {project.upcomingMilestones.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Upcoming Milestones</p>
            {project.upcomingMilestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                <span className="text-text-secondary">{m}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivity({ tickets }: { tickets: Ticket[] }) {
  const recent = [...tickets]
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
    .slice(0, 6);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">Recent Activity</CardTitle>
          <TrendingUp className="w-4 h-4 text-text-muted" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2">
          {recent.map((t) => {
            const cfg = statusConfig[t.status];
            const StatusIcon = cfg?.icon || Ticket;
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-surface hover:bg-surface-elevated transition-colors cursor-pointer group"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg?.color || 'bg-status-backlog'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {t.id}: {t.title}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    @{t.assignee} &middot; {t.status} &middot; {t.updated}
                  </p>
                </div>
                {t.prUrl && (
                  <a
                    href={t.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewView() {
  const tickets = useDashboardStore(s => s.tickets);

  const totalTickets = tickets.length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const inReview = tickets.filter(t => t.status === 'In Review').length;
  const blocked = tickets.filter(t => t.status === 'Blocked').length;
  const reviewQueue = tickets.filter(t => t.status === 'In Review' && t.reviewStatus === 'Pending').length;
  const doneThisWeek = tickets.filter(t => {
    if (t.status !== 'Done') return false;
    const updated = new Date(t.updated);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updated >= weekAgo;
  }).length;

  const builtProjects: Project[] = ['wayofmono', 'wow', 'opticat'].map(slug => {
    const projectTickets = tickets.filter(t => t.project === slug);
    const done = projectTickets.filter(t => t.status === 'Done');
    const doneWk = done.filter(t => {
      const d = new Date(t.updated);
      const w = new Date(); w.setDate(w.getDate() - 7);
      return d >= w;
    });
    return {
      slug: slug as Project['slug'],
      name: slug === 'wayofmono' ? 'WayOfMono' : slug === 'wow' ? 'WoW' : 'OptiCat',
      description: '',
      velocity: doneWk.length,
      openTickets: projectTickets.filter(t => t.status !== 'Done').length,
      closedThisWeek: doneWk.length,
      blockers: projectTickets.filter(t => t.status === 'Blocked').length,
      upcomingMilestones: [],
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard Overview</h2>
        <p className="text-sm text-text-muted mt-0.5">Real-time project health across all WayOfMono projects</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Tickets" value={totalTickets} icon={TicketIcon} />
        <StatCard label="In Progress" value={inProgress} icon={Loader2} accent="text-status-inprogress" />
        <StatCard label="Review Queue" value={reviewQueue} icon={ClipboardCheck} accent="text-primary" />
        <StatCard label="Blocked" value={blocked} icon={AlertTriangle} accent="text-destructive" />
        <StatCard label="Done This Week" value={doneThisWeek} icon={CheckCircle2} accent="text-status-done" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Project Health</h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {builtProjects.map(p => <ProjectHealthCard key={p.slug} project={p} />)}
          </div>
        </div>
        <div>
          <RecentActivity tickets={tickets} />
        </div>
      </div>
    </div>
  );
}