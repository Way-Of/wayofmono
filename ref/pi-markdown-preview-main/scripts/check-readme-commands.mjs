#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const indexPath = resolve(rootDir, "index.ts");
const readmePath = resolve(rootDir, "README.md");

const indexSource = readFileSync(indexPath, "utf8");
const readmeSource = readFileSync(readmePath, "utf8");

const registeredCommands = [
	...indexSource.matchAll(/registerCommand\("([^"]+)"/g),
].map((match) => match[1]);

if (registeredCommands.length === 0) {
	console.error(`No commands found in ${indexPath}`);
	process.exit(1);
}

const documentedCommands = [
	...readmeSource.matchAll(/^\|\s*`\/([a-z0-9-]+)(?:[^`]*)`\s*\|/gim),
].map((match) => match[1]);

const registeredSet = new Set(registeredCommands);
const documentedSet = new Set(documentedCommands);

// Backward-compatible aliases we intentionally keep undocumented.
const intentionallyUndocumentedCommands = new Set();

const staleUndocumentedAllowlist = [...intentionallyUndocumentedCommands].filter(
	(command) => !registeredSet.has(command),
);
if (staleUndocumentedAllowlist.length > 0) {
	console.error("Undocumented command allowlist contains commands not registered in index.ts:");
	for (const command of staleUndocumentedAllowlist) {
		console.error(`  - /${command}`);
	}
	process.exit(1);
}

const missingFromReadme = [...registeredSet].filter(
	(command) => !documentedSet.has(command) && !intentionallyUndocumentedCommands.has(command),
);
const undocumentedInCode = [...documentedSet].filter((command) => !registeredSet.has(command));

if (missingFromReadme.length === 0 && undocumentedInCode.length === 0) {
	const documentedRegisteredCommands = [...registeredSet].filter(
		(command) => !intentionallyUndocumentedCommands.has(command),
	);
	const hiddenAliases = [...intentionallyUndocumentedCommands].filter((command) => registeredSet.has(command));
	let message = `README command docs are in sync (${documentedRegisteredCommands.length} documented commands): ${documentedRegisteredCommands.map((c) => `/${c}`).join(", ")}`;
	if (hiddenAliases.length > 0) {
		message += ` (hidden aliases: ${hiddenAliases.map((c) => `/${c}`).join(", ")})`;
	}
	console.log(message);
	process.exit(0);
}

if (missingFromReadme.length > 0) {
	console.error("Commands registered in index.ts but missing from README:");
	for (const command of missingFromReadme) {
		console.error(`  - /${command}`);
	}
}

if (undocumentedInCode.length > 0) {
	console.error("Commands documented in README but not registered in index.ts:");
	for (const command of undocumentedInCode) {
		console.error(`  - /${command}`);
	}
}

process.exit(1);
