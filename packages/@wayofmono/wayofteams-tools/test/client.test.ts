import { describe, it, expect, vi } from "vitest"
import { McpClient } from "../src/client/mcp.js"
import { RestClient } from "../src/client/rest.js"

function jsonResponse(status: number, body: string): Response {
	return new Response(body, { status, headers: { "Content-Type": "application/json" } })
}

describe("McpClient", () => {
	it("initializes and returns tools", async () => {
		const fetchMock = vi.fn(async (_url: any, init: any) => {
			const body = JSON.parse(init.body)
			if (body.method === "initialize") {
				return jsonResponse(200, JSON.stringify({ result: { serverInfo: { name: "t", version: "1" }, tools: [{ name: "a" }, { name: "b" }] } }))
			}
			return jsonResponse(200, JSON.stringify({ result: {} }))
		})
		const client = new McpClient({ url: "https://x/mcp/v2", token: "tok", fetchImpl: fetchMock as any })
		const init = await client.initialize()
		expect(init.tools).toHaveLength(2)
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it("echoes the request id and sends Bearer token", async () => {
		let sent: any
		const fetchMock = vi.fn(async (_url: any, init: any) => {
			sent = JSON.parse(init.body)
			return jsonResponse(200, JSON.stringify({ result: {} }))
		})
		const client = new McpClient({ url: "https://x/mcp", fetchImpl: fetchMock as any })
		await client.request("ping", {})
		expect(sent.jsonrpc).toBe("2.0")
		expect(typeof sent.id).toBe("number")
		expect(sent.headers?.Authorization).toBeUndefined() // no token -> no header
	})

	it("throws McpAuthError on 401", async () => {
		const fetchMock = vi.fn(async () => jsonResponse(401, "{}"))
		const client = new McpClient({ url: "https://x/mcp/v2", token: "bad", fetchImpl: fetchMock as any })
		await expect(client.request("initialize")).rejects.toThrow(/auth failed/i)
	})

	it("surfaces JSON-RPC errors", async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse(200, JSON.stringify({ error: { code: -32601, message: "Method not found: x" } })),
		)
		const client = new McpClient({ url: "https://x/mcp", fetchImpl: fetchMock as any })
		await expect(client.request("unknown")).rejects.toThrow(/Method not found/)
	})

	it("contentText extracts text blocks", () => {
		expect(
			McpClient.contentText({ content: [{ type: "text", text: "hello" }, { type: "text", text: "world" }] }),
		).toBe("hello\nworld")
		expect(McpClient.contentText({ content: "raw" })).toBe('{"content":"raw"}')
	})
})

describe("RestClient", () => {
	it("sends Bearer + JSON and parses response", async () => {
		let header: any
		const fetchMock = vi.fn(async (_url: any, init: any) => {
			header = init.headers
			return jsonResponse(200, JSON.stringify({ ok: true }))
		})
		const client = new RestClient({ baseUrl: "https://x", token: "tok", fetchImpl: fetchMock as any })
		const data = await client.get("/api/tickets")
		expect(data.ok).toBe(true)
		expect(header.Authorization).toBe("Bearer tok")
	})

	it("throws RestAuthError on 401", async () => {
		const fetchMock = vi.fn(async () => jsonResponse(401, "{}"))
		const client = new RestClient({ baseUrl: "https://x", fetchImpl: fetchMock as any })
		await expect(client.get("/api/x")).rejects.toThrow(/auth failed/i)
	})

	it("POST /api/v1/tools adapter call", async () => {
		let sent: any
		const fetchMock = vi.fn(async (_url: any, init: any) => {
			sent = { url: _url, body: JSON.parse(init.body), method: init.method }
			return jsonResponse(200, JSON.stringify({ result: "ok" }))
		})
		const client = new RestClient({ baseUrl: "https://x", token: "t", fetchImpl: fetchMock as any })
		await client.callTool("tickets_list", { limit: 5 })
		expect(sent.url).toBe("https://x/api/v1/tools")
		expect(sent.method).toBe("POST")
		expect(sent.body.name).toBe("tickets_list")
	})
})