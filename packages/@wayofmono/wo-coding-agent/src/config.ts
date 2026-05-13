import { existsSync, mkdirSync } from "node:fs";
import { resolve, join, isAbsolute } from "node:path";
import { homedir } from "node:os";

export const APP_NAME = "wo-coding-agent";
export const VERSION = "1.0.0";

const WO_DIR_NAME = ".wo";

/**
 * Walk up from cwd to find the project root.
 * A directory is considered a project root if it contains `package.json`.
 * Falls back to `cwd` if nothing found (bare "outside project" mode).
 */
export function findProjectRoot(cwd?: string): string {
  const start = cwd ? resolve(process.cwd(), cwd) : process.cwd();
  let dir = start;

  while (true) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }

  return start;
}

let _projectRoot: string | undefined;
export function getProjectDir(cwd?: string): string {
  if (!_projectRoot) {
    _projectRoot = findProjectRoot(cwd);
  }
  return _projectRoot;
}

export function resetProjectDir(): void {
  _projectRoot = undefined;
}

/**
 * Returns true when running inside a detected npm/node project.
 */
export function isInsideProject(cwd?: string): boolean {
  const root = getProjectDir(cwd);
  return root !== (cwd ? resolve(process.cwd(), cwd) : process.cwd()) || existsSync(join(root, "package.json"));
}

/**
 * Get the wo working directory.
 *
 * ALWAYS project-local when inside a project tree.
 * Only falls back to ~/.wo when there is no project context.
 */
export function getWoDir(cwd?: string): string {
  const projectDir = getProjectDir(cwd);
  const projectWoDir = join(projectDir, WO_DIR_NAME);

  // Inside a project? Use .wo/ in the project root.
  // Create it on first access.
  if (isInsideProject(cwd)) {
    try {
      mkdirSync(projectWoDir, { recursive: true });
    } catch {
      // best-effort
    }
    return projectWoDir;
  }

  // Outside any project — global fallback
  return join(homedir(), WO_DIR_NAME);
}

export function getGlobalWoDir(): string {
  return join(homedir(), WO_DIR_NAME);
}

export function getSessionsDir(cwd?: string): string {
  const dir = join(getWoDir(cwd), "sessions");
  try { mkdirSync(dir, { recursive: true }); } catch { /* best-effort */ }
  return dir;
}

export function getBinDir(cwd?: string): string {
  const dir = join(getWoDir(cwd), "bin");
  try { mkdirSync(dir, { recursive: true }); } catch { /* best-effort */ }
  return dir;
}

export function getConfigPath(cwd?: string): string {
  return join(getWoDir(cwd), "config.json");
}

export function getGlobalConfigPath(): string {
  return join(getGlobalWoDir(), "config.json");
}

export function getAuthDir(cwd?: string): string {
  const dir = join(getWoDir(cwd), "auth");
  try { mkdirSync(dir, { recursive: true }); } catch { /* best-effort */ }
  return dir;
}
