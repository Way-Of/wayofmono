import { readdir, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { WoExtensionAPI } from "./extension-api.js";

export interface ExtensionRuntime {
  pi: WoExtensionAPI;
  errors: Error[];
}

export async function discoverAndLoadExtensions(
  paths: string[],
  cwd: string,
  _disableFile?: string
): Promise<ExtensionRuntime> {
  const pi = new WoExtensionAPI(cwd);
  const errors: Error[] = [];

  for (const dir of paths) {
    try {
      await stat(dir);
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".js") && !entry.name.endsWith(".mjs")) continue;

        try {
          const modPath = join(dir, entry.name);
          const mod = await import(modPath);
          if (typeof mod.default === "function") {
            await mod.default(pi);
          }
        } catch (err) {
          errors.push(new Error(`Failed to load extension ${entry.name}: ${err}`));
        }
      }
    } catch {
      // skip dirs that don't exist
    }
  }

  return { pi, errors };
}

export function createExtensionRuntime(): WoExtensionAPI {
  return new WoExtensionAPI();
}
