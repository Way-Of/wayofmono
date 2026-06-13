---
type: kpi_dashboard
version: "1.0"
required_vars:
  - project_name
  - key_metrics
  - current_date
  - document_version
---

# {{project_name}} - KPI Dashboard

**Document**: Key Performance Indicators
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Executive Summary

| KPI | Current | Previous Period | Change | Target | Status |
|-----|---------|----------------|--------|--------|--------|
| ARR | {{key_metrics.arr}} | [Prev] | [%] | [Target] | [🟢/🟡/🔴] |
| MRR | {{key_metrics.mrr}} | [Prev] | [%] | [Target] | [🟢/🟡/🔴] |
| Growth Rate | {{key_metrics.growth_rate}} | [Prev] | [%] | [Target] | [🟢/🟡/🔴] |
| Gross Margin | {{key_metrics.gross_margin}} | [Prev] | [%] | [Target] | [🟢/🟡/🔴] |
| CAC | {{key_metrics.cac}} | [Prev] | [%] | [Target] | [🟢/🟡/🔴] |
| LTV | {{key_metrics.ltv}} | [Prev] | [%] | [Target] | [🟢/🟡/🔴] |
| Churn | {{key_metrics.churn}} | [Prev] | [%] | [Target] | [🟢/🟡/🔴] |

---

## Revenue Metrics

| Metric | Value | Trend | Target | Status |
|--------|-------|-------|--------|--------|
| ARR | {{key_metrics.arr}} | [Trend] | [Target] | [🟢/🟡/🔴] |
| MRR | {{key_metrics.mrr}} | [Trend] | [Target] | [🟢/🟡/🔴] |
| New Bookings | [Amt] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Expansion Revenue | [Amt] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Net Revenue Retention | [%] | [Trend] | [Target] | [🟢/🟡/🔴] |

---

## Customer Metrics

| Metric | Value | Trend | Target | Status |
|--------|-------|-------|--------|--------|
| Total Customers | [Count] | [Trend] | [Target] | [🟢/🟡/🔴] |
| New Customers | [Count] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Churn Rate | {{key_metrics.churn}} | [Trend] | [Target] | [🟢/🟡/🔴] |
| NPS | [Score] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Activation Rate | [%] | [Trend] | [Target] | [🟢/🟡/🔴] |

---

## Usage Metrics

| Metric | Value | Trend | Target | Status |
|--------|-------|-------|--------|--------|
| DAU | [Count] | [Trend] | [Target] | [🟢/🟡/🔴] |
| MAU | [Count] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Feature Adoption | [%] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Avg Session Duration | [Time] | [Trend] | [Target] | [🟢/🟡/🔴] |

---

## Technical Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Uptime | [%] | [Target] | [🟢/🟡/🔴] |
| API Latency (p50) | [ms] | [Target] | [🟢/🟡/🔴] |
| API Latency (p99) | [ms] | [Target] | [🟢/🟡/🔴] |
| Error Rate | [%] | [Target] | [🟢/🟡/🔴] |
| Deployment Frequency | [Count/week] | [Target] | [🟢/🟡/🔴] |

---

## Financial Metrics

| Metric | Value | Trend | Target | Status |
|--------|-------|-------|--------|--------|
| Burn Rate | {{key_metrics.burn_rate}} | [Trend] | [Target] | [🟢/🟡/🔴] |
| Runway | {{key_metrics.runway}} | [Trend] | [Target] | [🟢/🟡/🔴] |
| CAC | {{key_metrics.cac}} | [Trend] | [Target] | [🟢/🟡/🔴] |
| LTV/CAC | [Ratio] | [Trend] | [Target] | [🟢/🟡/🔴] |

---

## Growth Metrics

| Metric | Value | Trend | Target | Status |
|--------|-------|-------|--------|--------|
| Lead Conversion Rate | [%] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Sales Pipeline Value | [Amt] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Win Rate | [%] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Average Deal Size | [Amt] | [Trend] | [Target] | [🟢/🟡/🔴] |

---

---

## Team KPIs

| Metric | Value | Trend | Target | Status |
|--------|-------|-------|--------|--------|
| Team Size | [Count] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Hiring Velocity | [Hires/quarter] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Employee Satisfaction (eNPS) | [Score] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Retention Rate | [%] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Revenue per Employee | [Amt] | [Trend] | [Target] | [🟢/🟡/🔴] |
| R&D Efficiency | [Features/FTE] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Time-to-Hire | [Days] | [Trend] | [Target] | [🟢/🟡/🔴] |
| Diversity Score | [%] | [Trend] | [Target] | [🟢/🟡/🔴] |

---

## KPI Definitions & Methodology

| KPI | Definition | Formula | Calculation Frequency | Data Source |
|-----|-----------|---------|----------------------|-------------|
| ARR | Annual Recurring Revenue | MRR × 12 | Monthly | Billing System |
| MRR | Monthly Recurring Revenue | Sum of active subscriptions | Monthly | Billing System |
| CAC | Customer Acquisition Cost | Total sales & marketing / new customers | Monthly | CRM + Finance |
| LTV | Customer Lifetime Value | ARPU × average lifetime (months) | Quarterly | Analytics |
| Churn | Customer churn rate | Lost customers / total customers | Monthly | CRM |
| eNPS | Employee Net Promoter Score | % promoters - % detractors | Quarterly | HR Survey |
| NRR | Net Revenue Retention | (Starting ARR + expansion - churn) / starting ARR | Monthly | Billing System |

---

## Related Dashboards

| Dashboard | Location | Owner | Refresh Frequency |
|-----------|----------|-------|-------------------|
| Financial Dashboard | [Link/Path] | [Owner] | [Frequency] |
| Product Analytics | [Link/Path] | [Owner] | [Frequency] |
| Sales Dashboard | [Link/Path] | [Owner] | [Frequency] |
| Team Dashboard | [Link/Path] | [Owner] | [Frequency] |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
