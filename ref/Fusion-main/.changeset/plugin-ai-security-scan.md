---
"@runfusion/fusion": minor
---

Add optional plugin AI security scan controls across install/rescan workflows.

- `fn plugin install <path-or-package> --ai-scan` to opt into scan-on-load
- `fn plugin rescan <id>` to run a fresh scan/reload and surface verdict details
- Dashboard/API plugin management now supports toggling `aiScanOnLoad` and explicit rescans with persisted scan results
