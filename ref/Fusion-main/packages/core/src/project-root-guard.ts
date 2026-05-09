/**
 * Guard helpers for store constructors that expect a project root and append
 * `.fusion` internally. Passing an existing `.fusion` directory produces the
 * nested `.fusion/.fusion` tree we want to fail loudly on.
 */

const FUSION_DIR_SUFFIX = /(?:^|[\\/])\.fusion(?:[\\/])?$/;

export function assertProjectRootDir(rootDir: string, caller: string): void {
  if (FUSION_DIR_SUFFIX.test(rootDir)) {
    throw new Error(
      `[fusion] ${caller} expected a project root, got a .fusion directory: ${rootDir}\n` +
      "Pass the project root instead; this store appends `.fusion` internally.",
    );
  }
}
