export class TreeSitterNavigator {
	isInTestBlock(node: { type?: string; text?: string; children?: unknown[]; parent?: unknown }): boolean {
		return this.isInside(node, [
			"describe",
			"it",
			"test",
			"it_block",
			"test_block",
		]);
	}

	isInTryCatch(node: { type?: string; text?: string; children?: unknown[]; parent?: unknown }): boolean {
		return this.isInside(node, [
			"try_statement",
			"try_block",
			"catch_clause",
			"catch_block",
			"finally_clause",
		]);
	}

	isInside(
		node: { parent?: unknown } | null | undefined,
		types: string[],
	): boolean {
		if (!node) return false;
		let current: unknown = node;
		while (current) {
			const n = current as { type?: string; parent?: unknown };
			if (n.type && types.includes(n.type)) return true;
			current = n.parent;
		}
		return false;
	}

	findParent(
		node: { parent?: unknown } | null | undefined,
		types: string[],
	): { type?: string; text?: string; children?: unknown[]; parent?: unknown } | null {
		if (!node) return null;
		let current: unknown = node.parent;
		while (current) {
			const n = current as { type?: string; parent?: unknown };
			if (n.type && types.includes(n.type)) return n as { type?: string; text?: string; children?: unknown[]; parent?: unknown };
			current = n.parent;
		}
		return null;
	}
}
