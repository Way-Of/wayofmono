---
type: supporting_slides
version: "1.0"
required_vars:
  - project_name
  - target_market
  - tam_global
  - tam_national
  - technology_stack
  - competitors
  - team_members
  - current_date
  - document_version
---

# {{project_name}} — Supporting Slides

**Document**: Backup / Appendix Slides for Investor Pitch
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Purpose

These slides are not part of the main pitch deck but are available for deeper dives during investor Q&A sessions.

---

## Detailed Market Data

### Global Market Breakdown

| Region | Market Size | CAGR | Key Drivers |
|--------|-------------|------|-------------|
| North America | [Size] | [CAGR] | [Drivers] |
| Europe | [Size] | [CAGR] | [Drivers] |
| Asia-Pacific | [Size] | [CAGR] | [Drivers] |
| Rest of World | [Size] | [CAGR] | [Drivers] |

### National Market Deep-Dive: {{geography_national}}

| Segment | Size | Growth | {{project_name}} Fit |
|---------|------|--------|---------------------|
| [Segment 1] | [Size] | [CAGR] | [Fit description] |
| [Segment 2] | [Size] | [CAGR] | [Fit description] |
| [Segment 3] | [Size] | [CAGR] | [Fit description] |

### Market Sizing Methodology

- **TAM Calculation**: [Methodology]
- **Data Sources**: [Source URLs, 3+ independent sources]
- **Assumptions**: [Key assumptions]

---

## Technical Architecture Deep-Dive

### System Architecture

[Architecture diagram description or reference to technical_overview.md]

### Technology Stack Details

{{#each technology_stack}}
- **{{name}}**: {{purpose}}{{#if version}} v{{version}}{{/if}}
{{/each}}

### Security & Compliance

| Domain | Standard / Certification | Status |
|--------|-------------------------|--------|
| Data Protection | [Standard] | [Status] |
| Infrastructure Security | [Standard] | [Status] |
| Access Control | [Standard] | [Status] |

### Scalability Approach

- **Current Scale**: [Current capacity]
- **Target Scale**: [Target capacity]
- **Architecture Strategy**: [Strategy description]

---

## Use Case Examples

### Use Case 1: [Title]

**Scenario**: [Description of the scenario]

**Before {{project_name}}**:
- [Pain point 1]
- [Pain point 2]
- [Time/cost involved]

**With {{project_name}}**:
- [Improvement 1]
- [Improvement 2]
- [Time/cost saved]

**ROI**: [Quantified benefit]

---

### Use Case 2: [Title]

**Scenario**: [Description of the scenario]

**Before {{project_name}}**:
- [Pain point 1]
- [Pain point 2]

**With {{project_name}}**:
- [Improvement 1]
- [Improvement 2]

**ROI**: [Quantified benefit]

---

### Use Case 3: [Title]

**Scenario**: [Description of the scenario]

**Before {{project_name}}**:
- [Pain point 1]
- [Pain point 2]

**With {{project_name}}**:
- [Improvement 1]
- [Improvement 2]

**ROI**: [Quantified benefit]

---

## Extended Team Bios

### Leadership

{{#each team_members}}
### {{name}} — {{role}}

- **Background**: [Detailed professional background]
- **Relevant Experience**: [Years in industry, key achievements]
- **Why {{project_name}}**: [Personal motivation]
- **Previous**: [Previous company / role]

---

{{/each}}

### Advisors

| Name | Role | Expertise |
|------|------|-----------|
| [Advisor] | [Role] | [Expertise] |
| [Advisor] | [Role] | [Expertise] |

### Key Hires Planned

| Role | Timeline | Priority |
|------|----------|----------|
| [Role] | [Timeline] | [High/Medium] |
| [Role] | [Timeline] | [High/Medium] |

---

## Extended Competitive Analysis

### Competitor Feature Matrix

| Feature | {{project_name}} | Competitor A | Competitor B | Competitor C |
|---------|:---:|:---:|:---:|:---:|
| [Feature 1] | ✅ | ✅ | ❌ | ✅ |
| [Feature 2] | ✅ | ❌ | ❌ | ❌ |
| [Feature 3] | ✅ | ✅ | ✅ | ❌ |
| [Feature 4] | ❌ | ✅ | ❌ | ✅ |

### Competitive Financial Comparison

| Metric | {{project_name}} | Competitor A | Competitor B |
|--------|:---:|:---:|:---:|
| Pricing | [Price] | [Price] | [Price] |
| Funding | [Amt] | [Amt] | [Amt] |
| Valuation | [Valuation] | [Valuation] | [Valuation] |
| Employees | [Count] | [Count] | [Count] |

---

## Full Financial Model

See `master_financial_model.md` for:
- 3-statement financial model
- Unit economics
- Scenario analysis
- Cash flow projections

### Key Assumptions

| Assumption | Base Case | Growth Case | Conservative |
|------------|-----------|-------------|--------------|
| [Assumption] | [Value] | [Value] | [Value] |
| [Assumption] | [Value] | [Value] | [Value] |

---

## Contact

[Company Contact Name]
[Email Address]
[Website]

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
