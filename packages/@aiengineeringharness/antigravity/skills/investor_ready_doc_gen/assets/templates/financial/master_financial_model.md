---
type: master_financial_model
version: "2.0"
required_vars:
  - project_name
  - revenue_streams
  - pricing_model
  - key_metrics
  - cost_categories
  - revenue_projections
  - cost_projections
  - funding_ask
  - use_of_funds
  - current_date
  - document_version
---

# {{project_name}} - Master Financial Model

**Document**: Master Financial Model
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Key Assumptions

| Assumption | Value | Source |
|------------|-------|--------|
| Market Growth Rate | [Rate]% | [Source] |
| Customer Acquisition Cost | [CAC] | [Source] |
| Average Revenue Per User | [ARPU] | [Source] |
| Gross Margin | [Margin]% | [Source] |
| Churn Rate | [Churn]% | [Source] |
| Headcount Growth | [Growth]% | [Source] |
| [Assumption] | [Value] | [Source] |

---

## Revenue Model

### Revenue by Deployment Tier

| Tier | Revenue Model | Target Customer | Margin Profile |
|------|--------------|-----------------|----------------|
| **Cloud SaaS** | Subscription-based, tiered pricing | SMB / Mid-Market | Highest — fully standardized |
| **Enterprise Cloud** | Custom subscription + enhanced services | Enterprise | High — premium support |
| **Hybrid** | Subscription + usage-based (on-prem data + cloud AI) | Regulated industries | Medium — infrastructure cost |
| **On-Premises** | License fees + maintenance/support | Government / Defense | Medium — upfront license + recurring |

### Revenue Streams

{{#each revenue_streams}}
- **{{channel}}**: {{description}}
{{/each}}

### Pricing

{{pricing_model}}

---

## Profit & Loss Statement

| Item | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|------|--------|--------|--------|--------|--------|
**Revenue** | | | | |
{{#each revenue_streams}}
| {{channel}} Revenue | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
{{/each}}
| **Total Revenue** | **[Total]** | **[Total]** | **[Total]** | **[Total]** | **[Total]** |
| COGS | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| **Gross Profit** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** |
| *Gross Margin* | *[%]* | *[%]* | *[%]* | *[%]* | *[%]* |
| | | | | |
| **Operating Expenses** | | | | |
| R&D | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| Sales & Marketing | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| G&A | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| **Total OPEX** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** |
| | | | | |
| **EBITDA** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** |
| *EBITDA Margin* | *[%]* | *[%]* | *[%]* | *[%]* | *[%]* |
| **Net Income** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** |

---

## Cash Flow Statement

| Item | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|------|--------|--------|--------|--------|--------|
| Operating Cash Flow | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| Investing Cash Flow | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| Financing Cash Flow | [Amt] | [Amt] | [Amt] | [Amt] | [Amt] |
| **Net Cash Flow** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** |
| **Beginning Cash** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** |
| **Ending Cash** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** | **[Amt]** |

---

## Unit Economics

| Metric | Current | Target | Industry Benchmark |
|--------|---------|--------|-------------------|
| CAC | {{key_metrics.cac}} | [Target] | [Benchmark] |
| LTV | {{key_metrics.ltv}} | [Target] | [Benchmark] |
| LTV/CAC | [Ratio] | [Target] | [Benchmark] |
| Payback Period | [Months] | [Target] | [Benchmark] |
| Gross Margin | {{key_metrics.gross_margin}} | [Target] | [Benchmark] |
| ARPU | [ARPU] | [Target] | [Benchmark] |

---

## Scenario Analysis

| Scenario | Key Assumption | Year 3 Revenue | Year 5 Revenue | Outcome |
|----------|---------------|----------------|----------------|---------|
| Base Case | [Base assumption] | [Amt] | [Amt] | [Outcome] |
| Upside | [Upside assumption] | [Amt] | [Amt] | [Outcome] |
| Downside | [Downside assumption] | [Amt] | [Amt] | [Outcome] |

---

## Sensitivity Analysis

| Driver | -20% | -10% | Base | +10% | +20% |
|--------|------|------|------|------|------|
| [Driver 1] | [Result] | [Result] | [Result] | [Result] | [Result] |
| [Driver 2] | [Result] | [Result] | [Result] | [Result] | [Result] |
| [Driver 3] | [Result] | [Result] | [Result] | [Result] | [Result] |

---

## Funding Requirements

| Round | Amount | Valuation | Expected Close | Use of Funds |
|-------|--------|-----------|----------------|--------------|
| Seed | [Amt] | [Val] | [Date] | {{#each use_of_funds}}{{category}}: {{percentage}}{{#unless @last}}; {{/unless}}{{/each}} |
| Series A | [Amt] | [Val] | [Date] | [Use] |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
