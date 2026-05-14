import type { ChatMessage } from "../types.js";

export interface MessageBubbleProps {
	message: ChatMessage;
	theme: {
		userBubble: string;
		assistantBubble: string;
		text: string;
	};
}

const bubbleStyle = (role: ChatMessage["role"], theme: MessageBubbleProps["theme"]): React.CSSProperties => ({
	alignSelf: role === "user" ? "flex-end" : "flex-start",
	backgroundColor: role === "user" ? theme.userBubble : theme.assistantBubble,
	color: theme.text,
	borderRadius: "12px",
	padding: "8px 14px",
	maxWidth: "80%",
	wordBreak: "break-word",
	whiteSpace: "pre-wrap",
	fontSize: "14px",
	lineHeight: "1.5",
});

const streamingStyle: React.CSSProperties = {
	display: "inline-block",
	width: "8px",
	height: "16px",
	backgroundColor: "currentColor",
	animation: "wo-blink 1s step-end infinite",
	marginLeft: "2px",
	opacity: 0.7,
};

export function MessageBubble({ message, theme }: MessageBubbleProps) {
	return (
		<div key={message.id} style={bubbleStyle(message.role, theme)}>
			{message.content}
			{message.streaming && <span style={streamingStyle} />}
		</div>
	);
}

export default MessageBubble;
