export interface ContextUsage {
  total: number;
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
}

export type AgentSessionEvent =
  | { type: "agent_start" }
  | { type: "agent_end"; messages: unknown[] }
  | { type: "message_start" }
  | { type: "message_update"; content: string }
  | { type: "message_end"; content: string }
  | { type: "error"; message: string }
  | { type: "compaction_start"; reason: "manual" | "threshold" | "overflow" }
  | { type: "compaction_end"; success: boolean }
  | { type: "auto_retry_start"; attempt: number; maxAttempts: number; delayMs: number }
  | { type: "auto_retry_end"; success: boolean }
  | { type: "model_changed"; model: string };

export interface AgentSessionConfig {
  cwd: string;
  agentDir: string;
  sessionDir?: string;
  defaultModel?: string;
  systemPrompt?: string;
}

export interface AgentSession {
  readonly config: AgentSessionConfig;
  subscribe(listener: (event: AgentSessionEvent) => void): () => void;
  prompt(text: string): Promise<string>;
  steer(text: string): void;
  followUp(text: string): void;
  abort(): void;
  compact(): Promise<void>;
  dispose(): void;
}

type Listener = (event: AgentSessionEvent) => void;

function createSessionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

export function createAgentSession(config: AgentSessionConfig): AgentSession {
  const listeners = new Set<Listener>();
  let disposed = false;

  const session: AgentSession = {
    config,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async prompt(text: string): Promise<string> {
      sessionId: createSessionId();
      for (const l of listeners) l({ type: "agent_start" });
      for (const l of listeners) l({ type: "message_start" });
      for (const l of listeners) l({ type: "message_update", content: text });
      for (const l of listeners) l({ type: "message_end", content: `Echo: ${text}` });
      for (const l of listeners) l({ type: "agent_end", messages: [] });
      return `Echo: ${text}`;
    },

    steer(_text: string): void {},
    followUp(_text: string): void {},
    abort(): void {},
    async compact(): Promise<void> {},

    dispose(): void {
      disposed = true;
      listeners.clear();
    },
  };

  return session;
}
