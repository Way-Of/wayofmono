import { describe, expect, it } from "vitest";
import { initialVoiceState } from "./state.js";
import { type ApplyContext, configFromDraft, draftFromConfig, reduce } from "./state-reducer.js";
import { STATUS_META } from "./status-intent.js";

const ctx: ApplyContext = { persistedConfig: {} };

function freshState() {
	return initialVoiceState(draftFromConfig({}));
}

describe("reduce", () => {
	it("audio_chunk updates audioLevel and requests render", () => {
		const s = freshState();
		const r = reduce(s, { kind: "audio_chunk", level: 0.4 }, ctx);
		expect(r.state.audioLevel).toBe(0.4);
		expect(r.effects.find((e) => e.kind === "request_render")).toBeTruthy();
	});

	it("audio_chunk with same level is a no-op (no effects)", () => {
		const s = freshState();
		const r = reduce(s, { kind: "audio_chunk", level: 0 }, ctx);
		expect(r.effects).toHaveLength(0);
	});

	it("audio_transcript_appended concatenates with a space", () => {
		let s = freshState();
		s = reduce(s, { kind: "audio_transcript_appended", text: "hello" }, ctx).state;
		s = reduce(s, { kind: "audio_transcript_appended", text: "world" }, ctx).state;
		expect(s.transcript).toBe("hello world");
	});

	it("audio_partial_transcript_set replaces the partial wholesale", () => {
		let s = freshState();
		s = reduce(s, { kind: "audio_partial_transcript_set", text: "I am" }, ctx).state;
		expect(s.partialTranscript).toBe("I am");
		s = reduce(s, { kind: "audio_partial_transcript_set", text: "I am going to" }, ctx).state;
		expect(s.partialTranscript).toBe("I am going to");
	});

	it("audio_partial_transcript_set with the same text is a no-op (no effects)", () => {
		const s = { ...freshState(), partialTranscript: "stable" };
		const r = reduce(s, { kind: "audio_partial_transcript_set", text: "stable" }, ctx);
		expect(r.effects).toHaveLength(0);
	});

	it("audio_transcript_appended commits and clears the partial", () => {
		let s = { ...freshState(), partialTranscript: "I am goin" };
		s = reduce(s, { kind: "audio_transcript_appended", text: "I am going home" }, ctx).state;
		expect(s.transcript).toBe("I am going home");
		expect(s.partialTranscript).toBe("");
	});

	it("audio_transcript_appended with empty text still clears a stale partial", () => {
		let s = { ...freshState(), partialTranscript: "stale" };
		s = reduce(s, { kind: "audio_transcript_appended", text: "" }, ctx).state;
		expect(s.partialTranscript).toBe("");
	});

	it("toggle_pause flips status and emits set_pipeline_paused matching STATUS_META", () => {
		const s = freshState();
		const r = reduce(s, { kind: "toggle_pause" }, ctx);
		expect(r.state.status).toBe("paused");
		const effect = r.effects.find((e) => e.kind === "set_pipeline_paused");
		expect(effect).toEqual({ kind: "set_pipeline_paused", paused: STATUS_META.paused.gatesSttPipeline });
	});

	it("commit emits done with the live transcript", () => {
		let s = freshState();
		s = reduce(s, { kind: "audio_transcript_appended", text: "hi" }, ctx).state;
		const r = reduce(s, { kind: "commit" }, ctx);
		expect(r.effects).toContainEqual({ kind: "done", result: { intent: "commit", transcript: "hi" } });
	});

	it("commit folds the in-flight partial into the committed transcript", () => {
		let s = freshState();
		s = reduce(s, { kind: "audio_transcript_appended", text: "hello" }, ctx).state;
		s = reduce(s, { kind: "audio_partial_transcript_set", text: "world" }, ctx).state;
		const r = reduce(s, { kind: "commit" }, ctx);
		expect(r.effects).toContainEqual({
			kind: "done",
			result: { intent: "commit", transcript: "hello world" },
		});
	});

	it("commit with only a partial (no committed text) returns just the partial", () => {
		let s = freshState();
		s = reduce(s, { kind: "audio_partial_transcript_set", text: "first words" }, ctx).state;
		const r = reduce(s, { kind: "commit" }, ctx);
		expect(r.effects).toContainEqual({
			kind: "done",
			result: { intent: "commit", transcript: "first words" },
		});
	});

	it("cancel emits abort_session and done with empty transcript", () => {
		const s = freshState();
		const r = reduce(s, { kind: "cancel" }, ctx);
		expect(r.effects.some((e) => e.kind === "abort_session")).toBe(true);
		expect(r.effects).toContainEqual({ kind: "done", result: { intent: "cancel", transcript: "" } });
	});

	it("open_settings transitions screen to settings", () => {
		const s = freshState();
		const r = reduce(s, { kind: "open_settings" }, ctx);
		expect(r.state.currentScreen).toBe("settings");
	});

	it("close_settings returns to dictation", () => {
		const s = { ...freshState(), currentScreen: "settings" as const };
		const r = reduce(s, { kind: "close_settings" }, ctx);
		expect(r.state.currentScreen).toBe("dictation");
	});

	it("toggle_hallucination_filter flips the draft and emits set_hallucination_filter", () => {
		const s = freshState();
		expect(s.settingsDraft.hallucinationFilterEnabled).toBe(true);
		const r = reduce(s, { kind: "toggle_hallucination_filter" }, ctx);
		expect(r.state.settingsDraft.hallucinationFilterEnabled).toBe(false);
		expect(r.effects).toContainEqual({ kind: "set_hallucination_filter", enabled: false });
	});

	it("settings_save with default-on filter writes an empty config", () => {
		const s = freshState();
		const r = reduce(s, { kind: "settings_save" }, ctx);
		expect(r.effects).toContainEqual({ kind: "save_config", config: {} });
	});

	it("settings_save persists hallucinationFilterEnabled when user disables it", () => {
		const s = { ...freshState(), settingsDraft: { hallucinationFilterEnabled: false } };
		const r = reduce(s, { kind: "settings_save" }, ctx);
		expect(r.effects).toContainEqual({ kind: "save_config", config: { hallucinationFilterEnabled: false } });
	});
});

describe("configFromDraft / draftFromConfig", () => {
	it("draftFromConfig defaults hallucination filter to enabled", () => {
		expect(draftFromConfig({})).toEqual({ hallucinationFilterEnabled: true });
	});

	it("draftFromConfig preserves an explicit `false` disable", () => {
		expect(draftFromConfig({ hallucinationFilterEnabled: false })).toEqual({ hallucinationFilterEnabled: false });
	});

	it("configFromDraft drops the default-true filter flag", () => {
		expect(configFromDraft({ hallucinationFilterEnabled: true })).toEqual({});
	});

	it("configFromDraft persists the off-state of the filter", () => {
		expect(configFromDraft({ hallucinationFilterEnabled: false })).toEqual({ hallucinationFilterEnabled: false });
	});
});
