import * as fs from "node:fs";
import * as path from "node:path";

export function resolvePackagePath(
	importMetaUrl: string,
	...segments: string[]
): string {
	const filePath = importMetaUrl.startsWith("file://")
		? new URL(importMetaUrl).pathname
		: importMetaUrl;

	let dir = path.dirname(filePath);
	for (let i = 0; i < 10; i++) {
		const pkgPath = path.join(dir, "package.json");
		if (fs.existsSync(pkgPath)) {
			return path.join(dir, ...segments);
		}
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return path.join(path.dirname(filePath), ...segments);
}
