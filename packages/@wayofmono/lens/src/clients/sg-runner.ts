import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { AstGrepMatch, SgMatch } from "./ast-grep-types.js";

export class SgRunner {
	private verbose: boolean;

	constructor(verbose = false) {
		this.verbose = verbose;
	}

	private log(msg: string): void {
		if (this.verbose) console.error(`[sg] ${msg}`);
	}

	async ensureAvailable(): Promise<boolean> {
		if (this.isAvailable()) return true;
		try {
			spawnSync("npm", ["install", "-g", "@ast-grep/cli"], {
				encoding: "utf-8",
				timeout: 60000,
			});
			return this.isAvailable();
		} catch {
			return false;
		}
	}

	isAvailable(): boolean {
		try {
			const result = spawnSync("npx", ["sg", "--version"], {
				encoding: "utf-8",
				timeout: 5000,
			});
			return result.status === 0;
		} catch {
			return false;
		}
	}

	async exec(
		args: string[],
	): Promise<{ matches: AstGrepMatch[]; error?: string }> {
		try {
			const result = spawnSync("npx", ["sg", ...args], {
				encoding: "utf-8",
				timeout: 30000,
			});

			if (result.error) {
				return { matches: [], error: result.error.message };
			}

			const output = result.stdout || result.stderr || "";
			if (!output.trim()) {
				return { matches: [] };
			}

			const parsed = JSON.parse(output);
			const items = Array.isArray(parsed) ? parsed : [];
			const matches: AstGrepMatch[] = items.map(
				(item: { text?: string; file?: string }) => ({
					text: item.text || "",
					file: item.file || "",
				}),
			);

			return { matches };
		} catch (err) {
			return {
				matches: [],
				error: err instanceof Error ? err.message : String(err),
			};
		}
	}

	tempScan(
		dir: string,
		ruleId: string,
		ruleYaml: string,
		timeout = 30000,
	): AstGrepMatch[] {
		const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sg-"));
		const ruleFile = path.join(tmpDir, `${ruleId}.yml`);
		try {
			fs.writeFileSync(ruleFile, ruleYaml, "utf-8");
			const result = spawnSync(
				"npx",
				[
					"sg",
					"scan",
					"--config",
					tmpDir,
					"--json",
					dir,
				],
				{
					encoding: "utf-8",
					timeout,
				},
			);
			const output = result.stdout || result.stderr || "";
			if (!output.trim()) return [];
			const parsed = JSON.parse(output);
			const items = Array.isArray(parsed) ? parsed : [];
			return items.map(
				(item: { text?: string; file?: string }) => ({
					text: item.text || "",
					file: item.file || "",
				}),
			);
		} catch {
			return [];
		} finally {
			try {
				fs.rmSync(tmpDir, { recursive: true, force: true });
			} catch {}
		}
	}

	formatMatches(
		matches: SgMatch[],
		isDryRun: boolean,
		_maxLines: number,
		showModeIndicator: boolean,
	): string {
		if (matches.length === 0) return "";
		const label = isDryRun ? "[dry-run]" : "[sg]";
		const mode = showModeIndicator ? " [ast-grep mode]" : "";
		let output = `${label}${mode} ${matches.length} match(es):\n`;
		for (const m of matches.slice(0, 10)) {
			output += `  ${m.file}:${m.line}:${m.column} ${m.message}`;
			if (m.severity) output += ` (${m.severity})`;
			output += "\n";
		}
		if (matches.length > 10) {
			output += `  ... and ${matches.length - 10} more\n`;
		}
		return output;
	}
}
