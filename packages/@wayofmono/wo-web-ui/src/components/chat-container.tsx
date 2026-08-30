import { useRef, useEffect } from "react";
import type { ChatMessage, SessionInfo } from "../types.js";
import { getTheme, type ThemeConfig } from "../theme.js";
import { MessageBubble } from "./message-bubble.js";
import { ChatInput } from "./chat-input.js";
import { SessionList } from "./session-list.js";
import { ToolCallCard } from "./tool-call-card.js";

export interface ChatContainerProps {
	messages: ChatMessage[];
	sessions?: SessionInfo[];
	activeSessionId?: string;
	onSend: (text: string) => void;
	onSelectSession?: (id: string) => void;
	onCreateSession?: () => void;
	themeMode?: "dark" | "light";
	disabled?: boolean;
}

const containerStyle = (theme: ThemeConfig): React.CSSProperties => ({
	display: "flex",
	height: "100%",
	backgroundColor: theme.background,
	color: theme.text,
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

const mainStyle: React.CSSProperties = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	overflow: "hidden",
};

const messagesStyle: React.CSSProperties = {
	flex: 1,
	overflowY: "auto",
	padding: "16px",
	display: "flex",
	flexDirection: "column",
	gap: "12px",
};

const emptyStyle: React.CSSProperties = {
	flex: 1,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "var(--text-secondary, #94a3b8)",
	fontSize: "14px",
};

export function ChatContainer({
	messages,
	sessions,
	activeSessionId,
	onSend,
	onSelectSession,
	onCreateSession,
	themeMode = "dark",
	disabled,
}: ChatContainerProps) {
	const bottomRef = useRef<HTMLDivElement>(null);
	const theme = getTheme(themeMode);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const bubbleTheme = {
		userBubble: theme.userBubble,
		assistantBubble: theme.assistantBubble,
		text: theme.text,
	};

	const inputTheme = {
		surface: theme.surface,
		text: theme.text,
		border: theme.border,
		primary: theme.primary,
	};

	const toolCardTheme = {
		surface: theme.surface,
		text: theme.text,
		textSecondary: theme.textSecondary,
		border: theme.border,
		success: theme.success,
		error: theme.error,
	};

	return (
		<div style={containerStyle(theme)}>
			{sessions && onSelectSession && onCreateSession && (
				<SessionList
					sessions={sessions}
					activeId={activeSessionId}
					onSelect={onSelectSession}
					onCreate={onCreateSession}
					theme={{
						surface: theme.surface,
						text: theme.text,
						textSecondary: theme.textSecondary,
						border: theme.border,
						primary: theme.primary,
					}}
				/>
			)}
			<div style={mainStyle}>
				<div style={messagesStyle}>
					{messages.length === 0 && (
						<div style={emptyStyle}>Start a conversation</div>
					)}
					{messages.map((msg) => (
						<div key={msg.id}>
							<MessageBubble message={msg} theme={bubbleTheme} />
							{msg.toolCalls?.map((tc) => (
								<div key={tc.id} style={{ marginTop: "8px" }}>
									<ToolCallCard toolCall={tc} theme={toolCardTheme} />
								</div>
							))}
						</div>
					))}
					<div ref={bottomRef} />
				</div>
				<ChatInput
					onSend={onSend}
					disabled={disabled}
					theme={inputTheme}
				/>
			</div>
		</div>
	);
}

export default ChatContainer;
