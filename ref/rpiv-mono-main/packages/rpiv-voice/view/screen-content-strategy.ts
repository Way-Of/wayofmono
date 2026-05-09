import { type Component, Spacer } from "@earendil-works/pi-tui";
import type { SettingsFormViewProps } from "./components/settings-form-view.js";
import type { StatusBarViewProps } from "./components/status-bar-view.js";
import type { TranscriptViewProps } from "./components/transcript-view.js";
import type { StatefulView } from "./stateful-view.js";

/**
 * Per-screen layout. Returns the ordered list of pi-tui Components that the
 * overlay container renders top-down. Both screens share the same bottom
 * status bar (recording glyph + timer + screen-specific hints) so the hint
 * column is stable when flipping between dictation and settings.
 */
export interface ScreenContentStrategy {
	readonly kind: "dictation" | "settings";
	children(): readonly Component[];
}

export interface DictationScreenStrategyConfig {
	transcript: StatefulView<TranscriptViewProps>;
	divider: Component;
	statusBar: StatefulView<StatusBarViewProps>;
}

export class DictationScreenStrategy implements ScreenContentStrategy {
	readonly kind = "dictation" as const;

	constructor(private readonly config: DictationScreenStrategyConfig) {}

	children(): readonly Component[] {
		return [new Spacer(1), this.config.transcript, this.config.divider, this.config.statusBar];
	}
}

export interface SettingsScreenStrategyConfig {
	settingsForm: StatefulView<SettingsFormViewProps>;
	divider: Component;
	statusBar: StatefulView<StatusBarViewProps>;
}

export class SettingsScreenStrategy implements ScreenContentStrategy {
	readonly kind = "settings" as const;

	constructor(private readonly config: SettingsScreenStrategyConfig) {}

	children(): readonly Component[] {
		return [new Spacer(1), this.config.settingsForm, this.config.divider, this.config.statusBar];
	}
}
