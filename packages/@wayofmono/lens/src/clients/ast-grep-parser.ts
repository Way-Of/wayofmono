import type { AstGrepDiagnostic, RuleDescription } from "./ast-grep-types.js";

export class AstGrepParser {
	private getRuleDescription: (id: string) => RuleDescription | undefined;
	private mapSeverity: (sev: string) => AstGrepDiagnostic["severity"];

	constructor(
		getRuleDescription: (id: string) => RuleDescription | undefined,
		mapSeverity: (sev: string) => AstGrepDiagnostic["severity"],
	) {
		this.getRuleDescription = getRuleDescription;
		this.mapSeverity = mapSeverity;
	}

	parseOutput(output: string, _absolutePath: string): AstGrepDiagnostic[] {
		const diagnostics: AstGrepDiagnostic[] = [];
		try {
			const parsed = JSON.parse(output);
			const items = Array.isArray(parsed) ? parsed : [parsed];
			for (const item of items) {
				diagnostics.push({
					rule: item.rule_id || item.rule || "unknown",
					severity: this.mapSeverity(item.severity || "hint"),
					line: item.line || item.range?.start?.line || 1,
					endLine: item.endLine || item.range?.end?.line || item.line || 1,
					fix: item.replacement || item.fix,
					ruleDescription: this.getRuleDescription(
						item.rule_id || item.rule || "",
					),
				});
			}
		} catch {
			// Not JSON — try line-by-line
			for (const line of output.split("\n")) {
				if (!line.trim()) continue;
				diagnostics.push({
					rule: "parse",
					severity: "hint",
					line: 1,
					endLine: 1,
					ruleDescription: { message: line.trim() },
				});
			}
		}
		return diagnostics;
	}
}
