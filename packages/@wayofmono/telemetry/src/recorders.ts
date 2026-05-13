import { recordEvent, setAttribute } from "./tracer.js";
import type { ToolCallRecord, LlmCallRecord, CommandRecord, DiagnosticRecord } from "./types.js";

export function recordToolCall(record: ToolCallRecord): void {
  recordEvent("tool.call", {
    "tool.name": record.toolName,
    "tool.duration_ms": record.duration,
    "tool.is_error": record.isError ?? false,
  });
}

export function recordLlmCall(record: LlmCallRecord): void {
  recordEvent("llm.call", {
    "llm.model": record.model,
    "llm.messages": record.messages,
    "llm.prompt_tokens": record.promptTokens,
    "llm.response_tokens": record.responseTokens,
    "llm.duration_ms": record.duration,
    "llm.is_error": record.isError ?? false,
  });
}

export function recordCommand(record: CommandRecord): void {
  recordEvent("command", {
    "command.name": record.command,
    "command.duration_ms": record.duration,
  });
  setAttribute("command.result", record.result);
}

export function recordDiagnostic(record: DiagnosticRecord): void {
  recordEvent("diagnostic", {
    "diagnostic.file": record.file,
    "diagnostic.severity": record.severity,
    "diagnostic.message": record.message,
    "diagnostic.line": record.line ?? 0,
    "diagnostic.column": record.column ?? 0,
  });
}
