/**
 * voice-config — best-effort persistence of optional rpiv-voice settings
 * (custom model path, named mic device) at `~/.config/rpiv-voice/voice.json`.
 *
 * Both load and save are crash-resistant: malformed JSON or filesystem errors
 * resolve to "no config". The file is created with 0600 perms because it may
 * one day hold device IDs that the user doesn't want world-readable.
 */

import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

// ── Filesystem layout ────────────────────────────────────────────────────────
const CONFIG_DIR_NAME = "rpiv-voice";
const CONFIG_FILE_NAME = "voice.json";
const CONFIG_DIR = join(homedir(), ".config", CONFIG_DIR_NAME);
const CONFIG_PATH = join(CONFIG_DIR, CONFIG_FILE_NAME);

// ── Permissions & formatting ─────────────────────────────────────────────────
const CONFIG_FILE_MODE = 0o600;
const JSON_INDENT = 2;

// ── Module-level singleton key (cleared by test/setup beforeEach) ────────────
const VOICE_STATE_KEY = Symbol.for("rpiv-voice");

export interface VoiceConfig {
	readonly hallucinationFilterEnabled?: boolean;
}

/**
 * The hallucination filter defaults to ENABLED. We only persist the off-state
 * to keep voice.json minimal, which means "field absent" must be read as
 * "enabled". Centralizing this rule here keeps the three readers in sync —
 * persisted config, pipeline runtime options, and the in-flight settings
 * draft all decode the absence the same way.
 */
export function isHallucinationFilterEnabled(config: { hallucinationFilterEnabled?: boolean }): boolean {
	return config.hallucinationFilterEnabled !== false;
}

export function loadVoiceConfig(): VoiceConfig {
	if (!existsSync(CONFIG_PATH)) return {};
	try {
		const parsed = JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as unknown;
		if (parsed === null || typeof parsed !== "object") return {};
		return parsed as VoiceConfig;
	} catch {
		return {};
	}
}

export function saveVoiceConfig(config: VoiceConfig): void {
	try {
		mkdirSync(dirname(CONFIG_PATH), { recursive: true });
		writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, JSON_INDENT)}\n`, "utf-8");
	} catch {
		// best-effort
	}
	try {
		chmodSync(CONFIG_PATH, CONFIG_FILE_MODE);
	} catch {
		// best-effort — perms are advisory; the user's umask still wins.
	}
}

export function __resetState(): void {
	const g = globalThis as unknown as { [k: symbol]: unknown };
	delete g[VOICE_STATE_KEY];
}
