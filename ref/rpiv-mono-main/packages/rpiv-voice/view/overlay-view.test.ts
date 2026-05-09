import type { Component } from "@earendil-works/pi-tui";
import { describe, expect, it } from "vitest";

import { initialVoiceState, type VoiceState } from "../state/state.js";
import { OverlayView } from "./overlay-view.js";
import type { ScreenContentStrategy } from "./screen-content-strategy.js";

// Minimal fake Component: emits a fixed line per call. The OverlayView
// pipeline pours these through pi-tui's Container, which preserves line count
// and prepends/appends per-child lines verbatim — so we can count rows and
// recognize markers ("D"/"S"/"=") without depending on Container styling.
function fakeLines(lines: string[]): Component {
	return {
		render: () => [...lines],
		invalidate: () => {},
	};
}

class FakeStrategy implements ScreenContentStrategy {
	constructor(
		readonly kind: "dictation" | "settings",
		private readonly rows: string[][],
	) {}
	children(): readonly Component[] {
		return this.rows.map(fakeLines);
	}
}

function makeOverlay(opts: { rows: number | undefined; dictation: string[][]; settings: string[][] }): OverlayView {
	return new OverlayView({
		tui: { terminal: { columns: 80, rows: opts.rows } },
		dictation: new FakeStrategy("dictation", opts.dictation),
		settings: new FakeStrategy("settings", opts.settings),
	});
}

function withScreen(state: VoiceState, screen: VoiceState["currentScreen"]): VoiceState {
	return { ...state, currentScreen: screen };
}

const DRAFT = { hallucinationFilterEnabled: true };

describe("OverlayView height stabilization", () => {
	// Lay out the strategies as: [body lines…, "DIVIDER", "STATUS"] so the last
	// two rows count as bottom chrome (BOTTOM_CHROME_ROWS = 2 in production).
	// `body` = total rendered lines minus 2.

	it("renders empty when state has not been set yet", () => {
		const overlay = makeOverlay({
			rows: 24,
			dictation: [["d1", "d2", "d3"], ["DIVIDER"], ["STATUS"]],
			settings: [["s1"], ["DIVIDER"], ["STATUS"]],
		});
		expect(overlay.render(80)).toEqual([]);
	});

	it("pads the shorter screen up to the high-water-mark of the taller one", () => {
		const overlay = makeOverlay({
			rows: 24,
			// dictation body = 5 rows: "d1".."d5"
			dictation: [["d1", "d2", "d3", "d4", "d5"], ["DIVIDER"], ["STATUS"]],
			// settings body = 1 row
			settings: [["s1"], ["DIVIDER"], ["STATUS"]],
		});

		const dict = initialVoiceState(DRAFT);
		overlay.setProps({ state: dict });
		const dictRows = overlay.render(80);
		// Should be 5 body + 2 chrome = 7 rows total, no padding needed.
		expect(dictRows).toHaveLength(7);
		expect(dictRows[dictRows.length - 1]).toContain("STATUS");

		// Flip to settings — should pad up to 5 body rows even though settings
		// only has 1 row of body content.
		overlay.setProps({ state: withScreen(dict, "settings") });
		const settRows = overlay.render(80);
		expect(settRows).toHaveLength(7);
		expect(settRows[settRows.length - 1]).toContain("STATUS");
		expect(settRows[settRows.length - 2]).toContain("DIVIDER");
		// The first 4 lines should be empty padding, then "s1", then chrome.
		expect(settRows.slice(0, 4)).toEqual(["", "", "", ""]);
		expect(settRows[4]).toContain("s1");
	});

	it("never shrinks the high-water-mark once established", () => {
		// Boot on settings (small body), then flip to dictation (tall body),
		// then back to settings — settings should be padded up.
		const overlay = makeOverlay({
			rows: 24,
			dictation: [["d1", "d2", "d3", "d4"], ["DIVIDER"], ["STATUS"]],
			settings: [["s1"], ["DIVIDER"], ["STATUS"]],
		});
		const dict = initialVoiceState(DRAFT);

		overlay.setProps({ state: withScreen(dict, "settings") });
		const before = overlay.render(80);
		expect(before).toHaveLength(6); // 4 body (settings padded by dictation render) + 2 chrome

		overlay.setProps({ state: dict });
		expect(overlay.render(80)).toHaveLength(6);

		overlay.setProps({ state: withScreen(dict, "settings") });
		const after = overlay.render(80);
		// Same height — chrome anchored at the bottom.
		expect(after).toHaveLength(6);
	});

	it("pins divider + status to the bottom row pair regardless of screen", () => {
		const overlay = makeOverlay({
			rows: 24,
			dictation: [["d1", "d2", "d3"], ["DIVIDER"], ["STATUS"]],
			settings: [["s1"], ["DIVIDER"], ["STATUS"]],
		});
		const dict = initialVoiceState(DRAFT);

		overlay.setProps({ state: dict });
		const dictRows = overlay.render(80);
		const dictDivIdx = dictRows.findIndex((r) => r.includes("DIVIDER"));
		const dictStatusIdx = dictRows.findIndex((r) => r.includes("STATUS"));
		expect(dictStatusIdx).toBe(dictRows.length - 1);
		expect(dictDivIdx).toBe(dictStatusIdx - 1);

		overlay.setProps({ state: withScreen(dict, "settings") });
		const settRows = overlay.render(80);
		expect(settRows[settRows.length - 1]).toContain("STATUS");
		expect(settRows[settRows.length - 2]).toContain("DIVIDER");
	});
});

describe("OverlayView clipToTerminalHeight integration", () => {
	it("top-clips when content exceeds 85% of terminal height", () => {
		// Terminal rows = 10 → maxRows = floor(10 * 0.85) = 8.
		const longBody = Array.from({ length: 12 }, (_, i) => `line-${i}`);
		const overlay = makeOverlay({
			rows: 10,
			dictation: [longBody, ["DIVIDER"], ["STATUS"]],
			settings: [["s1"], ["DIVIDER"], ["STATUS"]],
		});
		const dict = initialVoiceState(DRAFT);
		overlay.setProps({ state: dict });

		const rows = overlay.render(80);
		// Total = 12 body + 2 chrome = 14, clipped to 8.
		expect(rows.length).toBe(8);
		// Bottom chrome must survive — the clip is from the top.
		expect(rows[rows.length - 1]).toContain("STATUS");
		expect(rows[rows.length - 2]).toContain("DIVIDER");
		// First content row should be one of the later body lines (top was dropped).
		const earliestSurvivingIdx = Number(rows[0].match(/line-(\d+)/)?.[1] ?? -1);
		expect(earliestSurvivingIdx).toBeGreaterThan(0);
	});

	it("falls back to 24 rows when terminal.rows is undefined", () => {
		// 24 rows → maxRows = 20. A 30-row payload should clip to 20.
		const longBody = Array.from({ length: 28 }, (_, i) => `line-${i}`);
		const overlay = makeOverlay({
			rows: undefined,
			dictation: [longBody, ["DIVIDER"], ["STATUS"]],
			settings: [["s1"], ["DIVIDER"], ["STATUS"]],
		});
		overlay.setProps({ state: initialVoiceState(DRAFT) });
		const rows = overlay.render(80);
		expect(rows.length).toBe(20);
		expect(rows[rows.length - 1]).toContain("STATUS");
	});

	it("respects the MIN_RENDER_ROWS=4 floor on tiny terminals", () => {
		// 1 row * 0.85 = 0 → floor 4.
		const overlay = makeOverlay({
			rows: 1,
			dictation: [["d1", "d2", "d3", "d4", "d5", "d6"], ["DIVIDER"], ["STATUS"]],
			settings: [["s1"], ["DIVIDER"], ["STATUS"]],
		});
		overlay.setProps({ state: initialVoiceState(DRAFT) });
		const rows = overlay.render(80);
		expect(rows.length).toBe(4);
		expect(rows[rows.length - 1]).toContain("STATUS");
	});
});
