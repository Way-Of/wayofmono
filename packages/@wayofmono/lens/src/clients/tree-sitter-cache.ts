interface CacheEntry {
	content: string;
	languageId: string;
	tree: unknown;
	timestamp: number;
}

export class TreeCache {
	private maxSize: number;
	private verbose: boolean;
	private cache = new Map<string, CacheEntry>();

	constructor(maxSize = 50, verbose = false) {
		this.maxSize = maxSize;
		this.verbose = verbose;
	}

	private dbg(msg: string): void {
		if (this.verbose) console.error(`[tree-cache] ${msg}`);
	}

	get(
		filePath: string,
		content: string,
		languageId: string,
	): unknown | null {
		const entry = this.cache.get(filePath);
		if (!entry) return null;
		if (entry.content !== content || entry.languageId !== languageId) {
			this.cache.delete(filePath);
			return null;
		}
		this.dbg(`Cache hit for ${filePath}`);
		return entry.tree;
	}

	set(
		filePath: string,
		content: string,
		languageId: string,
		tree: unknown,
	): void {
		if (this.cache.size >= this.maxSize) {
			const first = this.cache.keys().next().value;
			if (first !== undefined) this.cache.delete(first);
		}
		this.cache.set(filePath, {
			content,
			languageId,
			tree,
			timestamp: Date.now(),
		});
		this.dbg(`Cached ${filePath}`);
	}

	invalidate(filePath: string): void {
		this.cache.delete(filePath);
	}

	clear(): void {
		this.cache.clear();
	}
}
