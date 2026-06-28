import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { existsSync } from "node:fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const assetsDir = join(__dirname, "assets");

export function getAssetPath(...segments) {
  const resolved = join(assetsDir, ...segments);
  if (!existsSync(resolved)) {
    throw new Error(
      `Asset path not found: ${resolved}. Available: templates/, pdf/, schema/, verticals/, examples/`,
    );
  }
  return resolved;
}
