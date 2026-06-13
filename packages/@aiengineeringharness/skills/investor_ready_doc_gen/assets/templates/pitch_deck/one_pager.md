---
type: one_pager
version: "2.0"
required_vars:
  - project_name
  - project_tagline
  - problem_statement
  - solution_description
  - solution_highlights
  - target_market
  - tam_global
  - tam_national
  - sam
  - som
  - key_metrics
  - revenue_streams
  - competitive_advantages
  - team_members
  - funding_ask
  - valuation
  - current_date
  - document_version
---

# {{project_name}} — One-Pager

**Document**: Investment One-Pager
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## {{project_name}}

**{{project_tagline}}**

---

## The Problem

{{problem_statement}}

---

## The Solution

{{solution_description}}

**Key Differentiators**:
{{#each solution_highlights}}
- **{{title}}**: {{description}}
{{/each}}

---

## Market Opportunity

| Scope | Market Size | Growth |
|-------|-------------|--------|
| Global | {{tam_global}} | {{global_growth_rate}} |
| National | {{tam_national}} | {{national_growth_rate}} |
| **SAM** | {{sam}} |
| **SOM** | {{som}} |

---

## Traction

| Metric | Value |
|--------|-------|
| ARR | {{key_metrics.arr}} |
| MRR | {{key_metrics.mrr}} |
| Growth | {{key_metrics.growth_rate}} |
| Customers | {{key_metrics.customers}} |

---

## Business Model

{{#each revenue_streams}}
- {{channel}}: {{description}}
{{/each}}

**Competitive Edge**: {{#each competitive_advantages}}{{this}}{{#unless @last}} | {{/unless}}{{/each}}

---

## Team

{{#each team_members}}{{name}} ({{role}}){{#unless @last}}, {{/unless}}{{/each}}

---

## Why Now

The market is ready. {{target_market}} is experiencing [key inflection point]. {{project_name}} is positioned to capture this opportunity.

---

## Get in on the Ground Floor

**Ask**: {{funding_ask}} at {{valuation}} valuation

---

**Contact**: [Email]
**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
