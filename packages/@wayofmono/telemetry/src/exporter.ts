import { context, trace, diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import type { TelemetryConfig } from "./types.js";

let initialized = false;

export function initTelemetry(config: TelemetryConfig = {}): void {
  if (initialized) return;
  initialized = true;

  if (config.console) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
  }
}

export async function shutdownTelemetry(): Promise<void> {
  try {
    const { BasicTracerProvider } = await import("@opentelemetry/sdk-trace-base");
    const provider = trace.getTracerProvider() as InstanceType<typeof BasicTracerProvider>;
    if (provider?.forceFlush) await provider.forceFlush();
    if (provider?.shutdown) await provider.shutdown();
  } catch {
    // SDK not loaded
  }
}

export async function setupOtlpExporter(endpoint?: string): Promise<void> {
  const [{ BasicTracerProvider, BatchSpanProcessor }, { OTLPTraceExporter }] = await Promise.all([
    import("@opentelemetry/sdk-trace-base") as any,
    import("@opentelemetry/exporter-otlp-grpc") as any,
  ]);

  const provider = new BasicTracerProvider();
  const exporter = new OTLPTraceExporter({
    url: endpoint || "http://localhost:4317",
  });
  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();
}

export function getCurrentTraceId(): string | undefined {
  try {
    const span = trace.getSpan(context.active());
    return span?.spanContext().traceId;
  } catch {
    return undefined;
  }
}
