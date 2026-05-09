import type { ScreenKind } from "./state.js";

export type FooterHintKey =
	| "enter_paste"
	| "space_pause"
	| "tab_settings"
	| "esc_cancel"
	| "esc_back"
	| "ctrl_s_save"
	| "enter_toggle";

export interface ScreenIntentMeta {
	label: string;
	footerHints: readonly FooterHintKey[];
}

export const SCREEN_META: Record<ScreenKind, ScreenIntentMeta> = {
	dictation: {
		label: "Dictation",
		footerHints: ["enter_paste", "space_pause", "tab_settings", "esc_cancel"],
	},
	settings: {
		label: "Settings",
		footerHints: ["enter_toggle", "ctrl_s_save", "esc_back"],
	},
};
