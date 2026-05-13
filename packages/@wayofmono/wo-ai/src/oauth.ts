import type { OAuthProvider, OAuthCredentials } from "./types.js";

const oauthProviders = new Map<string, OAuthProvider>();

export function registerOAuthProvider(provider: OAuthProvider): void {
  oauthProviders.set(provider.name, provider);
}

export function getOAuthProvider(name: string): OAuthProvider {
  const provider = oauthProviders.get(name);
  if (!provider) throw new Error(`OAuth provider "${name}" not found`);
  return provider;
}

export function createOAuthProvider(config: {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes?: string[];
}): OAuthProvider {
  return {
    name: config.name,
    async getAuthorizationUrl() {
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: (config.scopes || []).join(" "),
      });
      return `${config.authorizeUrl}?${params}`;
    },
    async exchangeCode(code: string) {
      const res = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
        }),
      });
      const data = await res.json() as { access_token: string; refresh_token?: string; expires_in?: number };
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      };
    },
    async refreshToken(credentials: OAuthCredentials) {
      if (!credentials.refreshToken) throw new Error("No refresh token available");
      const res = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: credentials.refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
      });
      const data = await res.json() as { access_token: string; refresh_token?: string; expires_in?: number };
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || credentials.refreshToken,
        expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      };
    },
  };
}
