import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export interface Compat {
	rpivPiVersion: string; // e.g. "1.1.4" — from packages/rpiv-pi/package.json
	piCodingAgentFloor: string; // e.g. "^0.70.5" — from packages/rpiv-pi/CHANGELOG.md
}

const FLOOR_RE = /pi-coding-agent[`\s]+\^([0-9]+\.[0-9]+\.[0-9]+)/;

export function loadCompat(): Compat {
	const pkgUrl = new URL("../../../rpiv-pi/package.json", import.meta.url);
	const changelogUrl = new URL("../../../rpiv-pi/CHANGELOG.md", import.meta.url);
	const pkg = JSON.parse(readFileSync(fileURLToPath(pkgUrl), "utf8"));
	const changelog = readFileSync(fileURLToPath(changelogUrl), "utf8");
	const match = changelog.match(FLOOR_RE);
	if (!match) {
		throw new Error("compat: could not parse pi-coding-agent floor from rpiv-pi/CHANGELOG.md");
	}
	return {
		rpivPiVersion: pkg.version,
		piCodingAgentFloor: `^${match[1]}`,
	};
}
