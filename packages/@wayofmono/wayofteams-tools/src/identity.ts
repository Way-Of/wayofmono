/**
 * [WOTEAMS-547] Multi-agent identity (WOTEAMS-322): stable per-instance agent id/name
 * and startup registration via update_my_work. Pure-ish (fs injected for tests).
 */
import { homedir } from "node:os"
import { join } from "node:path"
import type { FsLike } from "./config.js"

let counterState: number | null = null

function counterPath(dir = join(homedir(), ".pi", "agent")): string {
	return join(dir, ".agent-counter")
}

export function loadCounter(fs: FsLike, dir = join(homedir(), ".pi", "agent")): number {
	if (counterState !== null) return counterState
	try {
		if (fs.existsSync(counterPath(dir))) {
			counterState = parseInt(fs.readFileSync(counterPath(dir), "utf-8").trim(), 10) || 0
		} else {
			counterState = 0
		}
	} catch {
		counterState = 0
	}
	return counterState
}

export function nextCounter(fs: FsLike, dir = join(homedir(), ".pi", "agent")): number {
	const n = loadCounter(fs, dir) + 1
	counterState = n
	try {
		fs.writeFileSync(counterPath(dir), String(n), "utf-8")
	} catch {
		/* best effort */
	}
	return n
}

export function agentIdentity(fs: FsLike, pid = process.pid): { id: string; name: string } {
	const n = nextCounter(fs)
	const id = process.env.WOTEAMS_AGENT_ID || `pi-${pid}-${n}`
	const name = process.env.WOTEAMS_AGENT_NAME || `pi-${n}`
	return { id, name }
}

export interface RegisterResult {
	ok: boolean
	error?: string
}

/**
 * Register this agent on startup (best effort): calls the MCP update_my_work tool via
 * the caller-provided call function so this module stays transport-agnostic.
 */
export async function registerAgent(
	callFn: (tool: string, args: Record<string, unknown>) => Promise<unknown>,
	identity: { id: string; name: string },
): Promise<RegisterResult> {
	try {
		await callFn("update_my_work", {
			agent_id: identity.id,
			status: "idle",
			note: `${identity.name} started (pid ${process.pid})`,
		})
		return { ok: true }
	} catch (e: any) {
		return { ok: false, error: e?.message ?? String(e) }
	}
}