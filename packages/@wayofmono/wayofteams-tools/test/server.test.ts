import { describe, it, expect } from "vitest"
import { autoProbeOrder, probeSurfaces, domainUrls, domainServerPaths, V2_DOMAINS, PRIMARY_DOMAINS } from "../src/server.js"
import type { Surface, ProbeResult } from "../src/server.js"

describe("autoProbeOrder", () => {
	it("tries v2 gateway before legacy before rest", () => {
		const order = autoProbeOrder()
		expect(order.map(s => s.kind)).toEqual(["v2", "legacy", "rest"])
	})
})

describe("probeSurfaces", () => {
	it("wins on the first healthy surface", async () => {
		const prober = async (surface: Surface): Promise<ProbeResult> =>
			surface.kind === "v2"
				? { surface, ok: true, tools: 3 }
				: { surface, ok: false, error: "no" }

		const { winner, results } = await probeSurfaces("https://x", "tok", prober)
		expect(winner?.kind).toBe("v2")
		expect(winner?.tools).toBe(3)
		expect(results).toHaveLength(3)
	})

	it("returns null winner when all fail", async () => {
		const prober = async (surface: Surface): Promise<ProbeResult> => ({ surface, ok: false, error: "down" })
		const { winner } = await probeSurfaces("https://x", "tok", prober)
		expect(winner).toBeNull()
	})

	it("respects a restricted order", async () => {
		const prober = async (surface: Surface): Promise<ProbeResult> =>
			surface.kind === "legacy" ? { surface, ok: true, tools: 269 } : { surface, ok: false, error: "n/a" }
		const { winner } = await probeSurfaces("https://x", "tok", prober, ["legacy"])
		expect(winner?.kind).toBe("legacy")
	})
})

describe("domainUrls", () => {
	it("builds v2 domain URLs and flags primary domains", () => {
		const urls = domainUrls("https://x")
		// one entry per v2 domain
		expect(urls).toHaveLength(V2_DOMAINS.length)
		const core = urls.find(u => u.domain === "core")
		expect(core?.url).toBe("https://x/mcp/v2/core")
		expect(core?.primary).toBe(true)
		const drive = urls.find(u => u.domain === "google-drive")
		expect(drive?.primary).toBe(false)
	})
})

describe("domainServerPaths", () => {
	it("enumerates ALL v2 domain servers (the full ~269-tool surface)", () => {
		const paths = domainServerPaths()
		// Must include every configured domain: primary (5) + admin + optional (6) = 12
		expect(paths).toHaveLength(12)
		expect(paths.length).toBeGreaterThanOrEqual(10)
		// primary core domains are default-on
		const primary = paths.filter(p => p.primary)
		expect(primary.map(p => p.domain).sort()).toEqual([...PRIMARY_DOMAINS].sort())
		// optional + admin are marked separately
		expect(paths.some(p => p.domain === "admin")).toBe(true)
		expect(paths.some(p => p.domain === "google-drive" && p.optional)).toBe(true)
		expect(paths.some(p => p.domain === "obsidian" && p.optional)).toBe(true)
	})

	it("covers all V2_DOMAINS exactly once", () => {
		const domains = domainServerPaths().map(p => p.domain)
		expect(new Set(domains).size).toBe(domains.length) // no duplicates
		expect([...domains].sort()).toEqual([...V2_DOMAINS].sort()) // same set
	})
})