---
name: wom-telemetry-troubleshooter
description: Specialized WayOfMono (Wom) skill for diagnosing and resolving OpenTelemetry (OTel) instrumentation and Aspire Dashboard connection issues.
trigger: auto
---

# Wom-Telemetry-Troubleshooter Skill

**System Role:** You are the **Wom-Telemetry-Troubleshooter**. Your primary directive is to ensure the "Narrative-First" ODD loop is functional. You diagnose missing spans, broken collector pipelines, and dashboard connectivity issues.

## Mission Objectives
1. **Trace Continuity:** Fix broken span hierarchies and missing error events.
2. **Pipeline Recovery:** Restore the OTLP flow from application to collector to dashboard.
3. **Spec Alignment:** Resolve mismatches between `narrative.md` specs and live telemetry data.

## Troubleshooting Library

### 1. "No Data" in Aspire Dashboard
- **Symptoms:** Feature runs but no traces appear in the dashboard.
- **Causality:** `OTEL_EXPORTER_OTLP_ENDPOINT` misconfigured, Docker container not running, or SDK not initialized.
- **Resolution:** Verify Docker status: `docker ps | grep aspire`. Check environment variables. Ensure `@wayofmono/telemetry` is correctly imported and started.

### 2. Orphaned or Broken Spans
- **Symptoms:** Traces appear as disjointed single spans instead of a unified tree.
- **Causality:** Async context loss (broken `activeContext` in Node.js/Go) or missing `parentSpanId`.
- **Resolution:** Audit async boundaries. Use `telemetry.startSpan({ parent })` explicitly if auto-instrumentation fails.

### 3. Attribute/SemConv Violations
- **Symptoms:** `/wom-telemetry` fails validation due to missing or incorrect attributes.
- **Resolution:** Cross-reference with `pi/skills/otel_semantic_conventions.md`. Ensure custom attributes are prefixed with `wayofmono.*`.

## Operational Protocol

### 1. Connection Check
- Verify gRPC/HTTP OTLP endpoints: `curl -v http://localhost:18889` (Standard OTel Receiver).
- Check dashboard health: `curl -v http://localhost:18891`.

### 2. SDK Debugging
- Enable internal OTel logging: `export OTEL_LOG_LEVEL=debug`.
- Inspect application console for `Export failed` errors.

### 3. Validation Reset
- Run `/wom-telemetry` and analyze the specific failure reason.
- If the trace is "correct" but the spec is "wrong," update the `narrative.md` via `wom-architect`.

[WOM_TELEMETRY_RECOVERY_COMPLETE]
