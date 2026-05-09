---
"@runfusion/fusion": patch
---

Fix plugin installation persistence so user-installed plugins are always recorded in the shared central `plugin_installs` registry (with per-project state in `project_plugin_states`) instead of project-local legacy plugin rows. This ensures installs are visible across projects and processes as intended.
