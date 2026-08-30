import { describe, it, expect } from "vitest"
import { configFromSettings, DEFAULT_SKIP_TOOLS } from "../src/config.js"

describe("configFromSettings skipTools", () => {
	it("reads skipTools from the wayofteams settings block", () => {
		const cfg = configFromSettings({
			wayofteams: {
				token: "t",
				skipTools: ["web_search", "memory_search", "my_custom"],
			},
		})
		expect(cfg.skipTools).toEqual(["web_search", "memory_search", "my_custom"])
	})

	it("returns undefined skipTools when absent", () => {
		const cfg = configFromSettings({ wayofteams: { token: "t" } })
		expect(cfg.skipTools).toBeUndefined()
	})

	it("defaults skip pi-collision tools to avoid fatal pi tool-name conflicts", () => {
		// pi aborts an extension on the first duplicate tool name. These two collided with
		// @samfp/pi-memory (memory_search) and pi-web-access (web_search) in the real setup.
		expect(DEFAULT_SKIP_TOOLS).toContain("web_search")
		expect(DEFAULT_SKIP_TOOLS).toContain("memory_search")
	})
})