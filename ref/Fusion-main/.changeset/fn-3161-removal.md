---
"@runfusion/fusion": patch
---

Remove the dashboard-owned `RoadmapsView`, `useRoadmaps` hook, and related CSS/tests from `@fusion/dashboard`. Roadmap planning now routes exclusively through the bundled `roadmap-planner` plugin dashboard view (`plugin:roadmap-planner:roadmaps`).
