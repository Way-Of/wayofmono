const EXCLUDED_DIRS = new Set([
	"node_modules",
	".git",
	".svn",
	".hg",
	"dist",
	"build",
	".next",
	".cache",
	"target",
	"__pycache__",
	".venv",
	"venv",
	".tox",
	"coverage",
	".nyc_output",
]);

export function isExcludedDirName(name: string): boolean {
	return EXCLUDED_DIRS.has(name);
}
