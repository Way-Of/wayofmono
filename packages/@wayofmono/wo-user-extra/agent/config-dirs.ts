/**
 * Config directory detection — resolves `.wocode` or `.wo` based on which tool is running.
 *
 * This module is shared by all wo-user-extra extensions and packets.
 * It detects the config directory at runtime so the same code works in both wocode and wouser.
 */

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

let cachedConfigDir: string | undefined;

/**
 * Returns the config directory name (`.wocode` or `.wo`) based on which tool is running.
 * Detection order:
 *   1. Process argv — if `wocode` binary is in argv[1], return `.wocode`
 *   2. Filesystem — check which dir exists: `.wocode` vs `.wo`
 *   3. Default — `.wo` (wouser)
 */
export function getConfigDirName(): string {
	if (cachedConfigDir) return cachedConfigDir;

	// 1. Check process argv for wocode binary
	const argv1 = process.argv[1] ?? "";
	if (argv1.includes("wocode")) {
		cachedConfigDir = ".wocode";
		return cachedConfigDir;
	}

	// 2. Check filesystem
	const home = homedir();
	if (existsSync(join(home, ".wocode"))) {
		cachedConfigDir = ".wocode";
	} else {
		cachedConfigDir = ".wo";
	}

	return cachedConfigDir;
}

/**
 * Returns the full path to the agent config directory (e.g. `~/.wocode/agent/` or `~/.wo/agent/`).
 */
export function getAgentConfigDir(): string {
	return join(homedir(), getConfigDirName(), "agent");
}

/**
 * Returns the full path to the themes directory.
 */
export function getThemesDir(): string {
	return join(getAgentConfigDir(), "themes");
}

/**
 * Returns the full path to the agents directory.
 */
export function getAgentsDir(): string {
	return join(getAgentConfigDir(), "agents");
}

/**
 * Returns the full path to a config file in the config dir (e.g. `~/.wo/web-search.json`).
 */
export function getConfigPath(filename: string): string {
	return join(homedir(), getConfigDirName(), filename);
}

/**
 * Returns the full path to the config dir itself (e.g. `~/.wocode` or `~/.wo`).
 */
export function getConfigRoot(): string {
	return join(homedir(), getConfigDirName());
}
