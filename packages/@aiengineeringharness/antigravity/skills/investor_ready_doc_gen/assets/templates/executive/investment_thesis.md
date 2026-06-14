---
type: investment_thesis
version: "2.0"
required_vars:
  - project_name
  - project_tagline
  - project_description
  - problem_statement
  - problem_details
  - solution_description
  - solution_highlights
  - target_market
  - tam_global
  - tam_national
  - tam
  - sam
  - som
  - market_growth_rate
  - market_trends
  - competitors
  - competitive_advantages
  - team_members
  - advisors
  - key_metrics
  - unit_economics
  - funding_ask
  - valuation
  - use_of_funds
  - current_traction
  - revenue_streams
  - risks
  - incorporation_date
  - jurisdiction
  - current_date
  - document_version
---

# {{project_name}} — Investment Thesis

**Document**: Investment Thesis
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Active

---

## Compelling Investment Opportunity

{{project_name}} presents a compelling investment opportunity in {{target_market}}. {{#if project_tagline}}**{{project_tagline}}**{{/if}}

We {{problem_statement}}. {{solution_description}}. With a {{tam_global}} global market ({{tam_national}} in {{geography_national}} alone) growing at {{market_growth_rate}}, {{project_name}} is strategically positioned to capture this opportunity.

---

## Market Opportunity

- **Global TAM**: {{tam_global}} ({{global_growth_rate}})
- **National TAM** ({{geography_national}}): {{tam_national}} ({{national_growth_rate}})
- **SAM**: {{sam}}
- **SOM**: {{som}}

**Key Market Trends**:
{{#each market_trends}}
- **{{title}}** ({{timeline}}): {{description}}
{{/each}}

**Target Segments**: [Primary customer segments and their characteristics]

---

## Problem Solved by {{project_name}}

{{problem_statement}}

{{#each problem_details}}
### {{title}}
{{description}}

{{/each}}

---

## The Solution

{{solution_description}}

{{#if solution_highlights}}
**Key Capabilities**:
{{#each solution_highlights}}
- **{{title}}**: {{description}}
{{/each}}
{{/if}}

### Deployment Options
{{project_name}} offers flexible deployment to meet diverse security and compliance needs:
- **Cloud SaaS**: Fully managed, zero infrastructure overhead
- **Enterprise Cloud**: Dedicated instance with enhanced isolation
- **Hybrid**: Core on cloud, sensitive data on-premises
- **On-Premises**: Full self-hosted deployment, including self-hosted AI models

### AI Strategy
- Multi-Agent AI System routing tasks to optimal specialized models
- Human-in-the-Loop governance for all data mutations
- Support for bring-your-own LLM (Ollama, OpenRouter)
- Audit trail on every AI action

### Accessibility & Compliance
- [GDPR / SOC 2 / Industry-specific standards]
- [Accessibility standards: WCAG 2.1 AA]
- Multi-tenant isolation with role-based access
- Enterprise-grade encryption (in-transit and at-rest)

---

## Competitive Advantages

| Moat | Description |
|------|-------------|
{{#each competitive_advantages}}
| {{@key}} | {{this}} |
{{/each}}

### Competitive Landscape

| Competitor | Position | Threat Level |
|------------|----------|-------------|
{{#each competitors}}
| {{name}} | {{position}} | {{threat_level}} |
{{/each}}

**Defensibility**: [Summary of the durable moat — network effects, data advantage, regulatory barriers, switching costs]

---

## Business Model & Financials

### Revenue Streams

{{#each revenue_streams}}
- **{{channel}}**: {{description}}
{{/each}}

### Unit Economics

| Metric | Current | Target |
|--------|---------|--------|
| ARPU | {{unit_economics.arpu}} | [Target] |
| Gross Margin | {{unit_economics.gross_margin}} | [Target] |
| CAC | {{unit_economics.cac}} | [Target] |
| LTV | {{unit_economics.ltv}} | [Target] |
| Payback Period | {{unit_economics.payback_period}} | [Target] |

### Key Metrics

- ARR: {{key_metrics.arr}}
- MRR: {{key_metrics.mrr}}
- Growth Rate: {{key_metrics.growth_rate}}
- Gross Margin: {{key_metrics.gross_margin}}
- CAC: {{key_metrics.cac}}
- LTV: {{key_metrics.ltv}}
- Churn: {{key_metrics.churn}}
{{#if key_metrics.burn_rate}}
- Burn Rate: {{key_metrics.burn_rate}}
- Runway: {{key_metrics.runway}}
{{/if}}

---

## Traction

{{#each current_traction}}
- {{this}}
{{/each}}

---

## Team

| Name | Role | Background |
|------|------|------------|
{{#each team_members}}
| {{name}} | {{role}} | {{bio}} |
{{/each}}

{{#if advisors}}
### Advisors

| Name | Role | Expertise |
|------|------|-----------|
{{#each advisors}}
| {{name}} | {{role}} | {{background}} |
{{/each}}
{{/if}}

---

## Strategic Growth & Exit Opportunities

### Growth Trajectory

| Horizon | Strategy |
|---------|----------|
| **Near-Term** (0-12 months) | [GTM expansion, key hires, product milestones] |
| **Medium-Term** (12-24 months) | [Geographic expansion, vertical modules, platform scaling] |
| **Long-Term** (24-60 months) | [Market leadership, ecosystem building, network effects] |

### Exit Scenarios

| Scenario | Probability | Timeline | Estimated Return |
|----------|-------------|----------|------------------|
| Strategic Acquisition by [Buyer Profile] | [Prob] | [Timeline] | [Multiple] |
| IPO | [Prob] | [Timeline] | [Multiple] |
| Strategic Partnership Exit | [Prob] | [Timeline] | [Multiple] |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
{{#each risks}}
| {{risk}} | {{probability}} | {{impact}} | {{mitigation}} |
{{/each}}

---

## Conclusion: Invest in {{project_name}}

{{project_name}} is addressing a critical, validated need in {{target_market}}. With a {{tam_global}} market opportunity, a differentiated solution backed by {{competitive_advantages}}, strong team execution, proven traction, and a clear path to profitability, {{project_name}} offers a compelling investment opportunity.

We are seeking {{funding_ask}} at {{valuation}} to accelerate go-to-market, expand our platform, and capture market share. We invite you to join us in building the future of {{target_market}}.

---

**Contact**: [Company Contact Name] — [Email Address]
**Document Version**: {{document_version}}
**Last Updated**: {{current_date}}
