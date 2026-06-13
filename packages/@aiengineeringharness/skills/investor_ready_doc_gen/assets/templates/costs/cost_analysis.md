---
type: cost_analysis
version: "1.0"
required_vars:
  - project_name
  - cost_categories
  - total_historical_spend
  - monthly_burn
  - current_date
  - document_version
---

# {{project_name}} - Cost Analysis

**Document**: Cost Analysis
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Total Cost Overview

| Category | Monthly | Annual | Percentage |
|----------|---------|--------|------------|
{{#each cost_categories}}
| {{category}} | [Amt] | [Amt] | [%] |
{{/each}}
| **Total** | **{{monthly_burn}}** | **[Annual Total]** | **100%** |

---

## Development Costs

| Sub-Category | Monthly | Annual | Notes |
|-------------|---------|--------|-------|
| Engineering Salaries | [Amt] | [Amt] | [Notes] |
| Contractor Payments | [Amt] | [Amt] | [Notes] |
| Development Tools | [Amt] | [Amt] | [Notes] |
| **Total Development** | **[Amt]** | **[Amt]** | |

---

## Infrastructure Costs

| Sub-Category | Monthly | Annual | Notes |
|-------------|---------|--------|-------|
| Cloud Computing | [Amt] | [Amt] | [Notes] |
| Database Hosting | [Amt] | [Amt] | [Notes] |
| CDN & Bandwidth | [Amt] | [Amt] | [Notes] |
| Monitoring Tools | [Amt] | [Amt] | [Notes] |
| **Total Infrastructure** | **[Amt]** | **[Amt]** | |

---

## People Costs

| Sub-Category | Monthly | Annual | Headcount |
|-------------|---------|--------|-----------|
| Salaries & Wages | [Amt] | [Amt] | [Count] |
| Benefits & Insurance | [Amt] | [Amt] | [Count] |
| Equity Compensation | [Amt] | [Amt] | [Count] |
| Recruitment & Training | [Amt] | [Amt] | - |
| **Total People** | **[Amt]** | **[Amt]** | |

---

## Operational Costs

| Sub-Category | Monthly | Annual | Notes |
|-------------|---------|--------|-------|
| Office & Facilities | [Amt] | [Amt] | [Notes] |
| Legal & Professional | [Amt] | [Amt] | [Notes] |
| Travel & Expenses | [Amt] | [Amt] | [Notes] |
| Insurance | [Amt] | [Amt] | [Notes] |
| **Total Operational** | **[Amt]** | **[Amt]** | |

---

## Cost Trends

| Period | Total Cost | Change | Key Driver |
|--------|-----------|--------|------------|
| [Period] | [Amt] | [%] | [Driver] |
| [Period] | [Amt] | [%] | [Driver] |
| [Period] | [Amt] | [%] | [Driver] |

---

## Industry Benchmarks

| Metric | {{project_name}} | Industry Avg | Top Quartile |
|--------|-----------------|--------------|--------------|
| Cost per Employee | [Amt] | [Amt] | [Amt] |
| Infrastructure as % of Revenue | [%] | [%] | [%] |
| R&D as % of Revenue | [%] | [%] | [%] |
| S&M as % of Revenue | [%] | [%] | [%] |

---

## Optimization Opportunities

| Area | Current Cost | Optimized Cost | Savings | Timeline |
|------|-------------|----------------|---------|----------|
| [Area] | [Amt] | [Amt] | [Amt] | [Timeline] |
| [Area] | [Amt] | [Amt] | [Amt] | [Timeline] |

---

## Cost Projections

| Period | Current | Projected | Variance |
|--------|---------|-----------|----------|
| [Period] | [Amt] | [Amt] | [%] |
| [Period] | [Amt] | [Amt] | [%] |
| [Period] | [Amt] | [Amt] | [%] |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
