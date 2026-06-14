---
type: organizational_chart
version: "1.0"
required_vars:
  - project_name
  - team_members
  - current_date
  - document_version
---

# {{project_name}} — Organizational Chart

**Document**: Organizational Structure
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Leadership Structure

```
[Company Name]
│
├── CEO (Chief Executive Officer)
│   ├── CTO (Chief Technology Officer)
│   │   ├── Engineering Team
│   │   ├── DevOps / Infrastructure
│   │   └── QA / Testing
│   ├── CPO / Product Lead
│   │   ├── Product Management
│   │   ├── UX / Design
│   │   └── Data / Analytics
│   ├── CMO (Chief Marketing Officer)
│   │   ├── Marketing
│   │   ├── Content / PR
│   │   └── Events
│   ├── VP Sales
│   │   ├── Direct Sales
│   │   ├── Partner Channels
│   │   └── Customer Success
│   └── COO / Operations
│       ├── HR / People
│       ├── Finance
│       └── Legal / Compliance
```

---

## Department Breakdown

### Engineering

| Role | Team Lead | Current Headcount | Hiring Target |
|------|-----------|-------------------|---------------|
| [Role] | [Name] | [Count] | [Target] |
| [Role] | [Name] | [Count] | [Target] |

### Product & Design

| Role | Team Lead | Current Headcount | Hiring Target |
|------|-----------|-------------------|---------------|
| [Role] | [Name] | [Count] | [Target] |

### Sales & Marketing

| Role | Team Lead | Current Headcount | Hiring Target |
|------|-----------|-------------------|---------------|
| [Role] | [Name] | [Count] | [Target] |

### Operations & Admin

| Role | Team Lead | Current Headcount | Hiring Target |
|------|-----------|-------------------|---------------|
| [Role] | [Name] | [Count] | [Target] |

---

## Reporting Lines

| Role | Reports To | Department |
|------|-----------|------------|
{{#each team_members}}
| {{name}} ({{role}}) | [Manager Name] | [Department] |
{{/each}}

---

## Team Overview

| Name | Role | Department | Location | Reports To |
|------|------|-----------|----------|-----------|
{{#each team_members}}
| {{name}} | {{role}} | [Department] | [Location] | [Manager] |
{{/each}}

---

## Growth Plan

| Quarter | Target Headcount | Key Hires |
|---------|-----------------|-----------|
| Q1 | [Count] | [Roles] |
| Q2 | [Count] | [Roles] |
| Q3 | [Count] | [Roles] |
| Q4 | [Count] | [Roles] |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
