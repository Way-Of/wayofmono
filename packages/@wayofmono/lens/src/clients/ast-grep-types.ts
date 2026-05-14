export interface AstGrepMatch {
	text: string;
	file: string;
	range?: { start: { line: number }; end: { line: number } };
	labels?: Array<{ range: { start: { line: number } } }>;
}

export interface SgMatch {
	file: string;
	line: number;
	column: number;
	message: string;
	severity: string;
	rule_id: string;
	replacement?: string;
	fix?: string;
}

export interface RuleDescription {
	message: string;
	note?: string;
}

export interface AstGrepDiagnostic {
	rule: string;
	severity: "error" | "warning" | "info" | "hint";
	line: number;
	endLine: number;
	fix?: string;
	ruleDescription?: RuleDescription;
}
