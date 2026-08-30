import { context, trace, SpanStatusCode, type Span, type Tracer, type SpanOptions, type Attributes } from "@opentelemetry/api";
import type { TelemetryConfig } from "./types.js";

const tracerMap = new Map<string, Tracer>();

export function getTracer(name: string): Tracer {
  let t = tracerMap.get(name);
  if (!t) {
    t = trace.getTracer(name);
    tracerMap.set(name, t);
  }
  return t;
}

export function startSpan(name: string, opts?: SpanOptions): Span {
  const tracer = getTracer("wo");
  return tracer.startSpan(name, opts);
}

export async function runInSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  opts?: SpanOptions
): Promise<T> {
  const tracer = getTracer("wo");
  const span = tracer.startSpan(name, opts);
  try {
    const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (err) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
    span.recordException(err as Error);
    throw err;
  } finally {
    span.end();
  }
}

export function recordEvent(name: string, attributes?: Attributes): void {
  const span = trace.getSpan(context.active());
  if (span) {
    span.addEvent(name, attributes);
  }
}

export function setAttribute(key: string, value: unknown): void {
  const span = trace.getSpan(context.active());
  if (span) {
    span.setAttribute(key, value as any);
  }
}
