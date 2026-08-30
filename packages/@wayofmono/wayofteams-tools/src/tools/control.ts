/**
 * [WOTEAMS-547] Control-plane tools — always registered. Keep the extension usable
 * even when MCP is slow: status, health, refresh, and multi-agent (WOTEAMS-322) tools.
 */
import { Type } from "typebox"
import type { ToolDefinition } from "../registry.js"
import { McpClient } from "../client/mcp.js"
import type { RestClient } from "../client/rest.js"
import type { ActiveSurfaceState } from "../server.js"

export interface ControlDeps {
	mcp: McpClient
	rest: RestClient
	getState: () => { surface: ActiveSurfaceState | null; token?: string; mode: string }
	refresh: () => Promise<{ ok: boolean; message: string; tools: number }>
}

function textResult(text: string) {
	return { content: [{ type: "text" as const, text }], details: { text } }
}

function mcpPassthrough(mcp: McpClient, tool: string, wrap: (t: string) => string = t => t) {
	return async (_id: string, params: Record<string, unknown>) => {
		const result = await mcp.callTool(tool, params)
		return textResult(wrap(McpClient.contentText(result)))
	}
}

export function buildControlTools(deps: ControlDeps): ToolDefinition[] {
	const { mcp, rest, getState, refresh } = deps

	return [
		{
			name: "session_status",
			label: "Session Status",
			description:
				"[WayOfTeams] Get current extension session status: active MCP surface, tool count, token state, connection health.",
			promptSnippet: "Check WayOfTeams MCP connection + tool availability.",
			loader: true,
			parameters: Type.Object({}),
			async execute() {
				const s = getState()
				return textResult(
					JSON.stringify(
						{
							mode: s.mode,
							surface: s.surface?.label ?? "none",
							url: s.surface?.url ?? "",
							tools: s.surface?.tools ?? 0,
							tokenSet: !!s.token,
						},
						null,
						2,
					),
				)
			},
		},
		{
			name: "refresh_tools",
			label: "Refresh MCP Tools",
			description:
				"[WayOfTeams] Force re-fetch the MCP tool list / re-probe surfaces. Use when tools may have changed server-side.",
			promptSnippet: "Refresh the WayOfTeams tool list.",
			loader: true,
			parameters: Type.Object({}),
			async execute() {
				const r = await refresh()
				return textResult(r.ok ? `Refreshed: ${r.tools} tools. ${r.message}` : `Refresh failed: ${r.message}`)
			},
		},
		{
			name: "context_health",
			label: "Context Health",
			description: "[WayOfTeams] Diagnose stale or corrupted session context (context_status tool pass-through).",
			promptSnippet: "Diagnose context health/staleness.",
			loader: true,
			parameters: Type.Object({
				session_id: Type.Optional(Type.String({ description: "Session ID (optional)" })),
			}),
			execute: mcpPassthrough(mcp, "context_status"),
		},
		{
			name: "inject_prompt",
			label: "Inject Prompt",
			description: "[WayOfTeams] Inject a prompt override into the current session (REST control endpoint).",
			promptSnippet: "Inject a prompt when context is stale or the agent is stuck.",
			loader: true,
			parameters: Type.Object({
				prompt: Type.String({ description: "The prompt text to inject" }),
				mode: Type.Optional(Type.Unsafe({ type: "string", enum: ["append", "replace", "system"] })),
			}),
			async execute(_id, params) {
				const result = await rest.post("/api/v1/control/inject", {
					prompt: params.prompt,
					mode: params.mode || "append",
				})
				return textResult("Prompt injected")
			},
		},

		// ── Multi-agent orchestration (WOTEAMS-322) ──────────────────────────
		{
			name: "agent_register",
			label: "Agent Register",
			description: "[WayOfTeams] Register this agent: status, files in progress, tickets.",
			promptSnippet: "Declare this agent's identity and current work.",
			loader: true,
			parameters: Type.Object({
				agent_id: Type.Optional(Type.String()),
				status: Type.Optional(Type.Unsafe({ type: "string", enum: ["idle", "working", "blocked", "done"] })),
				note: Type.Optional(Type.String()),
				files: Type.Optional(Type.Array(Type.String())),
				tickets: Type.Optional(Type.Array(Type.String())),
			}),
			execute: mcpPassthrough(mcp, "update_my_work"),
		},
		{
			name: "agent_list",
			label: "Agent List",
			description: "[WayOfTeams] List all registered agents and their current work.",
			promptSnippet: "See what other agents are working on.",
			loader: true,
			parameters: Type.Object({}),
			execute: mcpPassthrough(mcp, "list_all_agents"),
		},
		{
			name: "agent_claim_files",
			label: "Agent Claim Files",
			description: "[WayOfTeams] Atomically claim files; detects conflicts with other agents.",
			promptSnippet: "Claim shared files before editing.",
			loader: true,
			parameters: Type.Object({
				files: Type.Array(Type.String()),
				agent_id: Type.Optional(Type.String()),
				tickets: Type.Optional(Type.Array(Type.String())),
				note: Type.Optional(Type.String()),
			}),
			execute: mcpPassthrough(mcp, "claim_files"),
		},
		{
			name: "agent_check_conflicts",
			label: "Agent Check Conflicts",
			description: "[WayOfTeams] Check if any other agent is editing the given files.",
			promptSnippet: "Check shared-file conflicts before starting work.",
			loader: true,
			parameters: Type.Object({
				files: Type.Array(Type.String()),
			}),
			execute: mcpPassthrough(mcp, "conflicts"),
		},
		{
			name: "agent_send_message",
			label: "Agent Send Message",
			description: "[WayOfTeams] Send an async message to another agent.",
			promptSnippet: "Communicate with other agents.",
			loader: true,
			parameters: Type.Object({
				target_agent_id: Type.String(),
				message: Type.String(),
				priority: Type.Optional(Type.Unsafe({ type: "string", enum: ["high", "normal", "low"] })),
			}),
			execute: mcpPassthrough(mcp, "send_message_to_agent"),
		},
		{
			name: "agent_coordinator_status",
			label: "Agent Coordinator Status",
			description: "[WayOfTeams] Current coordinator + orchestration state.",
			promptSnippet: "Check multi-agent coordination.",
			loader: true,
			parameters: Type.Object({}),
			execute: mcpPassthrough(mcp, "coordinator_status"),
		},
	]
}