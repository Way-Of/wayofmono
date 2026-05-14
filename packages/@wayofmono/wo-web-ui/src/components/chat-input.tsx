import { useState, type KeyboardEvent } from "react";

export interface ChatInputProps {
	onSend: (text: string) => void;
	disabled?: boolean;
	placeholder?: string;
	theme: {
		surface: string;
		text: string;
		border: string;
		primary: string;
	};
}

const containerStyle: React.CSSProperties = {
	display: "flex",
	gap: "8px",
	padding: "12px",
	borderTop: "1px solid var(--border, #e2e8f0)",
};

const textareaStyle = (
	theme: ChatInputProps["theme"],
): React.CSSProperties => ({
	flex: 1,
	backgroundColor: theme.surface,
	color: theme.text,
	border: `1px solid ${theme.border}`,
	borderRadius: "8px",
	padding: "10px 14px",
	fontSize: "14px",
	fontFamily: "inherit",
	resize: "none",
	outline: "none",
	minHeight: "42px",
	maxHeight: "200px",
	lineHeight: "1.4",
});

const buttonStyle = (theme: ChatInputProps["theme"]): React.CSSProperties => ({
	backgroundColor: theme.primary,
	color: "#fff",
	border: "none",
	borderRadius: "8px",
	padding: "8px 16px",
	fontSize: "14px",
	cursor: "pointer",
	alignSelf: "flex-end",
});

export function ChatInput({ onSend, disabled, placeholder, theme }: ChatInputProps) {
	const [text, setText] = useState("");

	const handleSend = () => {
		const trimmed = text.trim();
		if (!trimmed || disabled) return;
		onSend(trimmed);
		setText("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div style={containerStyle}>
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				onKeyDown={handleKeyDown}
				style={textareaStyle(theme)}
				placeholder={placeholder ?? "Type a message..."}
				disabled={disabled}
				rows={1}
			/>
			<button
				type="button"
				onClick={handleSend}
				disabled={disabled || !text.trim()}
				style={buttonStyle(theme)}
			>
				Send
			</button>
		</div>
	);
}

export default ChatInput;
