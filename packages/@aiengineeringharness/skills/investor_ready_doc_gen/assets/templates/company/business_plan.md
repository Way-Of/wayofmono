---
type: business_plan
version: "1.0"
required_vars:
  - project_name
  - project_tagline
  - project_description
  - problem_statement
  - solution_description
  - target_market
  - tam_global
  - tam_national
  - market_growth_rate
  - revenue_streams
  - competitors
  - competitive_advantages
  - team_members
  - funding_ask
  - valuation
  - use_of_funds
  - current_date
  - document_version
---

# {{project_name}} — Business Plan

**Document**: Comprehensive Business Plan
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Executive Summary

{{project_name}} is {{project_tagline}}. We address {{problem_statement}} through {{solution_description}}. Operating in {{target_market}}, we are seeking {{funding_ask}} at {{valuation}} to scale operations and capture market share.

**The Opportunity**: {{tam_global}} global market ({{tam_national}} in {{geography_national}}), growing at {{market_growth_rate}}.

---

## Company Description

{{project_description}}

**Legal Structure**: [Legal entity type, jurisdiction, incorporation date]
**Mission**: [Mission statement]
**Vision**: [Vision statement]

---

## Problem & Solution

### Problem

{{problem_statement}}

### Solution

{{solution_description}}

### Why Now

{{target_market}} is at an inflection point driven by [key drivers]. {{project_name}} is uniquely positioned to capitalize on this timing.

---

## Market Analysis

### Industry Overview

[Overview of the industry {{project_name}} operates in]

### Market Sizing

| Scope | TAM | Growth Rate | Key Drivers |
|-------|-----|-------------|-------------|
| Global | {{tam_global}} | {{global_growth_rate}} | [Drivers] |
| National ({{geography_national}}) | {{tam_national}} | {{national_growth_rate}} | [Drivers] |

### Target Market

| Segment | Description | Size | Growth |
|---------|-------------|------|--------|
| [Segment 1] | [Description] | [Size] | [CAGR] |
| [Segment 2] | [Description] | [Size] | [CAGR] |

### Competitive Analysis

| Competitor | Strengths | Weaknesses | {{project_name}} Advantage |
|------------|-----------|------------|---------------------------|
{{#each competitors}}
| {{name}} | {{strengths}} | {{weaknesses}} | [Advantage] |
{{/each}}

---

## Products & Services

| Offering | Description | Pricing | Target Customer |
|----------|-------------|---------|-----------------|
{{#each revenue_streams}}
| {{channel}} | {{description}} | [Pricing] | [Customer] |
{{/each}}

### Technology

[Technology stack summary — see technical_overview.md for details]

---

## Marketing & Sales Strategy

### Go-to-Market Plan

[Summary of GTM approach — see go_to_market_strategy.md for details]

### Sales Channels

| Channel | Strategy | Target |
|---------|----------|--------|
| [Channel] | [Strategy] | [Target] |
| [Channel] | [Strategy] | [Target] |

### Marketing Channels

| Channel | Focus | Budget Allocation |
|---------|-------|-------------------|
| [Channel] | [Focus] | [%] |
| [Channel] | [Focus] | [%] |

---

## Operations

### Team Structure

{{#each team_members}}
- **{{name}}** — {{role}}: {{background}}
{{/each}}

### Key Milestones

| Milestone | Target Date | Dependencies |
|-----------|-------------|--------------|
| [Milestone] | [Date] | [Dependencies] |
| [Milestone] | [Date] | [Dependencies] |

### Facilities & Infrastructure

[Locations, infrastructure requirements, technology needs]

---

## Financial Plan

### Revenue Model

{{#each revenue_streams}}
- **{{channel}}**: {{description}}
{{/each}}

### Key Assumptions

| Assumption | Value | Rationale |
|------------|-------|-----------|
| CAC | [Amt] | [Rationale] |
| LTV | [Amt] | [Rationale] |
| Churn Rate | [%] | [Rationale] |
| Gross Margin | [%] | [Rationale] |

### Financial Projections

| Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|--------|--------|--------|--------|--------|--------|
| Revenue | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| COGS | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| Gross Profit | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| OPEX | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| EBITDA | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| Net Income | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| Customers | [Count] | [Count] | [Count] | [Count] | [Count] |

---

## Funding Requirements

| Round | Amount | Timeline | Use of Funds |
|-------|--------|----------|--------------|
| {{current_round}} | {{funding_ask}} | [Timeline] | {{#each use_of_funds}}{{category}} ({{percentage}}%){{#unless @last}}, {{/unless}}{{/each}} |
| Series A | [Amt] | [Timeline] | [Use] |
| Series B | [Amt] | [Timeline] | [Use] |

### Use of Funds

| Category | Percentage | Amount | Purpose |
|----------|-----------|--------|---------|
{{#each use_of_funds}}
| {{category}} | {{percentage}}% | [Amt] | {{description}} |
{{/each}}
| **Total** | **100%** | **{{funding_ask}}** | |

---

## Appendices

- Pitch Deck
- Financial Model
- Team Biographies
- Market Research
- Technical Overview

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
