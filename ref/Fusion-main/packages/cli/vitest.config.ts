import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { computeMaxWorkers } from "../core/src/__test-utils__/vitest-workers";

const maxWorkers = computeMaxWorkers();

export default defineConfig({
  resolve: {
    // Keep these aliases exact and ordered (subpaths before package roots).
    // In fresh worktrees, internal packages may not have dist/ built yet, and
    // Vite otherwise resolves workspace package exports.import to dist/*.js.
    // Anchored regex aliases force CLI tests to use source entrypoints instead.
    alias: [
      { find: /^@fusion\/core\/gh-cli$/, replacement: resolve(__dirname, "../core/src/gh-cli.ts") },
      { find: /^@fusion\/core$/, replacement: resolve(__dirname, "../core/src/index.ts") },
      { find: /^@fusion\/dashboard\/planning$/, replacement: resolve(__dirname, "../dashboard/src/planning.ts") },
      { find: /^@fusion\/dashboard$/, replacement: resolve(__dirname, "../dashboard/src/index.ts") },
      { find: /^@fusion\/engine$/, replacement: resolve(__dirname, "../engine/src/index.ts") },
      { find: /^@fusion\/plugin-sdk$/, replacement: resolve(__dirname, "../plugin-sdk/src/index.ts") },
      {
        find: /^@fusion-plugin-examples\/droid-runtime\/probe$/,
        replacement: resolve(__dirname, "../../plugins/fusion-plugin-droid-runtime/src/probe.ts"),
      },
      {
        find: /^@fusion-plugin-examples\/droid-runtime$/,
        replacement: resolve(__dirname, "../../plugins/fusion-plugin-droid-runtime/src/index.ts"),
      },
      {
        find: /^@fusion-plugin-examples\/hermes-runtime$/,
        replacement: resolve(__dirname, "../../plugins/fusion-plugin-hermes-runtime/src/index.ts"),
      },
      {
        find: /^@fusion-plugin-examples\/openclaw-runtime$/,
        replacement: resolve(__dirname, "../../plugins/fusion-plugin-openclaw-runtime/src/index.ts"),
      },
      {
        find: /^@fusion-plugin-examples\/paperclip-runtime$/,
        replacement: resolve(__dirname, "../../plugins/fusion-plugin-paperclip-runtime/src/index.ts"),
      },
      { find: /^@fusion\/test-utils$/, replacement: resolve(__dirname, "../core/src/__test-utils__/workspace.ts") },
    ],
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // build-exe + build-exe-cross live in their own vitest project
    // (see vitest.build-exe.config.ts) so the rest of the CLI suite can
    // run with file parallelism enabled.
    exclude: ["**/node_modules/**", "**/dist/**", "src/__tests__/build-exe*.test.ts"],
    setupFiles: [
      resolve(__dirname, "../core/src/__test-utils__/vitest-setup.ts"),
    ],
    globalSetup: [resolve(__dirname, "../core/src/__test-utils__/vitest-teardown.ts")],
    pool: "forks",
    maxWorkers,
    poolOptions: { forks: { minForks: 1, maxForks: maxWorkers } },
    fileParallelism: true,
    coverage: {
      enabled: false,
      reporter: ["text", "html", "json"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.d.ts", "dist/**"],
    },
  },
});
