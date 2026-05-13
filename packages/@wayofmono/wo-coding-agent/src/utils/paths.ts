import { realpathSync } from "node:fs";
import { isAbsolute, relative, resolve as resolvePath, sep } from "node:path";

export function canonicalizePath(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

export function isLocalPath(value: string): boolean {
  const trimmed = value.trim();
  if (
    trimmed.startsWith("npm:") ||
    trimmed.startsWith("git:") ||
    trimmed.startsWith("github:") ||
    trimmed.startsWith("http:") ||
    trimmed.startsWith("https:") ||
    trimmed.startsWith("ssh:")
  ) {
    return false;
  }
  return true;
}

function resolveAgainstCwd(filePath: string, cwd: string): string {
  return isAbsolute(filePath) ? resolvePath(filePath) : resolvePath(cwd, filePath);
}

export function getCwdRelativePath(filePath: string, cwd: string): string | undefined {
  const resolvedCwd = resolvePath(cwd);
  const resolvedPath = resolveAgainstCwd(filePath, resolvedCwd);
  const relativePath = relative(resolvedCwd, resolvedPath);
  const isInsideCwd =
    relativePath === "" ||
    (relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath));

  return isInsideCwd ? relativePath || "." : undefined;
}

export function formatPathRelativeToCwdOrAbsolute(filePath: string, cwd: string): string {
  const absolutePath = resolveAgainstCwd(filePath, cwd);
  return (getCwdRelativePath(absolutePath, cwd) ?? absolutePath).split(sep).join("/");
}
