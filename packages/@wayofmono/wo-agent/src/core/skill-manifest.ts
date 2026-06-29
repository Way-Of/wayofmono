import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { CONFIG_DIR_NAME } from "../config.js";

export type ManifestEntryType = "skill" | "agent" | "extension";

export interface ManifestEntry {
	source: string;
	name: string;
	path: string;
	type: ManifestEntryType;
}

export interface WoManifest {
	entries: ManifestEntry[];
}

const MANIFEST_FILENAME = "manifest.json";

function getManifestPath(cwd: string): string {
	return resolve(cwd, CONFIG_DIR_NAME, MANIFEST_FILENAME);
}

export function readManifest(cwd: string): WoManifest {
	const path = getManifestPath(cwd);
	if (!existsSync(path)) {
		return { entries: [] };
	}
	try {
		const raw = readFileSync(path, "utf-8");
		return JSON.parse(raw) as WoManifest;
	} catch {
		return { entries: [] };
	}
}

export function writeManifest(cwd: string, manifest: WoManifest): void {
	const path = getManifestPath(cwd);
	const dir = resolve(cwd, CONFIG_DIR_NAME);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
}

export function addEntryToManifest(cwd: string, entry: ManifestEntry): boolean {
	const manifest = readManifest(cwd);
	const exists = manifest.entries.some(
		(e) => e.source === entry.source || (e.name === entry.name && e.type === entry.type),
	);
	if (exists) {
		return false;
	}
	manifest.entries.push(entry);
	writeManifest(cwd, manifest);
	return true;
}

export function removeEntryFromManifest(cwd: string, source: string): boolean {
	const manifest = readManifest(cwd);
	const before = manifest.entries.length;
	manifest.entries = manifest.entries.filter((e) => e.source !== source);
	if (manifest.entries.length === before) {
		return false;
	}
	writeManifest(cwd, manifest);
	return true;
}

export function findEntryInManifest(cwd: string, nameOrSource: string | undefined, type?: ManifestEntryType): ManifestEntry | undefined {
	const manifest = readManifest(cwd);
	return manifest.entries.find(
		(e) => (e.source === nameOrSource || e.name === nameOrSource) && (!type || e.type === type),
	);
}

export function getEntriesOfType(cwd: string, type: ManifestEntryType): ManifestEntry[] {
	const manifest = readManifest(cwd);
	return manifest.entries.filter((e) => e.type === type);
}

export function resolveNpmPackagePath(cwd: string, packageName: string): string | undefined {
	const name = packageName.startsWith("npm:") ? packageName.slice(4) : packageName;

	const candidates = [join(cwd, "node_modules", name)];

	const ancestor = resolve(cwd, "..");
	if (ancestor !== cwd) {
		candidates.push(join(ancestor, "node_modules", name));
	}

	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return undefined;
}

function discoverPackagesByMarker(cwd: string, marker: string, type: ManifestEntryType, packagePrefix: string): ManifestEntry[] {
	const found: ManifestEntry[] = [];
	const nmPath = join(cwd, "node_modules");
	if (!existsSync(nmPath)) return found;

	const scopePath = join(nmPath, packagePrefix.includes("/") ? packagePrefix : `@wayofmono`);
	if (!existsSync(scopePath)) return found;

	// Helper: check if path is a directory (follows symlinks)
	function isDirectory(path: string): boolean {
		try {
			return statSync(path).isDirectory();
		} catch { return false; }
	}

	try {
		const items = readdirSync(scopePath, { withFileTypes: true });
		const prefix = packagePrefix.includes("/") ? packagePrefix : `@wayofmono/`;
		for (const item of items) {
			const fullPath = join(scopePath, item.name);
			if (!isDirectory(fullPath)) continue;
			const markerFile = join(fullPath, marker);
			if (existsSync(markerFile)) {
				found.push({ source: `npm:${prefix}${item.name}`, name: item.name, path: fullPath, type });
			}
		}
	} catch {}

	// Also scan extension packages that may contain multiple skills/agents
	if (type === "skill" || type === "agent") {
		try {
			const items = readdirSync(scopePath, { withFileTypes: true });
			const prefix = packagePrefix.includes("/") ? packagePrefix : `@wayofmono/`;
			for (const item of items) {
				const fullPath = join(scopePath, item.name);
				if (!isDirectory(fullPath)) continue;
				if (item.name.startsWith("wo-") || item.name.startsWith("skill-") || item.name.startsWith("agent-")) {
					// Check for skills/agents in subdirectories
					const skillsDir = join(fullPath, "skills");
					const agentSkillsDir = join(fullPath, "agent", "skills");
					for (const subDir of [skillsDir, agentSkillsDir]) {
						if (isDirectory(subDir)) {
							const subItems = readdirSync(subDir, { withFileTypes: true });
							for (const subItem of subItems) {
								const subFullPath = join(subDir, subItem.name);
								if (!isDirectory(subFullPath)) continue;
								const markerFile = join(subFullPath, marker);
								if (existsSync(markerFile)) {
									found.push({ source: `npm:${prefix}${item.name}`, name: subItem.name, path: subFullPath, type });
								}
							}
						}
					}
				}
			}
		} catch {}
	}

	return found;
}

export function discoverNpmSkills(cwd: string): ManifestEntry[] {
	return discoverPackagesByMarker(cwd, "SKILL.md", "skill", "@wayofmono");
}

export function discoverNpmAgents(cwd: string): ManifestEntry[] {
	return discoverPackagesByMarker(cwd, "AGENTS.md", "agent", "@wayofmono");
}

export function discoverNpmExtensions(cwd: string): ManifestEntry[] {
	return discoverPackagesByMarker(cwd, "index.js", "extension", "@wayofmono");
}
