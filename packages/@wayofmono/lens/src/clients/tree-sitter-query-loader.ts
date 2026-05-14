import * as fs from "node:fs";
import * as path from "node:path";

export interface TreeSitterQuery {
	id: string;
	query: string;
	metavars: string[];
	language?: string;
	post_filter?: string;
	post_filter_params?: Record<string, string>;
	severity?: string;
	message?: string;
}

export class TreeSitterQueryLoader {
	private queries: TreeSitterQuery[] = [];
	private loaded = false;

	async loadQueries(rootDir: string): Promise<void> {
		if (this.loaded) return;
		const queriesDir = path.join(rootDir, "queries");
		if (!fs.existsSync(queriesDir)) {
			this.loaded = true;
			return;
		}
		this.loadDir(queriesDir);
		this.loaded = true;
	}

	private loadDir(dir: string): void {
		try {
			const entries = fs.readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				const full = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					this.loadDir(full);
				} else if (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml") || entry.name.endsWith(".scm")) {
					try {
						const content = fs.readFileSync(full, "utf-8");
						const idMatch = content.match(/^id:\s*(\S+)/m);
						const langHint = path.basename(dir);
						if (idMatch) {
							this.queries.push({
								id: idMatch[1],
								query: content,
								metavars: this.extractMetavars(content),
								language: this.languageFromDir(langHint),
								severity: content.match(/^severity:\s*(\S+)/m)?.[1],
								message: content.match(/^message:\s*(.+)/m)?.[1]?.trim(),
							});
						}
					} catch {}
				}
			}
		} catch {}
	}

	private languageFromDir(dirName: string): string | undefined {
		const map: Record<string, string> = {
			typescript: "typescript",
			ts: "typescript",
			tsx: "tsx",
			javascript: "javascript",
			js: "javascript",
			python: "python",
			py: "python",
			rust: "rust",
			rs: "rust",
			go: "go",
			java: "java",
			ruby: "ruby",
			rb: "ruby",
		};
		return map[dirName];
	}

	private extractMetavars(content: string): string[] {
		const vars: string[] = [];
		const regex = /@([A-Z_][A-Z0-9_]*)/g;
		let match: RegExpExecArray | null;
		while ((match = regex.exec(content)) !== null) {
			if (!vars.includes(match[1])) vars.push(match[1]);
		}
		return vars;
	}

	findMatchingQuery(
		pattern: string,
		languageId: string,
	): TreeSitterQuery | undefined {
		return this.queries.find(
			(q) =>
				(!q.language || q.language === languageId) &&
				q.message?.toLowerCase().includes(pattern.toLowerCase()),
		);
	}

	getQueries(): TreeSitterQuery[] {
		return this.queries;
	}
}
