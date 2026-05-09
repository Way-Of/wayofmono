import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  choosePreferredStoredCredential,
  getClaudeCodeCredentialPaths,
  getCodexCliAuthPath,
  readStoredCredentialsFromAuthFile,
  shouldHydrateStoredCredential,
  type StoredAuthCredential,
} from "@fusion/core";
import { AuthStorage } from "@mariozechner/pi-coding-agent";
import type { AuthCredential } from "@mariozechner/pi-coding-agent";
import { getOAuthProvider } from "@mariozechner/pi-ai/oauth";
import type { OAuthCredentials } from "@mariozechner/pi-ai/oauth";

type StoredCredential = StoredAuthCredential;

function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || homedir();
}

export function getFusionAuthPath(home = getHomeDir()): string {
  return join(home, ".fusion", "agent", "auth.json");
}

export function getFusionModelsPath(home = getHomeDir()): string {
  return join(home, ".fusion", "agent", "models.json");
}

function getLegacyAuthPaths(home = getHomeDir()): string[] {
  return [
    join(home, ".pi", "agent", "auth.json"),
    join(home, ".pi", "auth.json"),
  ];
}

function getSupplementalAuthPaths(home = getHomeDir()): string[] {
  return [
    ...getLegacyAuthPaths(home),
    getCodexCliAuthPath(home),
    ...getClaudeCodeCredentialPaths(home),
  ];
}

function getLegacyModelsPaths(home = getHomeDir()): string[] {
  return [
    join(home, ".pi", "agent", "models.json"),
    join(home, ".pi", "models.json"),
  ];
}

export function getModelRegistryModelsPath(home = getHomeDir()): string {
  const fusionModelsPath = getFusionModelsPath(home);
  if (existsSync(fusionModelsPath)) {
    return fusionModelsPath;
  }

  return getLegacyModelsPaths(home).find((modelsPath) => existsSync(modelsPath)) ?? fusionModelsPath;
}

function readSupplementalCredentials(authPaths = getSupplementalAuthPaths()): Record<string, StoredCredential> {
  const credentials: Record<string, StoredCredential> = {};

  for (const authPath of authPaths) {
    const parsed = readStoredCredentialsFromAuthFile(authPath);
    for (const [provider, credential] of Object.entries(parsed)) {
      credentials[provider] = choosePreferredStoredCredential(credentials[provider], credential) ?? credential;
    }
  }

  return credentials;
}

function resolveStoredApiKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return process.env[key] ?? key;
}

function resolveOAuthApiKey(providerId: string, credential: StoredCredential): string | undefined {
  if (
    credential.type !== "oauth" ||
    typeof credential.access !== "string" ||
    typeof credential.refresh !== "string" ||
    typeof credential.expires !== "number" ||
    Date.now() >= credential.expires
  ) {
    return undefined;
  }

  return getOAuthProvider(providerId)?.getApiKey(credential as OAuthCredentials);
}

function resolveStoredCredentialApiKey(providerId: string, credential: StoredCredential | undefined): string | undefined {
  if (credential?.type === "api_key") {
    return resolveStoredApiKey(credential.key);
  }
  if (credential?.type === "oauth") {
    return resolveOAuthApiKey(providerId, credential);
  }
  return undefined;
}

/**
 * Reads API keys from the resolved models.json file.
 *
 * Some providers (e.g., kimi-coding, lmstudio, ollama) store their API keys
 * in `models.json` under `providers.<providerId>.apiKey` rather than in
 * `auth.json`. This function extracts those keys so the auth storage proxy
 * can return them as a fallback when neither Fusion auth nor legacy auth.json
 * contains a key for the provider.
 */
function readModelsJsonApiKeys(home = getHomeDir()): Map<string, string> {
  const apiKeys = new Map<string, string>();
  const modelsPath = getModelRegistryModelsPath(home);

  if (!existsSync(modelsPath)) {
    return apiKeys;
  }

  try {
    const parsed = JSON.parse(readFileSync(modelsPath, "utf-8")) as {
      providers?: Record<string, { apiKey?: string }>;
    };
    const providers = parsed?.providers;
    if (providers) {
      for (const [providerId, config] of Object.entries(providers)) {
        if (config.apiKey) {
          apiKeys.set(providerId, config.apiKey);
        }
      }
    }
  } catch {
    // Ignore invalid models.json files.
  }

  return apiKeys;
}

export function createFusionAuthStorage(): AuthStorage {
  const primary = AuthStorage.create(getFusionAuthPath());
  let supplementalCredentials = readSupplementalCredentials();
  // models.json provider API keys — final fallback after primary auth and supplemental auth.json files
  let modelsJsonApiKeys = readModelsJsonApiKeys();

  // Providers the user has explicitly logged out from. These should not be
  // "resurrected" from supplemental credential files (e.g. ~/.claude/.credentials.json).
  // Cleared when the user re-authenticates via set().
  const loggedOutProviders = new Set<string>();

  const syncSupplementalOauthCredentials = () => {
    for (const [provider, credential] of Object.entries(supplementalCredentials)) {
      if (loggedOutProviders.has(provider)) {
        continue;
      }
      const current = primary.get(provider) as StoredCredential | undefined;
      if (!shouldHydrateStoredCredential(current, credential)) {
        continue;
      }
      if (credential.type === "oauth" || credential.type === "api_key") {
        primary.set(provider, credential as AuthCredential);
      }
    }
  };

  syncSupplementalOauthCredentials();

  return new Proxy(primary, {
    // Forward property writes to the target so that methods like
    // `setFallbackResolver` (called by ModelRegistry) correctly update the
    // underlying AuthStorage. Without this trap, writes land on the Proxy
    // object itself and the target's fallbackResolver stays undefined.
    set(target: AuthStorage, prop: string | symbol, value: unknown) {
      (target as unknown as Record<string | symbol, unknown>)[prop] = value;
      return true;
    },

    get(target, prop, receiver) {
      if (prop === "logout") {
        return (provider: string) => {
          target.logout(provider);
          loggedOutProviders.add(provider);
        };
      }

      if (prop === "remove") {
        return (provider: string) => {
          target.remove(provider);
          loggedOutProviders.add(provider);
        };
      }

      if (prop === "set") {
        return (provider: string, credential: AuthCredential) => {
          target.set(provider, credential);
          loggedOutProviders.delete(provider);
        };
      }

      if (prop === "reload") {
        return () => {
          target.reload();
          supplementalCredentials = readSupplementalCredentials();
          syncSupplementalOauthCredentials();
          modelsJsonApiKeys = readModelsJsonApiKeys();
        };
      }

      if (prop === "get") {
        return (provider: string) => {
          if (loggedOutProviders.has(provider)) {
            return undefined;
          }
          return choosePreferredStoredCredential(
            target.get(provider) as StoredCredential | undefined,
            supplementalCredentials[provider],
          );
        };
      }

      if (prop === "has") {
        return (provider: string) => {
          if (loggedOutProviders.has(provider)) {
            return false;
          }
          return target.has(provider) || provider in supplementalCredentials || modelsJsonApiKeys.has(provider);
        };
      }

      if (prop === "hasAuth") {
        return (provider: string) => {
          if (loggedOutProviders.has(provider)) {
            return false;
          }
          return target.hasAuth(provider) || Boolean(supplementalCredentials[provider]) || modelsJsonApiKeys.has(provider);
        };
      }

      if (prop === "getAll") {
        return () => {
          const providerIds = new Set([
            ...Object.keys(target.getAll() as Record<string, StoredCredential>),
            ...(loggedOutProviders.size > 0
              ? Object.keys(supplementalCredentials).filter((p) => !loggedOutProviders.has(p))
              : Object.keys(supplementalCredentials)),
          ]);
          const merged: Record<string, StoredCredential> = {};
          for (const providerId of providerIds) {
            if (loggedOutProviders.has(providerId)) {
              continue;
            }
            const credential = choosePreferredStoredCredential(
              (target.get(providerId) as StoredCredential | undefined),
              supplementalCredentials[providerId],
            );
            if (credential) {
              merged[providerId] = credential;
            }
          }
          return merged;
        };
      }

      if (prop === "list") {
        return () => {
          const providers = new Set([...target.list()]);
          for (const p of modelsJsonApiKeys.keys()) {
            if (!loggedOutProviders.has(p)) {
              providers.add(p);
            }
          }
          for (const p of Object.keys(supplementalCredentials)) {
            if (!loggedOutProviders.has(p)) {
              providers.add(p);
            }
          }
          return Array.from(providers).filter((p) => !loggedOutProviders.has(p));
        };
      }

      if (prop === "getApiKey") {
        return async (provider: string) => {
          if (loggedOutProviders.has(provider)) {
            return undefined;
          }

          // 1. Primary Fusion auth
          const primaryKey = await target.getApiKey(provider);
          if (primaryKey) return primaryKey;

          // 2. Supplemental auth.json credentials (.pi + .codex)
          const supplementalKey = resolveStoredCredentialApiKey(provider, supplementalCredentials[provider]);
          if (supplementalKey) return supplementalKey;

          // 3. models.json provider API keys (e.g., kimi-coding, lmstudio)
          return modelsJsonApiKeys.get(provider);
        };
      }

      return Reflect.get(target, prop, receiver);
    },
  }) as AuthStorage;
}
