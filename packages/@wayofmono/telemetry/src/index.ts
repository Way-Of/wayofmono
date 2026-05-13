export { initTelemetry, shutdownTelemetry, getCurrentTraceId } from "./exporter.js";
export { startSpan, runInSpan, recordEvent, setAttribute, getTracer } from "./tracer.js";
export { recordToolCall, recordLlmCall, recordCommand, recordDiagnostic } from "./recorders.js";

export type {
  TelemetryConfig,
  ToolCallRecord,
  LlmCallRecord,
  CommandRecord,
  DiagnosticRecord,
} from "./types.js";
