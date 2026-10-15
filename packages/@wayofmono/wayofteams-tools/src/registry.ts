/**
 * [WOTEAMS-547] Tool registration bridge — the only pi-bound registry module.
 *
 * Implements pi's dynamic tool loading (pi.dev/docs/latest/extensions#custom-tools):
 *  1. Register every tool with pi.registerTool() so it appears in pi.getAllTools().
 *  2. Keep loader tools active; other tools start inactive.
 *  3. Loader execution calls pi.setActiveTools([...current, ...matching]) — additive only.
 *  4. Pi exposes matched tools before the next model request.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { convertSchema } from "./schema.js"
import type { Schema } from "./schema.js"

/** A text content block for tool results. */
export type ToolTextBlock = { type: "text"; text: string; isError?: boolean }

export interface ToolResult {
	content: ToolTextBlock[]
	details?: unknown
}

export type ToolExecuteFn = (
	toolCallId: string,
	params: Record<string, unknown>,
	signal?: AbortSignal,
	onUpdate?: (update: ToolResult) => void,
	ctx?: unknown,
) => Promise<ToolResult>

export interface ToolDefinition {
	name: string
	label: string
	description: string
	promptSnippet?: string
	parameters: Schema
	/** loader tools stay active by default; everything else can be deferred */
	loader?: boolean
	execute: ToolExecuteFn
}

function errorResult(e: unknown): ToolResult {
	return {
		content: [{ type: "text", text: `ERROR: ${(e as Error)?.message ?? String(e)}`, isError: true }],
		details: { error: (e as Error)?.message ?? String(e) },
	}
}

export class ToolRegistry {
	private pi: ExtensionAPI
	private registered: string[] = []

	constructor(pi: ExtensionAPI) {
		this.pi = pi
	}

	get registeredNames(): string[] {
		return [...this.registered]
	}

	register(def: ToolDefinition): void {
		this.pi.registerTool({
			name: def.name,
			label: def.label,
			description: def.description,
			...(def.promptSnippet ? { promptSnippet: def.promptSnippet } : {}),
			parameters: def.parameters,
			// Cast to pi's AgentToolDefinition at the boundary; our Runtime contract is
			// deliberately loose so the transport modules stay simple and testable.
			execute: (async (toolCallId: string, params: unknown, signal: AbortSignal | undefined, onUpdate: unknown, ctx: unknown) => {
				try {
					return await def.execute(
						toolCallId,
						(params ?? {}) as Record<string, unknown>,
						signal,
						onUpdate as (update: ToolResult) => void,
						ctx,
					)
				} catch (e) {
					return errorResult(e)
				}
			}) as never,
		})
		if (!this.registered.includes(def.name)) this.registered.push(def.name)
	}

	registerMany(defs: ToolDefinition[]): number {
		for (const d of defs) this.register(d)
		return defs.length
	}

	/**
	 * Additively activate the given tools (never removes active ones).
	 * SAFE ONLY after the runtime is bound (e.g. inside session_start / a command/tool
	 * handler). Calling this from the factory throws — action methods like getActiveTools
	 * / setActiveTools are not available during extension loading.
	 */
	activate(names: string[]): void {
		if (names.length === 0) return
		const known = names.filter(n => this.registered.includes(n))
		if (known.length === 0) return
		const current = this.pi.getActiveTools()
		this.pi.setActiveTools([...new Set([...current, ...known])])
	}

	has(name: string): boolean {
		return this.registered.includes(name)
	}
}

/** Helper: JsonSchema → TypeBox params for MCP-sourced tools. */
export function paramsFromMcpSchema(schema: Record<string, unknown> | undefined): Schema {
	return convertSchema(schema)
}