---
"@runfusion/fusion": patch
---

Fix: dependency graph plugin failed to load because its plugin entry imported React/dashboard modules. Split the plugin into a server-pure metadata entry and a separate `./dashboard-view` subpath so the bundled-install loader can register it without crashing.
