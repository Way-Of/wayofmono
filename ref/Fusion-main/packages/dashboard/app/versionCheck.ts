declare const __BUILD_VERSION__: string;

const RELOAD_FLAG = "fusion:version-reload";
const VERSION_UPDATE_FLAG = "fusion:version-update";

/**
 * Module-level guard for auto-reload behavior.
 * Default true (auto-reload enabled). Set to false when the user disables
 * the `autoReloadOnVersionChange` setting.
 */
let autoReloadEnabled = true;

/**
 * Allow the React app to toggle the auto-reload guard at runtime
 * (e.g. when the user changes the setting in the Settings modal).
 */
export function setAutoReloadEnabled(enabled: boolean): void {
  autoReloadEnabled = enabled;
}

/** Exported for testing — reads the current guard value. */
export function _isAutoReloadEnabled(): boolean {
  return autoReloadEnabled;
}

/** Exported for testing — resets internal state. */
export function _resetState(): void {
  lastCheckTime = 0;
  checkInFlight = false;
  autoReloadEnabled = true;
}

export function consumeVersionUpdateFlag(): boolean {
  try {
    if (sessionStorage.getItem(VERSION_UPDATE_FLAG)) {
      sessionStorage.removeItem(VERSION_UPDATE_FLAG);
      return true;
    }
  } catch {
    // ignore (e.g. storage disabled)
  }
  return false;
}

export function reloadOnce(reason: string): void {
  if (sessionStorage.getItem(RELOAD_FLAG)) {
    console.warn("[versionCheck] reload already attempted, suppressing", reason);
    return;
  }
  sessionStorage.setItem(RELOAD_FLAG, "1");
  if (!autoReloadEnabled) {
    console.info("[versionCheck] auto-reload disabled by setting, skipping reload:", reason);
    return;
  }
  console.info("[versionCheck] reloading:", reason);
  window.location.reload();
}

export function isStaleChunkError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|is not a valid JavaScript MIME type|ChunkLoadError|Unable to preload (?:CSS|module) for/i.test(
    message,
  );
}

export function handleChunkLoadError(error: unknown): boolean {
  if (!isStaleChunkError(error)) return false;
  reloadOnce(`chunk load error: ${(error as Error)?.message ?? error}`);
  return true;
}

async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const res = await fetch("/version.json", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return null;
    const data = (await res.json()) as { version?: unknown };
    return typeof data.version === "string" ? data.version : null;
  } catch {
    return null;
  }
}

/**
 * Bootstrap: fetch global settings to check `autoReloadOnVersionChange`.
 * Runs once during `installVersionCheck()`. If the fetch fails or times out,
 * the default (true = auto-reload enabled) is kept.
 */
async function bootstrapAutoReloadSetting(): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("/api/settings", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = (await res.json()) as { autoReloadOnVersionChange?: unknown };
      if (data.autoReloadOnVersionChange === false) {
        autoReloadEnabled = false;
      }
    }
  } catch {
    // Network error, timeout, etc. — keep default (true).
  }
}

export const MIN_CHECK_INTERVAL_MS = 60_000; // 1 minute
let lastCheckTime = 0;
let checkInFlight = false;

/** Exported for testing — resets internal cooldown state */
export function _resetCheckState(): void {
  lastCheckTime = 0;
  checkInFlight = false;
}

export async function checkVersion(): Promise<void> {
  if (checkInFlight || document.visibilityState !== "visible") return;
  if (Date.now() - lastCheckTime < MIN_CHECK_INTERVAL_MS) return;
  lastCheckTime = Date.now();
  checkInFlight = true;
  try {
    const remote = await fetchRemoteVersion();
    if (remote && remote !== __BUILD_VERSION__) {
      try {
        sessionStorage.setItem(VERSION_UPDATE_FLAG, "1");
      } catch {
        // ignore
      }
      reloadOnce(`build version changed: ${__BUILD_VERSION__} -> ${remote}`);
    }
  } finally {
    checkInFlight = false;
  }
}

export function installVersionCheck(): void {
  if (!import.meta.env.PROD) return;
  // Fetch settings to apply auto-reload guard before first version check.
  void bootstrapAutoReloadSetting();
  // Clear stale flag once a fresh page has rendered successfully.
  window.setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 5_000);
  document.addEventListener("visibilitychange", () => {
    void checkVersion();
  });
  window.addEventListener("focus", () => {
    void checkVersion();
  });
  // Initial check after load to catch tabs restored from bfcache.
  window.setTimeout(() => void checkVersion(), 2_000);
}
