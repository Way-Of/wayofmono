import type { Settings } from "./types.js";

const LEGACY_EXPERIMENTAL_FEATURE_ALIASES: Record<string, string> = {
  devServer: "devServerView",
};

export function isExperimentalFeatureEnabled(
  settings: Pick<Settings, "experimentalFeatures"> | undefined,
  key: string,
): boolean {
  const features = settings?.experimentalFeatures;
  if (!features) return false;

  const canonicalKey = LEGACY_EXPERIMENTAL_FEATURE_ALIASES[key] ?? key;
  if (features[canonicalKey] === true) return true;

  for (const [legacyKey, aliasCanonical] of Object.entries(LEGACY_EXPERIMENTAL_FEATURE_ALIASES)) {
    if (aliasCanonical === canonicalKey && features[legacyKey] === true) {
      return true;
    }
  }

  return false;
}
