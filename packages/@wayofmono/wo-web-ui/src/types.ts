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
	args: string;
	result?: ToolResult;
}

export interface ToolResult {
	content: string;
	isError?: boolean;
}

export interface SessionInfo {
	id: string;
	label: string;
	createdAt: number;
	updatedAt: number;
	messageCount: number;
}

export interface DiagnosticInfo {
	message: string;
	severity: "error" | "warning" | "info" | "hint";
	line?: number;
	column?: number;
	tool?: string;
}

export interface ThemeConfig {
	mode: "dark" | "light";
	primary: string;
	background: string;
	surface: string;
	text: string;
	textSecondary: string;
	border: string;
	userBubble: string;
	assistantBubble: string;
	error: string;
	success: string;
}

export interface WebSocketMessage {
	type: "message" | "tool_call" | "tool_result" | "error" | "status" | "diagnostic";
	payload: unknown;
}
