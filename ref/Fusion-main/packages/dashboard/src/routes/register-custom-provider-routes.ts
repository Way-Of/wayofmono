import crypto from "node:crypto";
import type { CustomProvider } from "@fusion/core";
import { ApiError, badRequest, notFound } from "../api-error.js";
import type { ApiRouteRegistrar } from "./types.js";

function maskApiKey(key: string): string {
  if (key.length <= 8) {
    return "••••••••";
  }
  return key.slice(0, 3) + "•••••" + key.slice(-4);
}

function sanitizeProvider(provider: CustomProvider): CustomProvider {
  if (!provider.apiKey) {
    return provider;
  }

  return {
    ...provider,
    apiKey: maskApiKey(provider.apiKey),
  };
}

function assertNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw badRequest(`${fieldName} is required and must be a non-empty string`);
  }
  return value.trim();
}

function assertApiType(value: unknown): CustomProvider["apiType"] {
  if (value !== "openai-compatible" && value !== "anthropic-compatible") {
    throw badRequest("apiType must be either 'openai-compatible' or 'anthropic-compatible'");
  }
  return value;
}

function assertBaseUrl(value: unknown): string {
  const baseUrl = assertNonEmptyString(value, "baseUrl");

  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw badRequest("baseUrl must be a valid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw badRequest("baseUrl must use http or https");
  }

  return baseUrl;
}

function validateModels(value: unknown): Array<{ id: string; name: string }> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw badRequest("models must be an array");
  }

  return value.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw badRequest(`models[${index}] must be an object`);
    }

    const row = entry as Record<string, unknown>;
    return {
      id: assertNonEmptyString(row.id, `models[${index}].id`),
      name: assertNonEmptyString(row.name, `models[${index}].name`),
    };
  });
}

function parseCreateBody(body: unknown): Omit<CustomProvider, "id"> {
  if (!body || typeof body !== "object") {
    throw badRequest("request body must be an object");
  }

  const row = body as Record<string, unknown>;
  const provider: Omit<CustomProvider, "id"> = {
    name: assertNonEmptyString(row.name, "name"),
    apiType: assertApiType(row.apiType),
    baseUrl: assertBaseUrl(row.baseUrl),
  };

  if (row.apiKey !== undefined) {
    if (typeof row.apiKey !== "string") {
      throw badRequest("apiKey must be a string");
    }
    if (row.apiKey.trim().length > 0) {
      provider.apiKey = row.apiKey;
    }
  }

  const models = validateModels(row.models);
  if (models) {
    provider.models = models;
  }

  return provider;
}

function parseUpdateBody(body: unknown): Partial<Omit<CustomProvider, "id">> {
  if (!body || typeof body !== "object") {
    throw badRequest("request body must be an object");
  }

  const row = body as Record<string, unknown>;
  const updates: Partial<Omit<CustomProvider, "id">> = {};

  if (row.name !== undefined) {
    updates.name = assertNonEmptyString(row.name, "name");
  }
  if (row.apiType !== undefined) {
    updates.apiType = assertApiType(row.apiType);
  }
  if (row.baseUrl !== undefined) {
    updates.baseUrl = assertBaseUrl(row.baseUrl);
  }
  if (row.apiKey !== undefined) {
    if (typeof row.apiKey !== "string") {
      throw badRequest("apiKey must be a string");
    }
    updates.apiKey = row.apiKey.trim().length > 0 ? row.apiKey : undefined;
  }
  if (row.models !== undefined) {
    updates.models = validateModels(row.models);
  }

  return updates;
}

export const registerCustomProviderRoutes: ApiRouteRegistrar = (ctx) => {
  const { router, store, rethrowAsApiError } = ctx;

  router.get("/custom-providers", async (_req, res) => {
    try {
      if (!store) {
        throw new ApiError(500, "Settings store unavailable");
      }

      const settings = await store.getGlobalSettingsStore().getSettings();
      const providers = (settings.customProviders ?? []).map(sanitizeProvider);
      res.json(providers);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      rethrowAsApiError(err);
    }
  });

  router.post("/custom-providers", async (req, res) => {
    try {
      if (!store) {
        throw new ApiError(500, "Settings store unavailable");
      }

      const providerInput = parseCreateBody(req.body);
      const provider: CustomProvider = {
        id: crypto.randomUUID(),
        ...providerInput,
      };

      const settings = await store.getGlobalSettingsStore().getSettings();
      const providers = settings.customProviders ?? [];
      await store.updateGlobalSettings({ customProviders: [...providers, provider] });

      res.status(201).json(sanitizeProvider(provider));
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      rethrowAsApiError(err);
    }
  });

  router.put("/custom-providers/:id", async (req, res) => {
    try {
      if (!store) {
        throw new ApiError(500, "Settings store unavailable");
      }

      const providerId = String(req.params.id ?? "").trim();
      if (!providerId) {
        throw badRequest("id path parameter is required");
      }

      const updates = parseUpdateBody(req.body);
      const settings = await store.getGlobalSettingsStore().getSettings();
      const providers = settings.customProviders ?? [];
      const targetIndex = providers.findIndex((provider) => provider.id === providerId);

      if (targetIndex < 0) {
        throw notFound(`custom provider '${providerId}' not found`);
      }

      const updatedProvider: CustomProvider = {
        ...providers[targetIndex],
        ...updates,
      };

      const nextProviders = [...providers];
      nextProviders[targetIndex] = updatedProvider;
      await store.updateGlobalSettings({ customProviders: nextProviders });

      res.json(sanitizeProvider(updatedProvider));
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      rethrowAsApiError(err);
    }
  });

  router.delete("/custom-providers/:id", async (req, res) => {
    try {
      if (!store) {
        throw new ApiError(500, "Settings store unavailable");
      }

      const providerId = String(req.params.id ?? "").trim();
      if (!providerId) {
        throw badRequest("id path parameter is required");
      }

      const settings = await store.getGlobalSettingsStore().getSettings();
      const providers = settings.customProviders ?? [];
      const exists = providers.some((provider) => provider.id === providerId);

      if (!exists) {
        throw notFound(`custom provider '${providerId}' not found`);
      }

      const nextProviders = providers.filter((provider) => provider.id !== providerId);
      await store.updateGlobalSettings({ customProviders: nextProviders });
      res.json({ success: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      rethrowAsApiError(err);
    }
  });
};
