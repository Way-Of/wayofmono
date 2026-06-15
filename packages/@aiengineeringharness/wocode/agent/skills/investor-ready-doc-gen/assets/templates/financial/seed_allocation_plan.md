---
type: seed_allocation_plan
version: "1.0"
required_vars:
  - project_name
  - funding_ask
  - valuation
  - use_of_funds
  - current_date
  - document_version
---

# {{project_name}} - Seed Investment Allocation Plan

**Document**: Seed Investment Allocation Plan
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Investment Summary

| Term | Detail |
|------|--------|
| **Total Raise** | {{funding_ask}} |
| **Valuation** | {{valuation}} |
| **Security Type** | [SAFE / Convertible Note / Equity] |
| **Expected Close** | [Date] |
| **Lead Investor** | [Name] |

---

## Allocation Breakdown

| Category | Amount | Percentage | Description |
|----------|--------|------------|-------------|
{{#each use_of_funds}}
| {{category}} | [Amt] | {{percentage}} | {{description}} |
{{/each}}
| **Total** | **{{funding_ask}}** | **100%** | |

---

## Engineering & Product Development

| Sub-Category | Allocation | Timeline | Key Deliverables |
|-------------|-----------|----------|-----------------|
| Core Platform Development | [%] | [Timeline] | [Deliverable] |
| Feature Development | [%] | [Timeline] | [Deliverable] |
| Infrastructure & DevOps | [%] | [Timeline] | [Deliverable] |
| QA & Testing | [%] | [Timeline] | [Deliverable] |

---

## Sales & Marketing

| Sub-Category | Allocation | Timeline | Key Deliverables |
|-------------|-----------|----------|-----------------|
| Sales Team | [%] | [Timeline] | [Deliverable] |
| Marketing Campaigns | [%] | [Timeline] | [Deliverable] |
| Content & PR | [%] | [Timeline] | [Deliverable] |
| Events & Conferences | [%] | [Timeline] | [Deliverable] |

---

## Operations & G&A

| Sub-Category | Allocation | Timeline | Key Deliverables |
|-------------|-----------|----------|-----------------|
| Team & Administration | [%] | [Timeline] | [Deliverable] |
| Legal & Compliance | [%] | [Timeline] | [Deliverable] |
| Office & Equipment | [%] | [Timeline] | [Deliverable] |

---

## Milestone-Based Funding Triggers

| Tranche | Amount | Milestone | Expected Date |
|---------|--------|-----------|---------------|
| Initial | [Amt] | [Milestone] | [Date] |
| Milestone 1 | [Amt] | [Milestone] | [Date] |
| Milestone 2 | [Amt] | [Milestone] | [Date] |

---

## Expected Runway

| Assumption | Value |
|------------|-------|
| Monthly Burn Rate | [Amt] |
| Gross Burn | [Amt] |
| Net Burn | [Amt] |
| Runway (months) | [Months] |
| Revenue Contribution | [Amt] per month |

---

## ROI Analysis

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Cumulative Investment | [Amt] | [Amt] | [Amt] |
| Revenue | [Amt] | [Amt] | [Amt] |
| Return on Investment | [%] | [%] | [%] |
| Enterprise Value | [Amt] | [Amt] | [Amt] |

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| [Risk] | [Impact] | [Prob] | [Mitigation] |
| [Risk] | [Impact] | [Prob] | [Mitigation] |
| Buffer Reserve | [Amt] | - | Contingency fund |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
