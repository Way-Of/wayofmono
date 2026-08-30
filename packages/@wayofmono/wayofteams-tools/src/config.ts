/**
 * [WOTEAMS-547] Config + settings.json I/O — pure module (fs injected for tests).
 *
 * Client-first token storage per user design: pi settings.json carries a custom
 * "wayofteams" key, so clients paste a dashboard-generated token without env vars.
 */
import { homedir } from "node:os"
import { join, resolve } from "node:path"

export interface WayOfTeamsConfig {
	/** JWT token (first class) or path to a token file */
	token?: string
	tokenFile?: string
	/** "auto" | "v2" | "legacy" | "rest" — endpoint strategy */
	endpoint: string
	/** Optional: restrict to specific v2 domains */
	domains?: string[]
	/** Tool names to SKIP registering (avoids name collisions with other pi extensions,
	 *  e.g. web_search with pi-web-access, memory_search with @samfp/pi-memory). */
	skipTools?: string[]
	agentId?: string
	agentName?: string
}

/** Default tools skipped to avoid collisions with common pi packages. */
export const DEFAULT_SKIP_TOOLS = ["web_search", "memory_search"]

export interface FsLike {
	readFileSync(path: string, enc: "utf-8"): string
	writeFileSync(path: string, data: string, enc?: "utf-8"): void
	existsSync(path: string): boolean
}

export const DEFAULT_MCP_URL = "https://teamsapp.zerwiz.org"
export const DEFAULT_V2_PATH = "/mcp/v2"
export const DEFAULT_LEGACY_PATH = "/mcp"
export const DEFAULT_REST_PATH = "/api/v1/tools"

/** v2 domain-split catalog (WOTEAMS-544). Data, not code — no per-domain files. */
export const V2_DOMAINS = [
	"core",
	"collab",
	"agents",
	"knowledge",
	"memory",
	"admin",
	"google-gmail",
	"google-drive",
	"google-docs",
	"google-sheets",
	"google-calendar",
	"obsidian",
] as const

/** Primary domains default-on; optional ones (google-*, obsidian) opt-in. */
export const PRIMARY_DOMAINS = ["core", "collab", "agents", "knowledge", "memory"] as const

export function agentDir(): string {
	return join(homedir(), ".pi", "agent")
}

export function settingsPath(dir = agentDir()): string {
	return join(dir, "settings.json")
}

export function tokenFilePath(dir = agentDir()): string {
	return join(dir, ".wayofteams-mcp-token")
}

export function readJsonFile<T = Record<string, unknown>>(path: string, fs: FsLike): T | null {
	try {
		if (!fs.existsSync(path)) return null
		return JSON.parse(fs.readFileSync(path, "utf-8")) as T
	} catch {
		return null
	}
}

/** Read + merge global and project settings.json, return the parsed object (or {}). */
export function loadSettings(
	fs: FsLike,
	projectSettingsPath?: string,
	globalSettingsPathOverride?: string,
): Record<string, unknown> {
	const globalPath = globalSettingsPathOverride ?? settingsPath()
	const global = readJsonFile(globalPath, fs) ?? {}
	const project = projectSettingsPath ? readJsonFile(projectSettingsPath, fs) ?? {} : {}
	return { ...global, ...project }
}

/** Extract the wayofteams config block from parsed settings. */
export function configFromSettings(settings: Record<string, unknown>): Partial<WayOfTeamsConfig> {
	const wot = (settings.wayofteams ?? {}) as Record<string, unknown>
	return {
		token: typeof wot.token === "string" ? wot.token : undefined,
		tokenFile: typeof wot.tokenFile === "string" ? wot.tokenFile : undefined,
		endpoint: (typeof wot.endpoint === "string" && wot.endpoint) || "auto",
		domains: Array.isArray(wot.domains) ? (wot.domains as string[]) : undefined,
		skipTools: Array.isArray(wot.skipTools) ? (wot.skipTools as string[]) : undefined,
	}
}

/** Persist the wayofteams block back into settings.json (used by /wayofteams login). */
export function writeSettingsBlock(
	fs: FsLike,
	settingsPathToWrite: string,
	block: Partial<WayOfTeamsConfig>,
): { ok: boolean; error?: string } {
	try {
		const existing = readJsonFile<{ wayofteams?: Record<string, unknown> }>(
			settingsPathToWrite,
			fs,
		) ?? {}
		existing.wayofteams = { ...existing.wayofteams, ...block }
		fs.writeFileSync(settingsPathToWrite, JSON.stringify(existing, null, 2))
		return { ok: true }
	} catch (e: any) {
		return { ok: false, error: e?.message ?? String(e) }
	}
}

/** Resolve a token file path (supports ~ expansion) to an absolute path. */
export function resolveMaybeTilde(path: string): string {
	return path.startsWith("~/") ? resolve(homedir(), path.slice(2)) : resolve(path)
}