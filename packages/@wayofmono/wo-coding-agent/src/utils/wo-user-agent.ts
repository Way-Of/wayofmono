export function getWoUserAgent(version: string): string {
	const runtime = process.versions.bun ? `bun/${process.versions.bun}` : `node/${process.version}`;
	return `wocode/${version} (${process.platform}; ${runtime}; ${process.arch})`;
}

// Backward-compat alias
export const getPiUserAgent = getWoUserAgent;
