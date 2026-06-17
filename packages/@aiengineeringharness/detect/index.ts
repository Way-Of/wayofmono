import { type SystemReport } from "./types.ts";
import { detectOs } from "./os.ts";
import { detectArch } from "./arch.ts";
import { detectTools } from "./tools.ts";
import { detectRuntime } from "./runtime.ts";
import { detectDesktop } from "./desktop.ts";
import { detectHardware } from "./hardware.ts";
import { detectTerminal } from "./terminal.ts";
import { detectNetwork } from "./network.ts";
import { detectSecurity } from "./security.ts";
import { detectPermissions } from "./permissions.ts";

export interface DetectionCache {
  os: ReturnType<typeof detectOs>;
  arch: ReturnType<typeof detectArch>;
  tools: ReturnType<typeof detectTools>;
  runtime: ReturnType<typeof detectRuntime>;
  desktop: ReturnType<typeof detectDesktop>;
  hardware: Awaited<ReturnType<typeof detectHardware>>;
  terminal: ReturnType<typeof detectTerminal>;
  network: ReturnType<typeof detectNetwork>;
  security: ReturnType<typeof detectSecurity>;
  permissions: ReturnType<typeof detectPermissions>;
}

let _cache: DetectionCache | null = null;

export function detectAll(): DetectionCache {
  if (_cache) return _cache;

  _cache = {
    os: detectOs(),
    arch: detectArch(),
    tools: detectTools(),
    runtime: detectRuntime(),
    desktop: detectDesktop(),
    hardware: detectHardware() as any, // async, will be awaited
    terminal: detectTerminal(),
    network: detectNetwork(),
    security: detectSecurity(),
    permissions: detectPermissions(),
  };

  return _cache;
}

export function clearCache(): void {
  _cache = null;
}

export async function buildSystemReport(): Promise<SystemReport> {
  const d = detectAll();
  return {
    timestamp: new Date().toISOString(),
    os: d.os.value,
    arch: d.arch.value,
    tools: d.tools.value,
    runtime: d.runtime.value,
    desktop: d.desktop.value,
    hardware: (await d.hardware).value,
    terminal: d.terminal.value,
    network: d.network.value,
    security: d.security.value,
    permissions: d.permissions.value,
  };
}

export * from "./types.ts";
export { detectOs } from "./os.ts";
export { detectArch } from "./arch.ts";
export { detectTools } from "./tools.ts";
export { detectRuntime } from "./runtime.ts";
export { detectDesktop } from "./desktop.ts";
export { detectHardware } from "./hardware.ts";
export { detectTerminal } from "./terminal.ts";
export { detectNetwork } from "./network.ts";
export { detectSecurity } from "./security.ts";
export { detectPermissions } from "./permissions.ts";
