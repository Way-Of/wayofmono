/**
 * [WOTEAMS-547] Endpoint surface catalog + auto-probe order + active surface state.
 *
 * The extension's multi-endpoint strategy lives here. Three MCP surfaces + REST:
 *   - v2 gateway   POST /mcp/v2         (initialize -> 3 router tools; executes ALL tools on demand)
 *   - v2 domains   POST /mcp/v2/<domain> (initialize -> 20-45 domain tools)
 *   - legacy       POST /mcp            (initialize -> all 269 tools)
 *   - rest         POST /api/v1/tools    (REST adapter, WOTEAMS-245)
 *
 * Pure module — probing uses an injected client factory for testability.
 */
import { DEFAULT_LEGACY_PATH, DEFAULT_MCP_URL, DEFAULT_REST_PATH, DEFAULT_V2_PATH, PRIMARY_DOMAINS, V2_DOMAINS } from "./config.js"

export type SurfaceKind = "v2" | "legacy" | "rest"

export interface Surface {
	kind: SurfaceKind
	/** display name for /wayofteams endpoint */
	label: string
	/** full URL when base is https://teamsapp.zerwiz.org */
	defaultPath: string
	/** numeric priority: lower = tried first */
	priority: number
}

export const SURFACES: Surface[] = [
	{ kind: "v2", label: "v2 gateway", defaultPath: DEFAULT_V2_PATH, priority: 1 },
	{ kind: "legacy", label: "legacy /mcp", defaultPath: DEFAULT_LEGACY_PATH, priority: 2 },
	{ kind: "rest", label: "REST adapter", defaultPath: DEFAULT_REST_PATH, priority: 3 },
]

export interface ProbeResult {
	surface: Surface
	ok: boolean
	tools?: number
	error?: string
}

export type SurfaceProber = (surface: Surface, baseUrl: string, token: string) => Promise<ProbeResult>

/**
 * Deterministic probe order for "auto" mode: v2 gateway first (small context, executes
 * everything), then legacy (full surface), then REST. First healthy surface wins primary;
 * all surfaces remain listable/switchable after.
 */
export function autoProbeOrder(): Surface[] {
	return [...SURFACES].sort((a, b) => a.priority - b.priority)
}

export interface ActiveSurfaceState {
	kind: SurfaceKind
	label: string
	url: string
	tools: number
	probedAt: number
}

/** Probe surfaces in order until one is healthy; return the winner + full results. */
export async function probeSurfaces(
	baseUrl: string,
	token: string,
	prober: SurfaceProber,
	order: SurfaceKind[] = ["v2", "legacy", "rest"],
): Promise<{ winner: ActiveSurfaceState | null; results: ProbeResult[] }> {
	const want = autoProbeOrder().filter(s => order.includes(s.kind))
	const results: ProbeResult[] = []
	let winner: ActiveSurfaceState | null = null

	for (const surface of want) {
		const res = await prober(surface, baseUrl, token)
		results.push(res)
		if (res.ok && !winner) {
			winner = {
				kind: surface.kind,
				label: surface.label,
				url: `${baseUrl}${surface.defaultPath}`,
				tools: res.tools ?? 0,
				probedAt: Date.now(),
			}
			// keep probing cheap surfaces for the report but stop at first health only
		}
	}
	return { winner, results }
}

export function surfaceForKind(kind: SurfaceKind): Surface | undefined {
	return SURFACES.find(s => s.kind === kind)
}

export function domainUrls(baseUrl: string, domains: readonly string[] = V2_DOMAINS): Array<{ domain: string; url: string; primary: boolean }> {
	return domains.map(domain => ({
		domain,
		url: `${baseUrl}${DEFAULT_V2_PATH}/${domain}`,
		primary: (PRIMARY_DOMAINS as readonly string[]).includes(domain),
	}))
}

/**
 * The full list of v2 domain server paths, in the order clients should attach them:
 * primary core domains first, then admin, then optional (google-*, obsidian).
 * Mirrors the OpenCode client config in MCP-v2-DOMAIN-SPLIT-PLAN.md §6.
 */
export function domainServerPaths(): Array<{ domain: string; primary: boolean; optional: boolean }> {
	return [
		...PRIMARY_DOMAINS.map(d => ({ domain: d, primary: true, optional: false })),
		{ domain: "admin", primary: false, optional: false },
		...(V2_DOMAINS.filter(d => !PRIMARY_DOMAINS.includes(d as any) && d !== "admin")).map(d => ({
			domain: d,
			primary: false,
			optional: true,
		})),
	]
}

export { V2_DOMAINS, PRIMARY_DOMAINS }