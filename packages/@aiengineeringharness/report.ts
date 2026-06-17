import { type SystemReport } from "./detect/types.ts";
import { buildSystemReport } from "./detect/index.ts";
import { log } from "./logger.ts";

function sanitizePath(path: string, home: string): string {
  return path.replace(new RegExp(home.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "~");
}

function sanitizeReport(report: SystemReport): SystemReport {
  const home = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? "";

  const sanitized = JSON.parse(JSON.stringify(report)) as SystemReport;

  // Sanitize paths
  for (const tool of Object.values(sanitized.tools)) {
    if (typeof tool === "object" && "configDir" in tool) {
      (tool as { configDir: string }).configDir = sanitizePath((tool as { configDir: string }).configDir, home);
    }
  }

  if (sanitized.desktop.xdgConfigHome) sanitized.desktop.xdgConfigHome = sanitizePath(sanitized.desktop.xdgConfigHome, home);
  if (sanitized.desktop.xdgDataHome) sanitized.desktop.xdgDataHome = sanitizePath(sanitized.desktop.xdgDataHome, home);
  if (sanitized.desktop.xdgStateHome) sanitized.desktop.xdgStateHome = sanitizePath(sanitized.desktop.xdgStateHome, home);

  // Redact network tokens (only expose boolean presence)
  sanitized.network.githubToken = false;

  return sanitized;
}

export async function generateReport(): Promise<SystemReport> {
  const report = await buildSystemReport();
  log("report", `System report generated: ${report.os.platform}/${report.arch.arch}`);
  return report;
}

export async function generateSanitizedReport(): Promise<SystemReport> {
  const report = await generateReport();
  return sanitizeReport(report);
}

export async function pushReport(reportUrl: string, report: SystemReport): Promise<boolean> {
  const sanitized = sanitizeReport(report);

  try {
    const resp = await fetch(`${reportUrl}/api/skills/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: "ai-harness",
        tool: "harness-installer",
        version: "0.4.36",
        system: sanitized,
      }),
    });

    if (resp.ok) {
      log("report", `Report pushed to ${reportUrl} (${resp.status})`);
      return true;
    } else {
      const err = await resp.text();
      log("report", `Report push failed: ${resp.status} ${err}`);
      return false;
    }
  } catch (e) {
    log("report", `Report push connection failed: ${e}`);
    return false;
  }
}

export function printReport(report: SystemReport): void {
  const o = (s: string) => `\x1b[38;5;208m${s}\x1b[0m`;
  const ob = (s: string) => `\x1b[1m\x1b[38;5;208m${s}\x1b[0m`;
  const od = (s: string) => `\x1b[2m\x1b[38;5;208m${s}\x1b[0m`;

  console.log(`\n  ${ob("\u27a1 SYSTEM REPORT")}  ${od("platform-aware detection")}\n`);

  console.log(`  ${o("\u250c")}${od("\u2500".repeat(50))}${o("\u2510")}`);

  // OS
  console.log(`  ${o("\u2502")}  ${ob("OS")}`);
  console.log(`  ${o("\u2502")}    Platform:    ${report.os.platform}`);
  if (report.os.distro) console.log(`  ${o("\u2502")}    Distro:      ${report.os.distro} ${report.os.distroVersion || ""}`);
  if (report.os.isWsl) console.log(`  ${o("\u2502")}    WSL:         yes`);
  if (report.os.isContainer) console.log(`  ${o("\u2502")}    Container:   yes`);
  console.log(`  ${o("\u2502")}    Arch:        ${report.arch.arch}`);

  // Tools
  const installed = report.tools.installed;
  console.log(`  ${o("\u2502")}  ${ob("AI Tools")}`);
  if (installed.length > 0) {
    for (const t of installed) console.log(`  ${o("\u2502")}    ${"\x1b[38;5;82m\u2713\x1b[0m"} ${t}`);
  } else {
    console.log(`  ${o("\u2502")}    ${od("(none detected)")}`);
  }

  // Runtime
  console.log(`  ${o("\u2502")}  ${ob("Runtime")}`);
  if (report.runtime.node.detected) console.log(`  ${o("\u2502")}    Node.js:     ${report.runtime.node.version}`);
  if (report.runtime.deno.detected) console.log(`  ${o("\u2502")}    Deno:        ${report.runtime.deno.version}`);
  if (report.runtime.python.detected) console.log(`  ${o("\u2502")}    Python:      ${report.runtime.python.version}`);
  if (report.runtime.git.detected) console.log(`  ${o("\u2502")}    Git:         ${report.runtime.git.version}`);

  // Desktop
  if (report.desktop.desktopEnv) {
    console.log(`  ${o("\u2502")}  ${ob("Desktop")}`);
    console.log(`  ${o("\u2502")}    DE:          ${report.desktop.desktopEnv}`);
    console.log(`  ${o("\u2502")}    Display:     ${report.desktop.displayServer}`);
    console.log(`  ${o("\u2502")}    Nerd Font:   ${report.desktop.hasNerdFont ? "\x1b[38;5;82m\u2713\x1b[0m" : "\x1b[38;5;226m\u26a0\x1b[0m"}`);
  }

  // Hardware
  console.log(`  ${o("\u2502")}  ${ob("Hardware")}`);
  console.log(`  ${o("\u2502")}    CPU:         ${report.hardware.cpuCores} cores${report.hardware.cpuModel ? ` (${report.hardware.cpuModel})` : ""}`);
  console.log(`  ${o("\u2502")}    RAM:         ${report.hardware.ramGb} GB`);
  if (report.hardware.gpu) console.log(`  ${o("\u2502")}    GPU:         ${report.hardware.gpu.vendor}${report.hardware.gpu.name ? ` (${report.hardware.gpu.name})` : ""}`);

  // Terminal
  console.log(`  ${o("\u2502")}  ${ob("Terminal")}`);
  console.log(`  ${o("\u2502")}    Shell:       ${report.terminal.shell}`);
  console.log(`  ${o("\u2502")}    Color:       ${report.terminal.colorDepth}`);
  console.log(`  ${o("\u2502")}    UTF-8:       ${report.terminal.isUtf8 ? "\x1b[38;5;82m\u2713\x1b[0m" : "\x1b[38;5;226m\u26a0\x1b[0m"}`);

  // Permissions
  if (report.permissions.isRoot) console.log(`  ${o("\u2502")}  ${"\x1b[38;5;196m\u26a0\x1b[0m"} Running as ROOT`);

  console.log(`  ${o("\u2514")}${od("\u2500".repeat(50))}${o("\u2518")}`);
  console.log();
}
