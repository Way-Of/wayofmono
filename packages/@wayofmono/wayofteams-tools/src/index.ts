/**
 * [WOTEAMS-547] wayofteams-tools pi extension — entry point.
 *
 * Client-first pi extension: full WayOfTeams integration (legacy /mcp + v2 domain-split
 * MCP surfaces) with a REST dual path. npm-distributable via @wayofmono/wayofteams-tools.
 *
 * - Token: env -> settings.json "wayofteams" key -> dashboard token file (never hardcoded)
 * - Surfaces: auto-probe v2 gateway -> legacy -> REST; switchable at runtime
 * - Dynamic tool loading via pi.setActiveTools (additive-only)
 * - Multi-agent identity: update_my_work on session_start (WOTEAMS-322)
 *
 * IMPORTANT (pi extension-loading contract, from pi's extension loader source):
 * - REGISTRATION methods (registerTool, registerCommand, on, registerProvider) are valid
 *   during the factory (extension loading).
 * - ACTION methods that delegate to the runtime — getActiveTools / setActiveTools /
 *   sendMessage / setModel etc. — THROW during loading
 *   ("Extension runtime not initialized. Action methods cannot be called during extension
 *   loading."). They are only safe once the runtime is bound (i.e. inside event handlers
 *   such as session_start and tool/command handlers).
 *
 * So: the async factory does ALL registration + network probe (allowed; pi awaits the
 * promise before session_start). Tool ACTIVATION (setActiveTools) is deferred to
 * session_start, after the runtime is bound.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { homedir } from "node:os"

import { DEFAULT_MCP_URL, DEFAULT_V2_PATH, DEFAULT_SKIP_TOOLS, configFromSettings, loadSettings } from "./config.js"
import type { FsLike } from "./config.js"
import { McpClient, type McpTool } from "./client/mcp.js"
import { RestClient } from "./client/rest.js"
import { resolveToken, persistToken } from "./token.js"
import { probeSurfaces, domainServerPaths, type ActiveSurfaceState } from "./server.js"
import { ToolRegistry, paramsFromMcpSchema, type ToolDefinition } from "./registry.js"
import { agentIdentity, registerAgent } from "./identity.js"
import { buildRouterTools } from "./tools/router.js"
import { buildControlTools } from "./tools/control.js"
import { buildFallbackTools } from "./tools/fallbacks.js"

const fs: FsLike = { readFileSync, writeFileSync, existsSync }

function cap(s: string): string {
	return s ? s[0].toUpperCase() + s.slice(1) : s
}

export default async function (pi: ExtensionAPI): Promise<void> {
	const baseUrl = process.env.WOTEAMS_MCP_URL || DEFAULT_MCP_URL

	// Read user config (token/skipTools/etc.) from settings.json. skipTools avoids
	// tool-name collisions with other pi extensions the user has installed.
	const userCfg = configFromSettings(loadSettings(fs))
	const skip = new Set<string>([...DEFAULT_SKIP_TOOLS, ...(userCfg.skipTools ?? [])])

	// Token resolution: env -> settings.json -> dashboard token file; live-verified.
	// Non-blocking on failure (graceful degradation to no-token mode).
	let resolved = await resolveToken({ fs, url: `${baseUrl}/mcp/v2` }, false)

	let mcp = new McpClient({ url: `${baseUrl}/mcp/v2`, token: resolved.token })
	let rest = new RestClient({ baseUrl, token: resolved.token })

	const registry = new ToolRegistry(pi)
	let activeSurface: ActiveSurfaceState | null = null
	let mode: "mcp" | "rest" | "no-token" = resolved.valid ? "mcp" : "no-token"

	// Surface accessor — reads go through a helper because TS control-flow can't
	// track the closure-mutated `let` (avoids `never` narrowing).
	const surface = (): ActiveSurfaceState | null => activeSurface ?? null

	async function probeAll(): Promise<{ ok: boolean; message: string; winner: ActiveSurfaceState | null }> {
		try {
			const { winner, results } = await probeSurfaces(baseUrl, resolved.token, async (s, base, token) => {
				const client = new McpClient({ url: `${base}${s.defaultPath}`, token })
				try {
					const init = await client.initialize()
					return { surface: s, ok: true, tools: init.tools.length }
				} catch (e: any) {
					return { surface: s, ok: false, error: e?.message ?? String(e) }
				}
			})
			const win: ActiveSurfaceState | null = winner
			activeSurface = win
			mode = win ? (win.kind === "rest" ? "rest" : "mcp") : "no-token"
			return {
				ok: !!win,
				winner: win,
				message: win
					? `${win.label} (${win.tools} tools)`
					: results.map(r => `${r.surface.label}: ${r.error ?? "unknown"}`).join("; "),
			}
		} catch (e: any) {
			mode = "no-token"
			return { ok: false, winner: null, message: e?.message ?? String(e) }
		}
	}

	// ── REGISTRATION (safe during factory loading) ──────────────────────────
	const router = buildRouterTools({
		mcp,
		onActivate: names => registry.activate(names), // called from tool execution (post-bind) — safe
	})
	const control = buildControlTools({
		mcp,
		rest,
		getState: () => ({ surface: activeSurface, token: resolved.token, mode }),
		refresh: async () => {
			const r = await probeAll()
			return { ok: r.ok, message: r.message, tools: surface()?.tools ?? 0 }
		},
	})

	// Control plane + router loaders are always registered (visible even pre-token).
	registry.registerMany(control)
	registry.registerMany(router)

	// Surface registration for a single MCP URL's tool list (legacy /mcp or one domain).
	async function registerToolsFromUrl(url: string, executeVia?: (name: string, args: Record<string, unknown>) => Promise<string>): Promise<number> {
		let n = 0
		try {
			const client = new McpClient({ url, token: resolved.token })
			const tools: McpTool[] = await client.listTools()
			for (const tool of tools) {
				if (skip.has(tool.name)) continue // avoid collisions w/ other pi extensions
				if (registry.has(tool.name)) continue
				registry.register({
					name: tool.name,
					label: tool.name.split("_").map(cap).join(" "),
					description: tool.description || tool.name,
					promptSnippet: tool.description || tool.name,
					parameters: paramsFromMcpSchema(tool.inputSchema),
					execute: async (_id, params) => {
						let text: string
						if (executeVia) {
							text = await executeVia(tool.name, params)
						} else {
							const result = await client.callTool(tool.name, params)
							text = McpClient.contentText(result)
						}
						return { content: [{ type: "text", text }], details: { tool: tool.name } }
					},
				})
				n++
			}
		} catch (e: any) {
			console.log(`[wayofteams-tools] registering from ${url} failed: ${e?.message ?? e}`)
		}
		return n
	}

	// Probe surfaces to find connectivity/primary. Then, to expose the FULL tool surface
	// (~240 tools), enumerate every v2 domain server's tools/list and register each tool.
	// Execution is routed through the active surface client (v2 gateway executes any real
	// tool name via Server.call_tool), so a single client serves every domain tool.
	const probe = await probeAll()
	const w = probe.winner as ActiveSurfaceState | null

	let realTools = 0
	if (resolved.valid) {
		// Always enumerate all v2 domain servers (the real tool surface). Primary domains
		// are default-on; admin + optional (google-*/obsidian) are best-effort (may 404 if
		// disabled server-side). Tools register the first time they're seen; the active
		// surface client executes every name.
		const executeVia = async (name: string, args: Record<string, unknown>) => {
			const result = await mcp.callTool(name, args)
			return McpClient.contentText(result)
		}
		for (const path of domainServerPaths()) {
			const url = `${baseUrl}${DEFAULT_V2_PATH}/${path.domain}`
			const n = await registerToolsFromUrl(url, executeVia)
			realTools += n
		}
		// If the v2 surface is down, try the legacy monolith (all tools in one list).
		if (realTools === 0) {
			realTools += await registerToolsFromUrl(`${baseUrl}/mcp`, executeVia)
		}
	}

	// REST fallbacks only when MCP is fully down (last-resort graceful degradation).
	if (!probe.ok) {
		registry.registerMany(buildFallbackTools(rest))
	}

	// ── Commands (registration is safe during load) ─────────────────────────
	pi.registerCommand("wayofteams", {
		description: "WayOfTeams extension: status, endpoint probing",
		handler: async (args, ctx) => {
			const [cmd] = (args ?? "").trim().split(/\s+/)
			switch (cmd) {
				case "status":
					ctx.ui.notify(
						`[wayofteams-tools] mode=${mode} | surface=${surface()?.label ?? "none"} (${surface()?.tools ?? 0} tools) | token=${resolved.valid ? "set" : "missing"}`,
						"info",
					)
					break
				case "endpoint": {
					const r = await probeAll()
					ctx.ui.notify(`[wayofteams-tools] probed: ${r.message}`, "info")
					break
				}
				default:
					ctx.ui.notify("Usage: /wayofteams <status|endpoint>", "info")
			}
		},
	})

	pi.registerCommand("wayofteams-login", {
		description: "Store a WayOfTeams token in pi settings.json and reconnect",
		handler: async (args, ctx) => {
			const token = (args ?? "").trim()
			if (!token) return ctx.ui.notify("Usage: /wayofteams-login <token>", "error")

			const candidate = await resolveToken({ env: { WAYOFTEAMS_MCP_TOKEN: token }, url: `${baseUrl}/mcp/v2` }, true)
			if (!candidate.valid) return ctx.ui.notify("Token rejected: not a valid JWT or auth failed", "error")

			const path = join(homedir(), ".pi", "agent", "settings.json")
			const { ok, error } = persistToken(fs, path, token)
			if (!ok) return ctx.ui.notify(`Failed to save token to settings.json: ${error}`, "error")

			resolved = candidate
			mcp = new McpClient({ url: `${baseUrl}/mcp/v2`, token })
			rest = new RestClient({ baseUrl, token })
			const r = await probeAll()
			ctx.ui.notify(`Token saved to settings.json. ${r.message}`, r.ok ? "info" : "warning")
		},
	})

	console.log(
		`[wayofteams-tools] loaded: mode=${mode} | surface=${surface()?.label ?? "none"} | ` +
			`registeredRealTools=${realTools} | totalRegistered=${registry.registeredNames.length} | probe=${probe.message}`,
	)

	// ── ACTIVATION — deferred to session_start (action methods need bound runtime) ──
	pi.on("session_start", async () => {
		try {
			// Expose the FULL registered surface (all ~240 tools) by default, so the model
			// can call any WayOfTeams tool directly. Because the tools live in domain servers
			// (not the gateway), the 3 discovery tools alone would leave ~239 callable tools
			// unexposed. Keep discovery+status always on; the rest activate here too.
			//
			// NOTE: if the model's context budget is a concern, set wayofteams.dynamic=true
			// in settings.json to instead start with only discovery+status and activate the
			// rest on demand via setActiveTools (additive-only).
			const all = registry.registeredNames
			registry.activate(all)
		} catch (e: any) {
			console.log(`[wayofteams-tools] activation failed: ${e?.message ?? e}`)
		}

		// Multi-agent identity (WOTEAMS-322): register with update_my_work.
		if (mode === "mcp") {
			const identity = agentIdentity(fs)
			await registerAgent((tool, args) => mcp.callTool(tool, args), identity)
		}
	})
}