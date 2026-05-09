import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { findLegacySiblings, pruneLegacySiblings } from "./prune-legacy-siblings.js";

const SETTINGS_PATH = join(process.env.HOME!, ".pi", "agent", "settings.json");

function writeSettings(contents: unknown): void {
	mkdirSync(dirname(SETTINGS_PATH), { recursive: true });
	writeFileSync(SETTINGS_PATH, JSON.stringify(contents), "utf-8");
}

function readSettings(): unknown {
	return JSON.parse(readFileSync(SETTINGS_PATH, "utf-8"));
}

describe("pruneLegacySiblings", () => {
	it("no settings file → pruned: []", () => {
		expect(pruneLegacySiblings()).toEqual({ pruned: [] });
	});

	it("invalid JSON → pruned: [], file byte-exact unchanged", () => {
		mkdirSync(dirname(SETTINGS_PATH), { recursive: true });
		writeFileSync(SETTINGS_PATH, "{not json", "utf-8");
		expect(pruneLegacySiblings()).toEqual({ pruned: [] });
		expect(readFileSync(SETTINGS_PATH, "utf-8")).toBe("{not json");
	});

	it("non-object top-level (array) → pruned: [], file unchanged", () => {
		writeSettings([1, 2, 3]);
		expect(pruneLegacySiblings()).toEqual({ pruned: [] });
		expect(readSettings()).toEqual([1, 2, 3]);
	});

	it("no packages field → pruned: []", () => {
		writeSettings({ other: "data" });
		expect(pruneLegacySiblings()).toEqual({ pruned: [] });
		expect(readSettings()).toEqual({ other: "data" });
	});

	it("non-array packages field → pruned: []", () => {
		writeSettings({ packages: "not-array" });
		expect(pruneLegacySiblings()).toEqual({ pruned: [] });
	});

	it("only non-legacy entries → pruned: [], file unchanged", () => {
		writeSettings({
			packages: ["npm:pi-perplexity", "npm:@juicesharp/rpiv-todo", "npm:@tintinweb/pi-subagents"],
		});
		const before = readFileSync(SETTINGS_PATH, "utf-8");
		expect(pruneLegacySiblings()).toEqual({ pruned: [] });
		expect(readFileSync(SETTINGS_PATH, "utf-8")).toBe(before);
	});

	it("legacy-only: removes pi-subagents (nicobailon fork), preserves other top-level keys", () => {
		writeSettings({
			defaultProvider: "zai",
			theme: "dark",
			packages: ["npm:pi-subagents"],
		});
		const result = pruneLegacySiblings();
		expect(result.pruned).toEqual(["npm:pi-subagents"]);
		expect(readSettings()).toEqual({
			defaultProvider: "zai",
			theme: "dark",
			packages: [],
		});
	});

	it("mixed list: prunes nicobailon's pi-subagents only, preserves @tintinweb/pi-subagents and other entries", () => {
		writeSettings({
			packages: [
				"npm:pi-perplexity",
				"npm:@tintinweb/pi-subagents",
				"npm:@juicesharp/rpiv-todo",
				"/Users/x/rpiv-mono/packages/rpiv-pi",
				null,
				42,
				"npm:pi-subagents",
			],
		});
		const result = pruneLegacySiblings();
		expect(result.pruned).toEqual(["npm:pi-subagents"]);
		expect(readSettings()).toEqual({
			packages: [
				"npm:pi-perplexity",
				"npm:@tintinweb/pi-subagents",
				"npm:@juicesharp/rpiv-todo",
				"/Users/x/rpiv-mono/packages/rpiv-pi",
				null,
				42,
			],
		});
	});

	it("idempotent: second call after prune is a no-op", () => {
		writeSettings({
			packages: ["npm:pi-subagents"],
		});
		expect(pruneLegacySiblings().pruned).toEqual(["npm:pi-subagents"]);
		expect(pruneLegacySiblings()).toEqual({ pruned: [] });
	});

	it("case-insensitive match", () => {
		writeSettings({
			packages: ["NPM:Pi-Subagents"],
		});
		expect(pruneLegacySiblings().pruned).toEqual(["NPM:Pi-Subagents"]);
	});
});

describe("findLegacySiblings (read-only scan)", () => {
	it("no settings file → []", () => {
		expect(findLegacySiblings()).toEqual([]);
	});

	it("invalid JSON → []", () => {
		mkdirSync(dirname(SETTINGS_PATH), { recursive: true });
		writeFileSync(SETTINGS_PATH, "{not json", "utf-8");
		expect(findLegacySiblings()).toEqual([]);
	});

	it("non-object top-level → []", () => {
		writeSettings([1, 2, 3]);
		expect(findLegacySiblings()).toEqual([]);
	});

	it("no packages field → []", () => {
		writeSettings({ other: "data" });
		expect(findLegacySiblings()).toEqual([]);
	});

	it("non-array packages field → []", () => {
		writeSettings({ packages: "not-array" });
		expect(findLegacySiblings()).toEqual([]);
	});

	it("only non-legacy entries → []", () => {
		writeSettings({
			packages: ["npm:pi-perplexity", "npm:@juicesharp/rpiv-todo", "npm:@tintinweb/pi-subagents"],
		});
		expect(findLegacySiblings()).toEqual([]);
	});

	it("returns legacy entries without mutating settings.json", () => {
		writeSettings({
			defaultProvider: "zai",
			packages: ["npm:pi-subagents", "npm:@juicesharp/rpiv-todo"],
		});
		const before = readFileSync(SETTINGS_PATH, "utf-8");
		expect(findLegacySiblings()).toEqual(["npm:pi-subagents"]);
		expect(readFileSync(SETTINGS_PATH, "utf-8")).toBe(before);
	});

	it("idempotent: repeat call returns the same list and does not mutate", () => {
		writeSettings({ packages: ["npm:pi-subagents"] });
		const before = readFileSync(SETTINGS_PATH, "utf-8");
		expect(findLegacySiblings()).toEqual(["npm:pi-subagents"]);
		expect(findLegacySiblings()).toEqual(["npm:pi-subagents"]);
		expect(readFileSync(SETTINGS_PATH, "utf-8")).toBe(before);
	});
});
