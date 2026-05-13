export interface WoCodingAgentConfig {
  cwd: string;
  agentDir: string;
  sessionDir?: string;
  model?: string;
  provider?: string;
  apiKey?: string;
  thinkingLevel?: string;
  tools?: string[];
  noBuiltinTools?: boolean;
  noTools?: boolean;
  noSession?: boolean;
  noExtensions?: boolean;
  noSkills?: boolean;
  noPromptTemplates?: boolean;
  noThemes?: boolean;
  noContextFiles?: boolean;
  systemPrompt?: string;
  appendSystemPrompt?: string;
  extensionPaths?: string[];
  skillPaths?: string[];
  promptTemplatePaths?: string[];
  themePaths?: string[];
  verbose?: boolean;
}

export interface AgentSessionRuntimeDiagnostic {
  type: "info" | "warning" | "error";
  message: string;
}
