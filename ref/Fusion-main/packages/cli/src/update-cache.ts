import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GlobalSettingsStore, resolveGlobalDir } from "@fusion/core";

type CachedUpdateStatus = {
  updateAvailable: boolean;
  latestVersion: string;
  currentVersion: string;
};

type UpdateCachePayload = {
  updateAvailable?: unknown;
  latestVersion?: unknown;
  currentVersion?: unknown;
};

export function getCachedUpdateStatus(currentVersion?: string): CachedUpdateStatus | null {
  try {
    const cachePath = join(resolveGlobalDir(), "update-check.json");
    const raw = readFileSync(cachePath, "utf-8");
    const parsed = JSON.parse(raw) as UpdateCachePayload;

    if (
      parsed.updateAvailable === true &&
      typeof parsed.latestVersion === "string" &&
      parsed.latestVersion.length > 0 &&
      typeof parsed.currentVersion === "string" &&
      parsed.currentVersion.length > 0
    ) {
      if (
        typeof currentVersion === "string" &&
        currentVersion.length > 0 &&
        parsed.currentVersion !== currentVersion
      ) {
        return null;
      }

      return {
        updateAvailable: true,
        latestVersion: parsed.latestVersion,
        currentVersion: parsed.currentVersion,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function isUpdateCheckEnabled(): Promise<boolean> {
  const store = new GlobalSettingsStore();
  await store.init();
  const settings = await store.getSettings();
  return settings.updateCheckEnabled !== false;
}
