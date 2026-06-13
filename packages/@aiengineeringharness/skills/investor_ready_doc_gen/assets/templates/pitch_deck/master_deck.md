---
type: master_deck
version: "2.0"
required_vars:
  - project_name
  - project_tagline
  - problem_statement
  - problem_details
  - solution_description
  - solution_highlights
  - target_market
  - tam
  - sam
  - som
  - technology_stack
  - market_trends
  - revenue_streams
  - revenue_projections
  - competitors
  - competitive_advantages
  - team_members
  - key_metrics
  - funding_ask
  - valuation
  - use_of_funds
  - current_traction
  - architecture_description
  - competitive_matrix
  - core_components
  - current_date
  - document_version
---

# {{project_name}} — Master Pitch Deck

**Document**: Master Pitch Deck Presentation
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Executive Summary

{{#if project_tagline}}**{{project_tagline}}**{{/if}}

{{problem_statement}}

**Market**: {{target_market}} — {{tam}} TAM
**Ask**: {{funding_ask}} at {{valuation}} valuation

---

## The Problem

{{problem_statement}}

### Dimensions of the Problem

{{#each problem_details}}
### {{title}}
{{description}}

{{/each}}

---

## Our Solution

{{solution_description}}

### Key Capabilities

{{#each solution_highlights}}
- **{{title}}**: {{description}}
{{/each}}

{{#if core_components}}
### System Architecture

{{#each core_components}}
- **{{name}}**: {{description}}
{{/each}}
{{/if}}

---

## Why Now

{{target_market}} is at an inflection point:

{{#each market_trends}}
- **{{title}}** ({{timeline}}): {{description}}
{{/each}}

---

## Market Opportunity

| | Global | National ({{geography_national}}) |
|---|---|---|
| **TAM** | {{tam_global}} | {{tam_national}} |
| **Growth Rate** | {{global_growth_rate}} | {{national_growth_rate}} |
| **Trends** | {{global_trends}} |

| **SAM** | {{sam}} |
| **SOM** | {{som}} |

---

## Technology

**Stack**: {{#each technology_stack}}{{category}}{{#unless @last}} | {{/unless}}{{/each}}

{{#if architecture_description}}
{{architecture_description}}
{{/if}}

---

## Traction

{{#each current_traction}}
- {{this}}
{{/each}}

### Key Metrics

| Metric | Value |
|--------|-------|
| ARR | {{key_metrics.arr}} |
| MRR | {{key_metrics.mrr}} |
| Growth | {{key_metrics.growth_rate}} |
| Gross Margin | {{key_metrics.gross_margin}} |
| CAC | {{key_metrics.cac}} |
| LTV | {{key_metrics.ltv}} |
| Churn | {{key_metrics.churn}} |
| Payback Period | {{key_metrics.payback_period}} |

---

## Business Model

{{#each revenue_streams}}
- **{{channel}}**: {{description}}
{{/each}}

**Pricing**: {{pricing_model}}

---

## Competition

| | {{project_name}} | Competitor A | Competitor B | Competitor C |
|---|---|---|---|---|
{{#each competitive_matrix}}
| {{feature}} | {{us}} | {{them_a}} | {{them_b}} | {{them_c}} |
{{/each}}

### Competitive Moats

| Moat | Our Advantage |
|------|--------------|
{{#each competitive_advantages}}
| {{@key}} | {{this}} |
{{/each}}

---

## Team

| Name | Role | Background |
|------|------|------------|
{{#each team_members}}
| {{name}} | {{role}} | {{bio}} |
{{/each}}

---

## Financials

| Metric | Current | Year 1 | Year 2 | Year 3 |
|--------|---------|--------|--------|--------|
| ARR | {{key_metrics.arr}} | [Proj] | [Proj] | [Proj] |
| Revenue | [Current] | [Proj] | [Proj] | [Proj] |
| EBITDA | [Current] | [Proj] | [Proj] | [Proj] |
| Customers | [Current] | [Proj] | [Proj] | [Proj] |

{{#if revenue_projections}}
| Year | Revenue | Growth |
|------|---------|--------|
{{#each revenue_projections}}
| {{year}} | {{revenue}} | {{growth}} |
{{/each}}
{{/if}}

### Unit Economics Trajectory

| Metric | Current | Target |
|--------|---------|--------|
| ARPU | [Amt] | [Amt] |
| LTV/CAC | [Ratio] | [Ratio] |
| Gross Margin | [%] | [%] |

---

## The Ask

- **Amount**: {{funding_ask}}
- **Valuation**: {{valuation}}
- **Use of Funds**:

| Category | % | Description |
|----------|---|-------------|
{{#each use_of_funds}}
| {{category}} | {{percentage}}% | {{description}} |
{{/each}}

---

## Roadmap

**Current**: {{current_traction}}

| Horizon | Focus |
|---------|-------|
{{#if roadmap_short_term}}
**Short-Term** (0-12 months):
{{#each roadmap_short_term}}
- {{item}}: {{description}}
{{/each}}
{{/if}}
{{#if roadmap_medium_term}}
**Medium-Term** (12-24 months):
{{#each roadmap_medium_term}}
- {{item}}: {{description}}
{{/each}}
{{/if}}
{{#if roadmap_long_term}}
**Long-Term** (24+ months):
{{#each roadmap_long_term}}
- {{item}}: {{description}}
{{/each}}
{{/if}}

---

## Vision

[Long-term vision for {{project_name}} — where will the company be in 5-10 years?]

---

## Contact

[Company Contact Name]
[Email Address]
[Website]

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
