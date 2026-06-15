---
type: intellectual_property
version: "1.0"
required_vars:
  - project_name
  - project_tagline
  - project_description
  - ip_portfolio
  - current_date
  - document_version
---

# {{project_name}} — Intellectual Property Statements

**Document**: Intellectual Property Overview
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## IP Overview

{{project_name}} owns a portfolio of intellectual property that provides competitive advantage in {{target_market}}.

---

## Patents

| Patent | Status | Filing Date | Jurisdiction | Description |
|--------|--------|-------------|--------------|-------------|
{{#each ip_portfolio}}
{{#if_eq type "Patent"}}
| {{title}} | {{status}} | {{filing_date}} | {{jurisdiction}} | {{description}} |
{{/if_eq}}
{{/each}}

### Patent Strategy
[Patent strategy description]

---

## Trademarks

| Mark | Status | Filing Date | Jurisdiction | Goods/Services |
|------|--------|-------------|--------------|----------------|
{{#each ip_portfolio}}
{{#if_eq type "Trademark"}}
| {{title}} | {{status}} | {{filing_date}} | {{jurisdiction}} | {{goods_services}} |
{{/if_eq}}
{{/each}}

---

## Copyrights

| Work | Author | Registration | Year | Description |
|------|--------|-------------|------|-------------|
| [Work] | [Author] | [Registration] | [Year] | [Description] |
| [Work] | [Author] | [Registration] | [Year] | [Description] |

---

## Trade Secrets

The following proprietary processes and information are protected as trade secrets:
1. [Trade secret 1]
2. [Trade secret 2]
3. [Trade secret 3]

**Protection Measures**:
- [Measure 1]
- [Measure 2]
- [Measure 3]

---

## IP Assignment

All employees and contractors have executed IP assignment agreements:
- **Employees**: [Yes/No — Description]
- **Contractors**: [Yes/No — Description]
- **Founders**: [Yes/No — Description]

---

## Open Source

| Library | License | Usage | Compliance Status |
|---------|---------|-------|-------------------|
| [Library] | [License] | [Usage] | [Compliant] |
| [Library] | [License] | [Usage] | [Compliant] |

**Open Source Policy**: [Description of open source compliance procedures]

---

## Third-Party IP

| IP | Owner | License Type | Restrictions |
|----|-------|-------------|--------------|
| [IP] | [Owner] | [License] | [Restrictions] |
| [IP] | [Owner] | [License] | [Restrictions] |

---

## IP Protection Strategy

| Focus Area | Strategy | Investment | Timeline |
|-----------|----------|------------|----------|
| [Area] | [Strategy] | [Amt] | [Timeline] |
| [Area] | [Strategy] | [Amt] | [Timeline] |

---

## IP Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | [Prob] | [Impact] | [Mitigation] |
| [Risk] | [Prob] | [Impact] | [Mitigation] |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
