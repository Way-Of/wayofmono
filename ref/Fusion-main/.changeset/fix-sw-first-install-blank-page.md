---
"@runfusion/fusion": patch
---

Fix dashboard rendering blank on first load by skipping the service worker `controllerchange` reload on initial install — the page only reloads now when an existing controller is genuinely being replaced.
