/**
 * Shared chat type definitions used by both `useChat` (full chat panel) and
 * `useQuickChat` (FAB) plus the `createChatStreamHandlers` factory they
 * compose. Keeping the types here lets the streaming-handler factory live in
 * its own file without re-importing from one of the hooks (which would create
 * an awkward parent→sibling dependency cycle).
 */

export interface ToolCallInfo {
  toolName: string;
  args?: Record<string, unknown>;
  isError: boolean;
  result?: unknown;
  status: "running" | "completed";
}

export interface FallbackInfo {
  primaryModel: string;
  fallbackModel: string;
  triggerPoint: "session-creation" | "prompt-time";
}

export interface ChatMessageInfo {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  thinkingOutput?: string | null;
  toolCalls?: ToolCallInfo[];
  fallbackInfo?: FallbackInfo;
  attachments?: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
  }>;
  createdAt: string;
}
