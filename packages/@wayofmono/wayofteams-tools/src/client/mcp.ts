/**
 * [WOTEAMS-547] Pure JSON-RPC MCP client — no pi imports, unit-testable.
 *
 * Speaks the MCP Streamable-HTTP wire format against any WayOfTeams surface:
 *   - v2 gateway   POST /mcp/v2        (initialize returns the 3 router tools)
 *   - v2 domains   POST /mcp/v2/<domain> (initialize returns 20-45 domain tools)
 *   - legacy       POST /mcp           (initialize returns all 269 tools)
 *
 * WOTEAMS-204 gotchas honored: echo the request id, notifications/* return 200-empty,
 * 401/403 surfaced as typed auth errors so clients can guide the user to re-login.
 */

export interface McpTool {
	name: string
	description?: string
	inputSchema?: Record<string, unknown>
}

export interface JsonRpcRequest {
	jsonrpc: "2.0"
	id: number
	method: string
	params?: Record<string, unknown>
}

export interface JsonRpcError {
	code: number
	message: string
	data?: unknown
}

export class McpAuthError extends Error {
	constructor(message = "MCP auth failed: invalid or expired token") {
		super(message)
		this.name = "McpAuthError"
	}
}

export interface McpClientOptions {
	url: string
	token?: string
	/** Injectable fetch for tests */
	fetchImpl?: typeof fetch
	timeoutMs?: number
}

export interface McpInitResult {
	serverInfo?: { name: string; version: string }
	protocolVersion?: string
	tools: McpTool[]
}

export class McpClient {
	private url: string
	private token: string | undefined
	private fetchImpl: typeof fetch
	private timeoutMs: number
	private nextId = 1

	constructor(opts: McpClientOptions) {
		this.url = opts.url.replace(/\/$/, "")
		this.token = opts.token
		this.fetchImpl = opts.fetchImpl ?? fetch
		this.timeoutMs = opts.timeoutMs ?? 60_000
	}

	/** Per-request token override (used by /wayofteams login to verify a candidate). */
	withToken(token: string): McpClient {
		return new McpClient({
			url: this.url,
			token,
			fetchImpl: this.fetchImpl,
			timeoutMs: this.timeoutMs,
		})
	}

	async request(method: string, params?: Record<string, unknown>): Promise<unknown> {
		const id = this.nextId++
		const body: JsonRpcRequest = { jsonrpc: "2.0", id, method }
		if (params !== undefined) body.params = params

		const headers: Record<string, string> = { "Content-Type": "application/json" }
		if (this.token) headers.Authorization = `Bearer ${this.token}`

		const res = await this.fetchImpl(this.url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(this.timeoutMs),
		})

		if (res.status === 401 || res.status === 403) {
			throw new McpAuthError(`MCP auth failed (${res.status})`)
		}
		if (!res.ok) throw new Error(`MCP HTTP ${res.status}`)

		// notifications/* and no-content responses return 200 with empty body
		const text = await res.text()
		if (text.trim() === "") return { _notification: true }

		const data = JSON.parse(text) as { result?: unknown; error?: JsonRpcError }
		if (data.error) {
			throw new Error(`MCP error ${data.error.code}: ${data.error.message}`)
		}
		return data.result
	}

	/** Mirror of MCP initialize — includes capabilities for the surface. */
	async initialize(clientName = "pi-wayofteams", version = "1.0.0"): Promise<McpInitResult> {
		const result = (await this.request("initialize", {
			protocolVersion: "2024-11-05",
			capabilities: {},
			clientInfo: { name: clientName, version },
		})) as Record<string, unknown>
		return {
			serverInfo: (result.serverInfo ?? {}) as McpInitResult["serverInfo"],
			protocolVersion: result.protocolVersion as string | undefined,
			tools: ((result.tools ?? []) as unknown[]).map(t => t as McpTool),
		}
	}

	async listTools(): Promise<McpTool[]> {
		const result = (await this.request("tools/list")) as { tools?: unknown[] }
		return (result?.tools ?? []).map(t => t as McpTool)
	}

	async callTool(name: string, arguments_: Record<string, unknown> = {}): Promise<any> {
		return this.request("tools/call", { name, arguments: arguments_ })
	}

	/** Extract MCP content blocks into a single string. */
	static contentText(result: any): string {
		const content = result?.content ?? result?.result?.content
		if (Array.isArray(content)) {
			return content
				.map((b: any) => b?.text ?? JSON.stringify(b))
				.filter(Boolean)
				.join("\n")
		}
		if (content?.text) return content.text
		return JSON.stringify(result ?? {})
	}
}