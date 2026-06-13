---
type: cap_table
version: "2.0"
required_vars:
  - project_name
  - founders
  - investors
  - option_pool_percentage
  - total_shares
  - current_round
  - valuation
  - incorporation_date
  - jurisdiction
  - current_date
  - document_version
---

# {{project_name}} — Cap Table

**Document**: Capitalization Table
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Overview

This document contains the capitalization table for {{project_name}}, showing ownership structure and equity distribution among founders, investors, and employees.

---

## 1. Founders & Ownership

{{project_name}} is founded by the following individuals:

| Name | Role | Shares | % Ownership |
|------|------|--------|-------------|
{{#each founders}}
| {{name}} | {{role}} | {{shares}} | {{percentage}}% |
{{/each}}

**Key Points**:
- Founder ownership structure encourages collaboration while recognizing leadership roles
- Provides clarity for governance and strategic planning
- Protects founder control while accommodating future investments
- Total founder ownership: [Total]% ([Total Shares] shares)

---

## 2. Investors

### Current Investors

| Investor | Investment | Shares | % Ownership | Round |
|----------|-----------|--------|-------------|-------|
{{#each investors}}
| {{name}} | {{amount}} | {{shares}} | {{percentage}}% | {{round}} |
{{/each}}

### Strategic Rationale
- Early investors provide not just capital but also mentorship and market connections
- Total investor ownership: [Total]% ([Total Shares] shares)
- Funds are earmarked for [primary use of funds]

---

## 3. Employee Option Pool

| Description | Shares | % Ownership |
|-------------|--------|-------------|
| **Employee Stock Options** | [Shares] | {{option_pool_percentage}}% |

**Benefits**:
- Supports hiring for key technical, marketing, and operational roles
- Aligns employee incentives with company growth
- Provides flexibility for future talent-driven expansions

---

## 4. Total Capitalization

| Category | Shares | % Ownership |
|----------|--------|-------------|
| **Founders** | [Shares] | [%] |
| **Investors** | [Shares] | [%] |
| **Employee Option Pool** | [Shares] | {{option_pool_percentage}}% |
| **Total** | **{{total_shares}}** | **100%** |

**Insights**:
- Founders maintain [majority / significant] ownership, ensuring decision-making power
- Investor participation provides growth capital while managing dilution
- Option pool allows for talent retention without affecting founder control

---

## 5. Current Round Terms

| Term | Detail |
|------|--------|
| **Round** | {{current_round}} |
| **Amount** | [Amt] |
| **Pre-Money Valuation** | [Val] |
| **Post-Money Valuation** | {{valuation}} |
| **Security Type** | [SAFE / Convertible Note / Equity] |
| **Lead Investor** | [Name] |
| **Expected Close** | [Date] |

---

## 6. Pro Forma Cap Table (Post-Round)

| Shareholder | Pre-Round % | Investment | Post-Round % |
|-------------|-------------|------------|--------------|
| Founders | [%] | — | [%] |
| Option Pool | {{option_pool_percentage}}% | — | [%] |
| New Investor | — | [Amt] | [%] |
| Existing Investors | [%] | [Amt] | [%] |
| **Total** | **100%** | **[Amt]** | **100%** |

### Dilution Analysis
- Founder dilution: [%] → [%] (post-round)
- Investor dilution: [%] → [%] (post-round)
- Employee pool dilution: [%] → [%] (post-round)

---

## 7. Vesting Schedule

| Shareholder | Total Shares | Vested | Unvested | Cliff | Vesting Period |
|-------------|-------------|--------|----------|-------|----------------|
{{#each founders}}
| {{name}} | {{shares}} | [Vested] | [Unvested] | [Months] | [Years] |
{{/each}}

---

## 8. Future Planning

### Funding Roadmap

| Round | Target Amount | Timeline | Key Milestone Trigger |
|-------|--------------|----------|----------------------|
| {{current_round}} | [Amt] | [Date] | [Milestone] |
| Series A | [Amt] | [Date] | [Milestone] |
| Series B | [Amt] | [Date] | [Milestone] |

### Equity Dilution Scenarios
- Future rounds will be structured to maintain founder control
- Option pool can be expanded with board approval
- Strategic partnerships may include equity components
- Additional option pools can be created during expansion phases

---

## 9. Visual Summary

**Ownership Allocation**:
- **Founders**: [%]%
- **Investors**: [%]%
- **Employee Option Pool**: {{option_pool_percentage}}%

**This structure communicates**:
- Financial clarity and transparency
- Strategic foresight for growth
- Governance balance for decision-making

---

## Notes

- Cap table reflects current ownership structure as of {{current_date}}
- All equity agreements properly documented
- Regular updates as funding rounds occur
- Ownership percentages based on {{total_shares}} total shares
- Jurisdiction: {{jurisdiction}}

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
