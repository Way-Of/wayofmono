---
name: observability-driven-development
description: Design the trace before the feature. Triggers on "ODD", "telemetry", "instrumentation".
trigger: manual
---

# Observability-Driven Development (ODD)

ODD treats the **trace as a first-class design artifact**. You design the narrative of your code's execution before you write the logic.

## The ODD Philosophy
"A feature isn't 'done' when its tests pass; it's done when its trace accurately and legibly narrates the entire request lifecycle."

## Workflow

### 1. Narrative Design
Before implementing, write a **Narrative Spec** in \`thoughts/shared/research/telemetry/<feature>.md\`.
- **Span Tree:** Visualize the hierarchy of operations.
- **Attributes:** Define key metadata for each span (e.g., \`user_id\`, \`action_type\`).
- **Events:** Identify critical points for logs within the trace.

### 2. Instrumentation
Implement the feature while simultaneously adding OpenTelemetry instrumentation.
- Use the **@wayofmono/telemetry** package (aligned with Pi standards).
- Follow semantic conventions for attribute naming.

### 3. Observation
Run the code locally and observe the trace in the **Aspire Dashboard**.
- Ensure the trace shape matches your narrative spec.
- Verify that attributes are correctly populated and no sensitive data is leaked.

### 4. Validation
Use the \`/validate_telemetry\` command to automatically compare the captured trace against the narrative spec.

## Rules
- **No Orphan Spans:** Every span must have a parent or be the root.
- **Low Cardinality:** Avoid putting unique IDs (like GUIDs) in span names; use attributes instead.
- **Narrative First:** Instrumentation is not an afterthought; it is part of the design.

## Checklist
- [ ] Narrative spec written and approved.
- [ ] Instrumentation covers all critical paths.
- [ ] Trace correctly reflects the execution story.
- [ ] Validation report is clean.
