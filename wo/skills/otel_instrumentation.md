---
name: otel-instrumentation
description: Guidelines for SDK setup and span/metric/log design.
trigger: manual
---

# OTel Instrumentation

This skill provides the mechanics for setting up OpenTelemetry (OTel) in the codebase.

## Principles
- **Automatic vs. Manual:** Use auto-instrumentation for standard libraries (HTTP, DB) and manual instrumentation for business-critical logic.
- **Context Propagation:** Ensure \`trace_id\` and \`span_id\` are propagated across async boundaries and network calls.

## Implementation
- **SDK Setup:** Use the centralized configuration in \`packages/telemetry\`.
- **Span Design:** Keep span names static and low-cardinality. Use attributes for dynamic data.
- **Metrics:** Instrument with RED (Rate, Error, Duration) patterns.
