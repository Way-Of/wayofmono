---
name: otel-collector
description: Configuration and management of OTel Collector pipelines.
trigger: manual
---

# OTel Collector

This skill manages the pipeline that receives, processes, and exports telemetry data.

## Responsibilities
- **Receivers:** Configure OTLP (gRPC/HTTP) to receive data from apps.
- **Processors:** Batching, resource detection, and attribute redaction.
- **Exporters:** Sending data to the Aspire Dashboard or other backends.
