---
title: "[PROJ-004] Implement @wayofmono/telemetry — ODD Instrumentation SDK"
type: "Feature"
priority: "High"
status: "In Progress"
assignee: "@zerwiz"
created: "2024-05-09"
---

## Context
The `@wayofmono/telemetry` package provides OpenTelemetry-based observability for the Wo agent ecosystem. Designed for Observability-Driven Development (ODD) with Aspire dashboard support. This is a Wo-native package with no direct pi equivalent.

## Current Status
Package structure exists with basic OTel API integration, but no real tracing provider is registered.

## Remaining Work
- [ ] **TracerProvider registration** — Currently uses global OTel API only. Register a real OTLP exporter.
- [ ] **Tracer hierarchy** — Separate named tracers per subsystem: agent, tool, llm, lens, command
- [ ] **AsyncLocalStorage context propagation** — Auto-propagate active span across async calls (no manual `context.with()`)
- [ ] **Console exporter for dev** — Pretty-print spans to stderr for development
- [ ] **Parent-child span relationships** — Automatic parent linking from active span
- [ ] **Narrative validation hooks** — `/validate_telemetry` support for ODD narrative testing
- [ ] **Rich dashboard span attributes** — Structured attributes for Aspire dashboard filtering

## Verification
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
- [ ] Spans export via OTLP to Aspire dashboard
- [ ] Console exporter works for development
- [ ] Trace ID accessible from agent context
