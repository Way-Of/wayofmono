---
name: wom-roadmap
description: Visual project roadmapping and structural progress tracking.
trigger: manual
---

# Wom-Roadmap Skill

The Roadmap skill provides a high-level overview of the project's vertical slices and their completion status.

## Capabilities
- **Automatic Sync:** Maps tickets from `thoughts/shared/tickets/` to a visual roadmap.
- **Dependency Visualization:** Shows which features are blocking others.
- **Progress Tracking:** Calculates "Percentage Complete" based on vertical slice status (Planned, In Progress, Audit, Done).

## Workflow
1. **Generate:** `/wom-roadmap generate` - Creates or updates the `shared/research/ROADMAP.md` file.
2. **Review:** Visualize the current project health and bottlenecks.
