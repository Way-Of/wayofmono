import type { TSchema } from "typebox";

export type Api = "anthropic" | "openai" | "openai-completions" | "gemini" | "vertex";

export type StopReason = "end_turn" | "max_tokens" | "stop_sequence" | "aborted" | "error" | "tool_use";

export interface Usage {
  input: number;
  output: number;
  totalTokens?: number;
  cache?: { input?: number; creation?: number };
  reasoning?: number;
}

export interface Model {
  api: Api;
  modelId: string;
  name: string;
  displayName?: string;
  provider: string;
  description?: string;
  maxTokens: number;
  maxOutputTokens?: number;
  defaultMaxTokens?: number;
  supportsThinking: boolean;
  supportsSystemPrompt: boolean;
  supportsTools: boolean;
  supportsImages: boolean;
  supportsCacheControl?: boolean;
  supportsComputerUse?: boolean;
  inputPrice?: number;
  outputPrice?: number;
  cacheInputPrice?: number;
  cacheCreationPrice?: number;
  thinkingPrice?: number;
  hidden?: boolean;
}

export interface ModelConfig {
  api?: Api;
  modelId?: string;
  provider?: string;
  baseUrl?: string;
  apiKey?: string;
  maxTokens?: number;
  thinking?: ThinkingLevel;
  temperature?: number;
  topP?: number;
}

export type ThinkingLevel = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";

export interface ThinkingConfig {
  budget?: number;
  level?: ThinkingLevel;
}

export type MessageContent =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; mediaType: string; data: string } }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string | MessageContent[] };

export interface BaseMessage {
  role: string;
  content: string | MessageContent[];
}

export interface UserMessage extends BaseMessage {
  role: "user";
}

export interface SystemMessage extends BaseMessage {
  role: "system";
}

export interface AssistantMessage extends BaseMessage {
  role: "assistant";
}

export interface ToolMessage extends BaseMessage {
  role: "tool";
  tool_call_id: string;
}

export type Message = UserMessage | SystemMessage | AssistantMessage | ToolMessage;

export interface ImageContent {
  type: "image";
  source: { type: "base64"; mediaType: string; data: string };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: TSchema;
}

export interface CompletionParams {
  messages: Message[];
  system?: string;
  tools?: ToolDefinition[];
  tool_choice?: "auto" | "any" | "none" | { type: "tool"; name: string };
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  thinking?: ThinkingConfig;
  signal?: AbortSignal;
  onStream?: (chunk: StreamChunk) => void;
}

export interface CompletionResult {
  content: string;
  stopReason: StopReason;
  usage: Usage;
  errorMessage?: string;
}

export interface StreamChunk {
  type: "text" | "tool_use" | "thinking" | "error" | "done";
  text?: string;
  toolName?: string;
  toolInput?: string;
  toolCallId?: string;
  thinking?: string;
  stopReason?: StopReason;
  usage?: Usage;
  error?: string;
}

export interface SimpleCompletionParams {
  systemPrompt?: string;
  messages: Message[];
  tools?: ToolDefinition[];
  tool_choice?: "auto" | "any" | "none" | { type: "tool"; name: string };
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface OAuthProvider {
  name: string;
  getAuthorizationUrl(): Promise<string>;
  exchangeCode(code: string): Promise<OAuthCredentials>;
  refreshToken(credentials: OAuthCredentials): Promise<OAuthCredentials>;
}

export interface AgentToolResult {
  content: Array<{ type: string; text: string }>;
  details?: Record<string, unknown>;
  isError?: boolean;
}
