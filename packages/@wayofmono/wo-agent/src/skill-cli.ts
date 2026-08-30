import chalk from "chalk";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { APP_NAME } from "./config.js";
import { loadSkillsFromDir } from "./core/skills.js";
import { isLocalPath } from "./utils/paths.js";
import {
	addEntryToManifest,
	discoverNpmAgents,
	discoverNpmExtensions,
	discoverNpmSkills,
	findEntryInManifest,
	getEntriesOfType,
	readManifest,
	removeEntryFromManifest,
	resolveNpmPackagePath,
	type ManifestEntryType,
} from "./core/skill-manifest.js";

type ResourceCommand = "install" | "remove" | "discover" | "list" | "update";
type ResourceType = "skill" | "agent" | "extension";

interface ResourceCommandOptions {
	resourceType: ResourceType;
	command: ResourceCommand;
	source?: string;
	help: boolean;
	invalidOption?: string;
	invalidArgument?: string;
}

const RESOURCE_TYPES: ResourceType[] = ["skill", "agent", "extension"];

const RESOURCE_MARKERS: Record<ResourceType, string> = {
	skill: "SKILL.md",
	agent: "AGENTS.md",
	extension: "index.js",
};

const RESOURCE_DISCOVERERS: Record<ResourceType, (cwd: string) => Array<{ source: string; name: string; path: string; type: ManifestEntryType }>> = {
	skill: discoverNpmSkills,
	agent: discoverNpmAgents,
	extension: discoverNpmExtensions,
};

function getUsage(resourceType: ResourceType, command: ResourceCommand): string {
	switch (command) {
		case "install":
			return `${APP_NAME} ${resourceType} install <source>`;
		case "remove":
			return `${APP_NAME} ${resourceType} remove <source>`;
		case "discover":
			return `${APP_NAME} ${resourceType} discover`;
		case "list":
			return `${APP_NAME} ${resourceType} list`;
		case "update":
			return `${APP_NAME} ${resourceType} update [source]`;
	}
}

function printHelp(resourceType: ResourceType, command: ResourceCommand): void {
	const label = resourceType === "skill" ? `a ${resourceType}` : `an ${resourceType}`;
	const marker = RESOURCE_MARKERS[resourceType];

	switch (command) {
		case "install":
			console.log(`${chalk.bold("Usage:")}
  ${getUsage(resourceType, "install")}

Register ${label} from an npm package.
The package must be installed in node_modules/ and contain a ${marker} file.

Examples:
  ${APP_NAME} ${resourceType} install npm:@wayofmono/${resourceType === "skill" ? "skill-" : resourceType === "agent" ? "agent-" : "extension-"}example
`);
			return;

		case "remove":
			console.log(`${chalk.bold("Usage:")}
  ${getUsage(resourceType, "remove")}

Unregister ${label} by source or name.
`);
			return;

		case "discover":
			console.log(`${chalk.bold("Usage:")}
  ${getUsage(resourceType, "discover")}

Scan node_modules/@wayofmono/${resourceType === "skill" ? "skill-" : resourceType === "agent" ? "agent-" : "extension-"}* for unregistered entries.
`);
			return;

		case "list":
			console.log(`${chalk.bold("Usage:")}
  ${getUsage(resourceType, "list")}

List registered ${resourceType}s from .wo/manifest.json.
`);
			return;

		case "update":
			console.log(`${chalk.bold("Usage:")}
  ${getUsage(resourceType, "update")}

Re-read ${marker} for registered ${resourceType}s after npm update.
`);
			return;
	}
}

function printGeneralHelp(): void {
	console.log(`${chalk.bold("Resource Management Commands:")}

Resources are loaded from npm packages as project dependencies.

Commands:
  ${APP_NAME} skill <command>      Manage skills (SKILL.md)
  ${APP_NAME} agent <command>      Manage agents (AGENTS.md)
  ${APP_NAME} extension <command>  Manage extensions (index.js)

For each resource type:
  install <source>   Register a resource from an npm package
  remove <source>    Unregister a resource
  discover           Find unregistered resources in node_modules
  list               List registered resources
  update [source]    Refresh after npm update

Use "${APP_NAME} <type> <command> --help" for detailed help.
`);
}

export function parseResourceCommand(args: string[]): ResourceCommandOptions | undefined {
	if (args.length < 2) {
		return undefined;
	}

	const [rawType, rawCommand, ...rest] = args;

	const resourceType = RESOURCE_TYPES.find((t) => t === rawType);
	if (!resourceType) {
		return undefined;
	}

	const validCommands: ResourceCommand[] = ["install", "remove", "discover", "list", "update"];
	const command = validCommands.find((c) => c === rawCommand);

	if (!command) {
		if (rawCommand === "--help" || rawCommand === "-h") {
			printGeneralHelp();
			process.exit(0);
		}
		console.error(chalk.red(`Unknown ${resourceType} command "${rawCommand}".`));
		console.error(chalk.dim(`Use "${APP_NAME} ${resourceType} --help" for available commands.`));
		process.exitCode = 1;
		return undefined;
	}

	let help = false;
	let invalidOption: string | undefined;
	let invalidArgument: string | undefined;
	let source: string | undefined;

	for (let i = 0; i < rest.length; i++) {
		const arg = rest[i];
		if (arg === "--help" || arg === "-h") {
			help = true;
			continue;
		}
		if (arg.startsWith("-")) {
			invalidOption = invalidOption ?? arg;
			continue;
		}
		if (!source) {
			source = arg;
		} else {
			invalidArgument = invalidArgument ?? arg;
		}
	}

	if (help) {
		printHelp(resourceType, command);
		return undefined;
	}

	return { resourceType, command, source, help, invalidOption, invalidArgument };
}

export async function handleSkillCommand(args: string[]): Promise<boolean> {
	const options = parseResourceCommand(args);
	if (!options) {
		return args.length >= 1 && RESOURCE_TYPES.includes(args[0] as ResourceType);
	}

	if (options.help) {
		printHelp(options.resourceType, options.command);
		return true;
	}

	if (options.invalidOption) {
		console.error(chalk.red(`Unknown option ${options.invalidOption}.`));
		console.error(chalk.dim(`Use "${APP_NAME} ${options.resourceType} ${options.command} --help".`));
		process.exitCode = 1;
		return true;
	}

	if (options.invalidArgument) {
		console.error(chalk.red(`Unexpected argument ${options.invalidArgument}.`));
		console.error(chalk.dim(`Usage: ${getUsage(options.resourceType, options.command)}`));
		process.exitCode = 1;
		return true;
	}

	if (options.command === "install" || options.command === "remove") {
		if (!options.source) {
			console.error(chalk.red(`Missing ${options.command} source.`));
			console.error(chalk.dim(`Usage: ${getUsage(options.resourceType, options.command)}`));
			process.exitCode = 1;
			return true;
		}
	}

	const cwd = process.cwd();

	try {
		switch (options.command) {
			case "install":
				return await handleInstall(cwd, options.resourceType, options.source!);
			case "remove":
				return await handleRemove(cwd, options.source!);
			case "discover":
				return await handleDiscover(cwd, options.resourceType);
			case "list":
				return await handleList(cwd, options.resourceType);
			case "update":
				return await handleUpdate(cwd, options.resourceType, options.source);
		}
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error(chalk.red(`Error: ${message}`));
		process.exitCode = 1;
		return true;
	}
}

async function handleInstall(cwd: string, type: ResourceType, source: string): Promise<boolean> {
	// Handle short-form auto-resolution (e.g., "investor-ready-doc-gen" -> "npm:@wayofmono/skill-investor-ready-doc-gen")
	let resolvedSource = source;
	if (!source.startsWith("npm:") && !source.startsWith("git:") && !source.startsWith("http") && !isLocalPath(source)) {
		// Short form: auto-resolve under @wayofmono scope
		const prefix = type === "skill" ? "skill-" : type === "agent" ? "agent-" : "extension-";
		resolvedSource = `npm:@wayofmono/${prefix}${source}`;
		console.log(chalk.dim(`Resolving short form: ${source} → ${resolvedSource}`));
	}

	const resolvedPath = resolveNpmPackagePath(cwd, resolvedSource);
	if (!resolvedPath) {
		console.error(chalk.red(`Package not found: ${source}`));
		console.error(chalk.dim("Make sure the package is installed in node_modules/ first."));
		process.exitCode = 1;
		return true;
	}

	const marker = RESOURCE_MARKERS[type];
	const markerPath = join(resolvedPath, marker);
	if (!existsSync(markerPath)) {
		console.error(chalk.red(`No ${marker} found in ${resolvedPath}`));
		process.exitCode = 1;
		return true;
	}

	let name: string;
	if (type === "skill") {
		const result = loadSkillsFromDir({ dir: resolvedPath, source: "project" });
		if (result.skills.length === 0) {
			console.error(chalk.red(`No valid SKILL.md found in ${resolvedPath}`));
			process.exitCode = 1;
			return true;
		}
		name = result.skills[0].name;
	} else {
		name = resolvedPath.split("/").pop() || resolvedPath.split("\\").pop() || "unknown";
	}

	const entrySource = resolvedSource.startsWith("npm:") ? resolvedSource : `npm:${resolvedSource}`;
	const added = addEntryToManifest(cwd, { source: entrySource, name, path: resolvedPath, type });

	if (added) {
		console.log(chalk.green(`✓ Registered ${type} "${name}" from ${entrySource}`));
	} else {
		console.log(chalk.yellow(`"${name}" already registered.`));
	}

	return true;
}

async function handleRemove(cwd: string, source: string): Promise<boolean> {
	const entry = findEntryInManifest(cwd, source);
	if (!entry) {
		console.error(chalk.red(`No registered entry found matching "${source}".`));
		process.exitCode = 1;
		return true;
	}

	removeEntryFromManifest(cwd, entry.source);
	console.log(chalk.green(`✓ Unregistered "${entry.name}" (${entry.source})`));
	return true;
}

async function handleDiscover(cwd: string, type: ResourceType): Promise<boolean> {
	const discoverer = RESOURCE_DISCOVERERS[type];
	if (!discoverer) {
		console.error(chalk.red(`Discovery not supported for ${type} yet.`));
		return true;
	}

	const found = discoverer(cwd);
	const manifest = readManifest(cwd);
	const registeredSources = new Set(manifest.entries.map((e) => e.source));

	const unregistered = found.filter((f) => !registeredSources.has(f.source));

	if (unregistered.length === 0) {
		if (found.length === 0) {
			console.log(chalk.dim(`No @wayofmono/${type}* packages found in node_modules/.`));
		} else {
			console.log(chalk.green(`All @wayofmono/${type}* packages are already registered.`));
		}
		return true;
	}

	console.log(chalk.bold(`Found ${unregistered.length} unregistered ${type}(s):`));
	for (const item of unregistered) {
		console.log(`  ${item.source} → ${item.path}`);
		console.log(chalk.dim(`    Install: ${APP_NAME} ${type} install ${item.source}`));
	}

	return true;
}

async function handleList(cwd: string, type: ResourceType): Promise<boolean> {
	const entries = getEntriesOfType(cwd, type);

	if (entries.length === 0) {
		console.log(chalk.dim(`No ${type}s registered.`));
		console.log(chalk.dim(`Use "${APP_NAME} ${type} discover" to find available ${type}s.`));
		return true;
	}

	console.log(chalk.bold(`Registered ${type}s (${entries.length}):`));

	for (const entry of entries) {
		const exists = existsSync(entry.path);
		const status = exists ? chalk.green("✓") : chalk.red("✗");
		const statusHint = exists ? "" : chalk.red(" (path not found)");
		console.log(`  ${status} ${entry.name}`);
		console.log(chalk.dim(`     source: ${entry.source}`));
		console.log(chalk.dim(`     path:   ${entry.path}${statusHint}`));

		const pkgJsonPath = join(entry.path, "package.json");
		if (existsSync(pkgJsonPath)) {
			try {
				const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as { version?: string };
				if (pkg.version) {
					console.log(chalk.dim(`     version: ${pkg.version}`));
				}
			} catch {}
		}
	}

	return true;
}

async function handleUpdate(cwd: string, type: ResourceType, source?: string): Promise<boolean> {
	let entries;
	if (source) {
		const found = findEntryInManifest(cwd, source, type);
		if (!found) {
			console.error(chalk.red(`No registered ${type} found matching "${source}".`));
			process.exitCode = 1;
			return true;
		}
		entries = [found];
	} else {
		entries = getEntriesOfType(cwd, type);
		if (entries.length === 0) {
			console.log(chalk.dim(`No ${type}s registered.`));
			return true;
		}
	}

	let updated = 0;
	for (const entry of entries) {
		if (!existsSync(entry.path)) {
			console.error(chalk.yellow(`Warning: path not found for "${entry.name}" (${entry.path})`));
			continue;
		}
		console.log(chalk.green(`✓ ${type} "${entry.name}" is up to date (${entry.source})`));
		updated++;
	}

	if (updated > 0) {
		console.log(chalk.green(`\n${updated} ${type}(s) checked.`));
	}

	return true;
}
