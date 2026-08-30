import { useState } from "react";
import type { ToolCall } from "../types.js";

export interface ToolCallCardProps {
	toolCall: ToolCall;
	theme: {
		surface: string;
		text: string;
		textSecondary: string;
		border: string;
		success: string;
		error: string;
	};
}

const cardStyle = (theme: ToolCallCardProps["theme"]): React.CSSProperties => ({
	backgroundColor: theme.surface,
	border: `1px solid ${theme.border}`,
	borderRadius: "8px",
	overflow: "hidden",
	fontSize: "13px",
});

const headerStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: "8px",
	padding: "8px 12px",
	cursor: "pointer",
	userSelect: "none",
};

const dotStyle = (color: string): React.CSSProperties => ({
	width: "8px",
	height: "8px",
	borderRadius: "50%",
	backgroundColor: color,
	flexShrink: 0,
});

const nameStyle: React.CSSProperties = {
	fontWeight: 600,
	flex: 1,
};

const contentStyle = (theme: ToolCallCardProps["theme"]): React.CSSProperties => ({
	padding: "8px 12px",
	borderTop: `1px solid ${theme.border}`,
	fontFamily: "monospace",
	fontSize: "12px",
	whiteSpace: "pre-wrap",
	wordBreak: "break-word",
	maxHeight: "200px",
	overflowY: "auto",
});

export function ToolCallCard({ toolCall, theme }: ToolCallCardProps) {
	const [expanded, setExpanded] = useState(false);
	const statusColor = toolCall.result?.isError ? theme.error : theme.success;

	return (
		<div style={cardStyle(theme)}>
			<div style={headerStyle} onClick={() => setExpanded(!expanded)}>
				<span style={dotStyle(statusColor)} />
				<span style={nameStyle}>{toolCall.name}</span>
				<span style={{ color: theme.textSecondary, fontSize: "11px" }}>
					{expanded ? "▲" : "▼"}
				</span>
			</div>
			{expanded && (
				<div style={contentStyle(theme)}>
					<div style={{ color: theme.textSecondary, marginBottom: "4px" }}>Arguments:</div>
					{toolCall.args}
					{toolCall.result && (
						<>
							<div
								style={{
									color: theme.textSecondary,
									marginTop: "8px",
									marginBottom: "4px",
								}}
							>
								Result:
							</div>
							{toolCall.result.content}
						</>
					)}
				</div>
			)}
		</div>
	);
}

export default ToolCallCard;
