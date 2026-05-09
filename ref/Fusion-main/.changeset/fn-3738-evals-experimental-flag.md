---
"@runfusion/fusion": minor
---

Add a new global experimental feature flag, `experimentalFeatures.evalsView`, and default it to off for Evals surfaces. When disabled, the dashboard Evals view, Settings → Scheduled Evals section, header/mobile Evals navigation entries, and in-process scheduled-eval cron execution are hidden or short-circuited. Projects already using `evalSettings.enabled` must also enable `evalsView` to expose and run scheduled eval workflows.
