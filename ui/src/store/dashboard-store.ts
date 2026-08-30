import { create } from 'zustand';
import { ViewMode, Ticket, ReviewStatus, Developer, ProjectDoc, Idea, IdeaStatus, NewsItem } from '@/lib/types';

type LoginResult = { success: true } | { success: false; reason: 'loading' | 'unrecognized' | 'wrong_pincode' };

interface AuthState {
  currentUser: string | null;
  isCTO: boolean;
  canReview: boolean;
  login: (username: string, pincode?: string) => LoginResult;
  logout: () => void;
}

interface DashboardState {
  currentView: ViewMode;
  viewHistory: ViewMode[];
  selectedDeveloper: string | null;
  selectedTicket: Ticket | null;
  tickets: Ticket[];
  developers: Developer[];
  docs: ProjectDoc[];
  loading: boolean;
  searchQuery: string;
  filterProject: string;
  filterStatus: string;
  filterPriority: string;
  filterCategory: string;
  setCurrentView: (view: ViewMode) => void;
  goBack: () => void;
  setSelectedDeveloper: (id: string | null) => void;
  setSelectedTicket: (ticket: Ticket | null) => void;
  updateTicketStatus: (ticketId: string, status: string) => void;
  updateTicketReview: (ticketId: string, reviewStatus: ReviewStatus, comments: string) => void;
  setSearchQuery: (q: string) => void;
  setFilterProject: (p: string) => void;
  setFilterStatus: (s: string) => void;
  setFilterPriority: (p: string) => void;
  setFilterCategory: (c: string) => void;
  ideas: Idea[];
  addIdea: (idea: { title: string; description: string; author: string }) => void;
  updateIdeaPriority: (id: string, priority: number) => void;
  updateIdeaStatus: (id: string, status: IdeaStatus) => void;
  voteIdea: (id: string, user: string) => void;
  newsItems: NewsItem[];
  addNewsItem: (item: { title: string; body: string; author: string; pinned?: boolean }) => void;
  getFilteredTickets: () => Ticket[];
  fetchData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isCTO: false,
  canReview: false,
  login: (username: string, pincode?: string): LoginResult => {
    const devs = useDashboardStore.getState().developers;
    if (devs.length === 0) return { success: false, reason: 'loading' };
    const dev = devs.find(d => d.githubUsername.toLowerCase() === username.toLowerCase());
    if (!dev) return { success: false, reason: 'unrecognized' };
    if (dev.pincode && dev.pincode !== pincode) return { success: false, reason: 'wrong_pincode' };
    const isCTO = dev.role === 'CTO';
    const canReview = dev.role === 'CTO' || dev.role === 'Lead' || dev.role === 'Senior';
    set({ currentUser: dev.id, isCTO, canReview });
    return { success: true };
  },
  logout: () => set({ currentUser: null, isCTO: false, canReview: false }),
}));

export const useDashboardStore = create<DashboardState>((set, get) => ({
  currentView: 'overview',
  viewHistory: [],
  selectedDeveloper: null,
  selectedTicket: null,
  tickets: [],
  developers: [],
  docs: [],
  ideas: [],
  newsItems: [],
  loading: true,
  searchQuery: '',
  filterProject: 'all',
  filterStatus: 'all',
  filterPriority: 'all',
  filterCategory: 'all',
  setCurrentView: (view) => {
    const prev = get().currentView;
    if (prev !== view) {
      set(state => ({ viewHistory: [...state.viewHistory, prev], currentView: view }));
    }
  },
  goBack: () => {
    const history = get().viewHistory;
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({ currentView: prev, viewHistory: history.slice(0, -1) });
  },
  setSelectedDeveloper: (id) => set({ selectedDeveloper: id }),
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
  addIdea: (idea) => {
    const id = `IDEA-${Date.now()}`;
    const newIdea: Idea = {
      id,
      title: idea.title,
      description: idea.description,
      author: idea.author,
      created: new Date().toISOString().slice(0, 10),
      priority: 5,
      status: 'proposed',
      votes: 0,
      voters: [],
    };
    set(state => ({ ideas: [newIdea, ...state.ideas] }));
    fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIdea),
    }).catch(() => {});
  },
  updateIdeaPriority: (id, priority) => {
    set(state => ({
      ideas: state.ideas.map(i => i.id === id ? { ...i, priority } : i),
    }));
  },
  updateIdeaStatus: (id, status) => {
    set(state => ({
      ideas: state.ideas.map(i => i.id === id ? { ...i, status } : i),
    }));
  },
  voteIdea: (id, user) => {
    set(state => ({
      ideas: state.ideas.map(i => {
        if (i.id !== id) return i;
        const alreadyVoted = i.voters.includes(user);
        return {
          ...i,
          votes: alreadyVoted ? i.votes - 1 : i.votes + 1,
          voters: alreadyVoted
            ? i.voters.filter(v => v !== user)
            : [...i.voters, user],
        };
      }),
    }));
  },
  addNewsItem: (item) => {
    const newItem: NewsItem = {
      id: `NEWS-${Date.now()}`,
      title: item.title,
      body: item.body,
      author: item.author,
      createdAt: new Date().toISOString(),
      pinned: item.pinned || false,
    };
    set(state => ({ newsItems: [newItem, ...state.newsItems] }));
    fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(() => {});
  },
  updateTicketStatus: (ticketId, status) => {
    set(state => ({
      tickets: state.tickets.map(t =>
        t.id === ticketId ? { ...t, status: status as Ticket['status'], updated: new Date().toISOString().slice(0, 10) } : t
      ),
    }));
  },
  updateTicketReview: (ticketId, reviewStatus, comments) => {
    const currentUser = useAuthStore.getState().currentUser || '';
    set(state => ({
      tickets: state.tickets.map(t =>
        t.id === ticketId
          ? {
              ...t,
              reviewStatus,
              reviewComments: comments,
              reviewedBy: currentUser,
              reviewedAt: new Date().toISOString().slice(0, 10),
              status: reviewStatus === 'Approved' ? 'Done' : t.status,
              updated: new Date().toISOString().slice(0, 10),
            }
          : t
      ),
    }));
  },
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterProject: (p) => set({ filterProject: p }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  setFilterPriority: (p) => set({ filterPriority: p }),
  setFilterCategory: (c) => set({ filterCategory: c }),
  getFilteredTickets: () => {
    const { tickets, searchQuery, filterProject, filterStatus, filterPriority, filterCategory } = get();
    return tickets.filter(t => {
      if (filterProject !== 'all' && t.project !== filterProject) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  },
  fetchData: async () => {
    try {
      const [ticketsRes, devsRes, docsRes, ideasRes, newsRes] = await Promise.all([
        fetch('/api?type=tickets'),
        fetch('/api?type=developers'),
        fetch('/api?type=docs'),
        fetch('/api?type=ideas').catch(() => new Response('[]')),
        fetch('/api/news').catch(() => new Response('[]')),
      ]);
      const [tickets, developers, docs, ideas, newsItems] = await Promise.all([
        ticketsRes.json(),
        devsRes.json(),
        docsRes.json(),
        ideasRes.json().catch(() => []),
        newsRes.json().catch(() => []),
      ]);
      set({ tickets, developers, docs, ideas, newsItems, loading: false });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      set({ loading: false });
    }
  },
}));
