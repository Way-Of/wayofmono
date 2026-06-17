import { type DetectResult, type OsInfo, type DesktopInfo } from "./detect/types.ts";
import { resolvePlatformPaths } from "./adapt/paths.ts";

let _logFile: string | null = null;
let _debugMode = false;

const SECRET_PATTERNS = [
  /(GITHUB_TOKEN|GH_TOKEN|NEXTAUTH_SECRET|GITHUB_CLIENT_SECRET)=['"]?[^\s'"]+/g,
  /(Authorization|Bearer)\s+[^\s]+/g,
  /(ssh-rsa|ssh-ed25519|-----BEGIN[^R])\s+[^\s]+/g,
];

export function initLogger(osResult: DetectResult<OsInfo>, desktopResult: DetectResult<DesktopInfo>, debug = false): string {
  _debugMode = debug;
  const paths = resolvePlatformPaths(osResult, desktopResult);
  try {
    Deno.mkdirSync(paths.logDir, { recursive: true });
    _logFile = `${paths.logDir}/install.log`;
    const header = `=== WOMONO HARNESS INSTALL LOG ===\nStarted: ${new Date().toISOString()}\nPlatform: ${osResult.value.platform}\n${"─".repeat(60)}\n\n`;
    Deno.writeTextFileSync(_logFile, header, { append: false });
  } catch {
    _logFile = null;
  }
  return _logFile || "(no log file)";
}

function redact(line: string): string {
  let result = line;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, (match) => {
      const eq = match.indexOf("=");
      if (eq > 0) return match.slice(0, eq + 1) + "[REDACTED]";
      return "[REDACTED]";
    });
  }
  return result;
}

export function log(module: string, message: string): void {
  const line = `[${module}] ${message}`;
  if (_debugMode) console.log(`  ${line}`);
  if (_logFile) {
    try {
      Deno.writeTextFileSync(_logFile, redact(line) + "\n", { append: true });
    } catch {}
  }
}

export function logDetect<T>(module: string, result: DetectResult<T>): void {
  const line = `${module}: ${JSON.stringify(result.value)} (confidence: ${result.confidence}, source: ${result.source})`;
  if (_debugMode) console.log(`  ${line}`);
  if (_logFile) {
    try {
      Deno.writeTextFileSync(_logFile, redact(line) + "\n", { append: true });
    } catch {}
  }
}

export function getLogPath(): string | null {
  return _logFile;
}
