---
type: market_research
version: "1.0"
required_vars:
  - project_name
  - target_market
  - market_category
  - geography_national
  - tam_global
  - tam_national
  - tam
  - sam
  - som
  - global_growth_rate
  - national_growth_rate
  - market_growth_rate
  - global_trends
  - market_trends
  - customer_profiles
  - competitors
  - current_date
  - document_version
---

# {{project_name}} - Market Research

**Document**: Market Research Report
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Executive Summary

{{project_name}} operates in the {{target_market}} market, representing a {{tam}} TAM opportunity. Key findings indicate {{market_trends}}.

---

## Market Definition

**Market**: {{target_market}}
**Category**: {{market_category}}
**Geography**: [Target geography]

The {{target_market}} market encompasses [market scope definition].

---

## Research Scope

**⚠️ Mandatory Dual-Scope**: All market sizing MUST include BOTH global and national data.

### Global Market

| Metric | Value | Methodology | Source |
|--------|-------|-------------|--------|
| **Global TAM** | {{tam_global}} | [Methodology] | [Source(s)] |
| **Global Growth Rate** | {{global_growth_rate}} | [Source] |
| **Global Trends** | {{global_trends}} | |

### National Market — {{geography_national}}

| Metric | Value | Methodology | Source |
|--------|-------|-------------|--------|
| **National TAM** | {{tam_national}} | [Verification: 3+ sources] |
| **National Growth Rate** | {{national_growth_rate}} | [Source] |
| **National SAM** | {{sam}} | [Methodology] |
| **National SOM** | {{som}} | [Methodology] |

### Global vs National Comparison

| Dimension | Global | National | Ratio |
|-----------|--------|----------|-------|
| Market Size | {{tam_global}} | {{tam_national}} | [% of global] |
| Growth Rate | {{global_growth_rate}} | {{national_growth_rate}} | [Faster/Slower/Similar] |
| Regulation Favorability | [Score] | [Score] | [Advantage] |
| Competitive Intensity | [Score] | [Score] | [Advantage] |

---

## Market Trends

{{#each market_trends}}
### {{title}}
{{description}}

**Impact**: {{impact}}
**Timeline**: {{timeline}}
{{/each}}

---

## Target Customer Analysis

{{#each customer_profiles}}
### {{segment}}
- **Demographics**: {{demographics}}
- **Needs**: {{needs}}
- **Pain Points**: {{pain_points}}
- **Buying Behavior**: {{buying_behavior}}
- **Budget**: {{budget}}

{{/each}}

---

## Competitive Landscape

| Competitor | Focus | Market Share | Strengths | Weaknesses |
|-----------|-------|-------------|-----------|------------|
{{#each competitors}}
| {{name}} | {{focus}} | {{market_share}} | {{strengths}} | {{weaknesses}} |
{{/each}}

---

## Market Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| [Risk 1] | [Impact] | [Prob] | [Mitigation] |
| [Risk 2] | [Impact] | [Prob] | [Mitigation] |
| [Risk 3] | [Impact] | [Prob] | [Mitigation] |

---

## Opportunities

| Opportunity | Market Size | Timeline | Ease of Entry |
|------------|------------|----------|---------------|
| [Opportunity] | [Size] | [Timeline] | [Easy/Medium/Hard] |
| [Opportunity] | [Size] | [Timeline] | [Easy/Medium/Hard] |

---

## Forecast

| Year | Market Size | Growth | {{project_name}} Share |
|------|------------|--------|----------------------|
| Year 1 | [Amt] | [%] | [%] |
| Year 2 | [Amt] | [%] | [%] |
| Year 3 | [Amt] | [%] | [%] |
| Year 4 | [Amt] | [%] | [%] |
| Year 5 | [Amt] | [%] | [%] |

---

## Sources

1. [Source 1]
2. [Source 2]
3. [Source 3]

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
