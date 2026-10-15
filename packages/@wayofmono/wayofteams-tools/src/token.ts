/**
 * [WOTEAMS-547] Token resolution + JWT verification — pure module.
 *
 * Resolution order (first hit wins), never hardcoded:
 *   1. env WAYOFTEAMS_MCP_TOKEN
 *   2. pi settings.json -> wayofteams.token (client-pasted via /wayofteams login)
 *   3. settings.json -> wayofteams.tokenFile (path to dashboard-written token)
 *   4. dashboard token file ~/.config/opencode/.wayofteams-mcp-token (AGENTS.md convention)
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs"
import { configFromSettings, loadSettings, resolveMaybeTilde } from "./config.js"
import type { FsLike } from "./config.js"
import { homedir } from "node:os"
import { join } from "node:path"

export interface ResolvedToken {
	token: string
	source: "env" | "settings" | "settings-file" | "dashboard-file"
	/** True when the JWT decodes and exp is in the future. */
	valid: boolean
	exp?: number
	/** Decoded claim surface (never the raw secret). */
	claims?: JwtClaims
}

export interface JwtClaims {
	sub?: string
	email?: string
	company_id?: string
	exp?: number
	iat?: number
	role?: string
	superadmin?: boolean
}

/** Decode JWT payload without verification (client can't verify server signature). */
export function decodeJwt(token: string): JwtClaims | null {
	if (!token.includes(".")) return null
	try {
		const payload = token.split(".")[1]
		const padded = payload.length % 4 === 0 ? payload : payload + "=".repeat(4 - (payload.length % 4))
		const json = Buffer.from(padded, "base64url").toString("utf-8")
		return JSON.parse(json) as JwtClaims
	} catch {
		return null
	}
}

export function jwtValid(token: string, now = Date.now() / 1000): { valid: boolean; exp?: number } {
	const claims = decodeJwt(token)
	if (!claims) return { valid: false }
	if (typeof claims.exp === "number") {
		return { valid: now < claims.exp, exp: claims.exp }
	}
	// No exp claim — presence of a decodable payload is the best we can do client-side.
	return { valid: true }
}

export interface TokenResolverOptions {
	env?: Record<string, string | undefined>
	envKeys?: string[]
	fs?: FsLike
	fetchImpl?: typeof fetch
	url?: string
	/** Override where settings.json is read from (for tests / custom agent dirs). */
	settingsPath?: string
}

/** Best-effort live check: does the token authenticate to the given surface? */
export async function verifyTokenLive(token: string, url: string, fetchImpl = fetch): Promise<boolean> {
	try {
		const res = await fetchImpl(url, {
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 1,
				method: "initialize",
				params: {
					protocolVersion: "2024-11-05",
					capabilities: {},
					clientInfo: { name: "pi-wayofteams-verify", version: "1.0.0" },
				},
			}),
			signal: AbortSignal.timeout(15_000),
		})
		return res.status === 200
	} catch {
		return false
	}
}

/**
 * Resolve the token without network (order: env -> settings.token -> settings.tokenFile
 * -> dashboard token file). `live` performs the initialize check too.
 */
export async function resolveToken(
	opts: TokenResolverOptions = {},
	live = false,
): Promise<ResolvedToken> {
	const env = opts.env ?? process.env
	const fs: FsLike = opts.fs ?? {
		readFileSync,
		writeFileSync,
		existsSync,
	}
	const envKeys = opts.envKeys ?? ["WAYOFTEAMS_MCP_TOKEN"]

	let token: string | undefined
	let source: ResolvedToken["source"] | undefined

	for (const k of envKeys) {
		const v = env[k]
		if (v) {
			token = v
			source = "env"
			break
		}
	}

	if (!token) {
		const cfg = configFromSettings(loadSettings(fs, undefined, opts.settingsPath))
		if (cfg.token) {
			token = cfg.token
			source = "settings"
		} else if (cfg.tokenFile) {
			try {
				token = fs.readFileSync(resolveMaybeTilde(cfg.tokenFile), "utf-8").trim()
				source = "settings-file"
			} catch {
				token = undefined
			}
		}
	}

	if (!token) {
		const dashboard = join(homedir(), ".config", "opencode", ".wayofteams-mcp-token")
		try {
			if (fs.existsSync(dashboard)) {
				token = fs.readFileSync(dashboard, "utf-8").trim()
				source = "dashboard-file"
			}
		} catch {
			token = undefined
		}
	}

	if (!token) {
		return { token: "", source: "env", valid: false }
	}

	const { valid, exp } = jwtValid(token)

	// Live verification is expensive; only run when requested (login flow, startup once).
	let liveOk = valid
	if (live && valid && opts.url) {
		liveOk = await verifyTokenLive(token, opts.url)
	}

	return {
		token,
		source: source ?? "env",
		valid: live ? liveOk : valid,
		exp,
		claims: decodeJwt(token) ?? undefined,
	}
}

/** Persist a token into settings.json under wayofteams.token (via /wayofteams login). */
export function persistToken(fs: FsLike, settingsPathToWrite: string, token: string): { ok: boolean; error?: string } {
	try {
		const existing = JSON.parse(fs.existsSync(settingsPathToWrite) ? fs.readFileSync(settingsPathToWrite, "utf-8") : "{}")
		existing.wayofteams = { ...existing.wayofteams, token }
		fs.writeFileSync(settingsPathToWrite, JSON.stringify(existing, null, 2))
		return { ok: true }
	} catch (e: any) {
		return { ok: false, error: e?.message ?? String(e) }
	}
}