---
type: competitive_analysis
version: "1.0"
required_vars:
  - project_name
  - competitors
  - competitive_advantages
  - target_market
  - current_date
  - document_version
---

# {{project_name}} - Competitive Analysis

**Document**: Competitive Analysis
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Market Overview

**Market**: {{target_market}}
**Analysis Date**: {{current_date}}

---

## Competitive Landscape

| Competitor | Founded | Funding | Focus | Business Model | Market Share |
|-----------|---------|---------|-------|---------------|--------------|
{{#each competitors}}
| {{name}} | {{founded}} | {{funding}} | {{focus}} | {{business_model}} | {{market_share}} |
{{/each}}

---

## Feature Comparison Matrix

| Feature | {{project_name}} | [Competitor 1] | [Competitor 2] | [Competitor 3] |
|---------|:---:|:---:|:---:|:---:|
{{#if competitive_matrix}}
{{#each competitive_matrix}}
| {{feature}} | {{us}} | {{them_a}} | {{them_b}} | {{them_c}} |
{{/each}}
{{/if}}

---

## Competitive Positioning Map

```
                    [Axis: Price]
         High
          |
[Legacy]  |  [{{project_name}}]
          |
          +-------------------> [Axis: Features]
          |  [Competitor A]
   Low    |
          |  [Competitor B]
```

---

## Competitor Deep Dives

{{#each competitors}}
### {{name}}
- **Founded**: {{founded}}
- **Funding**: {{funding}}
- **Business Model**: {{business_model}}
- **Target Market**: {{target_segment}}
- **Strengths**: {{strengths}}
- **Weaknesses**: {{weaknesses}}
- **Strategy**: {{strategy}}
- **Threat Level**: {{threat_level}}

---

{{/each}}

## {{project_name}} Positioning

**Our Advantages**:
{{#each competitive_advantages}}
- {{this}}
{{/each}}

**Defensibility Analysis**:
| Moat Type | Strength | Description |
|-----------|----------|-------------|
| Technology | [Strength] | [Description] |
| Network Effects | [Strength] | [Description] |
| Brand | [Strength] | [Description] |
| Data | [Strength] | [Description] |
| Regulatory | [Strength] | [Description] |

---

## Market Share Projections

| Year | {{project_name}} | Competitor A | Competitor B | Others |
|------|:---:|:---:|:---:|:---:|
| Current | [%] | [%] | [%] | [%] |
| Year 1 | [%] | [%] | [%] | [%] |
| Year 2 | [%] | [%] | [%] | [%] |
| Year 3 | [%] | [%] | [%] | [%] |

---

## Key Takeaways

1. **[Insight 1]**: [Description]
2. **[Insight 2]**: [Description]
3. **[Insight 3]**: [Description]

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
