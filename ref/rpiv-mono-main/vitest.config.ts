import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["packages/*/**/*.test.ts"],
		setupFiles: ["./test/setup.ts"],
		unstubGlobals: true,
		clearMocks: true,
		restoreMocks: true,
		passWithNoTests: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			include: ["packages/*/**/*.ts"],
			exclude: [
				"**/node_modules/**",
				"**/.pi/**",
				"**/.rpiv/**",
				"**/thoughts/**",
				"**/docs/**",
				"**/*.test.ts",
				"**/index.ts",
				"packages/test-utils/**",
			],
		},
	},
});
