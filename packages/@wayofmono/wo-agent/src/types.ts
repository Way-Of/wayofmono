import type { ToolDefinition, AgentToolResult } from "@wayofmono/wo-agent-core";
import type { ModelConfig, StopReason, Usage, Message, StreamChunk } from "@wayofmono/wo-ai";

export interface AgentConfig {
  model: ModelConfig;
  skills?: string[];
  apiKey?: string;
  baseUrl?: string;
  /** Max ReAct loop steps (default 18) */
  maxSteps?: number;
  /** Workspace root for path jailing */
  workspaceRoot?: string;
}

export interface AgentOptions {
  systemPrompt?: string;
  signal?: AbortSignal;
  onChunk?: (chunk: AgentChunk) => void;
  /** Session ID for persistence (creates new if omitted) */
  sessionId?: string;
  maxSteps?: number;
  /** Conversation messages to continue from */
  messages?: Message[];
  /** Override tool_choice */
  toolChoice?: "auto" | "any" | "none" | { type: "tool"; name: string };
}

export interface TaskOptions extends AgentOptions {
  onStep?: (step: ReActStep) => void;
}

export interface AgentChunk {
  type: "text" | "tool_use" | "tool_result" | "thinking" | "error" | "done";
  text?: string;
  toolName?: string;
  toolInput?: string;
  toolResult?: string;
  thinking?: string;
  error?: string;
  stopReason?: StopReason;
  usage?: Usage;
}

export interface PromptResult {
  content: string;
  stopReason?: StopReason;
  usage?: Usage;
}

export interface TaskResult {
  summary: string;
  steps: ReActStep[];
  artifacts: string[];
  usage?: Usage;
}

export type AgentEvent = {
  type: "message" | "tool_use" | "tool_result" | "error" | "state_change" | "step_complete";
  data: unknown;
  timestamp: number;
};

export type AgentEventMap = {
  message: (text: string) => void;
  tool_use: (tool: string, input: unknown) => void;
  tool_result: (tool: string, result: AgentToolResult) => void;
  error: (error: Error) => void;
  state_change: (state: string) => void;
  step_complete: (step: ReActStep) => void;
};

export interface Agent {
  readonly id: string;
  readonly state: "init" | "ready" | "running" | "disposed";
  readonly conversation: Message[];

  prompt(text: string, options?: AgentOptions): Promise<PromptResult>;
  task(description: string, options?: TaskOptions): Promise<TaskResult>;
  runLoop(params: ReActLoopParams): Promise<ReActLoopResult>;
  registerTool(tool: ToolDefinition): void;
  clearConversation(): void;
  loadConversation(messages: Message[]): void;

  on<E extends keyof AgentEventMap>(event: E, handler: AgentEventMap[E]): () => void;
  dispose(): Promise<void>;
}

export interface AgentSkill {
  name: string;
  description: string;
  tools: ToolDefinition[];
  systemPrompt?: string;
  prompts?: string[];
}

// ReAct Loop Types
export interface ToolCallData {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ReActStep {
  content: string;
  toolCalls: ToolCallData[];
  stopReason: StopReason;
  usage: Usage;
  stepNumber: number;
}

export interface ReActLoopParams {
  model: ModelConfig;
  apiKey?: string;
  baseUrl?: string;
  messages: Message[];
  system?: string;
  tools: ToolDefinition[];
  toolChoice?: "auto" | "any" | "none" | { type: "tool"; name: string };
  maxSteps?: number;
  maxNudges?: number;
  signal?: AbortSignal;
  onStep?: (step: ReActStep) => void;
  onStream?: (chunk: StreamChunk) => void;
}

export interface ReActLoopResult {
  content: string;
  messages: Message[];
  usage: Usage;
  steps: number;
  truncated: boolean;
}

// Session Store Types
export interface SessionHeader {
  type: "session";
  kind: string;
  id: string;
  workspace: string;
  createdAt: string;
  engine: string;
}

export interface SessionMessageLine {
  type: "message";
  message: {
    role: "user" | "assistant" | "tool";
    content: string;
    createdAt: string;
  };
}

export interface SessionStoreConfig {
  sessionsDir: string;
  prefix?: string;
  maxFileBytes?: number;
  maxLineChars?: number;
}

// Agent Discovery Types
export interface AgentMeta {
  name: string;
  description: string;
  tools: string;
  skills: string;
  relativePath: string;
  body: string;
}

export interface AgentDiscoveryConfig {
  scanRoots: string[];
  tenantId?: string;
}

// System Prompt Types
export type SessionMode = "build" | "plan";

export interface SystemPromptInput {
  mode: SessionMode;
  envSystemPrompt?: string;
  agentBody: string | null;
  agentNameLower?: string | null;
  plannerBody?: string | null;
  toolsNote?: string | null;
  indexBoost?: string | null;
}

// Workspace Types
export interface WorkspaceConfig {
  root: string;
  maxFileBytes?: number;
  maxGrepBytes?: number;
  maxListEntries?: number;
  bashTimeoutMs?: number;
  maxBashCmd?: number;
}
