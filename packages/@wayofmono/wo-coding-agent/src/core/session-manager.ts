export interface SessionRecord {
  id: string;
  path: string;
  cwd: string;
  model: string;
  messages: unknown[];
  createdAt: number;
  updatedAt: number;
}

export interface SessionBranch {
  id: string;
  parentId: string | null;
  entries: unknown[];
}

export class SessionManager {
  private sessions: Map<string, SessionRecord> = new Map();
  private currentId: string | null = null;

  static inMemory(): SessionManager {
    return new SessionManager();
  }

  create(session: SessionRecord): void {
    this.sessions.set(session.id, session);
    this.currentId = session.id;
  }

  getCurrent(): SessionRecord | undefined {
    if (!this.currentId) return undefined;
    return this.sessions.get(this.currentId);
  }

  find(id: string): SessionRecord | undefined {
    return this.sessions.get(id);
  }

  getAll(): SessionRecord[] {
    return Array.from(this.sessions.values());
  }

  appendEntry(id: string, entry: unknown): void {
    const session = this.sessions.get(id);
    if (session) {
      session.messages.push(entry);
      session.updatedAt = Date.now();
    }
  }
}
