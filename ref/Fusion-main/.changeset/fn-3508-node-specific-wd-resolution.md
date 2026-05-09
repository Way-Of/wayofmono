---
"@runfusion/fusion": patch
---

Resolve project runtime working directories from per-node project path mappings for the routed/current node instead of falling back to `RegisteredProject.path`, and fail with clear errors when the exact mapping is missing.
