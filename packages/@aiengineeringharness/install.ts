#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env
/**
 * AI Engineering Harness Installer
 *
 * Install as CLI (recommended):
 *   deno install -Agf --no-lock --reload -n ai-harness \
 *     https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts
 *
 * Or using built-in --install-cli (auto-resolves URL):
 *   deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
 *
 * Then:
 *   ai-harness --tool=claude
 *
 * Direct run:
 *   deno run -A install.ts --tool=claude
 *
 * Run --help for full usage.
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { ensureDir } from "jsr:@std/fs@1/ensure-dir";
import { join } from "jsr:@std/path@1/join";
import { dirname } from "jsr:@std/path@1/dirname";
import { relative } from "jsr:@std/path@1/relative";

function normalizeSlashes(p: string): string {
  if (Deno.build.os === "windows") return p.replace(/\\/g, "/");
  return p;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FileEntry {
  src: string;
  dest: string;
}

interface Component {
  description: string;
  files: FileEntry[];
}

interface ToolConfig {
  target: string;
  components: Record<string, Component>;
}

interface Manifest {
  version: string;
  tools: Record<string, ToolConfig>;
}

// ---------------------------------------------------------------------------
// ANSI colors — orange Matrix style
// ---------------------------------------------------------------------------

const C = {
  orange: "\x1b[38;5;208m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
  green: "\x1b[38;5;82m",
  red: "\x1b[38;5;196m",
  yellow: "\x1b[38;5;226m",
  cyan: "\x1b[38;5;51m",
};

function o(s: string): string {
  return `${C.orange}${s}${C.reset}`;
}
function ob(s: string): string {
  return `${C.bold}${C.orange}${s}${C.reset}`;
}
function od(s: string): string {
  return `${C.dim}${C.orange}${s}${C.reset}`;
}
function green(s: string): string {
  return `${C.green}${s}${C.reset}`;
}
function red(s: string): string {
  return `${C.red}${s}${C.reset}`;
}
function yellow(s: string): string {
  return `${C.yellow}${s}${C.reset}`;
}
function cyan(s: string): string {
  return `${C.cyan}${s}${C.reset}`;
}

function check(): string {
  return green("✓");
}
function cross(): string {
  return red("✗");
}
function warn(): string {
  return yellow("⚠");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function resolveToken(): string | null {
  // 1. GITHUB_TOKEN env var (CI-friendly, standard convention)
  const envToken = Deno.env.get("GITHUB_TOKEN") ?? Deno.env.get("GH_TOKEN");
  if (envToken) return envToken;
  // 2. No token — unauthenticated (works for public repos)
  return null;
}

function fetchWithAuth(url: string, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { headers });
}

const HARNESS_VERSION_FILENAME = ".harness-version";

// ---------------------------------------------------------------------------
// Version / update tracking
// ---------------------------------------------------------------------------

function versionFileFor(targetDir: string): string {
  return join(targetDir, HARNESS_VERSION_FILENAME);
}

async function readInstalledVersion(targetDir: string): Promise<string | null> {
  try {
    return (await Deno.readTextFile(versionFileFor(targetDir))).trim();
  } catch {
    return null;
  }
}

async function writeInstalledVersion(targetDir: string, version: string): Promise<void> {
  await ensureDir(targetDir);
  await Deno.writeTextFile(versionFileFor(targetDir), version + "\n");
}

function parseVersion(v: string): number[] {
  return v.split(/[.\-]/).map((s) => {
    const n = parseInt(s, 10);
    return isNaN(n) ? 0 : n;
  });
}

function isNewerVersion(current: string, latest: string): boolean {
  const a = parseVersion(current);
  const b = parseVersion(latest);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const va = a[i] ?? 0;
    const vb = b[i] ?? 0;
    if (vb > va) return true;
    if (vb < va) return false;
  }
  return false;
}

async function checkForUpdates(manifest: Manifest, targetDir: string, toolName: string): Promise<void> {
  const installed = await readInstalledVersion(targetDir);
  const current = manifest.version;
  if (installed === null) {
    console.log(`  ${od(toolName.padEnd(12))} ${green("new")}  ${od("v" + current)}`);
    return;
  }
  if (installed === current) {
    console.log(`  ${od(toolName.padEnd(12))} ${od("v" + current)}`);
    return;
  }
  if (isNewerVersion(installed, current)) {
    console.log(`  ${od(toolName.padEnd(12))} ${yellow("UPDATE")}  ${od("v" + installed)} ${o("→")} ${o("v" + current)}`);
  } else {
    console.log(`  ${od(toolName.padEnd(12))} ${od("v" + current)}  ${od("(local v" + installed + ")")}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function expandHome(p: string): string {
  if (p.startsWith("~/") || p === "~") {
    const home = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? "";
    return home + p.slice(1);
  }
  return p;
}

function isRemote(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/** Derive the base raw GitHub URL from the script's import.meta.url */
function deriveBaseUrl(): string | null {
  const url = import.meta.url;
  if (!isRemote(url)) return null;
  // e.g. https://raw.githubusercontent.com/Way-Of/wayofmono/<SHA>/packages/@aiengineeringharness/install.ts
  return url.slice(0, url.lastIndexOf("/") + 1);
}

/** Get the directory containing this script (file:// or https://) */
function scriptDir(): string {
  const url = import.meta.url;
  if (url.startsWith("file://")) {
    let p = new URL(".", url).pathname;
    if (Deno.build.os === "windows" && p.startsWith("/")) p = p.slice(1);
    return p;
  }
  return url.slice(0, url.lastIndexOf("/") + 1);
}

async function loadManifest(sd: string, token: string | null): Promise<Manifest> {
  const isRemote = sd.startsWith("http://") || sd.startsWith("https://");
  if (isRemote) {
    const manifestUrl = `${sd}manifest.json`;
    const resp = await fetchWithAuth(manifestUrl, token);
    if (!resp.ok) {
      if ((resp.status === 403 || resp.status === 404) && !token) {
        const cloneDir = Deno.build.os === "windows" ? "%TEMP%\\wom" : "/tmp/wom";
        const sep = Deno.build.os === "windows" ? "\\" : "/";
        throw new Error(
          `Failed to fetch manifest (${resp.status}). If this is a private repository, clone and run locally:\n\n` +
          `  git clone https://github.com/Way-Of/wayofmono.git ${cloneDir} --depth=1 -q\n` +
          `  GITHUB_TOKEN=$(gh auth token) deno run -A ${cloneDir}${sep}packages${sep}@aiengineeringharness${sep}install.ts --tool=claude`
        );
      }
      throw new Error(`Failed to fetch manifest from ${manifestUrl}: ${resp.status} ${resp.statusText}`);
    }
    return resp.json() as Promise<Manifest>;
  }
  const text = await Deno.readTextFile(join(sd, "manifest.json"));
  return JSON.parse(text) as Manifest;
}

async function readFileIfExists(path: string): Promise<string | null> {
  try {
    return await Deno.readTextFile(path);
  } catch {
    return null;
  }
}

async function fetchRemoteFile(baseUrl: string, src: string, token: string | null): Promise<string> {
  const url = `${baseUrl}${src}`;
  const resp = await fetchWithAuth(url, token);
  if (!resp.ok) {
    if ((resp.status === 403 || resp.status === 404) && !token) {
      throw new Error(
        `Failed to fetch ${src} (${resp.status}). Private repo? Set GITHUB_TOKEN=$(gh auth token)`
      );
    }
    throw new Error(`Failed to fetch ${url}: ${resp.status} ${resp.statusText}`);
  }
  return resp.text();
}

/**
 * LCS-based unified diff. Computes the longest common subsequence of lines
 * and renders added/removed lines with +/- prefixes.
 */
function patchDenoWrapperReload(): void {
  // Patches the deno run wrapper to embed --reload, ensuring
  // that ai-harness --update always fetches fresh from the URL.
  const home = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE");
  if (!home) return; // can't determine home dir
  const denoBin = Deno.env.get("DENO_INSTALL_ROOT") || join(home, ".deno", "bin");
  const wrapperName = Deno.build.os === "windows" ? "ai-harness.cmd" : "ai-harness";
  const wrapperPath = join(denoBin, wrapperName);
  try {
    let content = Deno.readTextFileSync(wrapperPath);
    // Already wired? Different tools may add flags in different order
    if (/deno run --reload/.test(content)) return;
    // Insert --reload after 'deno run'
    content = content.replace(/\bdeno run\b/, "deno run --reload");
    Deno.writeTextFileSync(wrapperPath, content);
  } catch {
    // non-fatal — wrapper may not exist yet
  }
}

function renderDiff(oldText: string, newText: string): string {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  // Build LCS table
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = oldLines[i - 1] === newLines[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack to produce diff
  const lines: string[] = [];
  let i = m, j = n;
  const stack: string[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      stack.push(`  ${oldLines[i - 1]}`);
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push(`+ ${newLines[j - 1]}`);
      j--;
    } else {
      stack.push(`- ${oldLines[i - 1]}`);
      i--;
    }
  }
  // Reverse since we backtracked
  for (let k = stack.length - 1; k >= 0; k--) {
    lines.push(stack[k]);
  }
  return lines.join("\n");
}

async function promptConfirm(message: string): Promise<boolean> {
  return confirm(message);
}

function printHelp(): void {
  const logo = [
    "██╗    ██╗ ██████╗     ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗",
    "██║    ██║██╔═══██╗    ████╗ ████║██╔═══██╗████╗  ██║██╔═══██╗",
    "██║ █╗ ██║██║   ██║    ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║",
    "██║███╗██║██║   ██║    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║",
    "╚███╔███╔╝╚██████╔╝    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝",
    " ╚══╝╚══╝  ╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝",
  ];
  for (const line of logo) console.log(o(`  ${line}`));
  console.log();
  console.log(`  ${ob("⟡ HARNESS CLI")}  ${od("ai-harness — all commands")}  ${od("─".repeat(20))}\n`);
  console.log(`  ${o("┌")}${od("─".repeat(54))}${o("┐")}`);
  console.log(`  ${o("│")}  ${C.bold}deno run -A <url> --tool=all --yes${C.reset}          ${o("│")}`);
  console.log(`  ${o("│")}  ${C.bold}ai-harness --tool=claude${C.reset}                       ${o("│")}`);
  console.log(`  ${o("│")}  ${C.bold}ai-harness --update${C.reset}                            ${o("│")}`);
  console.log(`  ${o("│")}  ${C.bold}ai-harness --help${C.reset}                              ${o("│")}`);
  console.log(`  ${o("└")}${od("─".repeat(54))}${o("┘")}`);
  console.log();

  const INSTALL_URL = "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts";
  const sections: Array<{ title: string; items: Array<{ cmd: string; desc: string }> }> = [
    {
      title: "quick start (one-liner)",
      items: [
        { cmd: `deno run -A ${INSTALL_URL} --install-cli`, desc: "Install CLI with Matrix output" },
        { cmd: "ai-harness --tool=all --yes", desc: "Install all tool configs at once" },
      ],
    },
    {
      title: "install & update",
      items: [
        { cmd: "--tool=<name>", desc: "Install tool config (claude, opencode, gemini, pi, wocoder, antigravity, codex, all)" },
        { cmd: "--install-cli", desc: "Install/update CLI binary with Matrix output" },
        { cmd: "--update", desc: "Full harness sync: CLI + docs + all tools + stale cleanup + validate" },
        { cmd: "--yes, -y", desc: "Skip confirmation prompts" },
        { cmd: "--dry-run, -n", desc: "Preview without writing files" },
        { cmd: "--skill=<name>", desc: "Specific component names to install (comma-separated)" },
        { cmd: "--interactive, -i", desc: "Interactive checkbox picker" },
        { cmd: "--local, -l", desc: "Install to project-local directories" },
      ],
    },
    {
      title: "maintenance",
      items: [
        { cmd: "--prune", desc: "Interactive: review & remove non-manifest skills across all tools" },
        { cmd: "--check", desc: "Check installed version vs manifest" },
        { cmd: "--compliance", desc: "Validate all tools match manifest — no missing/stale/dangling files" },
        { cmd: "--uninstall=<name>", desc: "Remove installed files (claude, opencode, all, ...)" },
        { cmd: "--no-validate", desc: "Skip compliance validation after --update" },
      ],
    },
    {
      title: "sync & reporting",
      items: [
        { cmd: "--sync-docs", desc: "Sync canonical skills to all tool directories" },
        { cmd: "--sync-docs --check", desc: "Preview skill sync without making changes" },
        { cmd: "--import-ref", desc: "Import ref skills/agents to all platforms" },
        { cmd: "--report-skills", desc: "Report local skills to dashboard telemetry API" },
        { cmd: "--report-url=<url>", desc: "Dashboard URL for skill reporting" },
      ],
    },
    {
      title: "other",
      items: [
        { cmd: "--mode=repo", desc: "Show clone + stow instructions" },
        { cmd: "--dest=<path>", desc: "Clone destination for --mode=repo" },
        { cmd: "--help, -h", desc: "Show this help" },
      ],
    },
  ];

  for (const section of sections) {
    console.log(`  ${ob("▸ " + section.title)}`);
    console.log(`  ${od("─".repeat(40))}`);
    for (const item of section.items) {
      const cmd = `  ${o("·")} ${C.bold}${item.cmd.padEnd(32)}${C.reset} ${od(item.desc)}`;
      console.log(cmd);
    }
    console.log();
  }

  console.log(`  ${ob("⟡ QUICK START")}\n`);
  console.log(`  ${o("1.")} ${C.bold}deno run -A <url> --install-cli${C.reset}`);
  console.log(`  ${o("2.")} ${C.bold}ai-harness --tool=all --yes${C.reset}`);
  console.log(`  ${o("3.")} ${C.bold}ai-harness --update${C.reset}`);
  console.log();
}

function printRepoModeInstructions(dest: string): void {
  const expanded = expandHome(dest);
  console.log(`
Repo / Power-User Mode (GNU Stow)
==================================
This mode clones the repository and uses GNU Stow to create symlinks.
The repo must remain at a stable path on your system.

  1. Install GNU Stow:
       macOS:          brew install stow
       Ubuntu/Debian:  sudo apt install stow
       Fedora:         sudo dnf install stow
       Arch:           sudo pacman -S stow

   2. Clone the repository:
       git clone https://github.com/Way-Of/wayofmono.git ${expanded}
       cd ${expanded}/packages/@aiengineeringharness

   3. Install symlinks:
       ./setup.sh claude             # Claude Code
       ./setup.sh opencode           # OpenCode
       ./setup.sh gemini             # Gemini CLI
       ./setup.sh pi                 # Pi
       ./setup.sh wocoder            # Wo Coder
       ./setup.sh antigravity        # Antigravity
       ./setup.sh all                # All six

  4. Update after pulling changes:
       ./setup.sh all --restow
`.trim());
}

// ---------------------------------------------------------------------------
// Interactive picker using stdin (no external dependency)
// ---------------------------------------------------------------------------

async function interactivePicker(
  components: Array<{ name: string; description: string }>,
  preSelected?: Set<number>,
): Promise<string[]> {
  // Fall back to text prompt when stdin is not a TTY (piped)
  if (!Deno.stdin.isTerminal()) {
    const allChecked = preSelected && preSelected.size === components.length;
    console.log(`\nAvailable components (enter numbers separated by spaces, or '${allChecked ? "none" : "all"}'):\n`);
    components.forEach((c, i) => {
      const mark = preSelected?.has(i) ? o("✧") : " ";
      console.log(`  ${mark} ${String(i + 1).padStart(2)}. [${c.name}] ${od(c.description)}`);
    });
    console.log();
    Deno.stdout.writeSync(new TextEncoder().encode(`Select (e.g. 1 3 5, or '${allChecked ? "none" : "all"}'): `));
    const input = (await readLine()).toLowerCase();
    if (allChecked && (input === "" || input === "none")) return [];
    if (input === "all" || input === "") return components.map((c) => c.name);
    const indices = input.split(/\s+/).map(Number).filter((n) => !isNaN(n) && n >= 1 && n <= components.length);
    return indices.map((i) => components[i - 1].name);
  }

  const selected = preSelected ? new Set(preSelected) : new Set<number>();
  let cursor = 0;

  console.log(`\n  ${od("↑/↓ navigate · Space toggle · Enter confirm · a select all/none")}\n`);

  function render() {
    const moveUp = `\x1b[${components.length + 1}A`;
    Deno.stdout.writeSync(new TextEncoder().encode(moveUp));
    for (let i = 0; i < components.length; i++) {
      const check = selected.has(i) ? `${o("✧")}` : " ";
      const pointer = i === cursor ? `${o("▸")}` : " ";
      const desc = components[i].description.length > 60
        ? components[i].description.slice(0, 57) + "..."
        : components[i].description;
      Deno.stdout.writeSync(
        new TextEncoder().encode(` ${pointer} ${check}  ${C.bold}${components[i].name}${C.reset}  ${od(desc)}\x1b[K\n`),
      );
    }
  }

  for (let i = 0; i < components.length; i++) {
    const check = selected.has(i) ? `${o("✧")}` : " ";
    const pointer = i === cursor ? `${o("▸")}` : " ";
    const desc = components[i].description.length > 60
      ? components[i].description.slice(0, 57) + "..."
      : components[i].description;
    console.log(` ${pointer} ${check}  ${C.bold}${components[i].name}${C.reset}  ${od(desc)}`);
  }

  Deno.stdin.setRaw(true);
  try {
    const buf = new Uint8Array(8);
    while (true) {
      const n = await Deno.stdin.read(buf);
      if (n === null) break;
      const byte = buf[0];

      if (byte === 0x03) {
        Deno.stdout.writeSync(new TextEncoder().encode("\n"));
        Deno.exit(0);
      }

      if (byte === 0x0d || byte === 0x0a) break;

      if (byte === 0x61 || byte === 0x41) {
        if (selected.size === components.length) {
          selected.clear();
        } else {
          for (let i = 0; i < components.length; i++) selected.add(i);
        }
        render();
        continue;
      }

      if (byte === 0x1b && n >= 3) {
        const seq = new TextDecoder().decode(buf.slice(0, 3));
        if (seq === "\x1b[A") {
          cursor = cursor > 0 ? cursor - 1 : components.length - 1;
          render();
        } else if (seq === "\x1b[B") {
          cursor = cursor < components.length - 1 ? cursor + 1 : 0;
          render();
        }
        continue;
      }

      if (byte === 0x20) {
        if (selected.has(cursor)) selected.delete(cursor);
        else selected.add(cursor);
        render();
        continue;
      }
    }
  } finally {
    Deno.stdin.setRaw(false);
  }

  Deno.stdout.writeSync(new TextEncoder().encode(`\x1b[${components.length + 1}A\x1b[J`));

  if (selected.size === 0) {
    console.log(`  ${od("none selected")}`);
    return [];
  }

  console.log(`\n  ${o("└")} ${green(String(selected.size))} selected:`);
  for (const i of selected) {
    console.log(`     ${o("✧")} ${C.bold}${components[i].name}${C.reset}`);
  }
  console.log();

  return Array.from(selected).sort((a, b) => a - b).map((i) => components[i].name);
}

// ---------------------------------------------------------------------------
// Stale file cleanup — delete files not in manifest
// ---------------------------------------------------------------------------

/**
 * Recursively collect all file paths under a directory.
 * Returns paths relative to baseDir.
 */
async function collectFilePaths(dir: string, baseDir: string): Promise<string[]> {
  const results: string[] = [];
  try {
    for await (const entry of Deno.readDir(dir)) {
      const fullPath = join(dir, entry.name);
      let relPath = relative(baseDir, fullPath);
      if (Deno.build.os === "windows") relPath = relPath.replace(/\\/g, "/");
      if (entry.isDirectory) {
        results.push(...await collectFilePaths(fullPath, baseDir));
      } else if (entry.isFile) {
        results.push(relPath);
      }
    }
  } catch {
    // directory doesn't exist
  }
  return results;
}

/**
 * Remove files from known managed subdirs that are not in the manifest.
 * Only touches: skills/, agents/, commands/, prompts/, extensions/, themes/, keybindings/
 */
async function removeStaleFiles(
  targetDir: string,
  expectedPaths: Set<string>,
  opts: { dryRun: boolean; yes: boolean; toolName: string },
): Promise<void> {
  const knownSubdirs = ["skills", "agents", "commands", "prompts", "extensions", "themes", "keybindings"];

  const installedFiles: string[] = [];
  for (const subdir of knownSubdirs) {
    installedFiles.push(...await collectFilePaths(join(targetDir, subdir), targetDir));
  }

  const stalePaths = installedFiles.filter((f) => !expectedPaths.has(f));
  if (stalePaths.length === 0) return;

  console.log(`\n  ${od("┄")} ${opts.toolName}: ${yellow(String(stalePaths.length))} stale file(s) not in manifest:`);
  for (const f of stalePaths) console.log(`    ${od("·")} ${od(f)}`);

  if (!opts.yes && !opts.dryRun) {
    const ok = await promptConfirm(`  ${o("⟫")} Remove ${stalePaths.length} stale file(s) from ${opts.toolName}?`);
    if (!ok) { console.log(`  ${yellow("skipped")} stale file removal.`); return; }
  }

  const parentDirs = new Set<string>();
  let removed = 0;
  let failed = 0;

  for (const f of stalePaths) {
    const fullPath = join(targetDir, f);
    parentDirs.add(dirname(fullPath));

    if (opts.dryRun) { console.log(`  ${od("-")} would remove  ${od(f)}`); removed++; continue; }

    try {
      await Deno.remove(fullPath);
      console.log(`  ${o("✧")} removed  ${od(f)}`);
      removed++;
    } catch (err) {
      console.log(`  ${cross()} failed   ${f}: ${err}`);
      failed++;
    }
  }

  // Prune empty directories (deepest first)
  if (!opts.dryRun) {
    const sorted = [...parentDirs].sort((a, b) => b.length - a.length);
    for (const dir of sorted) {
      try {
        if (Array.from(Deno.readDirSync(dir)).length === 0) {
          await Deno.remove(dir);
          console.log(`  ${o("✧")} removed empty dir  ${od(normalizeSlashes(relative(targetDir, dir)))}`);
        }
      } catch { /* already gone or inaccessible */ }
    }
  }

  if (failed > 0) console.log(`  ${opts.toolName}: ${green(String(removed))} removed, ${red(String(failed))} failed`);
}

// ---------------------------------------------------------------------------
// Core installer
// ---------------------------------------------------------------------------

interface InstallOptions {
  tool: string;
  skills: string[];
  interactive: boolean;
  dryRun: boolean;
  yes: boolean;
  sd: string;
  token: string | null;
  local: boolean;
}

function getProjectLocalTarget(tool: string): string {
  switch (tool) {
    case "claude":
      return "./.claude";
    case "gemini":
      return "./.gemini";
    case "pi":
      return "./.pi/agent";
    case "opencode":
      return "./.config/opencode";
    case "antigravity":
      return "./.agents";
    case "wocoder":
      return "./.wocoder";
    default:
      return `./.${tool}`;
  }
}

async function installTool(manifest: Manifest, toolName: string, opts: InstallOptions): Promise<void> {
  const toolConfig = manifest.tools[toolName];
  if (!toolConfig) {
    console.error(`Unknown tool: "${toolName}". Available: ${Object.keys(manifest.tools).join(", ")}`);
    Deno.exit(1);
  }

  const targetDir = opts.local ? getProjectLocalTarget(toolName) : expandHome(toolConfig.target);

  // Show version info
  await checkForUpdates(manifest, targetDir, toolName);
  const allComponents = Object.entries(toolConfig.components).map(([name, comp]) => ({
    name,
    description: comp.description,
    files: comp.files,
  }));

  // Collect all expected file paths from manifest (used for stale cleanup)
  const expectedPaths = new Set<string>();
  for (const comp of Object.values(toolConfig.components)) {
    for (const f of comp.files) {
      expectedPaths.add(f.dest);
    }
  }

  let selectedComponents = allComponents;

  if (opts.skills.length > 0) {
    selectedComponents = allComponents.filter((c) => opts.skills.includes(c.name));
    const unknown = opts.skills.filter((s) => !allComponents.find((c) => c.name === s));
    if (unknown.length > 0) {
      console.warn(`  Warning: unknown components for ${toolName}: ${unknown.join(", ")}`);
      console.warn(`  Available: ${allComponents.map((c) => c.name).join(", ")}`);
    }
    if (selectedComponents.length === 0) {
      console.error(`  No valid components matched. Skipping ${toolName}.`);
      return;
    }
  } else if (opts.interactive) {
    const chosen = await interactivePicker(allComponents);
    selectedComponents = allComponents.filter((c) => chosen.includes(c.name));
    if (selectedComponents.length === 0) {
      console.log("No components selected. Skipping.");
      return;
    }
  }

  console.log(`\n  ${o("⟫")} ${C.bold}${toolName}${C.reset} ${od("→")} ${od(targetDir)}`);
  if (opts.dryRun) {
    console.log(`  ${od("(dry run — no files will be written)")}\n`);
  }

  let installed = 0;
  let skipped = 0;
  let unchanged = 0;

  for (const comp of selectedComponents) {
    // Warn before installing user-specific config files in the default flow
    if (comp.name === "settings" && !opts.yes && opts.skills.length === 0) {
      console.log(`\n  ⚠ The "settings" component contains tool-specific config files`);
      console.log(`    (settings.json, .mcp.json) that may overwrite your existing settings.`);
      if (opts.dryRun) {
        console.log("  [dry-run] would prompt for confirmation");
      } else {
        const ok = await promptConfirm(`  Install settings component?`);
        if (!ok) {
          console.log("  Skipped settings component.");
          skipped += comp.files.length;
          continue;
        }
      }
    }

    for (const fileEntry of comp.files) {
      const destPath = join(targetDir, fileEntry.dest);

      // Get source content
      let srcContent: string;
      if (opts.sd.startsWith("http://") || opts.sd.startsWith("https://")) {
        srcContent = await fetchRemoteFile(opts.sd, fileEntry.src, opts.token);
      } else {
        srcContent = await Deno.readTextFile(`${opts.sd}${fileEntry.src}`);
      }

      // Check existing destination
      const existingContent = await readFileIfExists(destPath);

      if (existingContent !== null && existingContent === srcContent) {
        console.log(`  ${od("·")} ${fileEntry.dest}  ${od("(ok)")}`);
        unchanged++;
        continue;
      }

      if (existingContent !== null && existingContent !== srcContent) {
        // Show diff and prompt
        console.log(`\n  ${o("⟁")} ${fileEntry.dest}  ${yellow("conflict")}`);
        if (!opts.yes) {
          const diff = renderDiff(existingContent, srcContent);
          console.log(`  ${od("--- existing")}`);
          console.log(`  ${green("+++ incoming")}`);
          console.log(diff.split("\n").map((l) => "  " + l).join("\n"));
          console.log();

          if (opts.dryRun) {
            console.log(`  ${od("[dry-run]")} would overwrite`);
            installed++;
            continue;
          }

          const ok = await promptConfirm(`  ${o("⟫")} Overwrite ${fileEntry.dest}?`);
          if (!ok) {
            console.log(`  ${yellow("skipped")}.`);
            skipped++;
            continue;
          }
        }
      }

      if (opts.dryRun) {
        const action = existingContent === null ? "create" : "overwrite";
        console.log(`  ${o("+")} ${action.padEnd(9)}  ${fileEntry.dest}`);
        installed++;
        continue;
      }

      await ensureDir(dirname(destPath));
      await Deno.writeTextFile(destPath, srcContent);
      const action = existingContent === null ? "installed" : "updated";
      console.log(`  ${o("✧")} ${action.padEnd(9)}  ${od(fileEntry.dest)}`);
      installed++;
    }
  }

  console.log(`\n  ${o("└")} ${od(toolName)}: ${green(String(installed))} changed, ${od(String(unchanged) + " ok")}, ${yellow(String(skipped) + " skipped")}`);

  // Remove stale files not in manifest (only for full installs)
  if (opts.skills.length === 0 && !opts.interactive) {
    await removeStaleFiles(targetDir, expectedPaths, {
      dryRun: opts.dryRun,
      yes: opts.yes,
      toolName,
    });
  }

  // Write version marker so --check can detect future updates
  if (!opts.dryRun) {
    await writeInstalledVersion(targetDir, manifest.version);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const args = parseArgs(Deno.args, {
  string: ["tool", "skill", "dest", "mode", "report-url", "uninstall"],
  boolean: ["interactive", "dry-run", "yes", "help", "check", "local", "import-ref", "sync-docs", "report-skills", "update", "no-validate", "prune", "install-cli", "compliance"],
  alias: { h: "help", n: "dry-run", y: "yes", i: "interactive", l: "local" },
});

if (args.help) {
  printHelp();
  Deno.exit(0);
}

// --report-skills: scan local skills and report to dashboard telemetry API
if (args["report-skills"]) {
  const reportUrl = (args["report-url"] as string) ?? "https://cto.wayof.work";
  const homedir = Deno.env.get("HOME") ?? "";
  const dirs = [
    { name: "Pi", path: join(homedir, ".pi", "agent", "skills") },
    { name: "OpenCode", path: join(homedir, ".config", "opencode", "skills") },
    { name: "Gemini CLI", path: join(homedir, ".gemini", "skills") },
    { name: "Codex", path: join(homedir, ".codex", "skills") },
    { name: "Claude Code", path: join(homedir, ".claude", "skills") },
    { name: "Antigravity", path: join(homedir, ".antigravity", "skills") },
    { name: "Wo Coder", path: join(homedir, ".wocoder", "skills") },
  ];

  const clientId = new TextDecoder().decode(
    await new Deno.Command("hostname", { args: [] }).output().then((r) => r.stdout),
  ).trim() || "unknown";

  console.log(`Reporting skills to ${reportUrl}/api/skills/report ...\n`);

  for (const tool of dirs) {
    const skills: Array<Record<string, unknown>> = [];
    try {
      for await (const entry of Deno.readDir(tool.path)) {
        if (!entry.isDirectory) continue;
        const skillPath = join(tool.path, entry.name);
        const skillMdPath = join(skillPath, "SKILL.md");
        let description = "";
        let allowedTools = "";
        let fileCount = 0;
        try {
          const content = Deno.readTextFileSync(skillMdPath);
          const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (fmMatch) {
            const fmLines = fmMatch[1].split("\n");
            for (const line of fmLines) {
              if (line.startsWith("description:")) description = line.slice("description:".length).trim().replace(/^["']|["']$/g, "");
              if (line.startsWith("allowed-tools:")) allowedTools = line.slice("allowed-tools:".length).trim().replace(/^["']|["']$/g, "");
            }
          }
          fileCount = Array.from(Deno.readDirSync(skillPath)).length;
        } catch { /* no SKILL.md */ }
        skills.push({ name: entry.name, description, allowedTools, fileCount, hasFrontmatter: true });
      }
    } catch { /* dir not found */ }

    console.log(`  ${tool.name}: ${skills.length} skills`);

    try {
      const resp = await fetch(`${reportUrl}/api/skills/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, tool: tool.name, skills }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        console.error(`    ✗ Failed: ${resp.status} ${err}`);
      } else {
        const result = await resp.json();
        console.log(`    ✓ reported (id: ${result.id})`);
      }
    } catch (e) {
      console.error(`    ✗ Connection failed: ${e}`);
    }
  }

  console.log("\nReport complete.");
  Deno.exit(0);
}

// --sync-docs: sync canonical skills to all tool skill directories
if (args["sync-docs"]) {
  const docsSyncScript = `${scriptDir()}scripts/docs-sync.ts`;
  const syncArgs = ["run", "-A", docsSyncScript];
  if (args["check"]) syncArgs.push("--check");
  console.log("Syncing canonical skills to all tool skill directories...\n");
  const cmd = new Deno.Command("deno", { args: syncArgs });
  const output = await cmd.output();
  console.log(new TextDecoder().decode(output.stdout));
  if (!output.success) {
    console.error(new TextDecoder().decode(output.stderr));
    Deno.exit(1);
  }
  console.log("Docs sync complete.");
  Deno.exit(0);
}

// --compliance: validate all tools match manifest — no stale files, no missing files, no dangling entries
if (args.compliance) {
  const sd = scriptDir();
  const token = resolveToken();
  const manifest = await loadManifest(sd, token);
  const knownSubdirs = ["skills", "agents", "commands", "prompts", "extensions", "themes", "keybindings"];
  let totalMissing = 0;
  let totalStale = 0;
  let totalDangling = 0;
  let totalOk = 0;
  let totalTools = 0;

  console.log(`\n  ${ob("⟡ COMPLIANCE CHECK")}  ${od("manifest v" + manifest.version)}\n`);

  for (const [toolName, toolConfig] of Object.entries(manifest.tools)) {
    totalTools++;
    const targetDir = expandHome(toolConfig.target);
    const toolDisplay = `${toolName.padEnd(14)} ${od(targetDir)}`;

    // Verify all manifest source files exist on disk
    const missing: string[] = [];
    const srcRoot = sd;
    for (const comp of Object.values(toolConfig.components)) {
      for (const f of comp.files) {
        const srcPath = join(srcRoot, f.src);
        try {
          await Deno.stat(srcPath);
        } catch {
          missing.push(f.src);
        }
      }
    }

    // Collect installed files & check for stale (non-manifest) files
    const expectedPaths = new Set<string>();
    for (const comp of Object.values(toolConfig.components)) {
      for (const f of comp.files) {
        expectedPaths.add(f.dest);
      }
    }

    const installedFiles: string[] = [];
    for (const subdir of knownSubdirs) {
      installedFiles.push(...await collectFilePaths(join(targetDir, subdir), targetDir));
    }

    const staleFiles = installedFiles.filter((f) => !expectedPaths.has(f));

    // Check for dangling manifest entries (src not matching dest structure)
    const expectedSrc = new Set<string>();
    for (const comp of Object.values(toolConfig.components)) {
      for (const f of comp.files) {
        expectedSrc.add(f.src);
      }
    }

    if (missing.length > 0) {
      totalMissing += missing.length;
      console.log(`  ${cross()} ${toolDisplay}: ${missing.length} missing src file(s)`);
    } else {
      totalOk++;
    }

    if (staleFiles.length > 0) {
      totalStale += staleFiles.length;
      console.log(`  ${warn()} ${toolName.padEnd(14)} ${staleFiles.length} stale file(s) in target`);
    }

    if (missing.length === 0 && staleFiles.length === 0) {
      console.log(`  ${check()} ${od(toolDisplay)}`);
    }
  }

  // Check for dangling manifest entries
  for (const [toolName, toolConfig] of Object.entries(manifest.tools)) {
    const targetDir = expandHome(toolConfig.target);
    for (const comp of Object.values(toolConfig.components)) {
      for (const f of comp.files) {
        const srcPath = join(sd, f.src);
        try {
          await Deno.stat(srcPath);
        } catch {
          totalDangling++;
          console.log(`  ${cross()} ${toolName.padEnd(14)} dangling entry: ${f.src}`);
        }
      }
    }
  }

  console.log();
  if (totalMissing === 0 && totalStale === 0 && totalDangling === 0) {
    console.log(`  ${check()} All ${totalTools} tools compliant — no issues found.\n`);
    Deno.exit(0);
  } else {
    if (totalMissing > 0) console.log(`  ${cross()} ${totalMissing} missing source file(s)`);
    if (totalStale > 0) console.log(`  ${warn()} ${totalStale} stale file(s) in target dirs`);
    if (totalDangling > 0) console.log(`  ${cross()} ${totalDangling} dangling manifest entr(ies)`);
    console.log();
    Deno.exit(1);
  }
}

// --check: compare installed versions against manifest
if (args["check"]) {
  const sd = scriptDir();
  const token = resolveToken();
  const manifest = await loadManifest(sd, token);
  console.log(`\n  ${ob("⟡ VERSION CHECK")}  ${od("manifest v" + manifest.version)}\n`);
  for (const tool of Object.keys(manifest.tools)) {
    const targetDir = expandHome(manifest.tools[tool].target);
    await checkForUpdates(manifest, targetDir, tool);
  }
  console.log();
  console.log(`  ${od("re-run:")} ${C.bold}deno run -A ...install.ts --tool=all --yes${C.reset}`);
  Deno.exit(0);
}

// --prune: interactive skill pruning — review and remove non-manifest skills
if (args["prune"]) {
  const sd = scriptDir();
  const token = resolveToken();
  const manifest = await loadManifest(sd, token);
  const homedir = Deno.env.get("HOME") ?? "";

  const knownSubdirs = ["skills", "agents", "commands", "prompts", "extensions", "themes", "keybindings"];

  console.log(`\n  ${ob("⟡ PRUNE SKILLS")}  ${od("review non-manifest files across all tools")}\n`);

  // Collect extra files per tool
  const toolExtras: Array<{ tool: string; targetDir: string; files: Array<{ path: string; fullPath: string }> }> = [];

  for (const [toolName, toolConfig] of Object.entries(manifest.tools)) {
    const targetDir = expandHome(toolConfig.target);
    const expectedPaths = new Set<string>();
    for (const comp of Object.values(toolConfig.components)) {
      for (const f of comp.files) {
        expectedPaths.add(f.dest);
      }
    }

    const allFiles: string[] = [];
    for (const subdir of knownSubdirs) {
      allFiles.push(...await collectFilePaths(join(targetDir, subdir), targetDir));
    }

    const extraFiles = allFiles.filter((f) => !expectedPaths.has(f));
    if (extraFiles.length > 0) {
      toolExtras.push({
        tool: toolName,
        targetDir,
        files: extraFiles.map((f) => ({ path: f, fullPath: join(targetDir, f) })),
      });
      console.log(`  ${o("┄")} ${C.bold}${toolName}${C.reset}: ${yellow(String(extraFiles.length))} extra file(s)  ${od(targetDir)}`);
    } else {
      console.log(`  ${od("┄")} ${od(toolName)}: ${green("clean")}  ${od(targetDir)}`);
    }
  }

  if (toolExtras.length === 0) {
    console.log(`\n  ${check()} No extra files found — all tools match the manifest.\n`);
    Deno.exit(0);
  }

  console.log(`\n  ${od("tools with extra files: " + toolExtras.length)}\n`);

  // Stage 1: pick tools to prune
  const toolChoices = toolExtras.map((t) => ({
    name: t.tool,
    description: `${t.files.length} extra file(s) in ${t.targetDir}`,
  }));
  const chosenTools = await interactivePicker(toolChoices);
  if (chosenTools.length === 0) {
    console.log(`  ${yellow("aborted")}\n`);
    Deno.exit(0);
  }

  // Stage 2: for each chosen tool, pick files to remove
  let totalRemoved = 0;
  let totalFailed = 0;

  for (const toolName of chosenTools) {
    const te = toolExtras.find((t) => t.tool === toolName)!;
    console.log(`\n  ${ob("▸ " + toolName)}  ${od("extra files (pre-checked = safe to remove)")}`);

    const fileChoices = te.files.map((f) => ({
      name: f.path,
      description: "",
    }));

    // Pre-select all (they're all non-manifest)
    const preSelected = new Set(fileChoices.map((_, i) => i));
    const chosenFiles = await interactivePicker(fileChoices, preSelected);
    if (chosenFiles.length === 0) {
      console.log(`  ${od("none selected for " + toolName)}`);
      continue;
    }

    if (!args.yes) {
      console.log(`  ${od("will remove " + chosenFiles.length + " file(s) from " + toolName)}`);
    }

    for (const f of chosenFiles) {
      const fullPath = te.files.find((fe) => fe.path === f)!.fullPath;
      try {
        await Deno.remove(fullPath);
        console.log(`  ${o("✧")} removed  ${od(f)}`);
        totalRemoved++;
      } catch (err) {
        console.log(`  ${cross()} failed  ${od(f)}: ${err}`);
        totalFailed++;
      }
    }

    // Prune empty dirs
    const parentDirs = new Set(chosenFiles.map((f) => {
      const fe = te.files.find((fe) => fe.path === f)!;
      return dirname(fe.fullPath);
    }));
    const sorted = [...parentDirs].sort((a, b) => b.length - a.length);
    for (const dir of sorted) {
      try {
        if (Array.from(Deno.readDirSync(dir)).length === 0) {
          await Deno.remove(dir);
          console.log(`  ${o("✧")} removed empty dir  ${od(normalizeSlashes(relative(te.targetDir, dir)))}`);
        }
      } catch { /* already gone */ }
    }
  }

  console.log(`\n  ${ob("⟡ PRUNE COMPLETE")}  ${green(String(totalRemoved))} removed, ${totalFailed > 0 ? red(String(totalFailed)) + " failed" : ""}\n`);
  Deno.exit(0);
}

if (args["import-ref"]) {
  const importScript = `${sd}scripts/import-ref-skills.ts`;
  console.log("Importing ref skills/agents to all platforms...\n");
  const cmd = new Deno.Command("deno", {
    args: ["run", "--allow-read", "--allow-write", "--allow-run", "--allow-env", importScript],
    cwd: join(sd, "..", ".."),
  });
  const output = await cmd.output();
  console.log(new TextDecoder().decode(output.stdout));
  if (!output.success) {
    console.error(new TextDecoder().decode(output.stderr));
    Deno.exit(1);
  }
  console.log("Import complete.");
  Deno.exit(0);
}

if (args.mode === "repo") {
  const dest = (args.dest as string | undefined) ?? "~/.ai-engineering-harness";
  printRepoModeInstructions(dest);
  Deno.exit(0);
}

// --install-cli: install/update CLI binary with Matrix output
if (args["install-cli"]) {
  const installUrl =
    "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts";

  const logo = [
    "██╗    ██╗ ██████╗     ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗",
    "██║    ██║██╔═══██╗    ████╗ ████║██╔═══██╗████╗  ██║██╔═══██╗",
    "██║ █╗ ██║██║   ██║    ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║",
    "██║███╗██║██║   ██║    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║",
    "╚███╔███╔╝╚██████╔╝    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝",
    " ╚══╝╚══╝  ╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝",
  ];
  for (const line of logo) console.log(o(`  ${line}`));
  console.log();

  const installCmd = new Deno.Command("deno", {
    args: ["install", "-Agf", "--no-lock", "--reload", "-n", "ai-harness", installUrl],
    cwd: Deno.env.get("TMPDIR") || Deno.env.get("TEMP") || Deno.env.get("TMP") || "/tmp",
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  const result = await installCmd.output();
  if (!result.success) {
    console.error(`\n  ${cross()} Failed to install CLI binary.`);
    Deno.exit(1);
  }

  // Patch wrapper to embed --reload
  patchDenoWrapperReload();

  const mf = await loadManifest(scriptDir(), resolveToken());
  console.log(`\n  ${check()} ${C.bold}ai-harness${C.reset} CLI installed  ${od("v" + mf.version)}`);
  console.log(`  ${o("►")} Next: ${C.bold}ai-harness --tool=all --yes${C.reset}`);
  console.log(`  ${o("►")} Update: ${C.bold}ai-harness --update${C.reset}`);
  console.log();
  Deno.exit(0);
}

// --update: full harness sync — CLI binary + changelog + docs + all tools + stale cleanup + validate
if (args.update) {
  const installUrl =
    "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts";
  const installBase = installUrl.slice(0, installUrl.lastIndexOf("/") + 1);
  const dryRun = Boolean(args["dry-run"]);
  const yes = Boolean(args.yes);
  const noValidate = Boolean(args["no-validate"]);
  const skipBinary = Boolean(args["skip-binary"]);
  const sd = scriptDir();
  const token = resolveToken();

  // --- Phase 1: Update binary (unless --skip-binary) ---
  if (!skipBinary) {
    const updateCmd = new Deno.Command("deno", {
      args: ["install", "-Agf", "--no-lock", "--reload", "-n", "ai-harness", installUrl],
      cwd: Deno.env.get("TMPDIR") || Deno.env.get("TEMP") || Deno.env.get("TMP") || "/tmp",
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });
    const updateResult = await updateCmd.output();
    if (!updateResult.success) {
      console.error(`${cross()} Failed to update ai-harness CLI.`);
      console.error(`${warn()} Try once: deno run --reload -A ${installUrl} --update`);
      Deno.exit(1);
    }

    // Patch wrapper to embed --reload so future updates bypass Deno cache
    await patchDenoWrapperReload();

    // Continue in same process — code is already fresh (--reload was used)
  }

  // --- Phase 2: Full Matrix flow (new binary, --skip-binary) ---
  const manifest = await loadManifest(sd, token);
  const latestVersion = manifest.version;

  // Collect installed versions for changelog diff
  const installedVersions: Record<string, string | null> = {};
  for (const toolName of Object.keys(manifest.tools)) {
    const targetDir = expandHome(manifest.tools[toolName].target);
    installedVersions[toolName] = await readInstalledVersion(targetDir);
  }

  // Logo
  const logo = [
    "██╗    ██╗ ██████╗     ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗",
    "██║    ██║██╔═══██╗    ████╗ ████║██╔═══██╗████╗  ██║██╔═══██╗",
    "██║ █╗ ██║██║   ██║    ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║",
    "██║███╗██║██║   ██║    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║",
    "╚███╔███╔╝╚██████╔╝    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝",
    " ╚══╝╚══╝  ╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝",
  ];
  for (const line of logo) console.log(o(`  ${line}`));
  console.log();
  console.log(`  ${ob("⟡ HARNESS UPDATE")}  ${od("v" + latestVersion)}  ${od("─".repeat(30))}\n`);
  console.log(`  ${o("►")}  ${C.bold}ai-harness --update${C.reset}  ${od("full sync engine")}`);
  console.log();
  console.log(`  ${o("┌")}${od("─".repeat(50))}${o("┐")}`);
  console.log(`  ${o("│")}  ${check()} CLI binary updated                         ${o("│")}`);
  console.log(`  ${o("│")}  ${o("2.")} Sync canonical skills to all tools        ${o("│")}`);
  console.log(`  ${o("│")}  ${o("3.")} Install/update ${String(Object.keys(manifest.tools).length).padEnd(2)} tools + remove stale  ${o("│")}`);
  console.log(`  ${o("│")}  ${noValidate ? o("4.") + " Compliance validation (skipped)" : o("4.") + " Run compliance validation          "}  ${o("│")}`);
  console.log(`  ${o("└")}${od("─".repeat(50))}${o("┘")}`);
  console.log();

  // Version changes
  const anyUpdates = Object.entries(installedVersions).some(([t, v]) => v !== null && v !== latestVersion);
  if (anyUpdates) {
    console.log(`  ${od("version changes")}`);
    console.log(`  ${od("─".repeat(40))}`);
    for (const [toolName, installed] of Object.entries(installedVersions)) {
      if (installed === null) {
        console.log(`  ${o("┤")} ${toolName.padEnd(12)} ${green("new install")}`);
      } else if (installed !== latestVersion) {
        console.log(`  ${o("┤")} ${toolName.padEnd(12)} ${od("v" + installed)} ${o("→")} ${o("v" + latestVersion)}`);
      } else {
        console.log(`  ${o("┤")} ${toolName.padEnd(12)} ${od("v" + latestVersion)}`);
      }
    }
    console.log();

    const changelogPath = `${scriptDir()}../CHANGELOG.md`;
    try {
      const changelog = await Deno.readTextFile(changelogPath);
      const entries: Array<{ version: string; content: string }> = [];
      const sectionRegex = /^## \[(.+?)\]/gm;
      let match;
      while ((match = sectionRegex.exec(changelog)) !== null) {
        const start = match.index;
        const nextMatch = sectionRegex.exec(changelog);
        const end = nextMatch ? nextMatch.index : changelog.length;
        entries.push({ version: match[1], content: changelog.slice(start, end).trim() });
        sectionRegex.lastIndex = match.index + match[0].length;
      }
      const relevant = entries.filter((e) => e.version === "Unreleased" || e.version === latestVersion);
      if (relevant.length > 0) {
        console.log(`  ${od("what's new")}`);
        console.log(`  ${od("─".repeat(40))}`);
        for (const entry of relevant) {
          const lines = entry.content.split("\n").filter((l) => l.startsWith("-") || l.startsWith("###"));
          for (const line of lines.slice(0, 10)) console.log(`  ${od("·")} ${line}`);
          if (lines.length > 10) console.log(`  ${od("·")} ${od("... and " + (lines.length - 10) + " more changes")}`);
        }
        console.log();
      }
    } catch { /* no changelog */ }
  } else {
    console.log(`  ${od("all tools up to date")}\n`);
  }

  if (!yes && !dryRun) {
    const ok = await promptConfirm(`  ${o("⟫")} Proceed with harness update?`);
    if (!ok) { console.log(`  ${yellow("aborted")}`); Deno.exit(0); }
  }

  // --- Step 2: Sync canonical skills ---
  console.log(`\n  ${ob("▸ STEP 2/4")}  ${od("Sync canonical skills")}`);
  console.log(`  ${od("─".repeat(40))}\n`);
  if (dryRun) {
    console.log(`  ${od("[dry-run]")} would run: ${C.bold}deno run -A install.ts --sync-docs${C.reset}\n`);
  } else {
    const syncCmd = new Deno.Command("deno", {
      args: ["run", "-A", `${installBase}install.ts`, "--sync-docs"],
      stdout: "inherit", stderr: "inherit",
    });
    const syncResult = await syncCmd.output();
    if (!syncResult.success) console.log(`  ${warn()} Docs sync had issues, continuing...\n`);
    else console.log(`  ${check()} Docs synced\n`);
  }

  // --- Step 3: Install/update all tools ---
  console.log(`  ${ob("▸ STEP 3/4")}  ${od("Install/update " + Object.keys(manifest.tools).length + " tools")}`);
  console.log(`  ${od("─".repeat(40))}\n`);
  if (dryRun) {
    console.log(`  ${od("[dry-run]")} would run: ${C.bold}ai-harness --tool=all${yes ? " --yes" : ""}${C.reset}\n`);
    console.log(`  ${od("[dry-run]")} would remove stale files in all ${Object.keys(manifest.tools).length} target dirs\n`);
  } else {
    const runArgs = ["--tool=all"];
    if (yes) runArgs.push("--yes");
    const runCmd = new Deno.Command("ai-harness", {
      args: runArgs, stdout: "inherit", stderr: "inherit",
    });
    const runResult = await runCmd.output();
    if (!runResult.success) { console.log(`  ${cross()} Tool installation had errors.`); Deno.exit(1); }
    console.log();
  }

  // --- Step 4: Compliance validation ---
  if (!noValidate) {
    console.log(`  ${ob("▸ STEP 4/4")}  ${od("Post-update validation")}`);
    console.log(`  ${od("─".repeat(40))}\n`);
    if (dryRun) {
      console.log(`  ${od("[dry-run]")} would run compliance check\n`);
    } else {
      const complianceScript = `${scriptDir()}scripts/compliance-check.ts`;
      try {
        const compCmd = new Deno.Command("deno", {
          args: ["run", "-A", complianceScript], stdout: "piped", stderr: "piped",
        });
        const compResult = await compCmd.output();
        const stdout = new TextDecoder().decode(compResult.stdout);
        const errorLines = stdout.split("\n").filter((l) => l.includes("✗ ERROR"));
        const errorCount = errorLines.reduce((sum, l) => {
          const m = l.match(/(\d+)/); return sum + (m ? parseInt(m[1]) : 0);
        }, 0);
        if (errorCount > 0) {
          console.log(stdout);
          console.log(`  ${warn()} ${errorCount} error(s) found after update. Review above.`);
        } else {
          const passMatch = stdout.match(/Skills: \d+ total, (\d+) passed/);
          const passed = passMatch ? parseInt(passMatch[1]) : "?";
          console.log(`  ${check()} Compliance check passed (${passed}+ skills clean across all tools)\n`);
        }
      } catch (e) {
        console.log(`  ${warn()} Compliance check skipped: ${e}`);
        console.log(`  Run manually: ${od("deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts")}\n`);
      }
    }
  } else {
    console.log(`  ${ob("▸ STEP 4/4")}  ${od("Validation skipped (--no-validate)")}\n`);
  }

  console.log(`\n  ${ob("⟡ UPDATE COMPLETE")}  ${check()}\n`);
  Deno.exit(0);
}

// --uninstall: remove installed files
if (args.uninstall) {
  const sd = scriptDir();
  const token = resolveToken();
  const manifest = await loadManifest(sd, token);

  // Matrix-style header
  const logo = [
    "██╗    ██╗ ██████╗     ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗",
    "██║    ██║██╔═══██╗    ████╗ ████║██╔═══██╗████╗  ██║██╔═══██╗",
    "██║ █╗ ██║██║   ██║    ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║",
    "██║███╗██║██║   ██║    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║",
    "╚███╔███╔╝╚██████╔╝    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝",
    " ╚══╝╚══╝  ╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝",
  ];
  for (const l of logo) console.log(o(`  ${l}`));
  console.log();
  console.log(`  ${ob("⟡ HARNESS UNINSTALL")}  ${od("v" + manifest.version)}  ${od("─".repeat(30))}\n`);

  const allTools = Object.keys(manifest.tools);
  let toolsToRemove: string[];
  let selectedComponents: Record<string, string[]> | null = null;

  if (String(args.uninstall) === "all") {
    if (args.interactive) {
      const toolChoices = allTools.map((t) => ({
        name: t,
        description: `Remove all ${t} files from ${manifest.tools[t].target}`,
      }));
      const chosen = await interactivePicker(toolChoices);
      toolsToRemove = chosen;
      selectedComponents = {};
      for (const t of toolsToRemove) {
        const comps = Object.entries(manifest.tools[t].components).map(([name, comp]) => ({
          name,
          description: comp.description,
        }));
        const chosenComps = await interactivePicker(comps);
        selectedComponents[t] = chosenComps;
      }
    } else {
      toolsToRemove = allTools;
    }
  } else {
    const toolName = String(args.uninstall);
    if (!manifest.tools[toolName]) {
      console.error(`Unknown tool: "${toolName}". Available: ${allTools.join(", ")}`);
      Deno.exit(1);
    }
    if (args.interactive) {
      const comps = Object.entries(manifest.tools[toolName].components).map(([name, comp]) => ({
        name,
        description: comp.description,
      }));
      const chosen = await interactivePicker(comps);
      toolsToRemove = [toolName];
      selectedComponents = { [toolName]: chosen };
    } else {
      toolsToRemove = [toolName];
    }
  }

  if (toolsToRemove.length === 0) {
    console.log("No tools selected. Nothing to uninstall.");
    Deno.exit(0);
  }

  // Confirm unless --yes
  if (!args.yes) {
    const summary = toolsToRemove.map((t) => {
      const comps = selectedComponents?.[t];
      if (comps && comps.length > 0) return `  ${t}: ${comps.length} component(s)`;
      if (comps) return null;
      return `  ${t}: all components`;
    }).filter(Boolean).join("\n");
    console.log(`\nWill uninstall:\n${summary}\n`);
    const ok = await promptConfirm("Continue?");
    if (!ok) {
      console.log("Cancelled.");
      Deno.exit(0);
    }
  }

  for (const tool of toolsToRemove) {
    const toolConfig = manifest.tools[tool];
    const targetDir = expandHome(toolConfig.target);
    let removed = 0;
    let failed = 0;

    const compsToRemove = selectedComponents?.[tool]
      ? selectedComponents[tool].map((n) => toolConfig.components[n]).filter(Boolean)
      : Object.values(toolConfig.components);

    for (const comp of compsToRemove) {
      for (const fileEntry of comp.files) {
        const destPath = join(targetDir, fileEntry.dest);
        if (args["dry-run"]) {
          console.log(`  would remove  ${fileEntry.dest}`);
          continue;
        }
        try {
          await Deno.remove(destPath);
          console.log(`  ✓ removed  ${fileEntry.dest}`);
          removed++;
        } catch (err) {
          if (err instanceof Deno.errors.NotFound) {
            console.log(`  - skipped  ${fileEntry.dest} (not found)`);
          } else {
            console.error(`  ✗ failed   ${fileEntry.dest}: ${err}`);
            failed++;
          }
        }
      }
    }

    if (!args["dry-run"]) {
      for (const subdir of ["agents", "skills", "commands", "prompts", "extensions"]) {
        const dir = join(targetDir, subdir);
        try { await Deno.remove(dir); } catch { /* not empty or not found */ }
      }
      const versionFile = join(targetDir, ".ai-harness-version");
      try { await Deno.remove(versionFile); } catch { /* not found */ }
    }

    if (args["dry-run"]) {
      console.log(`\n  ${tool}: ${compsToRemove.length} component(s) would be removed`);
    } else {
      console.log(`\n  ${tool}: ${removed} removed, ${failed} failed`);
    }
  }

  if (!args["dry-run"]) {
    const farewell = [
      "██╗    ██╗ ██████╗     ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗",
      "██║    ██║██╔═══██╗    ████╗ ████║██╔═══██╗████╗  ██║██╔═══██╗",
      "██║ █╗ ██║██║   ██║    ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║",
      "██║███╗██║██║   ██║    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║",
      "╚███╔███╔╝╚██████╔╝    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝",
      " ╚══╝╚══╝  ╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝",
    ];
    for (const l of farewell) console.log(o(`  ${l}`));
    console.log();
    console.log(`  ${od("thanks for trying the harness — hope to see you back")}  ${o("✧")}\n`);
  }
  Deno.exit(0);
}

if (!args.tool && !args.uninstall) {
  console.error("Error: --tool is required.\n");
  printHelp();
  Deno.exit(1);
}

const sd = scriptDir();
const token = resolveToken();
const manifest = await loadManifest(sd, token);

const skillFilter: string[] = args.skill
  ? String(args.skill).split(",").map((s: string) => s.trim()).filter(Boolean)
  : [];

const installOpts: InstallOptions = {
  tool: String(args.tool),
  skills: skillFilter,
  interactive: Boolean(args.interactive),
  dryRun: Boolean(args["dry-run"]),
  yes: Boolean(args.yes),
  sd,
  token,
  local: Boolean(args.local),
};

const toolArg = String(args.tool);
const toolsToInstall = toolArg === "all" ? Object.keys(manifest.tools) : [toolArg];

// Matrix-style header
const logo = [
  "██╗    ██╗ ██████╗     ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗",
  "██║    ██║██╔═══██╗    ████╗ ████║██╔═══██╗████╗  ██║██╔═══██╗",
  "██║ █╗ ██║██║   ██║    ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║",
  "██║███╗██║██║   ██║    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║",
  "╚███╔███╔╝╚██████╔╝    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝",
  " ╚══╝╚══╝  ╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝",
];
for (const line of logo) console.log(o(`  ${line}`));
console.log();
console.log(`  ${ob("⟡ HARNESS INSTALL")}  ${od("v" + manifest.version)}  ${od("─".repeat(30))}\n`);

for (const tool of toolsToInstall) {
  await installTool(manifest, tool, installOpts);
}

// Patch wrapper to embed --reload so future updates bypass Deno cache
patchDenoWrapperReload();

console.log(`\n  ${ob("⟡ INSTALL COMPLETE")}  ${check()}\n`);
