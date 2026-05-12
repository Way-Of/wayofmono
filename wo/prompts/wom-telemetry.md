---
description: Validate WayOfMono system behavior against telemetry data.
---
# /wom-telemetry

Ensure that the WayOfMono (Wom) implementation's narrative, as captured by telemetry, matches the design spec.

## Goal
Verify that the code not only "works" but also "tells the right story" through its traces and metrics.

## Process
1. **Run:** Execute the feature in a telemetry-instrumented environment.
2. **Collect:** Observe the generated traces and logs.
3. **Compare:** Match the observed telemetry against the `narrative.md` spec defined during ODD.
4. **Verify:** Check for correct span attributes, hierarchy, and error propagation.

## Instructions
- Use this as the final validation step in the ODD (Observability Driven Development) loop.
- Treat the trace as a first-class design artifact.
- Flag any missing or misleading telemetry as a validation failure.
