import { Container } from "@earendil-works/pi-tui";
import { clipToTerminalHeight } from "../state/selectors/derivations.js";
import type { VoiceState } from "../state/state.js";
import type { ScreenContentStrategy } from "./screen-content-strategy.js";
import type { StatefulView } from "./stateful-view.js";

const FALLBACK_TERMINAL_ROWS = 24;

// Both strategies end with `[divider, statusBar]` — exactly two rows of
// "bottom chrome" we anchor against. Subtracting that count from total rows
// gives the body row count that needs height equalization.
const BOTTOM_CHROME_ROWS = 2;

export interface OverlayViewProps {
	state: VoiceState;
}

export interface OverlayViewConfig {
	tui: { terminal: { rows?: number; columns: number } };
	dictation: ScreenContentStrategy;
	settings: ScreenContentStrategy;
}

/**
 * OverlayView keeps the divider + status-bar pinned at the same vertical
 * offset across screen flips. Each render:
 *   1. Renders both strategies (cheap — components are pure renderers).
 *   2. Updates a high-water mark of the body height (rows above the bottom
 *      chrome) across both. Once dictation has grown to N rows, every
 *      subsequent settings render pads up to N too — so the user never sees
 *      the chrome jump after switching screens.
 *   3. Top-pads the active strategy's rows with empty lines to match the
 *      target.
 *   4. Top-clips to ~85% of terminal height (handled by clipToTerminalHeight).
 */
export class OverlayView implements StatefulView<OverlayViewProps> {
	private liveState: VoiceState | undefined;
	private targetBodyHeight = 0;

	constructor(private readonly config: OverlayViewConfig) {}

	setProps(props: OverlayViewProps): void {
		this.liveState = props.state;
	}

	handleInput(_data: string): void {}

	invalidate(): void {}

	render(width: number): string[] {
		const state = this.liveState;
		if (!state) return [];

		const dictRows = this.renderStrategy(this.config.dictation, width);
		const settRows = this.renderStrategy(this.config.settings, width);
		const dictBody = Math.max(0, dictRows.length - BOTTOM_CHROME_ROWS);
		const settBody = Math.max(0, settRows.length - BOTTOM_CHROME_ROWS);
		this.targetBodyHeight = Math.max(this.targetBodyHeight, dictBody, settBody);

		const activeRows = state.currentScreen === "settings" ? settRows : dictRows;
		const currentBody = Math.max(0, activeRows.length - BOTTOM_CHROME_ROWS);
		const padNeeded = this.targetBodyHeight - currentBody;
		const padded = padNeeded > 0 ? [...new Array<string>(padNeeded).fill(""), ...activeRows] : activeRows;
		return clipToTerminalHeight(padded, this.terminalRows());
	}

	private renderStrategy(strategy: ScreenContentStrategy, width: number): string[] {
		const container = new Container();
		for (const child of strategy.children()) container.addChild(child);
		return container.render(width);
	}

	private terminalRows(): number {
		return this.config.tui.terminal.rows ?? FALLBACK_TERMINAL_ROWS;
	}
}
