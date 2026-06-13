---
type: product_roadmap
version: "1.0"
required_vars:
  - project_name
  - project_tagline
  - project_description
  - roadmap_short_term
  - roadmap_medium_term
  - roadmap_long_term
  - current_date
  - document_version
---

# {{project_name}} - Product Roadmap

**Document**: Product Roadmap
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Product Vision

{{project_description}}

---

## Current State

{{#each current_traction}}
- {{this}}
{{/each}}

---

## Short-Term Roadmap (3-6 Months)

| Priority | Feature/Initiative | Description | Expected Impact | Dependencies |
|----------|-------------------|-------------|-----------------|--------------|
{{#each roadmap_short_term}}
| [P{{@index}}] | {{item}} | {{description}} | {{impact}} | {{dependencies}} |
{{/each}}

---

## Medium-Term Roadmap (6-12 Months)

| Priority | Feature/Initiative | Description | Expected Impact | Dependencies |
|----------|-------------------|-------------|-----------------|--------------|
{{#each roadmap_medium_term}}
| [P{{@index}}] | {{item}} | {{description}} | {{impact}} | {{dependencies}} |
{{/each}}

---

## Long-Term Roadmap (1-3 Years)

| Priority | Initiative | Description | Strategic Rationale |
|----------|-----------|-------------|-------------------|
{{#each roadmap_long_term}}
| [P{{@index}}] | {{item}} | {{description}} | {{rationale}} |
{{/each}}

---

## Resource Requirements

| Phase | Engineering | Product | Design | Ops | Budget |
|-------|-------------|---------|--------|-----|--------|
| Short-Term | [FTEs] | [FTEs] | [FTEs] | [FTEs] | [Amt] |
| Medium-Term | [FTEs] | [FTEs] | [FTEs] | [FTEs] | [Amt] |
| Long-Term | [FTEs] | [FTEs] | [FTEs] | [FTEs] | [Amt] |

---

## Key Milestones

| Date | Milestone | Dependencies | Status | ETA Confidence |
|------|-----------|-------------|--------|----------------|
| [Date] | [Milestone] | [Deps] | [🟢/🟡/🔴] | [High/Medium/Low] |
| [Date] | [Milestone] | [Deps] | [🟢/🟡/🔴] | [High/Medium/Low] |
| [Date] | [Milestone] | [Deps] | [🟢/🟡/🔴] | [High/Medium/Low] |
| [Date] | [Milestone] | [Deps] | [🟢/🟡/🔴] | [High/Medium/Low] |

---

## Dependencies

| Feature | Technical Dependency | External Dependency | Partnership Dependency |
|---------|---------------------|--------------------|----------------------|
| [Feature] | [Dep] | [Dep] | [Dep] |
| [Feature] | [Dep] | [Dep] | [Dep] |

---

## Risk Factors

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| Technical Risk | [Impact] | [Prob] | [Mitigation] |
| Market Risk | [Impact] | [Prob] | [Mitigation] |
| Resource Risk | [Impact] | [Prob] | [Mitigation] |
| Dependency Risk | [Impact] | [Prob] | [Mitigation] |

---

## Success Metrics

| KPI | Current | Short-Term Target | Medium-Term Target | Long-Term Target |
|-----|---------|-------------------|--------------------|------------------|
| [KPI] | [Current] | [Target] | [Target] | [Target] |
| [KPI] | [Current] | [Target] | [Target] | [Target] |
| [KPI] | [Current] | [Target] | [Target] | [Target] |

---

---

## Out of Scope

The following items are explicitly **not** in scope for the current roadmap:

| Item | Rationale | Potential Future Consideration |
|------|-----------|-------------------------------|
| [Out of Scope Item 1] | [Rationale] | [Yes/No/Maybe] |
| [Out of Scope Item 2] | [Rationale] | [Yes/No/Maybe] |
| [Out of Scope Item 3] | [Rationale] | [Yes/No/Maybe] |
| [Out of Scope Item 4] | [Rationale] | [Yes/No/Maybe] |

---

## Status Legend

| Icon | Meaning |
|------|---------|
| 🔴 | Not Started / At Risk |
| 🟡 | In Progress |
| 🟢 | Completed |
| ⚪ | Planned / Backlog |
| 🔵 | Blocked / Pending Decision |
| ⭐ | Launched |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
