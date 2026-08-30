import * as fs from "node:fs";
import * as path from "node:path";
import type { RuleDescription } from "./ast-grep-types.js";

export class AstGrepRuleManager {
	private ruleDir: string;
	private log: (msg: string) => void;

	constructor(ruleDir: string, log: (msg: string) => void) {
		this.ruleDir = ruleDir;
		this.log = log;
	}

	loadRuleDescriptions(): Map<string, RuleDescription> {
		const descriptions = new Map<string, RuleDescription>();
		if (!fs.existsSync(this.ruleDir)) return descriptions;

		const entries = fs.readdirSync(this.ruleDir, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.name.endsWith(".yml") && !entry.name.endsWith(".yaml"))
				continue;
			const filePath = path.join(this.ruleDir, entry.name);
			try {
				const content = fs.readFileSync(filePath, "utf-8");
				const idMatch = content.match(/^id:\s*(\S+)/m);
				const msgMatch = content.match(/^message:\s*(.+)/m);
				const noteMatch = content.match(/^note:\s*(.+)/m);
				if (idMatch) {
					descriptions.set(idMatch[1], {
						message: msgMatch?.[1]?.trim() || idMatch[1],
						note: noteMatch?.[1]?.trim(),
					});
				}
			} catch {
				this.log(`Failed to parse rule: ${entry.name}`);
			}
		}

		this.log(
			`Loaded ${descriptions.size} rule descriptions from ${this.ruleDir}`,
		);
		return descriptions;
	}
}
