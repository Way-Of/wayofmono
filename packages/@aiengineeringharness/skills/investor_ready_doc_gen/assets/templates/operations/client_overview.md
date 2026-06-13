---
type: client_overview
version: "1.0"
required_vars:
  - project_name
  - project_tagline
  - project_description
  - solution_highlights
  - target_market
  - pricing_model
  - current_date
  - document_version
---

---
type: client_overview
version: "2.0"
required_vars:
  - project_name
  - project_tagline
  - project_description
  - solution_highlights
  - target_market
  - pricing_model
  - current_date
  - document_version
---

# {{project_name}} — Client Overview

**Document**: Client Overview
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Template — Requires Project-Specific Data

---

## Platform Overview

{{project_description}}

**Value Proposition**: {{project_tagline}}

---

## Key Differentiators

{{#each competitive_advantages}}
- {{this}}
{{/each}}

---

## Key Benefits

{{#if solution_highlights}}
{{#each solution_highlights}}
### {{title}}
{{description}}
{{/each}}
{{/if}}

---

## Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| [Feature] | [Description] | [Benefit] |
| [Feature] | [Description] | [Benefit] |
| [Feature] | [Description] | [Benefit] |
| [Feature] | [Description] | [Benefit] |

---

## Use Cases

### Use Case 1: [Title]
**Scenario**: [Description]
**How {{project_name}} Helps**: [Description]
**Outcome**: [Result]

### Use Case 2: [Title]
**Scenario**: [Description]
**How {{project_name}} Helps**: [Description]
**Outcome**: [Result]

### Use Case 3: [Title]
**Scenario**: [Description]
**How {{project_name}} Helps**: [Description]
**Outcome**: [Result]

---

## Target Audience

**Primary**: {{target_market}}
**Secondary**: {{target_market_secondary}}
**Ideal Customer Profile**: {{ideal_customer_profile}}

---

## Integration

{{project_name}} integrates with:
- [Integration 1]
- [Integration 2]
- [Integration 3]

---

## Pricing

{{pricing_model}}

{{#if pricing_tiers}}
| Tier | Price | Best For | Key Features |
|------|-------|----------|--------------|
{{#each pricing_tiers}}
| {{name}} | {{price}} | {{best_for}} | {{features}} |
{{/each}}
{{/if}}

---

## Support

| Level | Response Time | Availability | Channels |
|-------|--------------|--------------|----------|
| Standard | [Time] | [Hours] | [Channels] |
| Premium | [Time] | [Hours] | [Channels] |
| Enterprise | [Time] | [Hours] | [Channels] |

---

## Security & Compliance

{{#each security_features}}
- **{{feature}}**: {{description}}
{{/each}}

---

## Getting Started

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]

**Time to Value**: [Estimated time]

---

## Case Studies

{{#if false}}
### Case Study: [Client Name]
**Industry**: [Industry]
**Challenge**: [Challenge]
**Solution**: [How {{project_name}} helped]
**Results**: [Quantified results]
{{/if}}

*[Case studies to be added as available]*

---

## Sub-Document Index

| Document | Location | Description |
|----------|----------|-------------|
| Case Studies | `Case_Studies/` | Detailed client implementation stories |
| Testimonials | `Testimonials.md` | Client quotes and success stories |
| Product Guides | `Product_Guides/` | User manuals and how-to guides |
| FAQ | `FAQ.md` | Frequently asked questions |

---

**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
