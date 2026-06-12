#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env
/**
 * AI Engineering Harness Installer
 *
 * Install as CLI (recommended):
 *   deno install -Agf -n ai-harness \
 *     https://raw.githubusercontent.com/adrielp/ai-engineering-harness/main/install.ts
 *   ai-harness --tool=claude
 *
 * Direct run:
 *   deno run -A install.ts --tool=claude
 *
 * Private repos — clone and run:
 *   gh repo clone <org>/ai-engineering-harness /tmp/aih -- --depth=1 -q
 *   GITHUB_TOKEN=$(gh auth token) deno run -A /tmp/aih/install.ts --tool=claude
 *   rm -rf /tmp/aih
 *
 * Run --help for full usage.
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { ensureDir } from "jsr:@std/fs@1/ensure-dir";
import { join } from "jsr:@std/path@1/join";

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
  return `${targetDir}/${HARNESS_VERSION_FILENAME}`;
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
    console.log(`  ${toolName}: first install (v${current})`);
    return;
  }
  if (installed === current) {
    console.log(`  ${toolName}: up to date (v${current})`);
    return;
  }
  if (isNewerVersion(installed, current)) {
    console.log(`  ${toolName}: UPDATE AVAILABLE v${installed} → v${current}`);
  } else {
    console.log(`  ${toolName}: v${current} (local v${installed})`);
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
  // e.g. https://raw.githubusercontent.com/adrielp/ai-engineering-harness/<SHA>/install.ts
  return url.slice(0, url.lastIndexOf("/") + 1);
}

/** Get the directory containing this script (file:// or https://) */
function scriptDir(): string {
  const url = import.meta.url;
  if (url.startsWith("file://")) {
    return new URL(".", url).pathname;
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
        throw new Error(
          `Failed to fetch manifest (${resp.status}). If this is a private repository, clone and run locally:\n\n` +
          `  gh repo clone <org>/ai-engineering-harness /tmp/aih -- --depth=1 -q\n` +
          `  GITHUB_TOKEN=$(gh auth token) deno run -A /tmp/aih/install.ts --tool=<tool>\n` +
          `  rm -rf /tmp/aih`
        );
      }
      throw new Error(`Failed to fetch manifest from ${manifestUrl}: ${resp.status} ${resp.statusText}`);
    }
    return resp.json() as Promise<Manifest>;
  }
  const text = await Deno.readTextFile(`${sd}manifest.json`);
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

async function readLine(): Promise<string> {
  const chunks: Uint8Array[] = [];
  const buf = new Uint8Array(1);
  while (true) {
    const n = await Deno.stdin.read(buf);
    if (n === null) break;
    if (buf[0] === 10) break; // newline
    chunks.push(buf.slice());
  }
  return new TextDecoder().decode(new Uint8Array(chunks.flatMap((c) => [...c]))).trim();
}

async function promptConfirm(message: string): Promise<boolean> {
  Deno.stdout.writeSync(new TextEncoder().encode(`${message} [y/N] `));
  const input = await readLine();
  return input === "y" || input === "Y";
}

function printHelp(): void {
  console.log(`
AI Engineering Harness Installer

SINGLE COMMAND (easiest for agents):
  deno run -A \\
    https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts \\
    --tool=all --yes

INSTALL AS CLI (one-time):
  deno install -Agf -n ai-harness \\
    https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts

  Then run:
    ai-harness --tool=claude
    ai-harness --tool=all --interactive
    ai-harness --update             # Full sync: CLI + docs + all tools + stale cleanup + validate

CLONE AND RUN (for private repos):
  gh repo clone Way-Of/wayofmono /tmp/wo -- --depth=1 -q
  GITHUB_TOKEN=$(gh auth token) deno run -A /tmp/wo/packages/@aiengineeringharness/install.ts --tool=claude
  rm -rf /tmp/wo

DIRECT RUN (no install step):
  deno run -A install.ts [options]

OPTIONS:
  --tool=<claude|opencode|gemini|pi|wocoder|antigravity|codex|all> Which tool configs to install (required)
  --skill=<name>[,<name>]               Specific component names to install
  --interactive, -i                     Interactive checkbox picker
  --dry-run, -n                         Preview without writing files
  --yes, -y                             Skip confirmation prompts
  --local, -l                           Install to project-local directories (.claude, .agents, .gemini, etc.)
  --check                               Check installed version vs manifest
  --update                              Full harness sync: update CLI, sync docs, install/update all tools, remove stale files
  --uninstall=<claude|opencode|all>     Remove installed files for the given tool(s) (manifest from GitHub)
  --no-validate                         Skip compliance validation after --update
  --import-ref                          Import ref skills/agents to all platforms (WOMONO-016)
  --sync-docs                           Sync canonical skills to all tool skill directories
  --sync-docs --check                   Preview skill sync without making changes
  --report-skills                       Report local skills to dashboard telemetry API
  --report-url=<url>                    Dashboard URL for skill reporting (default: https://cto.wayof.work)
  --mode=repo                           Show clone+stow instructions instead
  --dest=<path>                         Clone destination for --mode=repo
  --help, -h                            Show this help

EXAMPLES:
  ai-harness --tool=all --yes                     # Install all configs non-interactively
  ai-harness --tool=claude                        # Install Claude Code configs
  ai-harness --tool=claude --dry-run              # Preview changes
  ai-harness --tool=claude --skill=agents         # Install only agents
  ai-harness --tool=claude --interactive          # Pick components
  ai-harness --mode=repo                          # Clone + stow instructions
`.trim());
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

async function interactivePicker(components: Array<{ name: string; description: string }>): Promise<string[]> {
  // Fall back to text prompt when stdin is not a TTY (piped)
  if (!Deno.stdin.isTerminal()) {
    console.log("\nAvailable components (enter numbers separated by spaces, or 'all'):\n");
    components.forEach((c, i) => {
      console.log(`  ${String(i + 1).padStart(2)}. [${c.name}] ${c.description}`);
    });
    console.log();
    Deno.stdout.writeSync(new TextEncoder().encode("Select (e.g. 1 3 5, or 'all'): "));
    const input = (await readLine()).toLowerCase();
    if (input === "all") return components.map((c) => c.name);
    const indices = input.split(/\s+/).map(Number).filter((n) => !isNaN(n) && n >= 1 && n <= components.length);
    return indices.map((i) => components[i - 1].name);
  }

  const selected = new Set<number>();
  let cursor = 0;

  console.log("\nUse ↑/↓ to move, Space to toggle, Enter to confirm, 'a' for all:\n");

  function render() {
    const moveUp = `\x1b[${components.length + 1}A`;
    Deno.stdout.writeSync(new TextEncoder().encode(moveUp));
    for (let i = 0; i < components.length; i++) {
      const check = selected.has(i) ? "✓" : " ";
      const pointer = i === cursor ? "▸" : " ";
      const desc = components[i].description.length > 60
        ? components[i].description.slice(0, 57) + "..."
        : components[i].description;
      Deno.stdout.writeSync(
        new TextEncoder().encode(` ${pointer} [${check}] ${components[i].name}  ${desc}\x1b[K\n`),
      );
    }
  }

  for (let i = 0; i < components.length; i++) {
    const check = selected.has(i) ? "✓" : " ";
    const pointer = i === cursor ? "▸" : " ";
    const desc = components[i].description.length > 60
      ? components[i].description.slice(0, 57) + "..."
      : components[i].description;
    console.log(` ${pointer} [${check}] ${components[i].name}  ${desc}`);
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
    console.log("No components selected.");
    return [];
  }

  console.log(`Selected ${selected.size} component(s):`);
  for (const i of selected) {
    console.log(`  ✓ ${components[i].name}`);
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
      const fullPath = `${dir}/${entry.name}`;
      const relPath = fullPath.startsWith(baseDir + "/") ? fullPath.slice(baseDir.length + 1) : entry.name;
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
    installedFiles.push(...await collectFilePaths(`${targetDir}/${subdir}`, targetDir));
  }

  const stalePaths = installedFiles.filter((f) => !expectedPaths.has(f));
  if (stalePaths.length === 0) return;

  console.log(`\n  ${opts.toolName}: ${stalePaths.length} stale file(s) not in manifest:`);
  for (const f of stalePaths) console.log(`    - ${f}`);

  if (!opts.yes && !opts.dryRun) {
    const ok = await promptConfirm(`  Remove ${stalePaths.length} stale file(s) from ${opts.toolName}?`);
    if (!ok) { console.log("  Skipped stale file removal."); return; }
  }

  const parentDirs = new Set<string>();
  let removed = 0;
  let failed = 0;

  for (const f of stalePaths) {
    const fullPath = `${targetDir}/${f}`;
    parentDirs.add(fullPath.slice(0, fullPath.lastIndexOf("/")));

    if (opts.dryRun) { console.log(`  - would remove  ${f}`); removed++; continue; }

    try {
      await Deno.remove(fullPath);
      console.log(`  ✓ removed  ${f}`);
      removed++;
    } catch (err) {
      console.error(`  ✗ failed   ${f}: ${err}`);
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
          console.log(`  ✓ removed empty dir  ${dir.slice(targetDir.length + 1)}`);
        }
      } catch { /* already gone or inaccessible */ }
    }
  }

  if (failed > 0) console.log(`  ${opts.toolName}: ${removed} removed, ${failed} failed`);
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

  console.log(`\nInstalling ${toolName} → ${targetDir}`);
  if (opts.dryRun) {
    console.log("  (dry run — no files will be written)\n");
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
      const destPath = `${targetDir}/${fileEntry.dest}`;

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
        console.log(`  ✓ unchanged  ${fileEntry.dest}`);
        unchanged++;
        continue;
      }

      if (existingContent !== null && existingContent !== srcContent) {
        // Show diff and prompt
        console.log(`\n  ~ conflict   ${fileEntry.dest}`);
        if (!opts.yes) {
          const diff = renderDiff(existingContent, srcContent);
          console.log("  --- existing");
          console.log("  +++ incoming");
          console.log(diff.split("\n").map((l) => "  " + l).join("\n"));
          console.log();

          if (opts.dryRun) {
            console.log("  [dry-run] would overwrite");
            installed++;
            continue;
          }

          const ok = await promptConfirm(`  Overwrite ${fileEntry.dest}?`);
          if (!ok) {
            console.log("  Skipped.");
            skipped++;
            continue;
          }
        }
      }

      if (opts.dryRun) {
        const action = existingContent === null ? "create" : "overwrite";
        console.log(`  + ${action.padEnd(9)}  ${fileEntry.dest}`);
        installed++;
        continue;
      }

      await ensureDir(destPath.slice(0, destPath.lastIndexOf("/")));
      await Deno.writeTextFile(destPath, srcContent);
      const action = existingContent === null ? "installed" : "updated";
      console.log(`  ✓ ${action.padEnd(9)}  ${fileEntry.dest}`);
      installed++;
    }
  }

  console.log(`\n  ${toolName}: ${installed} installed/updated, ${unchanged} unchanged, ${skipped} skipped`);

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
  boolean: ["interactive", "dry-run", "yes", "help", "check", "local", "import-ref", "sync-docs", "report-skills", "update", "no-validate"],
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

// --check: compare installed versions against manifest
if (args["check"]) {
  const sd = scriptDir();
  const token = resolveToken();
  const manifest = await loadManifest(sd, token);
  console.log(`\nUpdate check — latest manifest v${manifest.version}\n`);
  for (const tool of Object.keys(manifest.tools)) {
    const targetDir = expandHome(manifest.tools[tool].target);
    await checkForUpdates(manifest, targetDir, tool);
  }
  console.log();
  console.log("Re-run installer to update: deno run -A ...install.ts --tool=all --yes");
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

// --update: full harness sync — CLI binary + changelog + docs + all tools + stale cleanup + validate
if (args.update) {
  const installUrl =
    "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts";
  const installBase = installUrl.slice(0, installUrl.lastIndexOf("/") + 1);
  const dryRun = Boolean(args["dry-run"]);
  const yes = Boolean(args.yes);
  const noValidate = Boolean(args["no-validate"]);

  // Load current manifest for version info
  const sd = scriptDir();
  const token = resolveToken();
  const manifest = await loadManifest(sd, token);
  const latestVersion = manifest.version;

  // Collect installed versions for changelog diff
  const installedVersions: Record<string, string | null> = {};
  for (const toolName of Object.keys(manifest.tools)) {
    const targetDir = expandHome(manifest.tools[toolName].target);
    installedVersions[toolName] = await readInstalledVersion(targetDir);
  }

  // --- Preview ---
  console.log(`\n=== ai-harness --update (v${latestVersion}) ===\n`);
  console.log("  This will:\n");
  console.log("    1. Update ai-harness CLI binary");
  console.log("    2. Sync canonical skills to all tool skill directories");
  console.log(`    3. Install/update ${Object.keys(manifest.tools).length} tools + remove stale files`);
  if (!noValidate) console.log("    4. Run compliance validation (use --no-validate to skip)");
  console.log();

  // Show version changes
  const anyUpdates = Object.entries(installedVersions).some(([t, v]) => v !== null && v !== latestVersion);
  if (anyUpdates) {
    console.log("  Version changes:");
    for (const [toolName, installed] of Object.entries(installedVersions)) {
      if (installed === null) {
        console.log(`    ${toolName}: new install`);
      } else if (installed !== latestVersion) {
        console.log(`    ${toolName}: v${installed} → v${latestVersion}`);
      } else {
        console.log(`    ${toolName}: up to date (v${latestVersion})`);
      }
    }

    // Changelog: read between versions
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
        console.log("\n  What's new:");
        for (const entry of relevant) {
          const lines = entry.content.split("\n").filter((l) => l.startsWith("-") || l.startsWith("###"));
          for (const line of lines.slice(0, 10)) {
            console.log(`    ${line}`);
          }
          if (lines.length > 10) console.log(`    ... and ${lines.length - 10} more changes`);
        }
      }
    } catch { /* changelog not available */ }
  } else {
    console.log("  All tools up to date.\n");
  }

  console.log();

  // Confirm unless --yes or --dry-run
  if (!yes && !dryRun) {
    const ok = await promptConfirm("Proceed with full harness update?");
    if (!ok) { console.log("Cancelled."); Deno.exit(0); }
  }

  // --- Step 1: Update CLI binary ---
  console.log("\n=== Step 1/4: Updating CLI binary ===\n");
  if (dryRun) {
    console.log("  [dry-run] would run: deno install -Agf -n ai-harness <url>\n");
  } else {
    const updateCmd = new Deno.Command("deno", {
      args: ["install", "-Agf", "-n", "ai-harness", installUrl],
      stdout: "inherit",
      stderr: "inherit",
    });
    const updateResult = await updateCmd.output();
    if (!updateResult.success) {
      console.error("  ✗ Failed to update ai-harness CLI.");
      Deno.exit(1);
    }
    console.log("  ✓ CLI binary updated\n");
  }

  // --- Step 2: Sync canonical skills ---
  console.log("\n=== Step 2/4: Syncing canonical skills ===\n");
  if (dryRun) {
    console.log("  [dry-run] would run: deno run -A install.ts --sync-docs\n");
  } else {
    const syncCmd = new Deno.Command("deno", {
      args: ["run", "-A", `${installBase}install.ts`, "--sync-docs"],
      stdout: "inherit",
      stderr: "inherit",
    });
    const syncResult = await syncCmd.output();
    if (!syncResult.success) {
      console.warn("  ⚠ Docs sync had issues, continuing...\n");
    } else {
      console.log("  ✓ Docs synced\n");
    }
  }

  // --- Step 3: Install/update all tools ---
  console.log("\n=== Step 3/4: Installing/updating all tools ===\n");
  if (dryRun) {
    console.log(`  [dry-run] would run: ai-harness --tool=all${yes ? " --yes" : ""}\n`);
    console.log("  [dry-run] would remove stale files in all 7 target dirs\n");
  } else {
    const runArgs = ["--tool=all"];
    if (yes) runArgs.push("--yes");
    if (dryRun) runArgs.push("--dry-run");
    const runCmd = new Deno.Command("ai-harness", {
      args: runArgs,
      stdout: "inherit",
      stderr: "inherit",
    });
    const runResult = await runCmd.output();
    if (!runResult.success) {
      console.error("  ✗ Tool installation had errors.");
      Deno.exit(1);
    }
    console.log();
  }

  // --- Step 4: Compliance validation ---
  if (!noValidate) {
    console.log("\n=== Step 4/4: Post-update validation ===\n");
    if (dryRun) {
      console.log("  [dry-run] would run compliance check\n");
    } else {
      const complianceScript = `${scriptDir()}scripts/compliance-check.ts`;
      try {
        const compCmd = new Deno.Command("deno", {
          args: ["run", "-A", complianceScript],
          stdout: "piped",
          stderr: "piped",
        });
        const compResult = await compCmd.output();
        const stdout = new TextDecoder().decode(compResult.stdout);
        const stderr = new TextDecoder().decode(compResult.stderr);

        // Show error count
        const errorLines = stdout.split("\n").filter((l) => l.includes("✗ ERROR"));
        const errorCount = errorLines.reduce((sum, l) => {
          const m = l.match(/(\d+)/);
          return sum + (m ? parseInt(m[1]) : 0);
        }, 0);

        if (errorCount > 0) {
          console.log(stdout);
          console.warn(`  ⚠ ${errorCount} error(s) found after update. Review above.`);
        } else {
          const passMatch = stdout.match(/Skills: \d+ total, (\d+) passed/);
          const passed = passMatch ? parseInt(passMatch[1]) : "?";
          console.log(`  ✓ Compliance check passed (${passed}+ skills clean across all tools)\n`);
        }
        if (stderr) console.error(stderr);
      } catch (e) {
        console.warn(`  ⚠ Compliance check skipped: ${e}`);
        console.log("  Run manually: deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts\n");
      }
    }
  } else {
    console.log("\n=== Step 4/4: Validation skipped (--no-validate) ===\n");
  }

  console.log("\n=== Update complete ===\n");
  Deno.exit(0);
}

// --uninstall: remove installed files
if (args.uninstall) {
  const sd = scriptDir();
  const token = resolveToken();
  const manifest = await loadManifest(sd, token);

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
        const destPath = `${targetDir}/${fileEntry.dest}`;
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
        const dir = `${targetDir}/${subdir}`;
        try { await Deno.remove(dir); } catch { /* not empty or not found */ }
      }
      const versionFile = `${targetDir}/.ai-harness-version`;
      try { await Deno.remove(versionFile); } catch { /* not found */ }
    }

    if (args["dry-run"]) {
      console.log(`\n  ${tool}: ${compsToRemove.length} component(s) would be removed`);
    } else {
      console.log(`\n  ${tool}: ${removed} removed, ${failed} failed`);
    }
  }

  if (!args["dry-run"]) console.log("\nUninstall complete.");
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

for (const tool of toolsToInstall) {
  await installTool(manifest, tool, installOpts);
}

console.log("\nDone.");
