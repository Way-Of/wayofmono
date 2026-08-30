# @wayofmono/telemetry

ODD-first instrumentation and telemetry SDK for the Wo ecosystem. OpenTelemetry-based tracing for agent operations, tool calls, LLM calls, and diagnostics.

```
npm install @wayofmono/telemetry
```

## Usage

```ts
import { initTelemetry, startSpan, runInSpan, recordEvent, recordToolCall, recordLlmCall, getCurrentTraceId, setupOtlpExporter } from "@wayofmono/telemetry";

// Initialize
initTelemetry({ console: true });

// Manual span
const span = startSpan("my-operation", { attributes: { key: "value" } });
span.end();

// Auto-closed span with error handling
const result = await runInSpan("process-data", async (span) => {
  span.setAttribute("items", 42);
  recordEvent("processing.started", { count: 42 });
  return doWork();
});

// Record activities
recordToolCall({
  toolName: "web_search",
  args: { query: "weather" },
  duration: 1500,
  isError: false,
});

recordLlmCall({
  model: "gpt-4o",
  messages: 3,
  promptTokens: 150,
  responseTokens: 42,
  duration: 3200,
});

recordCommand({
  command: "wom-build",
  args: "src/",
  duration: 500,
  result: "success",
});

recordDiagnostic({
  file: "src/main.ts",
  severity: "error",
  message: "Type 'undefined' is not assignable",
  line: 42,
  column: 8,
});

// Get trace ID for context injection
const traceId = getCurrentTraceId();
// Inject into agent: `<trace id="${traceId}">`

// Set up OTLP exporter for Aspire dashboard
await setupOtlpExporter("http://localhost:4317");
```

## API

### Lifecycle
| Function | Description |
|----------|-------------|
| `initTelemetry(config?)` | Initialize telemetry SDK |
| `shutdownTelemetry()` | Flush and shut down all exporters |
| `setupOtlpExporter(endpoint?)` | Set up OTLP gRPC exporter |

### Tracing
| Function | Description |
|----------|-------------|
| `startSpan(name, opts?)` | Create and start a new span |
| `runInSpan(name, fn, opts?)` | Execute async fn within a span |
| `recordEvent(name, attributes?)` | Record event on current span |
| `setAttribute(key, value)` | Set attribute on current span |
| `getTracer(name)` | Get or create a named tracer |
| `getCurrentTraceId()` | Get trace ID from current span context |

### Activity Recorders
| Function | Description |
|----------|-------------|
| `recordToolCall(record)` | Record a tool execution |
| `recordLlmCall(record)` | Record an LLM completion call |
| `recordCommand(record)` | Record a slash command execution |
| `recordDiagnostic(record)` | Record a diagnostic finding |

## Types

`TelemetryConfig`, `ToolCallRecord`, `LlmCallRecord`, `CommandRecord`, `DiagnosticRecord`

## Configuration

```ts
interface TelemetryConfig {
  serviceName?: string;    // default: "wo"
  serviceVersion?: string; // default: "1.0.0"
  otlpEndpoint?: string;   // OTLP gRPC endpoint
  console?: boolean;       // enable console diag logging
  enabled?: boolean;       // enable/disable (default: true)
}
```

## OTel Dashboard (Aspire)

1. Start Aspire dashboard: `docker run -p 4317:4317 -p 18888:18888 mcr.microsoft.com/dotnet/aspire-dashboard:latest`
2. Call `setupOtlpExporter()` in your app
3. All spans flow into the dashboard for live trace viewing
