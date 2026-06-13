---
type: revenue_model
version: "1.0"
required_vars:
  - project_name
  - revenue_streams
  - pricing_tiers
  - pricing_strategy
  - monetization_plans
  - revenue_kpis
  - revenue_projections
  - current_date
  - document_version
---

# {{project_name}} - Revenue Model

**Document**: Revenue Model
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Overview

This document details {{project_name}}'s revenue generation strategy, pricing architecture, and monetization roadmap.

---

## Revenue Streams

### Primary Revenue

{{#each revenue_streams}}
### {{stream_name}}
- **Type**: {{type}}
- **Description**: {{description}}
- **Pricing Model**: {{pricing_model}}
- **Target Segment**: {{target_segment}}
- **Revenue Contribution**: {{revenue_contribution}}% of total
- **Growth Rate**: {{growth_rate}}
- **Gross Margin**: {{gross_margin}}

{{/each}}

### Secondary Revenue

| Stream | Type | Current Revenue | Target Revenue | Timeline |
|--------|------|----------------|----------------|----------|
| [Stream 1] | [Type] | [Amt] | [Amt] | [Timeline] |
| [Stream 2] | [Type] | [Amt] | [Amt] | [Timeline] |

---

## Pricing Tiers

| Tier | Price | Target Customer | Features | Capacity | Support Level |
|-----|-------|----------------|----------|----------|---------------|
{{#each pricing_tiers}}
| {{tier_name}} | {{price}} | {{target_customer}} | {{key_features}} | {{capacity}} | {{support}} |
{{/each}}

---

## Pricing Strategy

### Strategy Rationale

{{pricing_strategy}}

### Competitive Pricing Analysis

| Competitor | Pricing Model | Price Range | Positioning vs {{project_name}} |
|------------|--------------|-------------|-------------------------------|
| [Competitor] | [Model] | [Range] | [Higher/Lower/Similar] |
| [Competitor] | [Model] | [Range] | [Higher/Lower/Similar] |

### Value-Based Justification

{{value_justification}}

---

## Monetization Plan

### Near-Term (0-12 months)

{{monetization_plan_near_term}}

### Medium-Term (12-24 months)

{{monetization_plan_medium_term}}

### Long-Term (24+ months)

{{monetization_plan_long_term}}

### Upsell & Expansion Strategies

| Strategy | Mechanism | Expected Lift | Timeline |
|----------|-----------|---------------|----------|
| [Strategy] | [Mechanism] | [Lift] | [Timeline] |
| [Strategy] | [Mechanism] | [Lift] | [Timeline] |

---

## Key Revenue Metrics

| Metric | Current | Target | Benchmark |
|--------|---------|--------|-----------|
{{#each revenue_kpis}}
| {{metric}} | {{current}} | {{target}} | {{benchmark}} |
{{/each}}

---

## Revenue Projections

### Annual Revenue Forecast

| Year | Base Case | Growth Case | Conservative | Key Assumptions |
|------|-----------|-------------|--------------|-----------------|
| Year 1 | [Amt] | [Amt] | [Amt] | [Assumptions] |
| Year 2 | [Amt] | [Amt] | [Amt] | [Assumptions] |
| Year 3 | [Amt] | [Amt] | [Amt] | [Assumptions] |
| Year 4 | [Amt] | [Amt] | [Amt] | [Assumptions] |
| Year 5 | [Amt] | [Amt] | [Amt] | [Assumptions] |

### Revenue by Stream

| Year | Stream 1 | Stream 2 | Stream 3 | Total |
|------|----------|----------|----------|-------|
| Year 1 | [Amt] | [Amt] | [Amt] | [Amt] |
| Year 2 | [Amt] | [Amt] | [Amt] | [Amt] |
| Year 3 | [Amt] | [Amt] | [Amt] | [Amt] |

### Unit Economics Trajectory

| Metric | Current | Year 1 | Year 2 | Year 3 |
|--------|---------|--------|--------|--------|
| ARPU | [Amt] | [Amt] | [Amt] | [Amt] |
| ARR per Customer | [Amt] | [Amt] | [Amt] | [Amt] |
| LTV | [Amt] | [Amt] | [Amt] | [Amt] |
| CAC | [Amt] | [Amt] | [Amt] | [Amt] |
| LTV/CAC Ratio | [X] | [X] | [X] | [X] |

---

## Sales Forecasting

### Pipeline Model

| Stage | Conversion Rate | Deal Size | Time to Close |
|-------|----------------|-----------|---------------|
| Lead | [%] | [N/A] | [N/A] |
| Qualified | [%] | [Amt] | [Days] |
| Proposal | [%] | [Amt] | [Days] |
| Negotiation | [%] | [Amt] | [Days] |
| Closed Won | 100% | [Amt] | [Total] |

### Quarterly Sales Forecast

| Quarter | New Deals | Expansion | Churn | Net New ARR |
|---------|-----------|-----------|-------|-------------|
| Q1 | [Amt] | [Amt] | [Amt] | [Amt] |
| Q2 | [Amt] | [Amt] | [Amt] | [Amt] |
| Q3 | [Amt] | [Amt] | [Amt] | [Amt] |
| Q4 | [Amt] | [Amt] | [Amt] | [Amt] |

---

## Revenue Risks & Mitigations

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| [Risk] | [Impact] | [Prob] | [Mitigation] |
| [Risk] | [Impact] | [Prob] | [Mitigation] |

---

## Document Version: {{document_version}}
**Last Updated**: {{current_date}}
