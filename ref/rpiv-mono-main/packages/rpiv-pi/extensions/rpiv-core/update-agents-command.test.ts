import { createMockCtx, createMockPi } from "@juicesharp/rpiv-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./agents.js", () => ({
	syncBundledAgents: vi.fn(),
}));

import { syncBundledAgents } from "./agents.js";
import { registerUpdateAgentsCommand } from "./update-agents-command.js";

beforeEach(() => {
	vi.mocked(syncBundledAgents).mockReset();
});

const empty = (overrides: Partial<ReturnType<typeof syncBundledAgents>> = {}) => ({
	added: [],
	updated: [],
	unchanged: [],
	removed: [],
	pendingUpdate: [],
	pendingRemove: [],
	errors: [],
	...overrides,
});

describe("/rpiv-update-agents", () => {
	it("registers the command", () => {
		const { pi, captured } = createMockPi();
		registerUpdateAgentsCommand(pi);
		expect(captured.commands.has("rpiv-update-agents")).toBe(true);
	});

	it("UP_TO_DATE when no changes, no errors", async () => {
		vi.mocked(syncBundledAgents).mockReturnValue(empty());
		const { pi, captured } = createMockPi();
		registerUpdateAgentsCommand(pi);
		const ctx = createMockCtx({ hasUI: true });
		await captured.commands.get("rpiv-update-agents")?.handler("", ctx as never);
		expect(ctx.ui.notify).toHaveBeenCalledWith(expect.stringContaining("up-to-date"), "info");
	});

	it("synced report when added+updated+removed > 0", async () => {
		vi.mocked(syncBundledAgents).mockReturnValue(empty({ added: ["a.md"], updated: ["b.md"], removed: ["c.md"] }));
		const { pi, captured } = createMockPi();
		registerUpdateAgentsCommand(pi);
		const ctx = createMockCtx({ hasUI: true });
		await captured.commands.get("rpiv-update-agents")?.handler("", ctx as never);
		const report = (ctx.ui.notify as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(report).toContain("1 added");
		expect(report).toContain("1 updated");
		expect(report).toContain("1 removed");
	});

	it("errors-only report uses 'warning' severity", async () => {
		vi.mocked(syncBundledAgents).mockReturnValue(
			empty({ errors: [{ op: "copy", message: "EACCES", file: "a.md" }] }),
		);
		const { pi, captured } = createMockPi();
		registerUpdateAgentsCommand(pi);
		const ctx = createMockCtx({ hasUI: true });
		await captured.commands.get("rpiv-update-agents")?.handler("", ctx as never);
		const [, severity] = (ctx.ui.notify as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(severity).toBe("warning");
	});

	it("stays silent when !hasUI", async () => {
		vi.mocked(syncBundledAgents).mockReturnValue(empty({ added: ["x.md"] }));
		const { pi, captured } = createMockPi();
		registerUpdateAgentsCommand(pi);
		const ctx = createMockCtx({ hasUI: false });
		await captured.commands.get("rpiv-update-agents")?.handler("", ctx as never);
		expect(ctx.ui.notify).not.toHaveBeenCalled();
	});
});
