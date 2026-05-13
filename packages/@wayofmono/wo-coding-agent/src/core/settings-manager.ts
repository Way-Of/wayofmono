export interface CompactionSettings {
  enabled?: boolean;
  reserveTokens?: number;
  keepRecentTokens?: number;
}

export interface RetrySettings {
  enabled?: boolean;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export interface ImageSettings {
  blockImages?: boolean;
}

export interface TerminalSettings {
  theme?: "dark" | "light";
  editorPaddingX?: number;
  autocompleteMaxVisible?: number;
}

export interface Settings {
  model?: string;
  provider?: string;
  thinkingLevel?: string;
  compaction?: CompactionSettings;
  retry?: RetrySettings;
  images?: ImageSettings;
  terminal?: TerminalSettings;
}

export class SettingsManager {
  private settings: Settings = {};
  private loadError: Error | undefined;

  static create(): SettingsManager {
    const mgr = new SettingsManager();
    return mgr;
  }

  get<K extends keyof Settings>(key: K): Settings[K] {
    return this.settings[key];
  }

  set<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.settings[key] = value;
  }

  getAll(): Settings {
    return { ...this.settings };
  }

  drainErrors(): Error[] {
    const errors: Error[] = [];
    if (this.loadError) errors.push(this.loadError);
    this.loadError = undefined;
    return errors;
  }
}
