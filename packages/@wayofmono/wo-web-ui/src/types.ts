export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  toolResult?: ToolResult;
  streaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: "pending" | "running" | "done" | "error";
  result?: string;
}

export interface ToolResult {
  toolCallId: string;
  content: string;
  isError?: boolean;
}

export interface SessionInfo {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  branch?: string;
}

export interface DiagnosticInfo {
  file: string;
  severity: "error" | "warning" | "info";
  message: string;
  line?: number;
  column?: number;
}

export interface ThemeConfig {
  mode: "light" | "dark";
  primaryColor?: string;
  fontSize?: number;
}

export interface WebSocketMessage {
  type: "message" | "tool_call" | "tool_result" | "error" | "diagnostic" | "status" | "session";
  payload: unknown;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  theme: ThemeConfig;
}

export interface ChatInputProps {
  onSend: (text: string) => void;
  onCommand?: (command: string, args: string) => void;
  disabled?: boolean;
  theme: ThemeConfig;
}

export interface SessionListProps {
  sessions: SessionInfo[];
  activeSessionId?: string;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
  theme: ThemeConfig;
}

export interface ToolCallCardProps {
  toolCall: ToolCall;
  theme: ThemeConfig;
}
