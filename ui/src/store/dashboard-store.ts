import { create } from 'zustand';
import { ViewMode, Ticket, ReviewStatus, Developer, ProjectDoc } from '@/lib/types';

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
      const [ticketsRes, devsRes, docsRes] = await Promise.all([
        fetch('/api/thoughts?type=tickets'),
        fetch('/api/thoughts?type=developers'),
        fetch('/api/thoughts?type=docs'),
      ]);
      const [tickets, developers, docs] = await Promise.all([
        ticketsRes.json(),
        devsRes.json(),
        docsRes.json(),
      ]);
      set({ tickets, developers, docs, loading: false });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      set({ loading: false });
    }
  },
}));
