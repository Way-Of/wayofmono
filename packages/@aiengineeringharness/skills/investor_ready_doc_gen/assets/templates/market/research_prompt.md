---
type: research_prompt
version: "1.0"
required_vars:
  - project_name
  - target_market
  - market_category
  - geography_national
  - research_questions
  - current_date
  - document_version
---

# {{project_name}} - Research Prompt

**Document**: Research Prompt / Scope Definition
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Purpose

This document defines the scope, methodology, and specific research questions for the deep research and analysis conducted for {{project_name}}. It ensures transparency, reproducibility, and completeness of the research process.

---

## Research Scope

### Project Context

- **Project**: {{project_name}}
- **Target Market**: {{target_market}}
- **Market Category**: {{market_category}}
- **Primary Geography (National)**: {{geography_national}}
- **Secondary Geography (Global)**: Worldwide

### Research Objectives

1. **Market Validation**: Validate market size, growth rates, and trends
2. **Competitive Intelligence**: Map competitive landscape and identify gaps
3. **Technology Assessment**: Evaluate technology trends and implications
4. **Strategic Opportunity Identification**: Identify actionable opportunities
5. **Risk Identification**: Surface market and technology risks

---

## Research Questions

{{#each research_questions}}

### {{category}}

{{#each questions}}
- {{this}}
{{/each}}

{{/each}}

---

## Methodology

### Primary Research

- [Method 1]: [Description]
- [Method 2]: [Description]

### Secondary Research

- **Market Reports**: [Sources: Gartner, IDC, Forrester, Grand View Research, etc.]
- **Academic Papers**: [Sources: Google Scholar, SSRN, arXiv]
- **Government Data**: [Sources: National statistics bureaus, energy agencies]
- **Competitor Analysis**: [Sources: Crunchbase, company websites, press releases]
- **News & Media**: [Sources: Industry publications, news archives]

### Verification Protocol

Every claim in the research output must be verified:
1. Market sizing requires 3+ independent sources
2. Competitor status verified via active website / Crunchbase / news
3. Regulatory claims sourced to official government publications
4. Technology claims checked against published benchmarks
5. All source URLs are captured and saved

### Dual-Scope Mandate

Research MUST cover BOTH:
1. **Global**: Worldwide market dynamics, international competitors, cross-border trends
2. **National** ({{geography_national}}): Country-specific market data, local competitors, domestic regulations

---

## Deliverables

| Deliverable | Format | Description |
|-------------|--------|-------------|
| Market Research | Markdown | Market sizing, segmentation, trends |
| Competitive Analysis | Markdown | Competitor profiles and positioning |
| Technology Trends | Markdown | Technology landscape and implications |
| Strategic Opportunities | Markdown | Identified opportunities and recommendations |
| Deep Research Report | Markdown | Synthesis of all findings |

---

## Constraints

1. All data must be sourced and verifiable
2. Global AND national data required for all market sizing
3. Competitor status must be current (confirmed active, acquired, or defunct)
4. No unverified claims in final output
5. All source URLs saved alongside findings

---

## Timeline

- **Research Period**: [Start Date] to [End Date]
- **Data Freshness Cutoff**: [Date]

---

## Document Owner

**Research Lead**: [Name]
**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
