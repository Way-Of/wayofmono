/**
 * [WOTEAMS-547] REST fallback tools — the "chat keeps working when MCP is down" path.
 * Ported from the original single-file extension; pure REST via RestClient.
 */
import { Type } from "typebox"
import type { ToolDefinition } from "../registry.js"
import type { RestClient } from "../client/rest.js"

function ok(details: unknown) {
	return { content: [{ type: "text" as const, text: JSON.stringify(details) }], details }
}

export function buildFallbackTools(rest: RestClient): ToolDefinition[] {
	return [
		{
			name: "list_tickets",
			label: "List Tickets",
			description: "[REST fallback] List tickets with optional filters.",
			promptSnippet: "List WayOfTeams tickets (REST fallback).",
			parameters: Type.Object({
				status: Type.Optional(Type.String()),
				priority: Type.Optional(Type.String()),
				search: Type.Optional(Type.String()),
			}),
			async execute(_id, params) {
				const qs = new URLSearchParams()
				if (params.status) qs.set("status", params.status as string)
				if (params.priority) qs.set("priority", params.priority as string)
				if (params.search) qs.set("search", params.search as string)
				const q = qs.toString() ? `?${qs}` : ""
				const data = await rest.get(`/api/tickets${q}`)
				const items = (data.tickets || []).map((t: any) => ({
					id: t.id, title: t.title, status: t.status, priority: t.priority,
					project_prefix: t.project_prefix, ticket_number: t.ticket_number,
				}))
				return ok({ count: items.length, tickets: items })
			},
		},
		{
			name: "get_ticket",
			label: "Get Ticket",
			description: "[REST fallback] Get full details of a specific ticket by UUID.",
			promptSnippet: "View a ticket's complete details (REST fallback).",
			parameters: Type.Object({
				ticket_id: Type.String(),
			}),
			async execute(_id, params) {
				const data = await rest.get(`/api/tickets/${params.ticket_id}`)
				return ok(data.ticket)
			},
		},
		{
			name: "create_ticket",
			label: "Create Ticket",
			description: "[REST fallback] Create a new ticket.",
			promptSnippet: "Create a WayOfTeams ticket (REST fallback).",
			parameters: Type.Object({
				title: Type.String(),
				description: Type.Optional(Type.String()),
				ticket_type: Type.Optional(Type.String()),
				priority: Type.Optional(Type.Integer()),
			}),
			async execute(_id, params) {
				const data = await rest.post("/api/tickets", {
					title: params.title,
					description: params.description ?? "",
					ticket_type: params.ticket_type ?? "task",
					priority: params.priority ?? 3,
				})
				return ok({ message: `Created ticket: ${data.ticket.title}`, ticket: data.ticket })
			},
		},
		{
			name: "update_ticket_status",
			label: "Update Ticket Status",
			description: "[REST fallback] Update a ticket's status.",
			promptSnippet: "Change a ticket's status (REST fallback).",
			parameters: Type.Object({
				ticket_id: Type.String(),
				status: Type.String(),
			}),
			async execute(_id, params) {
				const data = await rest.patch(`/api/tickets/${params.ticket_id}`, { status: params.status })
				return ok({ message: `Updated ticket status to "${params.status}"`, ticket: data.ticket })
			},
		},
		{
			name: "list_standups",
			label: "List Standups",
			description: "[REST fallback] List standup entries.",
			promptSnippet: "View team standup entries (REST fallback).",
			parameters: Type.Object({
				date: Type.Optional(Type.String()),
			}),
			async execute(_id, params) {
				const qs = params.date ? `?date=${params.date}` : ""
				const data = await rest.get(`/api/standups${qs}`)
				return ok({ count: (data.standups || []).length, standups: data.standups })
			},
		},
		{
			name: "create_standup",
			label: "Create Standup",
			description: "[REST fallback] Create a standup entry for today.",
			promptSnippet: "Log daily standup entries (REST fallback).",
			parameters: Type.Object({
				yesterday: Type.Optional(Type.String()),
				today: Type.Optional(Type.String()),
				blockers: Type.Optional(Type.String()),
			}),
			async execute(_id, params) {
				const today = new Date().toISOString().split("T")[0]
				const data = await rest.post("/api/standups", {
					date: today,
					yesterday: params.yesterday ?? "",
					today: params.today ?? "",
					blockers: params.blockers ?? "",
				})
				return ok({ message: "Standup created", standup: data.standup })
			},
		},
		{
			name: "list_notifications",
			label: "List Notifications",
			description: "[REST fallback] List notifications for the current user.",
			promptSnippet: "Check notifications (REST fallback).",
			parameters: Type.Object({
				unread_only: Type.Optional(Type.Boolean()),
			}),
			async execute(_id, params) {
				const unread = params.unread_only !== false
				const qs = unread ? "?unread=true" : ""
				const data = await rest.get(`/api/notifications${qs}`)
				return ok({ count: (data.notifications || []).length, notifications: data.notifications })
			},
		},
	]
}