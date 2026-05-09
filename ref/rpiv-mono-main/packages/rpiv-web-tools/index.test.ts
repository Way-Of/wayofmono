import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createMockCtx, createMockPi, stubFetch } from "@juicesharp/rpiv-test-utils";
import { beforeEach, describe, expect, it, type vi } from "vitest";
import registerWebTools from "./index.js";

const CONFIG_PATH = join(process.env.HOME!, ".config", "rpiv-web-tools", "config.json");

function registerAndCapture() {
	const { pi, captured } = createMockPi();
	registerWebTools(pi);
	return { pi, captured };
}

function writeConfig(contents: unknown) {
	mkdirSync(dirname(CONFIG_PATH), { recursive: true });
	writeFileSync(CONFIG_PATH, JSON.stringify(contents), "utf-8");
}

beforeEach(() => {
	delete process.env.BRAVE_SEARCH_API_KEY;
	rmSync(CONFIG_PATH, { force: true });
});

describe("registerWebTools — registration", () => {
	it("registers web_search + web_fetch tools", () => {
		const { captured } = registerAndCapture();
		expect(captured.tools.has("web_search")).toBe(true);
		expect(captured.tools.has("web_fetch")).toBe(true);
	});

	it("registers /web-search-config command", () => {
		const { captured } = registerAndCapture();
		expect(captured.commands.has("web-search-config")).toBe(true);
	});

	it("web_search schema declares min:1, max:10, default:5", () => {
		const { captured } = registerAndCapture();
		const params = captured.tools.get("web_search")?.parameters as unknown as {
			properties: { max_results: { minimum: number; maximum: number; default: number } };
		};
		expect(params.properties.max_results).toMatchObject({ minimum: 1, maximum: 10, default: 5 });
	});
});

describe("web_search.execute — env-key precedence + happy path", () => {
	it("uses env key over config key", async () => {
		process.env.BRAVE_SEARCH_API_KEY = "env-key";
		writeConfig({ apiKey: "config-key" });
		const stub = stubFetch([
			{
				match: (u) => u.includes("api.search.brave.com"),
				response: () =>
					new Response(
						JSON.stringify({
							web: { results: [{ title: "T", url: "https://x", description: "snip" }] },
						}),
						{ status: 200 },
					),
			},
		]);
		const { captured } = registerAndCapture();
		const r = await captured.tools
			.get("web_search")
			?.execute?.("tc", { query: "hello", max_results: 3 }, undefined as never, undefined as never, createMockCtx());
		expect(r?.content[0]).toMatchObject({ type: "text" });
		const headers = stub.calls[0].init?.headers as Record<string, string>;
		expect(headers["X-Subscription-Token"]).toBe("env-key");
	});

	it("falls back to config key when env unset", async () => {
		writeConfig({ apiKey: "config-key" });
		const stub = stubFetch([
			{
				match: (u) => u.includes("api.search.brave.com"),
				response: () => new Response(JSON.stringify({ web: { results: [] } }), { status: 200 }),
			},
		]);
		const { captured } = registerAndCapture();
		await captured.tools
			.get("web_search")
			?.execute?.("tc", { query: "x" }, undefined as never, undefined as never, createMockCtx());
		const headers = stub.calls[0].init?.headers as Record<string, string>;
		expect(headers["X-Subscription-Token"]).toBe("config-key");
	});

	it("throws when neither env nor config set", async () => {
		const { captured } = registerAndCapture();
		await expect(
			captured.tools
				.get("web_search")
				?.execute?.("tc", { query: "x" }, undefined as never, undefined as never, createMockCtx()),
		).rejects.toThrow(/BRAVE_SEARCH_API_KEY is not set/);
	});

	it("clamps max_results to [1,10]", async () => {
		process.env.BRAVE_SEARCH_API_KEY = "k";
		const stub = stubFetch([
			{
				match: (u) => u.includes("api.search.brave.com"),
				response: () => new Response(JSON.stringify({ web: { results: [] } }), { status: 200 }),
			},
		]);
		const { captured } = registerAndCapture();
		await captured.tools
			.get("web_search")
			?.execute?.("tc", { query: "x", max_results: 99 }, undefined as never, undefined as never, createMockCtx());
		const url = stub.calls[0].url;
		expect(new URL(url).searchParams.get("count")).toBe("10");
	});

	it("wraps non-2xx as 'Brave Search API error (status): body'", async () => {
		process.env.BRAVE_SEARCH_API_KEY = "k";
		stubFetch([
			{
				match: (u) => u.includes("api.search.brave.com"),
				response: () => new Response("rate limit", { status: 429 }),
			},
		]);
		const { captured } = registerAndCapture();
		await expect(
			captured.tools
				.get("web_search")
				?.execute?.("tc", { query: "x" }, undefined as never, undefined as never, createMockCtx()),
		).rejects.toThrow(/Brave Search API error \(429\)/);
	});

	it("returns no-results envelope when Brave yields []", async () => {
		process.env.BRAVE_SEARCH_API_KEY = "k";
		stubFetch([
			{
				match: (u) => u.includes("api.search.brave.com"),
				response: () => new Response(JSON.stringify({ web: { results: [] } }), { status: 200 }),
			},
		]);
		const { captured } = registerAndCapture();
		const r = await captured.tools
			.get("web_search")
			?.execute?.("tc", { query: "x" }, undefined as never, undefined as never, createMockCtx());
		expect(r?.content[0]).toMatchObject({ text: expect.stringContaining("No results found") });
	});
});

describe("web_fetch.execute — URL validation", () => {
	it("throws on invalid URL", async () => {
		const { captured } = registerAndCapture();
		await expect(
			captured.tools
				.get("web_fetch")
				?.execute?.("tc", { url: "not a url" }, undefined as never, undefined as never, createMockCtx()),
		).rejects.toThrow(/Invalid URL/);
	});
	it("throws on non-http(s) protocol", async () => {
		const { captured } = registerAndCapture();
		await expect(
			captured.tools
				.get("web_fetch")
				?.execute?.("tc", { url: "ftp://x.com" }, undefined as never, undefined as never, createMockCtx()),
		).rejects.toThrow(/Unsupported URL protocol/);
	});
});

describe("web_fetch.execute — happy path", () => {
	it("strips HTML and extracts title for text/html", async () => {
		stubFetch([
			{
				match: (u) => u.includes("example.com"),
				response: () =>
					new Response("<html><head><title>My Page</title></head><body><p>Hello</p></body></html>", {
						status: 200,
						headers: { "content-type": "text/html" },
					}),
			},
		]);
		const { captured } = registerAndCapture();
		const r = await captured.tools
			.get("web_fetch")
			?.execute?.("tc", { url: "https://example.com" }, undefined as never, undefined as never, createMockCtx());
		expect(r?.content[0]).toMatchObject({ text: expect.stringContaining("My Page") });
		expect(r?.content[0]).toMatchObject({ text: expect.stringContaining("Hello") });
	});

	it("throws on non-2xx with HTTP status in message", async () => {
		stubFetch([
			{
				match: () => true,
				response: () => new Response("nope", { status: 404, statusText: "Not Found" }),
			},
		]);
		const { captured } = registerAndCapture();
		await expect(
			captured.tools
				.get("web_fetch")
				?.execute?.("tc", { url: "https://example.com" }, undefined as never, undefined as never, createMockCtx()),
		).rejects.toThrow(/HTTP 404/);
	});

	it("throws on binary content-type", async () => {
		stubFetch([
			{
				match: () => true,
				response: () => new Response("binary", { status: 200, headers: { "content-type": "image/png" } }),
			},
		]);
		const { captured } = registerAndCapture();
		await expect(
			captured.tools
				.get("web_fetch")
				?.execute?.("tc", { url: "https://x.com" }, undefined as never, undefined as never, createMockCtx()),
		).rejects.toThrow(/Unsupported content type/);
	});

	it("returns raw=true untouched", async () => {
		stubFetch([
			{
				match: () => true,
				response: () => new Response("<p>raw</p>", { status: 200, headers: { "content-type": "text/html" } }),
			},
		]);
		const { captured } = registerAndCapture();
		const r = await captured.tools
			.get("web_fetch")
			?.execute?.(
				"tc",
				{ url: "https://x.com", raw: true },
				undefined as never,
				undefined as never,
				createMockCtx(),
			);
		expect(r?.content[0]).toMatchObject({ text: expect.stringContaining("<p>raw</p>") });
	});

	it("sends UA + Accept headers + redirect:follow", async () => {
		const stub = stubFetch([
			{
				match: () => true,
				response: () => new Response("<p>x</p>", { status: 200, headers: { "content-type": "text/html" } }),
			},
		]);
		const { captured } = registerAndCapture();
		await captured.tools
			.get("web_fetch")
			?.execute?.("tc", { url: "https://x.com" }, undefined as never, undefined as never, createMockCtx());
		const init = stub.calls[0].init;
		const headers = init?.headers as Record<string, string>;
		expect(headers["User-Agent"]).toMatch(/rpiv-pi/);
		expect(headers.Accept).toContain("text/html");
		expect(init?.redirect).toBe("follow");
	});

	it("coerces content-length to numeric details.contentLength", async () => {
		stubFetch([
			{
				match: () => true,
				response: () =>
					new Response("x".repeat(100), {
						status: 200,
						headers: { "content-type": "text/plain", "content-length": "100" },
					}),
			},
		]);
		const { captured } = registerAndCapture();
		const r = await captured.tools
			.get("web_fetch")
			?.execute?.("tc", { url: "https://x.com" }, undefined as never, undefined as never, createMockCtx());
		expect((r?.details as { contentLength: number }).contentLength).toBe(100);
	});
});

describe("/web-search-config command", () => {
	it("!hasUI notifies error", async () => {
		const { captured } = registerAndCapture();
		const ctx = createMockCtx({ hasUI: false });
		await captured.commands.get("web-search-config")?.handler("", ctx as never);
		expect(ctx.ui.notify).toHaveBeenCalledWith(expect.stringContaining("interactive"), "error");
	});

	it("--show masks both env + config keys", async () => {
		process.env.BRAVE_SEARCH_API_KEY = "sk-live-abcdefghijklmnop";
		writeConfig({ apiKey: "sk-cfg-abcdefghijklmnop" });
		const { captured } = registerAndCapture();
		const ctx = createMockCtx({ hasUI: true });
		await captured.commands.get("web-search-config")?.handler("--show", ctx as never);
		const msg = (ctx.ui.notify as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(msg).toContain("sk-l...mnop");
		expect(msg).toContain("sk-c...mnop");
	});

	it("--show shows '(not set)' when nothing configured", async () => {
		const { captured } = registerAndCapture();
		const ctx = createMockCtx({ hasUI: true });
		await captured.commands.get("web-search-config")?.handler("--show", ctx as never);
		const msg = (ctx.ui.notify as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(msg).toContain("(not set)");
	});

	it("interactive save writes JSON and preserves extra fields", async () => {
		writeConfig({ apiKey: "old", otherField: "keep" });
		const { captured } = registerAndCapture();
		const ctx = createMockCtx({ hasUI: true });
		(ctx.ui.input as ReturnType<typeof vi.fn>).mockResolvedValueOnce("  new-key  ");
		await captured.commands.get("web-search-config")?.handler("", ctx as never);
		const saved = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
		expect(saved).toEqual({ apiKey: "new-key", otherField: "keep" });
	});

	it("interactive empty/whitespace input preserves existing config", async () => {
		writeConfig({ apiKey: "existing" });
		const { captured } = registerAndCapture();
		const ctx = createMockCtx({ hasUI: true });
		(ctx.ui.input as ReturnType<typeof vi.fn>).mockResolvedValueOnce("   ");
		await captured.commands.get("web-search-config")?.handler("", ctx as never);
		const saved = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
		expect(saved.apiKey).toBe("existing");
	});

	it("undefined input (Esc) leaves config untouched", async () => {
		writeConfig({ apiKey: "existing" });
		const { captured } = registerAndCapture();
		const ctx = createMockCtx({ hasUI: true });
		(ctx.ui.input as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
		await captured.commands.get("web-search-config")?.handler("", ctx as never);
		const saved = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
		expect(saved.apiKey).toBe("existing");
	});
});
