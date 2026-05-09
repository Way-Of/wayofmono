import {
	chmodSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BUNDLED_AGENTS_DIR, syncBundledAgents } from "./agents.js";

let cwd: string;
let targetDir: string;
let manifestPath: string;

beforeEach(() => {
	cwd = mkdtempSync(join(tmpdir(), "rpiv-agents-"));
	targetDir = join(cwd, ".pi", "agents");
	manifestPath = join(targetDir, ".rpiv-managed.json");
});
afterEach(() => {
	rmSync(cwd, { recursive: true, force: true });
	vi.restoreAllMocks();
});

describe("syncBundledAgents — first run (empty target)", () => {
	it("copies every source .md and writes manifest", () => {
		const r = syncBundledAgents(cwd, false);
		const bundled = readdirSync(BUNDLED_AGENTS_DIR).filter((f) => f.endsWith(".md"));
		expect(r.added.sort()).toEqual(bundled.sort());
		expect(r.updated).toEqual([]);
		expect(r.errors).toEqual([]);
		expect(existsSync(manifestPath)).toBe(true);
		const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
		expect(manifest.sort()).toEqual(bundled.sort());
	});
});

describe("syncBundledAgents — bootstrap-claim from manifest-less drift", () => {
	it("claims pre-existing files matching bundled names as managed", () => {
		const bundled = readdirSync(BUNDLED_AGENTS_DIR).filter((f) => f.endsWith(".md"));
		if (bundled.length === 0) return;
		mkdirSync(targetDir, { recursive: true });
		writeFileSync(join(targetDir, bundled[0]), "drift content", "utf-8");
		const r = syncBundledAgents(cwd, false);
		expect(r.pendingUpdate).toContain(bundled[0]);
		expect(readFileSync(join(targetDir, bundled[0]), "utf-8")).toBe("drift content");
	});
});

describe("syncBundledAgents — apply=false (detect only)", () => {
	it("reports pendingUpdate for changed managed files without touching them", () => {
		const bundled = readdirSync(BUNDLED_AGENTS_DIR).filter((f) => f.endsWith(".md"));
		if (bundled.length === 0) return;
		syncBundledAgents(cwd, true);
		writeFileSync(join(targetDir, bundled[0]), "user-modified", "utf-8");
		const r = syncBundledAgents(cwd, false);
		expect(r.pendingUpdate).toContain(bundled[0]);
		expect(readFileSync(join(targetDir, bundled[0]), "utf-8")).toBe("user-modified");
	});
});

describe("syncBundledAgents — apply=true (mutating sync)", () => {
	it("overwrites changed managed files", () => {
		const bundled = readdirSync(BUNDLED_AGENTS_DIR).filter((f) => f.endsWith(".md"));
		if (bundled.length === 0) return;
		syncBundledAgents(cwd, true);
		writeFileSync(join(targetDir, bundled[0]), "user-modified", "utf-8");
		const r = syncBundledAgents(cwd, true);
		expect(r.updated).toContain(bundled[0]);
		const srcContent = readFileSync(join(BUNDLED_AGENTS_DIR, bundled[0]), "utf-8");
		expect(readFileSync(join(targetDir, bundled[0]), "utf-8")).toBe(srcContent);
	});

	it("removes stale managed files absent from source", () => {
		mkdirSync(targetDir, { recursive: true });
		writeFileSync(join(targetDir, "stale.md"), "x", "utf-8");
		writeFileSync(manifestPath, JSON.stringify(["stale.md"]), "utf-8");
		const r = syncBundledAgents(cwd, true);
		expect(r.removed).toContain("stale.md");
		expect(existsSync(join(targetDir, "stale.md"))).toBe(false);
	});

	it("leaves unchanged managed files alone", () => {
		syncBundledAgents(cwd, true);
		const r = syncBundledAgents(cwd, true);
		expect(r.updated).toEqual([]);
		expect(r.unchanged.length).toBeGreaterThan(0);
	});
});

describe("syncBundledAgents — error paths", () => {
	it.skipIf(process.platform === "win32")("collects copy error when dest is read-only", () => {
		// Create a read-only target dir so copyFileSync fails with EACCES/EPERM
		const bundled = readdirSync(BUNDLED_AGENTS_DIR).filter((f) => f.endsWith(".md"));
		if (bundled.length === 0) return;
		mkdirSync(targetDir, { recursive: true });
		chmodSync(targetDir, 0o500);
		try {
			const r = syncBundledAgents(cwd, false);
			// At least one copy op should have failed; otherwise nothing proves the error path
			const errorTripped = r.errors.some((e) => e.op === "copy") || r.added.length < bundled.length;
			expect(errorTripped).toBe(true);
		} finally {
			chmodSync(targetDir, 0o700);
		}
	});
});

describe("syncBundledAgents — stale-file detection (apply=false)", () => {
	it("reports pendingRemove when a managed file has no matching source", () => {
		mkdirSync(targetDir, { recursive: true });
		writeFileSync(join(targetDir, "stale.md"), "x", "utf-8");
		writeFileSync(manifestPath, JSON.stringify(["stale.md"]), "utf-8");
		const r = syncBundledAgents(cwd, false);
		expect(r.pendingRemove).toContain("stale.md");
		expect(r.removed).toEqual([]);
		expect(existsSync(join(targetDir, "stale.md"))).toBe(true);
	});

	it("keeps pendingRemove entries in the manifest so the next apply can finish removal", () => {
		mkdirSync(targetDir, { recursive: true });
		writeFileSync(join(targetDir, "stale.md"), "x", "utf-8");
		writeFileSync(manifestPath, JSON.stringify(["stale.md"]), "utf-8");
		syncBundledAgents(cwd, false);
		const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as string[];
		expect(manifest).toContain("stale.md");
	});

	it("skips pendingRemove when the stale file no longer exists on disk", () => {
		mkdirSync(targetDir, { recursive: true });
		// Manifest claims stale.md but disk does not have it
		writeFileSync(manifestPath, JSON.stringify(["stale.md"]), "utf-8");
		const r = syncBundledAgents(cwd, false);
		expect(r.pendingRemove).not.toContain("stale.md");
		expect(r.removed).not.toContain("stale.md");
	});
});

describe("syncBundledAgents — manifest robustness", () => {
	it("treats a corrupt manifest (invalid JSON) as empty and re-bootstraps", () => {
		mkdirSync(targetDir, { recursive: true });
		writeFileSync(manifestPath, "{ not json ::", "utf-8");
		const r = syncBundledAgents(cwd, false);
		expect(r.errors).toEqual([]);
		// After sync, the manifest should be valid JSON again.
		const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as string[];
		expect(Array.isArray(manifest)).toBe(true);
	});

	it("treats a non-array manifest as empty and re-bootstraps", () => {
		mkdirSync(targetDir, { recursive: true });
		writeFileSync(manifestPath, JSON.stringify({ oops: true }), "utf-8");
		const r = syncBundledAgents(cwd, false);
		expect(r.errors).toEqual([]);
		const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as string[];
		expect(Array.isArray(manifest)).toBe(true);
	});

	it("filters non-string manifest entries during parse", () => {
		mkdirSync(targetDir, { recursive: true });
		writeFileSync(join(targetDir, "unrelated.md"), "keep me", "utf-8");
		// Write manifest containing mixed types (must be ignored per-entry rather than whole-file)
		writeFileSync(manifestPath, JSON.stringify([42, null, "unrelated.md"]), "utf-8");
		const r = syncBundledAgents(cwd, false);
		expect(r.errors).toEqual([]);
		// unrelated.md is not in source, so it will be tracked for pendingRemove
		expect(r.pendingRemove).toContain("unrelated.md");
	});
});

describe("syncBundledAgents — subsequent-run bookkeeping", () => {
	it("reports unchanged (not added) on a second run with no changes", () => {
		syncBundledAgents(cwd, true);
		const r = syncBundledAgents(cwd, false);
		expect(r.added).toEqual([]);
		expect(r.updated).toEqual([]);
		expect(r.pendingUpdate).toEqual([]);
		expect(r.unchanged.length).toBeGreaterThan(0);
	});

	it("treats a destination file that was manually removed as a new add on next sync", () => {
		syncBundledAgents(cwd, true);
		const bundled = readdirSync(BUNDLED_AGENTS_DIR).filter((f) => f.endsWith(".md"));
		if (bundled.length === 0) return;
		rmSync(join(targetDir, bundled[0]));
		const r = syncBundledAgents(cwd, false);
		expect(r.added).toContain(bundled[0]);
	});
});
