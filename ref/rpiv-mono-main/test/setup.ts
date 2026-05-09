import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, vi } from "vitest";

const TEST_HOME = mkdtempSync(join(tmpdir(), "rpiv-test-home-"));
process.env.HOME = TEST_HOME;
process.env.USERPROFILE = TEST_HOME;

vi.mock("@earendil-works/pi-ai", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@earendil-works/pi-ai")>();
	return {
		...actual,
		completeSimple: vi.fn(),
		getSupportedThinkingLevels: vi.fn(() => ["off", "minimal", "low", "medium", "high"]),
	};
});

const ADVISOR_SYMBOL = Symbol.for("rpiv-advisor");
const BTW_SYMBOL = Symbol.for("rpiv-btw");
const I18N_SYMBOL = Symbol.for("rpiv-i18n");
const VOICE_SYMBOL = Symbol.for("rpiv-voice");

beforeEach(async () => {
	const todo = await import("../packages/rpiv-todo/todo.js");
	todo.__resetState();

	const advisor = await import("../packages/rpiv-advisor/advisor.js");
	advisor.setAdvisorModel(undefined);
	advisor.setAdvisorEffort(undefined);

	const args = await import("../packages/rpiv-args/args.js");
	args.invalidateSkillIndex();

	const guidance = await import("../packages/rpiv-pi/extensions/rpiv-core/guidance.js");
	guidance.clearInjectionState();
	const gitContext = await import("../packages/rpiv-pi/extensions/rpiv-core/git-context.js");
	gitContext.clearGitContextCache();
	gitContext.resetInjectedMarker();

	const titleSpinner = await import("../packages/rpiv-warp/title-spinner.js");
	titleSpinner.__resetState();

	const i18n = await import("../packages/rpiv-i18n/i18n.js");
	i18n.__resetState();

	const voice = await import("../packages/rpiv-voice/config/voice-config.js");
	voice.__resetState();

	delete (globalThis as Record<symbol, unknown>)[ADVISOR_SYMBOL];
	delete (globalThis as Record<symbol, unknown>)[BTW_SYMBOL];
	delete (globalThis as Record<symbol, unknown>)[I18N_SYMBOL];
	delete (globalThis as Record<symbol, unknown>)[VOICE_SYMBOL];

	const piAgentSettings = join(process.env.HOME!, ".pi", "agent", "settings.json");
	const advisorConfig = join(process.env.HOME!, ".config", "rpiv-advisor", "advisor.json");
	const i18nConfig = join(process.env.HOME!, ".config", "rpiv-i18n", "locale.json");
	const voiceConfig = join(process.env.HOME!, ".config", "rpiv-voice", "voice.json");
	const voiceErrorsLog = join(process.env.HOME!, ".config", "rpiv-voice", "errors.log");
	rmSync(piAgentSettings, { force: true });
	rmSync(advisorConfig, { force: true });
	rmSync(i18nConfig, { force: true });
	rmSync(voiceConfig, { force: true });
	rmSync(voiceErrorsLog, { force: true });
});
