import fs from 'fs';
import path from 'path';
import os from 'os';

export interface WodevConfig {
  thoughtsRoot: string;
  projects: string[];
  skipDirs: string[];
  github: {
    repo: string;
    branch: string;
    apiBase: string;
    rawBase: string;
    cacheTtlMs: number;
  };
  port: number;
  databaseUrl: string;
}

const DEFAULTS: WodevConfig = {
  thoughtsRoot: path.join(process.cwd(), '..', 'thoughts'),
  projects: ['wayofmono', 'wow', 'opticat'],
  skipDirs: ['.git', 'global', 'shared', 'docs', 'ticket-executor', 'enforcement-ticket', 'installation-tickets', 'old tickets'],
  github: {
    repo: 'Way-Of/f-rr-d',
    branch: 'main',
    apiBase: 'https://api.github.com',
    rawBase: 'https://raw.githubusercontent.com',
    cacheTtlMs: 5 * 60 * 1000,
  },
  port: 6969,
  databaseUrl: path.join(os.homedir(), '.config', 'wodev', 'dashboard.db'),
};

function loadJsonConfig(path: string): Partial<WodevConfig> | null {
  try {
    const raw = fs.readFileSync(path, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const val = override[key as keyof typeof override];
    if (val !== undefined) {
      if (typeof val === 'object' && !Array.isArray(val) && val !== null &&
          typeof result[key as keyof T] === 'object' && !Array.isArray(result[key as keyof T]) && result[key as keyof T] !== null) {
        (result as Record<string, unknown>)[key] = deepMerge(
          result[key as keyof T] as Record<string, unknown>,
          val as Record<string, unknown>
        );
      } else {
        (result as Record<string, unknown>)[key] = val;
      }
    }
  }
  return result;
}

let cachedConfig: WodevConfig | null = null;

export function getConfig(): WodevConfig {
  if (cachedConfig) return cachedConfig;

  let config = { ...DEFAULTS };

  // Layer 1: JSON config file
  const configPath = process.env.WODEV_CONFIG_PATH || path.join(os.homedir(), '.config', 'wodev', 'config.json');
  const fileConfig = loadJsonConfig(configPath);
  if (fileConfig) {
    config = deepMerge(config as unknown as Record<string, unknown>, fileConfig as unknown as Record<string, unknown>) as unknown as WodevConfig;
  }

  // Layer 2: Environment variables
  if (process.env.THOUGHTS_ROOT) config.thoughtsRoot = process.env.THOUGHTS_ROOT;
  if (process.env.WODEV_PROJECTS) {
    try { config.projects = JSON.parse(process.env.WODEV_PROJECTS); } catch { config.projects = process.env.WODEV_PROJECTS.split(',').map(s => s.trim()); }
  }
  if (process.env.WODEV_SKIP_DIRS) {
    try { config.skipDirs = JSON.parse(process.env.WODEV_SKIP_DIRS); } catch { config.skipDirs = process.env.WODEV_SKIP_DIRS.split(',').map(s => s.trim()); }
  }
  if (process.env.GITHUB_REPO) config.github.repo = process.env.GITHUB_REPO;
  if (process.env.GITHUB_BRANCH) config.github.branch = process.env.GITHUB_BRANCH;
  if (process.env.GITHUB_API_BASE) config.github.apiBase = process.env.GITHUB_API_BASE;
  if (process.env.GITHUB_RAW_BASE) config.github.rawBase = process.env.GITHUB_RAW_BASE;
  if (process.env.GITHUB_CACHE_TTL) config.github.cacheTtlMs = parseInt(process.env.GITHUB_CACHE_TTL, 10);
  if (process.env.PORT) config.port = parseInt(process.env.PORT, 10);
  if (process.env.DATABASE_URL) config.databaseUrl = process.env.DATABASE_URL;

  cachedConfig = config;
  return config;
}

export function resetConfig(): void {
  cachedConfig = null;
}
