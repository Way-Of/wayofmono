export interface DetectResult<T> {
  value: T;
  confidence: "high" | "medium" | "low";
  source?: string;
}

export interface OsInfo {
  platform: "linux" | "darwin" | "win32";
  distro?: string;
  distroVersion?: string;
  isWsl: boolean;
  isContainer: boolean;
  isWindows: boolean;
  isMacos: boolean;
  isLinux: boolean;
}

export interface ArchInfo {
  arch: "x86_64" | "arm64" | "aarch64" | "i386" | "unknown";
  is64bit: boolean;
}

export interface ToolInfo {
  name: string;
  configDir: string;
  detected: boolean;
  version?: string;
  format: "snake_case" | "kebab-case";
}

export interface ToolsInfo {
  opencode: ToolInfo;
  claude: ToolInfo;
  pi: ToolInfo;
  codex: ToolInfo;
  antigravity: ToolInfo;
  wocode: ToolInfo;
  any: boolean;
  installed: string[];
}

export interface RuntimeInfo {
  deno: { detected: boolean; version?: string; path?: string };
  node: { detected: boolean; version?: string; path?: string };
  python: { detected: boolean; version?: string; path?: string };
  pnpm: { detected: boolean; version?: string };
  npm: { detected: boolean; version?: string };
  yarn: { detected: boolean; version?: string };
  git: { detected: boolean; version?: string; userName?: string; userEmail?: string; hasSigningKey: boolean };
}

export interface DesktopInfo {
  desktopEnv?: string;
  displayServer?: "x11" | "wayland" | "unknown";
  hasNerdFont: boolean;
  iconTheme?: string;
  xdgConfigHome: string;
  xdgDataHome: string;
  xdgStateHome: string;
}

export interface HardwareInfo {
  cpuCores: number;
  cpuModel?: string;
  ramGb: number;
  gpu?: { vendor: "nvidia" | "amd" | "intel" | "apple" | "unknown"; name?: string };
  diskFreeGb: number;
  onBattery: boolean;
}

export interface TerminalInfo {
  shell: "bash" | "zsh" | "fish" | "powershell" | "unknown";
  terminal?: string;
  colorDepth: 8 | 256 | "truecolor";
  isMultiplexer: boolean;
  locale: string;
  isUtf8: boolean;
}

export interface NetworkInfo {
  hasProxy: boolean;
  httpProxy?: string;
  httpsProxy?: string;
  noProxy?: string;
  githubToken?: boolean;
  isOffline: boolean;
  npmRegistry?: string;
}

export interface SecurityInfo {
  sshAgentRunning: boolean;
  gpgKeys: number;
  hasKeychain: boolean;
  selinuxEnforcing: boolean;
  apparmorEnforcing: boolean;
}

export interface PermissionsInfo {
  isRoot: boolean;
  isAdmin: boolean;
  macosQuarantineSupport: boolean;
  windowsExecutionPolicy?: string;
  homebrewAppleSilicon: boolean;
  homebrewIntel: boolean;
}

export interface SystemReport {
  timestamp: string;
  os: OsInfo;
  arch: ArchInfo;
  tools: ToolsInfo;
  runtime: RuntimeInfo;
  desktop: DesktopInfo;
  hardware: HardwareInfo;
  terminal: TerminalInfo;
  network: NetworkInfo;
  security: SecurityInfo;
  permissions: PermissionsInfo;
}
