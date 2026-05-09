import { isHallucinationFilterEnabled, type VoiceConfig } from "../config/voice-config.js";
import { t } from "./i18n-bridge.js";
import type { VoiceAction } from "./key-router.js";
import type { SettingsDraft, VoiceState } from "./state.js";
import { STATUS_META } from "./status-intent.js";

export interface ApplyContext {
	persistedConfig: VoiceConfig;
}

export type Effect =
	| { kind: "request_render" }
	| { kind: "paste_to_editor"; text: string }
	| { kind: "notify"; level: "error" | "info"; message: string }
	| { kind: "abort_session" }
	| { kind: "stop_mic" }
	| { kind: "set_pipeline_paused"; paused: boolean }
	| { kind: "set_hallucination_filter"; enabled: boolean }
	| { kind: "save_config"; config: VoiceConfig }
	| { kind: "done"; result: VoiceResult };

export interface VoiceResult {
	intent: "commit" | "cancel";
	transcript: string;
}

export interface ApplyResult {
	state: VoiceState;
	effects: readonly Effect[];
}

type Handler<K extends VoiceAction["kind"]> = (
	state: VoiceState,
	action: Extract<VoiceAction, { kind: K }>,
	ctx: ApplyContext,
) => ApplyResult;

const audioChunk: Handler<"audio_chunk"> = (state, action, _ctx) => {
	if (state.audioLevel === action.level) return { state, effects: [] };
	return { state: { ...state, audioLevel: action.level }, effects: [{ kind: "request_render" }] };
};

// Final commit. Appends to the persisted transcript and clears the in-progress
// partial — rolling re-decodes get superseded by the authoritative final.
const audioTranscriptAppended: Handler<"audio_transcript_appended"> = (state, action, _ctx) => {
	if (action.text.length === 0) {
		// Nothing to append, but a finalization still ends the partial.
		if (!state.partialTranscript) return { state, effects: [] };
		return { state: { ...state, partialTranscript: "" }, effects: [{ kind: "request_render" }] };
	}
	const next = state.transcript ? `${state.transcript} ${action.text}` : action.text;
	return {
		state: { ...state, transcript: next, partialTranscript: "" },
		effects: [{ kind: "request_render" }],
	};
};

// Replaces the partial wholesale — each rolling decode produces a fresh
// reading of the active utterance.
const audioPartialTranscriptSet: Handler<"audio_partial_transcript_set"> = (state, action, _ctx) => {
	if (state.partialTranscript === action.text) return { state, effects: [] };
	return { state: { ...state, partialTranscript: action.text }, effects: [{ kind: "request_render" }] };
};

const togglePause: Handler<"toggle_pause"> = (state, _action, _ctx) => {
	const nextStatus = state.status === "paused" ? "recording" : "paused";
	return {
		state: { ...state, status: nextStatus },
		effects: [
			{ kind: "set_pipeline_paused", paused: STATUS_META[nextStatus].gatesSttPipeline },
			{ kind: "request_render" },
		],
	};
};

// Include the in-flight partial when committing — what the user sees on
// screen (committed + grayed preview) is what they get pasted. Waiting for a
// "proper" final decode here would add 0.5–2 s of latency between Enter and
// paste; the visible partial is already a complete utterance from Whisper's
// perspective, just one without the trailing-silence padding.
const commit: Handler<"commit"> = (state, _action, _ctx) => {
	const merged = state.partialTranscript
		? state.transcript
			? `${state.transcript} ${state.partialTranscript}`
			: state.partialTranscript
		: state.transcript;
	return {
		state,
		effects: [{ kind: "done", result: { intent: "commit", transcript: merged } }],
	};
};

const cancel: Handler<"cancel"> = (state, _action, _ctx) => ({
	state,
	effects: [{ kind: "abort_session" }, { kind: "done", result: { intent: "cancel", transcript: "" } }],
});

const openSettings: Handler<"open_settings"> = (state, _action, _ctx) => ({
	state: { ...state, currentScreen: "settings" },
	effects: [{ kind: "request_render" }],
});

const closeSettings: Handler<"close_settings"> = (state, _action, _ctx) => ({
	state: { ...state, currentScreen: "dictation" },
	effects: [{ kind: "request_render" }],
});

const toggleHallucinationFilter: Handler<"toggle_hallucination_filter"> = (state, _action, _ctx) => {
	const enabled = !state.settingsDraft.hallucinationFilterEnabled;
	return {
		state: { ...state, settingsDraft: { ...state.settingsDraft, hallucinationFilterEnabled: enabled } },
		effects: [{ kind: "set_hallucination_filter", enabled }, { kind: "request_render" }],
	};
};

const settingsSave: Handler<"settings_save"> = (state, _action, _ctx) => {
	const config = configFromDraft(state.settingsDraft);
	return {
		state,
		effects: [
			{ kind: "save_config", config },
			{ kind: "notify", level: "info", message: t("notify.settings_saved", "Voice settings saved") },
		],
	};
};

const ignore: Handler<"ignore"> = (state, _action, _ctx) => ({ state, effects: [] });

const HANDLERS: { [K in VoiceAction["kind"]]: Handler<K> } = {
	audio_chunk: audioChunk,
	audio_transcript_appended: audioTranscriptAppended,
	audio_partial_transcript_set: audioPartialTranscriptSet,
	toggle_pause: togglePause,
	commit,
	cancel,
	open_settings: openSettings,
	close_settings: closeSettings,
	toggle_hallucination_filter: toggleHallucinationFilter,
	settings_save: settingsSave,
	ignore,
};

export function reduce(state: VoiceState, action: VoiceAction, ctx: ApplyContext): ApplyResult {
	const handler = HANDLERS[action.kind] as Handler<typeof action.kind>;
	return handler(state, action as never, ctx);
}

export function configFromDraft(draft: SettingsDraft): VoiceConfig {
	const out: { -readonly [K in keyof VoiceConfig]: VoiceConfig[K] } = {};
	// Only persist the off-state. The default-true case keeps voice.json minimal
	// and forward-compatible if we ever change the default.
	if (draft.hallucinationFilterEnabled === false) out.hallucinationFilterEnabled = false;
	return out;
}

export function draftFromConfig(config: VoiceConfig): SettingsDraft {
	return {
		hallucinationFilterEnabled: isHallucinationFilterEnabled(config),
	};
}
