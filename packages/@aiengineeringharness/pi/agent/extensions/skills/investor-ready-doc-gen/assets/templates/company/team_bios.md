---
type: team_bios
version: "1.0"
required_vars:
  - project_name
  - team_members
  - advisors
  - current_date
  - document_version
---

# {{project_name}} - Team

**Document**: Team Biographies
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Executive Team

{{project_name}} is led by a team with deep expertise in {{target_market}}.

{{#each team_members}}
### {{name}} — {{role}}

**Background**: {{background}}

**Experience**:
{{#each experience}}
- {{this}}
{{/each}}

**Education**: {{education}}

**Role at {{../project_name}}**: {{role_description}}

**Contributions**: {{contributions}}

**LinkedIn**: [Profile URL]

---

{{/each}}

## Organizational Structure

```
{{organizational_structure}}
```

---

## Advisors

{{#if advisors}}
{{#each advisors}}
### {{name}} — {{role}}
{{background}}

*Expertise*: {{expertise}}

---

{{/each}}
{{else}}
*[Advisor information to be added]*
{{/if}}

---

## Hiring Plan

| Role | Headcount | Timeline | Location | Status |
|------|-----------|----------|----------|--------|
{{#each hiring_plan}}
| {{role}} | {{headcount}} | {{timeline}} | {{location}} | {{status}} |
{{/each}}

---

## Board of Directors

| Name | Title | Affiliation | Background |
|------|-------|-------------|------------|
| [Name] | [Title] | [Org] | [Background] |
| [Name] | [Title] | [Org] | [Background] |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
