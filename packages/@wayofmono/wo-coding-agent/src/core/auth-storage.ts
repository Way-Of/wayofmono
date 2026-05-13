export interface AuthCredentials {
  apiKey?: string;
  oauthToken?: string;
  provider?: string;
}

export class AuthStorage {
  private credentials: Map<string, AuthCredentials> = new Map();
  private loadError: Error | undefined;

  static create(): AuthStorage {
    return new AuthStorage();
  }

  setCredentials(provider: string, creds: AuthCredentials): void {
    this.credentials.set(provider, creds);
  }

  getCredentials(provider: string): AuthCredentials | undefined {
    return this.credentials.get(provider);
  }

  getApiKey(provider: string): string | undefined {
    const envVarMap: Record<string, string> = {
      anthropic: "ANTHROPIC_API_KEY",
      openai: "OPENAI_API_KEY",
      gemini: "GEMINI_API_KEY",
      openai_compat: "OPENAI_API_KEY",
    };
    const creds = this.credentials.get(provider);
    if (creds?.apiKey) return creds.apiKey;
    const envKey = envVarMap[provider];
    if (envKey) {
      const envVal = process.env[envKey];
      if (envVal) return envVal;
    }
    return undefined;
  }

  drainErrors(): Error[] {
    const errors: Error[] = [];
    if (this.loadError) errors.push(this.loadError);
    this.loadError = undefined;
    return errors;
  }
}
