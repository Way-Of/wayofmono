export function getUserAgent(version: string): string {
  const runtime = process.versions.bun ? `bun/${process.versions.bun}` : `node/${process.version}`;
  return `wo/${version} (${process.platform}; ${runtime}; ${process.arch})`;
}
