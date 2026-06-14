---
type: go_to_market_strategy
version: "1.0"
required_vars:
  - project_name
  - project_tagline
  - target_market
  - solution_description
  - competitive_advantages
  - customer_profiles
  - revenue_streams
  - pricing_model
  - current_date
  - document_version
---

# {{project_name}} - Go-to-Market Strategy

**Document**: Go-to-Market Strategy
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Market Overview

**Target Market**: {{target_market}}
**Value Proposition**: {{project_tagline}}
**Solution**: {{solution_description}}

---

## Target Customer Profiles

{{#each customer_profiles}}
### {{segment}}
- **Characteristics**: {{characteristics}}
- **Needs**: {{needs}}
- **Acquisition Channel**: {{acquisition_channel}}
- **Average Deal Size**: {{deal_size}}
- **Sales Cycle**: {{sales_cycle}}

{{/each}}

---

## Value Proposition by Segment

| Segment | Value Proposition | Key Message |
|---------|------------------|-------------|
| [Segment 1] | [Value prop] | [Message] |
| [Segment 2] | [Value prop] | [Message] |
| [Segment 3] | [Value prop] | [Message] |

---

## Channel Strategy

| Channel | Description | Investment | Expected ROI | Timeline |
|---------|-------------|------------|--------------|----------|
| Direct Sales | [Description] | [Amt] | [%] | [Timeline] |
| Partner Channel | [Description] | [Amt] | [%] | [Timeline] |
| Online/Self-Serve | [Description] | [Amt] | [%] | [Timeline] |
| [Channel] | [Description] | [Amt] | [%] | [Timeline] |

---

## Pricing Strategy

{{pricing_model}}

{{#if pricing_tiers}}
| Tier | Price | Features | Target Segment |
|------|-------|----------|----------------|
{{#each pricing_tiers}}
| {{name}} | {{price}} | {{features}} | {{segment}} |
{{/each}}
{{/if}}

---

## Sales Process

| Stage | Activity | Owner | Tools | Duration |
|-------|----------|-------|-------|----------|
| 1. Lead Generation | [Activity] | [Owner] | [Tools] | [Duration] |
| 2. Qualification | [Activity] | [Owner] | [Tools] | [Duration] |
| 3. Demo | [Activity] | [Owner] | [Tools] | [Duration] |
| 4. Proposal | [Activity] | [Owner] | [Tools] | [Duration] |
| 5. Negotiation | [Activity] | [Owner] | [Tools] | [Duration] |
| 6. Close | [Activity] | [Owner] | [Tools] | [Duration] |
| 7. Onboarding | [Activity] | [Owner] | [Tools] | [Duration] |

---

## Marketing Strategy

| Channel | Tactics | Budget | Target | Metrics |
|---------|---------|--------|--------|---------|
| Content Marketing | [Tactics] | [Amt] | [Target] | [Metrics] |
| Demand Generation | [Tactics] | [Amt] | [Target] | [Metrics] |
| PR & Communications | [Tactics] | [Amt] | [Target] | [Metrics] |
| Events | [Tactics] | [Amt] | [Target] | [Metrics] |
| Digital Advertising | [Tactics] | [Amt] | [Target] | [Metrics] |

---

## Launch Plan

### Phase 1: Pre-Launch ([Timeline])
- [Activity 1]
- [Activity 2]
- [Activity 3]

### Phase 2: Launch ([Timeline])
- [Activity 1]
- [Activity 2]
- [Activity 3]

### Phase 3: Post-Launch ([Timeline])
- [Activity 1]
- [Activity 2]
- [Activity 3]

---

## Success Metrics

| KPI | Target | Measurement | Frequency |
|-----|--------|-------------|-----------|
| [KPI] | [Target] | [Method] | [Frequency] |
| [KPI] | [Target] | [Method] | [Frequency] |
| [KPI] | [Target] | [Method] | [Frequency] |
| [KPI] | [Target] | [Method] | [Frequency] |

---

## Budget Allocation

| Category | Budget | % of Total | Expected Impact |
|----------|--------|------------|-----------------|
| Sales Team | [Amt] | [%] | [Impact] |
| Marketing | [Amt] | [%] | [Impact] |
| Partnerships | [Amt] | [%] | [Impact] |
| Tools & Technology | [Amt] | [%] | [Impact] |
| **Total** | **[Amt]** | **100%** | |

---

## Competitive Positioning

| Factor | {{project_name}} | Competitor A | Competitor B |
|--------|-----------------|--------------|--------------|
{{#if competitive_matrix}}
{{#each competitive_matrix}}
| {{factor}} | {{us}} | {{them_a}} | {{them_b}} |
{{/each}}
{{/if}}

---

## Risks & Contingency

| Risk | Impact | Probability | Contingency Plan |
|------|--------|------------|------------------|
| [Risk] | [Impact] | [Prob] | [Plan] |
| [Risk] | [Impact] | [Prob] | [Plan] |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
