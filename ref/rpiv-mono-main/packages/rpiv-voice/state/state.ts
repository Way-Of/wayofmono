export type RecordingStatus = "recording" | "paused";
export type ScreenKind = "dictation" | "settings";

export interface SettingsDraft {
	hallucinationFilterEnabled: boolean;
}

export interface VoiceState {
	currentScreen: ScreenKind;
	status: RecordingStatus;
	/** Committed text — produced by the final decode at each VAD silence /
	 *  cap boundary. This is what the editor receives on commit. */
	transcript: string;
	/** In-progress text — rolling re-decodes of the still-active utterance,
	 *  emitted every ~1 s. Replaced wholesale by each successive partial.
	 *  Cleared (and concatenated into `transcript`) on the final decode of
	 *  the utterance. Rendered after `transcript` in a dim style. */
	partialTranscript: string;
	audioLevel: number;
	/** In-flight editor draft — not persisted until `settings_save`. */
	settingsDraft: SettingsDraft;
}

export interface VoiceRuntime {
	keybindings: { matches(data: string, name: string): boolean };
}

export function initialVoiceState(draft: SettingsDraft): VoiceState {
	return {
		currentScreen: "dictation",
		status: "recording",
		transcript: "",
		partialTranscript: "",
		audioLevel: 0,
		settingsDraft: draft,
	};
}
