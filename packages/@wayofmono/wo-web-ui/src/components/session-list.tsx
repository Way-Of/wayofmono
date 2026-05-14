import type { SessionInfo } from "../types.js";

export interface SessionListProps {
	sessions: SessionInfo[];
	activeId?: string;
	onSelect: (id: string) => void;
	onCreate: () => void;
	theme: {
		surface: string;
		text: string;
		textSecondary: string;
		border: string;
		primary: string;
	};
}

const sidebarStyle = (theme: SessionListProps["theme"]): React.CSSProperties => ({
	width: "260px",
	backgroundColor: theme.surface,
	borderRight: `1px solid ${theme.border}`,
	display: "flex",
	flexDirection: "column",
	height: "100%",
});

const headerStyle: React.CSSProperties = {
	padding: "16px",
	fontSize: "16px",
	fontWeight: 600,
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
};

const createButtonStyle = (theme: SessionListProps["theme"]): React.CSSProperties => ({
	backgroundColor: theme.primary,
	color: "#fff",
	border: "none",
	borderRadius: "6px",
	padding: "4px 10px",
	fontSize: "12px",
	cursor: "pointer",
});

const listStyle: React.CSSProperties = {
	flex: 1,
	overflowY: "auto",
	padding: "4px 8px",
};

function itemStyle(isActive: boolean, theme: SessionListProps["theme"]): React.CSSProperties {
	return {
		padding: "10px 12px",
		borderRadius: "6px",
		cursor: "pointer",
		backgroundColor: isActive ? theme.primary + "20" : "transparent",
		marginBottom: "2px",
	};
}

const labelStyle: React.CSSProperties = {
	fontSize: "14px",
	fontWeight: 500,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
};

const metaStyle = (theme: SessionListProps["theme"]): React.CSSProperties => ({
	fontSize: "11px",
	color: theme.textSecondary,
	marginTop: "2px",
});

function formatTime(ts: number): string {
	const d = new Date(ts);
	const now = new Date();
	const diff = now.getTime() - d.getTime();
	if (diff < 60000) return "just now";
	if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
	if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
	return d.toLocaleDateString();
}

export function SessionList({ sessions, activeId, onSelect, onCreate, theme }: SessionListProps) {
	return (
		<div style={sidebarStyle(theme)}>
			<div style={headerStyle}>
				<span>Sessions</span>
				<button type="button" style={createButtonStyle(theme)} onClick={onCreate}>
					+ New
				</button>
			</div>
			<div style={listStyle}>
				{sessions.map((s) => (
					<div
						key={s.id}
						style={itemStyle(s.id === activeId, theme)}
						onClick={() => onSelect(s.id)}
					>
						<div style={labelStyle}>{s.label}</div>
						<div style={metaStyle(theme)}>
							{formatTime(s.updatedAt)} · {s.messageCount} msgs
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default SessionList;
