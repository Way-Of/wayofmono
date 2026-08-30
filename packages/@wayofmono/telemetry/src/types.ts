export interface TelemetryConfig {
  serviceName?: string;
  serviceVersion?: string;
  otlpEndpoint?: string;
  console?: boolean;
  enabled?: boolean;
}

export interface ToolCallRecord {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
  duration: number;
  isError?: boolean;
}

export interface LlmCallRecord {
  model: string;
  messages: number;
  responseTokens: number;
  promptTokens: number;
  duration: number;
  isError?: boolean;
}

export interface CommandRecord {
  command: string;
  args: string;
  result: string;
  duration: number;
}

export interface DiagnosticRecord {
  file: string;
  severity: "error" | "warning" | "info";
  message: string;
  line?: number;
  column?: number;
}
