/**
 * [WOTEAMS-547] The three v2 discovery/meta tools, registered as loaders.
 *
 * These stay active; on execution they may additively activate matching real tools
 * via the injected onActivate callback (pi dynamic tool loading).
 */
import { Type } from "typebox"
import type { ToolDefinition } from "../registry.js"
import { McpClient } from "../client/mcp.js"

export interface RouterToolDeps {
	mcp: McpClient
	onActivate?: (toolNames: string[]) => void
}

function textResult(text: string) {
	return { content: [{ type: "text" as const, text }], details: { text } }
}

/** search_tools — keyword search over the server tool catalog; activates matches. */
export function searchToolsTool({ mcp, onActivate }: RouterToolDeps): ToolDefinition {
	return {
		name: "search_tools",
		label: "Search Tools",
		description:
			"[WayOfTeams] Search the available WayOfTeams MCP tools by keyword. Returns tool names + schemas so you can call them directly. Use this FIRST when you need a tool.",
		promptSnippet: "Search the WayOfTeams tool catalog by keyword.",
		loader: true,
		parameters: Type.Object({
			query: Type.String({ description: "Keyword(s) to search tool names and descriptions" }),
			limit: Type.Optional(Type.Integer({ description: "Max results (default 8)" })),
		}),
		async execute(_toolCallId, params) {
			const result = await mcp.callTool("search_tools", {
				query: params.query,
				...(params.limit != null ? { limit: params.limit } : {}),
			})
			const text = McpClient.contentText(result)
			// Best effort: activate tools whose names appear in the result.
			const matches = (text.match(/[a-z0-9_-]+/g) ?? []).filter(n => /^(tickets|plans|docs|standups|kanban|knowledge|rules|memory|anchors|ideas|templates|skills|thoughts|versions|team|agent|coordinator|google_|obsidian_)/.test(n))
			if (matches.length > 0) onActivate?.(matches)
			return textResult(text)
		},
	}
}

/** list_domains — the 7 tool domains. */
export function listDomainsTool({ mcp }: RouterToolDeps): ToolDefinition {
	return {
		name: "list_domains",
		label: "List Domains",
		description:
			"[WayOfTeams] List the WayOfTeams MCP tool domains (core, google, collab, agents, knowledge, memory, admin) with tool counts and sample tools.",
		promptSnippet: "Orient yourself in the WayOfTeams tool domains.",
		loader: true,
		parameters: Type.Object({}),
		async execute() {
			const result = await mcp.callTool("list_domains", {})
			return textResult(McpClient.contentText(result))
		},
	}
}

/** get_tool_schema — fetch the JSON schema for a single tool. */
export function getToolSchemaTool({ mcp }: RouterToolDeps): ToolDefinition {
	return {
		name: "get_tool_schema",
		label: "Get Tool Schema",
		description:
			"[WayOfTeams] Return the full JSON schema for a single named tool, including its input parameters.",
		promptSnippet: "Get the input schema for one WayOfTeams tool.",
		loader: true,
		parameters: Type.Object({
			name: Type.String({ description: "Exact tool name (e.g. tickets_create)" }),
		}),
		async execute(_toolCallId, params) {
			const result = await mcp.callTool("get_tool_schema", { name: params.name })
			return textResult(McpClient.contentText(result))
		},
	}
}

export function buildRouterTools(deps: RouterToolDeps): ToolDefinition[] {
	return [searchToolsTool(deps), listDomainsTool(deps), getToolSchemaTool(deps)]
}