import type { ToolDefinition, AgentToolResult } from "@wayofmono/wo-agent-core";
import type { ModelConfig } from "@wayofmono/wo-ai";

export interface AgentConfig {
  model: ModelConfig;
  skills?: string[];
  apiKey?: string;
  baseUrl?: string;
}

export interface AgentOptions {
  systemPrompt?: string;
  signal?: AbortSignal;
  onChunk?: (chunk: AgentChunk) => void;
}

export interface AgentChunk {
  type: "text" | "tool_use" | "tool_result" | "thinking" | "error" | "done";
  text?: string;
  toolName?: string;
  toolInput?: string;
  toolResult?: string;
  thinking?: string;
  error?: string;
}

export interface PromptResult {
  content: string;
  toolCalls?: Array<{ name: string; input: string; result: string }>;
}

export interface TaskResult {
  summary: string;
  steps: TaskStep[];
  artifacts: string[];
}

export interface TaskStep {
  description: string;
  result: string;
  durationMs: number;
}

export type AgentEvent = {
  type: "message" | "tool_use" | "error" | "state_change";
  data: unknown;
  timestamp: number;
};

export type AgentEventMap = {
  message: (text: string) => void;
  tool_use: (tool: string, input: unknown) => void;
  tool_result: (tool: string, result: AgentToolResult) => void;
  error: (error: Error) => void;
  state_change: (state: string) => void;
};

export interface Agent {
  readonly id: string;
  readonly state: "init" | "ready" | "running" | "disposed";

  prompt(text: string, options?: AgentOptions): Promise<PromptResult>;
  task(description: string, options?: AgentOptions): Promise<TaskResult>;
  registerTool(tool: ToolDefinition): void;

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
