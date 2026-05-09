import { describe, expect, it } from "vitest";
import type { QuestionAnswer, QuestionData } from "../tool/types.js";
import type { WrappingSelectItem } from "../view/components/wrapping-select.js";
import {
	chatNumberingFor,
	computeFocusedOptionHasPreview,
	selectActivePreviewPaneIndex,
	selectActiveTabItems,
	selectConfirmedIndicator,
} from "./selectors/derivations.js";
import { selectActiveView } from "./selectors/focus.js";

function q(over: Partial<QuestionData> = {}): QuestionData {
	return {
		question: over.question ?? "Pick one",
		header: over.header ?? "H",
		options: over.options ?? [
			{ label: "A", description: "a" },
			{ label: "B", description: "b" },
		],
		multiSelect: over.multiSelect,
	};
}

const itemsRegular: WrappingSelectItem[] = [
	{ kind: "option", label: "A" },
	{ kind: "option", label: "B" },
];
const itemsWithOther: WrappingSelectItem[] = [
	{ kind: "option", label: "A" },
	{ kind: "option", label: "B" },
	{ kind: "other", label: "Type something." },
];

describe("selectConfirmedIndicator", () => {
	it("returns undefined when the question is multiSelect", () => {
		const answers = new Map<number, QuestionAnswer>([
			[0, { questionIndex: 0, question: "q", kind: "option", answer: "A" }],
		]);
		expect(selectConfirmedIndicator([q({ multiSelect: true })], 0, answers, itemsRegular)).toBeUndefined();
	});

	it("returns undefined when there is no prior answer for the tab", () => {
		expect(selectConfirmedIndicator([q()], 0, new Map(), itemsRegular)).toBeUndefined();
	});

	it("returns undefined when the prior answer was kind:'chat'", () => {
		const answers = new Map<number, QuestionAnswer>([
			[0, { questionIndex: 0, question: "q", kind: "chat", answer: "Chat about this" }],
		]);
		expect(selectConfirmedIndicator([q()], 0, answers, itemsRegular)).toBeUndefined();
	});

	it("returns the kind:'other' index + labelOverride when the prior answer was kind:'custom'", () => {
		const answers = new Map<number, QuestionAnswer>([
			[0, { questionIndex: 0, question: "q", kind: "custom", answer: "Hello" }],
		]);
		expect(selectConfirmedIndicator([q()], 0, answers, itemsWithOther)).toEqual({ index: 2, labelOverride: "Hello" });
	});

	it("returns undefined when kind:'custom' but the items array has no kind:'other' row", () => {
		const answers = new Map<number, QuestionAnswer>([
			[0, { questionIndex: 0, question: "q", kind: "custom", answer: "Hello" }],
		]);
		expect(selectConfirmedIndicator([q()], 0, answers, itemsRegular)).toBeUndefined();
	});

	it("returns the matching index for a regular label answer", () => {
		const answers = new Map<number, QuestionAnswer>([
			[0, { questionIndex: 0, question: "q", kind: "option", answer: "B" }],
		]);
		expect(selectConfirmedIndicator([q()], 0, answers, itemsRegular)).toEqual({ index: 1 });
	});

	it("returns undefined when the prior label matches no row (defensive)", () => {
		const answers = new Map<number, QuestionAnswer>([
			[0, { questionIndex: 0, question: "q", kind: "option", answer: "ZZ" }],
		]);
		expect(selectConfirmedIndicator([q()], 0, answers, itemsRegular)).toBeUndefined();
	});
});

describe("selectActivePreviewPaneIndex", () => {
	it("returns currentTab when within range", () => {
		expect(selectActivePreviewPaneIndex(1, 3)).toBe(1);
	});
	it("clamps to the last question index when on the Submit tab", () => {
		expect(selectActivePreviewPaneIndex(3, 3)).toBe(2);
	});
	it("returns 0 when totalQuestions is 0 (defensive)", () => {
		expect(selectActivePreviewPaneIndex(0, 0)).toBe(0);
	});
});

describe("selectActiveTabItems", () => {
	it("returns the items for the current tab", () => {
		const a: WrappingSelectItem[] = [{ kind: "option", label: "A" }];
		const b: WrappingSelectItem[] = [{ kind: "option", label: "B" }];
		expect(selectActiveTabItems([a, b], 1, 2)).toBe(b);
	});
	it("clamps Submit-tab to the last question's items", () => {
		const a: WrappingSelectItem[] = [{ kind: "option", label: "A" }];
		expect(selectActiveTabItems([a], 1, 1)).toBe(a);
	});
	it("falls back to an empty array when the index lands outside (defensive)", () => {
		expect(selectActiveTabItems([], 0, 0)).toEqual([]);
	});
});

describe("selectActiveView", () => {
	it("returns 'notes' when notesVisible is true", () => {
		expect(selectActiveView({ notesVisible: true, chatFocused: false, currentTab: 0 }, 2)).toBe("notes");
	});
	it("returns 'submit' when currentTab equals totalQuestions and notes hidden", () => {
		expect(selectActiveView({ notesVisible: false, chatFocused: false, currentTab: 2 }, 2)).toBe("submit");
	});
	it("returns 'chat' when chatFocused is true and notes hidden + not Submit tab", () => {
		expect(selectActiveView({ notesVisible: false, chatFocused: true, currentTab: 0 }, 2)).toBe("chat");
	});
	it("returns 'options' as the default", () => {
		expect(selectActiveView({ notesVisible: false, chatFocused: false, currentTab: 0 }, 2)).toBe("options");
	});
	it("priority order: notes wins over Submit-tab + chatFocused (matches dispatcher cascade)", () => {
		expect(selectActiveView({ notesVisible: true, chatFocused: true, currentTab: 2 }, 2)).toBe("notes");
	});
	it("priority order: submit wins over chatFocused when notes hidden", () => {
		expect(selectActiveView({ notesVisible: false, chatFocused: true, currentTab: 2 }, 2)).toBe("submit");
	});
});

describe("preexisting selectors retained", () => {
	it("computeFocusedOptionHasPreview returns true when the focused option carries a preview", () => {
		const questions = [
			q({
				options: [
					{ label: "A", description: "a", preview: "code" },
					{ label: "B", description: "b" },
				],
			}),
		];
		expect(computeFocusedOptionHasPreview(questions, 0, 0)).toBe(true);
		expect(computeFocusedOptionHasPreview(questions, 0, 1)).toBe(false);
	});
	it("chatNumberingFor excludes kind:'next' rows from the count", () => {
		const items: WrappingSelectItem[] = [
			{ kind: "option", label: "A" },
			{ kind: "option", label: "B" },
			{ kind: "next", label: "Next" },
		];
		expect(chatNumberingFor(items)).toEqual({ offset: 2, total: 3 });
	});
});

describe("chatNumberingFor — exhaustive kind matrix", () => {
	it("excludes only kind:'next' from the count", () => {
		const items: WrappingSelectItem[] = [
			{ kind: "option", label: "A" },
			{ kind: "option", label: "B" },
			{ kind: "other", label: "Type something." },
			{ kind: "next", label: "Next" },
		];
		expect(chatNumberingFor(items)).toEqual({ offset: 3, total: 4 });
	});
});

describe("selectConfirmedIndicator — kind matrix", () => {
	const items: WrappingSelectItem[] = [
		{ kind: "option", label: "A" },
		{ kind: "other", label: "Type something." },
	];
	const questions = [q({ options: [{ label: "A", description: "a" }] })];

	it("returns the kind:'other' index + labelOverride when prior was kind:'custom'", () => {
		const answers = new Map<number, QuestionAnswer>([
			[0, { questionIndex: 0, question: "q", kind: "custom", answer: "Hello" }],
		]);
		expect(selectConfirmedIndicator(questions, 0, answers, items)).toEqual({ index: 1, labelOverride: "Hello" });
	});

	it("returns undefined when prior was kind:'chat'", () => {
		const answers = new Map<number, QuestionAnswer>([
			[0, { questionIndex: 0, question: "q", kind: "chat", answer: "Chat about this" }],
		]);
		expect(selectConfirmedIndicator(questions, 0, answers, items)).toBeUndefined();
	});
});
