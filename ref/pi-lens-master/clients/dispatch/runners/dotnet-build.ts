import * as fs from "node:fs";
import * as path from "node:path";
import { safeSpawn } from "../../safe-spawn.js";
import { PRIORITY } from "../priorities.js";
import type {
	Diagnostic,
	DispatchContext,
	RunnerDefinition,
	RunnerResult,
} from "../types.js";
import { createAvailabilityChecker } from "./utils/runner-helpers.js";

const dotnet = createAvailabilityChecker("dotnet", ".exe");

function findProjectTarget(cwd: string): string | undefined {
	const entries = fs.readdirSync(cwd);
	const solution = entries.find((entry) => /\.(sln|slnx)$/i.test(entry));
	if (solution) return solution;
	return entries.find((entry) => /\.(csproj)$/i.test(entry));
}

function parseDotnetBuildOutput(raw: string, filePath: string): Diagnostic[] {
	const diagnostics: Diagnostic[] = [];
	for (const line of raw.split(/\r?\n/)) {
		const match = line.match(/^(.*?\.cs)\((\d+),(\d+)\):\s+(error|warning)\s+([A-Z]+[0-9]+):\s+(.+?)(?:\s+\[[^\]]+\])?$/i);
		if (!match) continue;

		const [, reportedFile, lineStr, colStr, severityLabel, rule, message] = match;
		const resolvedReported = path.resolve(reportedFile.trim());
		const resolvedTarget = path.resolve(filePath);
		if (resolvedReported !== resolvedTarget) continue;

		const severity = severityLabel.toLowerCase() === "error" ? "error" : "warning";
		const lineNum = Number.parseInt(lineStr, 10) || 1;
		const colNum = Number.parseInt(colStr, 10) || 1;
		diagnostics.push({
			id: `dotnet-build-${rule}-${lineNum}-${colNum}`,
			message: `[${rule}] ${message.trim()}`,
			filePath,
			line: lineNum,
			column: colNum,
			severity,
			semantic: severity === "error" ? "blocking" : "warning",
			tool: "dotnet-build",
			rule,
			fixable: false,
		});
	}

	return diagnostics;
}

const dotnetBuildRunner: RunnerDefinition = {
	id: "dotnet-build",
	appliesTo: ["csharp"],
	priority: PRIORITY.GENERAL_ANALYSIS,
	enabledByDefault: true,
	skipTestFiles: false,

	async run(ctx: DispatchContext): Promise<RunnerResult> {
		const cwd = ctx.cwd || process.cwd();
		if (!dotnet.isAvailable(cwd)) {
			return { status: "skipped", diagnostics: [], semantic: "none" };
		}

		const cmd = dotnet.getCommand(cwd);
		if (!cmd) {
			return { status: "skipped", diagnostics: [], semantic: "none" };
		}

		const target = findProjectTarget(cwd);
		if (!target) {
			return { status: "skipped", diagnostics: [], semantic: "none" };
		}

		const result = safeSpawn(
			cmd,
			["build", target, "--nologo", "--verbosity", "minimal"],
			{
				cwd,
				timeout: 60000,
			},
		);
		const raw = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();

		if (result.status === 0 && !raw) {
			return { status: "succeeded", diagnostics: [], semantic: "none" };
		}

		const diagnostics = parseDotnetBuildOutput(raw, ctx.filePath);
		if (diagnostics.length === 0) {
			return {
				status: result.status === 0 ? "succeeded" : "failed",
				diagnostics: [],
				semantic: "warning",
				rawOutput: raw,
			};
		}

		const hasErrors = diagnostics.some((d) => d.severity === "error");
		return {
			status: hasErrors ? "failed" : "succeeded",
			diagnostics,
			semantic: hasErrors ? "blocking" : "warning",
		};
	},
};

export default dotnetBuildRunner;
