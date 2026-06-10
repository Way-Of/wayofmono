export type TicketStatus = 'Backlog' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketType = 'Feature' | 'Bug' | 'Task' | 'Research' | 'Refactor' | 'Docs';
export type ReviewStatus = 'Pending' | 'Approved' | 'Changes Requested';
export type ProjectSlug = 'wayofmono' | 'wow' | 'opticat';

export interface Developer {
  id: string;
  githubUsername: string;
  displayName: string;
  role: 'CTO' | 'Lead' | 'Senior' | 'Developer';
  pincode: string;
  avatarUrl: string;
  projects: ProjectSlug[];
  isActive: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  reporter: string;
  project: ProjectSlug;
  namespace: string;
  category: string;
  parentTicket: string;
  sharedTickets: string[];
  prUrl: string;
  githubIssue: string;
  created: string;
  updated: string;
  reviewedBy: string;
  reviewedAt: string;
  reviewStatus: ReviewStatus;
  reviewComments: string;
  description: string;
  personalBreakdown: string[];
  linkedDocs: string[];
}

export interface ProjectDoc {
  id: string;
  title: string;
  type: 'architecture' | 'decision' | 'guide' | 'reference';
  project: ProjectSlug;
  path: string;
  updated: string;
  author: string;
  summary: string;
  body: string;
}

export interface Project {
  slug: ProjectSlug;
  name: string;
  description: string;
  velocity: number;
  openTickets: number;
  closedThisWeek: number;
  blockers: number;
  upcomingMilestones: string[];
}

export interface DashboardStats {
  totalTickets: number;
  inProgress: number;
  inReview: number;
  blocked: number;
  doneThisWeek: number;
  reviewQueue: number;
}

export type ViewMode = 'overview' | 'tickets' | 'developers' | 'review' | 'docs' | 'my-view' | 'skills';
