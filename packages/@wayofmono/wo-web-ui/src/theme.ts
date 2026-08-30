import type { ThemeConfig } from "./types.js";

export const darkTheme: ThemeConfig = {
	mode: "dark",
	primary: "#6366f1",
	background: "#0f172a",
	surface: "#1e293b",
	text: "#f1f5f9",
	textSecondary: "#94a3b8",
	border: "#334155",
	userBubble: "#6366f1",
	assistantBubble: "#334155",
	error: "#ef4444",
	success: "#22c55e",
};

export const lightTheme: ThemeConfig = {
	mode: "light",
	primary: "#6366f1",
	background: "#ffffff",
	surface: "#f8fafc",
	text: "#0f172a",
	textSecondary: "#64748b",
	border: "#e2e8f0",
	userBubble: "#6366f1",
	assistantBubble: "#f1f5f9",
	error: "#ef4444",
	success: "#22c55e",
};

export function getTheme(mode: "dark" | "light"): ThemeConfig {
	return mode === "dark" ? darkTheme : lightTheme;
}

export type { ThemeConfig };
