import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { KnipClient } from "../../clients/knip-client.js";
import { setupTestEnvironment } from "./test-utils.js";

describe("knip-client", () => {
	it("resolves project root from nested directory", () => {
		const { tmpDir, cleanup } = setupTestEnvironment("pi-lens-knip-");
		try {
			fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"demo"}');
			const nested = path.join(tmpDir, "src", "feature");
			fs.mkdirSync(nested, { recursive: true });

			const client = new KnipClient(false) as unknown as {
				resolveProjectRoot: (startDir: string) => string;
			};

			expect(client.resolveProjectRoot(nested)).toBe(tmpDir);
		} finally {
			cleanup();
		}
	});

	it("parses fallback flat issue array format", () => {
		const client = new KnipClient(false) as unknown as {
			parseOutput: (output: string) => {
				success: boolean;
				issues: Array<{ type: string; name: string; file?: string }>;
				unlistedDeps: Array<{ type: string; name: string }>;
			};
		};

		const result = client.parseOutput(
			JSON.stringify([
				{
					type: "unlisted",
					name: "@acme/pkg",
					file: "src/main.ts",
					line: 12,
				},
			]),
		);

		expect(result.success).toBe(true);
		expect(result.issues).toHaveLength(1);
		expect(result.unlistedDeps).toHaveLength(1);
		expect(result.unlistedDeps[0].name).toBe("@acme/pkg");
	});
});
