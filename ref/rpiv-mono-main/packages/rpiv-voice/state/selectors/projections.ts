import type { SettingsFieldViewProps } from "../../view/components/settings-field-view.js";
import type { StatusBarViewProps } from "../../view/components/status-bar-view.js";
import type { TranscriptViewProps } from "../../view/components/transcript-view.js";
import { getActiveLocale, t } from "../i18n-bridge.js";
import type { FooterHintKey } from "../screen-intent.js";
import { SCREEN_META } from "../screen-intent.js";
import type { GlobalSelector } from "./contract.js";

// Locales the bundled Whisper base multilingual model recognizes well. Mirror
// of WHISPER_SUPPORTED_LANGUAGES in voice-command.ts — duplicated rather than
// imported to keep selectors free of command-layer deps. Codes outside this
// set fall through to the auto-detect display.
//
// Endonyms (self-names) so the same string reads naturally regardless of the
// active UI locale: a Russian user sees `Русский`, an English user sees the
// same `Русский` — always self-recognizable, no translation matrix needed.
const LANGUAGE_DISPLAY_BY_CODE: Record<string, string> = {
	de: "Deutsch",
	en: "English",
	es: "Español",
	fr: "Français",
	it: "Italiano",
	ja: "日本語",
	pt: "Português",
	ru: "Русский",
	uk: "Українська",
	zh: "中文",
};

// Selector functions resolve i18n at projection time so /languages flips
// propagate without re-instantiating the views.
function hintLabel(key: FooterHintKey, status: { status: string }): string {
	switch (key) {
		case "enter_paste":
			return t("footer.enter_paste", "Enter to paste");
		case "space_pause":
			return status.status === "paused"
				? t("footer.space_resume", "Space to resume")
				: t("footer.space_pause", "Space to pause");
		case "tab_settings":
			return t("footer.tab_settings", "Tab for settings");
		case "esc_cancel":
			return t("footer.esc_cancel", "Esc to cancel");
		case "esc_back":
			return t("footer.esc_back", "Esc to go back");
		case "ctrl_s_save":
			return t("footer.ctrl_s_save", "Ctrl-S to save");
		case "enter_toggle":
			return t("footer.enter_toggle", "Enter to toggle");
	}
}

export const selectStatusBarProps: GlobalSelector<StatusBarViewProps> = (state, _ctx) => {
	const meta = SCREEN_META[state.currentScreen];
	const hints: string[] = [];
	for (const key of meta.footerHints) hints.push(hintLabel(key, state));
	return { status: state.status, hints };
};

export const selectTranscriptProps: GlobalSelector<TranscriptViewProps> = (state, _ctx) => ({
	text: state.transcript,
	partial: state.partialTranscript,
	placeholder: t("transcript.placeholder", "Listening..."),
});

// `active`/`hint` are unconditional so the settings body height is stable —
// OverlayView renders the settings strategy off-screen on every tick to compute
// the height-padding target, and the result must not depend on which screen is
// currently visible.
export const selectHallucinationFilterFieldProps: GlobalSelector<SettingsFieldViewProps> = (state, _ctx) => ({
	label: t("settings.hallucination_filter_label", "Filter Whisper noise"),
	active: true,
	field: { kind: "toggle", enabled: state.settingsDraft.hallucinationFilterEnabled },
	hint: t(
		"settings.hallucination_filter_hint",
		"Drops silence-segment artifacts. Turn off for single-word dictation.",
	),
});

export const selectMicReadonlyFieldProps: GlobalSelector<SettingsFieldViewProps> = (_state, _ctx) => ({
	label: t("settings.microphone_label", "Microphone"),
	active: false,
	field: { kind: "readonly", value: t("settings.microphone_value_default", "System default input") },
});

export const selectLanguageReadonlyFieldProps: GlobalSelector<SettingsFieldViewProps> = (_state, _ctx) => {
	const locale = getActiveLocale();
	const base = locale ? (locale.split("-")[0] ?? locale) : undefined;
	const display = base ? (LANGUAGE_DISPLAY_BY_CODE[base] ?? base) : t("settings.language_value_auto", "Auto-detect");
	return {
		label: t("settings.language_label", "Language"),
		active: false,
		field: { kind: "readonly", value: display },
		hint: t("settings.language_hint", "Run /languages to change."),
	};
};
