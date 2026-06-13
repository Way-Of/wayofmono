---
type: send_ahead_deck
version: "1.0"
required_vars:
  - project_name
  - project_tagline
  - project_description
  - problem_statement
  - solution_description
  - target_market
  - tam
  - sam
  - som
  - revenue_streams
  - pricing_model
  - competitors
  - competitive_advantages
  - team_members
  - key_metrics
  - funding_ask
  - valuation
  - use_of_funds
  - current_traction
  - risks
  - current_date
  - document_version
---

# {{project_name}} - Send-Ahead Deck

**Document**: Send-Ahead Investor Deck
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Executive Summary

{{project_name}} is a {{project_tagline}}. We solve {{problem_statement}} through {{solution_description}}. With a {{tam}} TAM in {{target_market}}, {{project_name}} is seeking {{funding_ask}} to scale.

---

## Company Overview

{{project_description}}

**Founded**: {{incorporation_date}}{{#if jurisdiction}}
**Jurisdiction**: {{jurisdiction}}{{/if}}

---

## Problem & Solution

**Problem**: {{problem_statement}}

**Solution**: {{solution_description}}

{{#if competitive_advantages}}
**Why Us**:
{{#each competitive_advantages}}
- {{this}}
{{/each}}
{{/if}}

---

## Market

- **TAM**: {{tam}}
- **SAM**: {{sam}}
- **SOM**: {{som}}
{{#if market_growth_rate}}
- **Growth**: {{market_growth_rate}}
{{/if}}

---

## Traction

{{#each current_traction}}
- {{this}}
{{/each}}

---

## Business Model

{{#each revenue_streams}}
- {{this}}
{{/each}}

**Pricing**: {{pricing_model}}

---

## Competition

{{#each competitors}}
- **{{name}}**: {{position}}
{{/each}}

**Our Edge**: {{competitive_advantages}}

---

## Team

{{#each team_members}}
- **{{name}}** — {{role}}: {{bio}}
{{/each}}

---

## Financial Summary

- ARR: {{key_metrics.arr}}
- Growth: {{key_metrics.growth_rate}}
- Gross Margin: {{key_metrics.gross_margin}}
- CAC: {{key_metrics.cac}}
- LTV: {{key_metrics.ltv}}

---

## Investment

- **Ask**: {{funding_ask}}
- **Valuation**: {{valuation}}
**Use of Funds**:
{{#each use_of_funds}}
- {{this}}
{{/each}}

---

## Appendix

[Supplementary materials, detailed metrics, technical specifications]

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
