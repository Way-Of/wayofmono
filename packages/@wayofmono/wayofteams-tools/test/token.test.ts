import { describe, it, expect, vi } from "vitest"
import { decodeJwt, jwtValid, resolveToken, persistToken } from "../src/token.js"
import type { FsLike } from "../src/config.js"
import { join } from "node:path"

// A valid-looking JWT: header.payload.signature (signature is ignored client-side)
const fakeJwt =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
	Buffer.from(JSON.stringify({ sub: "u1", email: "a@b.c", exp: 9999999999, company_id: "c1" })).toString("base64url") +
	".sig"

function memFs(initial: Record<string, string> = {}): FsLike & { files: Record<string, string> } {
	const files: Record<string, string> = { ...initial }
	return {
		files,
		readFileSync: (p: string) => {
			if (!(p in files)) throw new Error(`ENOENT: ${p}`)
			return files[p]
		},
		writeFileSync: (p: string, d: string) => {
			files[p] = d
		},
		existsSync: (p: string) => p in files,
	}
}

describe("JWT helpers", () => {
	it("decodes the payload", () => {
		const c = decodeJwt(fakeJwt)
		expect(c?.email).toBe("a@b.c")
		expect(c?.company_id).toBe("c1")
	})

	it("returns null for garbage", () => {
		expect(decodeJwt("not-a-jwt")).toBeNull()
	})

	it("valid when exp is in the future", () => {
		expect(jwtValid(fakeJwt, 1_800_000_000).valid).toBe(true)
	})

	it("invalid when exp passed", () => {
		const expired =
			"a.b." +
			Buffer.from(JSON.stringify({ exp: 100 })).toString("base64url") +
			".c"
		expect(jwtValid(expired).valid).toBe(false)
	})
})

describe("resolveToken", () => {
	it("prefers env over settings", async () => {
		const fs = memFs({
			[join("path", "settings.json")]: JSON.stringify({ wayofteams: { token: "settings-token" } }),
		})
		const r = await resolveToken({ env: { WAYOFTEAMS_MCP_TOKEN: "env-token" }, fs }, false)
		expect(r.token).toBe("env-token")
		expect(r.source).toBe("env")
	})

	it("falls back to settings.json wayofteams.token", async () => {
		const fs = memFs({
			[join("path", "settings.json")]: JSON.stringify({ wayofteams: { token: "settings-token" } }),
		})
		const r = await resolveToken({ env: {}, fs, settingsPath: join("path", "settings.json") }, false)
		expect(r.token).toBe("settings-token")
		expect(r.source).toBe("settings")
	})

	it("returns invalid when no token anywhere", async () => {
		const r = await resolveToken({ env: {}, fs: memFs() }, false)
		expect(r.valid).toBe(false)
		expect(r.token).toBe("")
	})
})

describe("persistToken", () => {
	it("merges into settings.json wayofteams block", () => {
		const fs = memFs({
			[join("path", "settings.json")]: JSON.stringify({ defaultModel: "x" }),
		})
		const { ok } = persistToken(fs, join("path", "settings.json"), "new-token")
		expect(ok).toBe(true)
		const saved = JSON.parse(fs.files[join("path", "settings.json")])
		expect(saved.defaultModel).toBe("x")
		expect(saved.wayofteams.token).toBe("new-token")
	})
})