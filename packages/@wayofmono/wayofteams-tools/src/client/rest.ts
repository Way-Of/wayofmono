/**
 * [WOTEAMS-547] Pure REST client — no pi imports, unit-testable.
 *
 * Second client path (the extension's distinguishing feature vs generic MCP bridges):
 *   1. REST adapter  POST /api/v1/tools  — call any MCP tool via REST (WOTEAMS-245)
 *   2. Direct REST endpoints (fallbacks): /api/tickets, /api/standups, /api/notifications
 */

export class RestAuthError extends Error {
	constructor(message = "REST auth failed: invalid or expired token") {
		super(message)
		this.name = "RestAuthError"
	}
}

export interface RestClientOptions {
	baseUrl: string
	token?: string
	fetchImpl?: typeof fetch
	timeoutMs?: number
}

export class RestClient {
	private baseUrl: string
	private token: string | undefined
	private fetchImpl: typeof fetch
	private timeoutMs: number

	constructor(opts: RestClientOptions) {
		this.baseUrl = opts.baseUrl.replace(/\/$/, "")
		this.token = opts.token
		this.fetchImpl = opts.fetchImpl ?? fetch
		this.timeoutMs = opts.timeoutMs ?? 60_000
	}

	withToken(token: string): RestClient {
		return new RestClient({
			baseUrl: this.baseUrl,
			token,
			fetchImpl: this.fetchImpl,
			timeoutMs: this.timeoutMs,
		})
	}

	private headers(extra: Record<string, string> = {}): Record<string, string> {
		const h: Record<string, string> = { "Content-Type": "application/json", ...extra }
		if (this.token) h.Authorization = `Bearer ${this.token}`
		return h
	}

	private async send(
		method: "GET" | "POST" | "PATCH",
		path: string,
		body?: Record<string, unknown>,
	): Promise<any> {
		const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
			method,
			headers: this.headers(),
			body: body ? JSON.stringify(body) : undefined,
			signal: AbortSignal.timeout(this.timeoutMs),
		})
		if (res.status === 401 || res.status === 403) {
			throw new RestAuthError(`REST auth failed (${res.status})`)
		}
		const text = await res.text()
		if (!res.ok) throw new Error(`API error: ${res.status} ${text.slice(0, 300)}`)
		if (text.trim() === "") return null
		return JSON.parse(text)
	}

	async get(path: string): Promise<any> {
		return this.send("GET", path)
	}

	async post(path: string, body: Record<string, unknown>): Promise<any> {
		return this.send("POST", path, body)
	}

	async patch(path: string, body: Record<string, unknown>): Promise<any> {
		return this.send("PATCH", path, body)
	}

	/** POST /api/v1/tools — REST adapter call (WOTEAMS-245). */
	async callTool(name: string, arguments_: Record<string, unknown> = {}): Promise<any> {
		return this.post("/api/v1/tools", { name, arguments: arguments_ })
	}
}