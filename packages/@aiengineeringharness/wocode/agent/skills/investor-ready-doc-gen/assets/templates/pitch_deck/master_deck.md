---
type: master_deck
version: "2.0"
required_vars:
  - project_name
  - project_tagline
  - problem_statement
  - problem_details
  - solution_description
  - solution_highlights
  - target_market
  - tam
  - sam
  - som
  - technology_stack
  - market_trends
  - revenue_streams
  - revenue_projections
  - competitors
  - competitive_advantages
  - team_members
  - key_metrics
  - funding_ask
  - valuation
  - use_of_funds
  - current_traction
  - architecture_description
  - competitive_matrix
  - core_components
  - current_date
  - document_version
---

<!-- _class: cover -->

# {{project_name}}

<div class="accent-line"></div>

## {{project_tagline}}

<h3><em>{{funding_ask}}</em> &middot; {{valuation}} valuation</h3>

<p>{{current_date}} &middot; v{{document_version}}</p>

---

<!-- _class: toc -->

# Contents

<div class="toc-items">

<div class="toc-item"><div class="toc-number">1</div><div><div class="toc-title">Executive Summary</div><div class="toc-sub">The opportunity at a glance</div></div></div>
<div class="toc-item"><div class="toc-number">2</div><div><div class="toc-title">The Problem</div><div class="toc-sub">What we're solving</div></div></div>
<div class="toc-item"><div class="toc-number">3</div><div><div class="toc-title">Our Solution</div><div class="toc-sub">How we solve it</div></div></div>
<div class="toc-item"><div class="toc-number">4</div><div><div class="toc-title">Market Opportunity</div><div class="toc-sub">Market sizing & trends</div></div></div>
<div class="toc-item"><div class="toc-number">5</div><div><div class="toc-title">Technology & Traction</div><div class="toc-sub">Stack, metrics, milestones</div></div></div>
<div class="toc-item"><div class="toc-number">6</div><div><div class="toc-title">Business Model</div><div class="toc-sub">Revenue, pricing, unit economics</div></div></div>
<div class="toc-item"><div class="toc-number">7</div><div><div class="toc-title">Competition</div><div class="toc-sub">Landscape & moats</div></div></div>
<div class="toc-item"><div class="toc-number">8</div><div><div class="toc-title">Team & Financials</div><div class="toc-sub">Who we are & the numbers</div></div></div>
<div class="toc-item"><div class="toc-number">9</div><div><div class="toc-title">The Ask</div><div class="toc-sub">Investment & use of funds</div></div></div>
<div class="toc-item"><div class="toc-number">10</div><div><div class="toc-title">Vision</div><div class="toc-sub">Where we're going</div></div></div>

</div>

---

<!-- _class: section -->
<div class="section-number">01</div>

# Executive Summary

## The opportunity at a glance

---

{{#if project_tagline}}<div class="emphasis">{{project_tagline}}</div>{{/if}}

{{problem_statement}}

<div class="callout info">
<div class="callout-title">Market</div>
{{target_market}} &mdash; {{tam}} TAM
</div>

<div class="callout accent">
<div class="callout-title">Ask</div>
{{funding_ask}} at {{valuation}} valuation
</div>

---

<!-- _class: section -->
<div class="section-number">02</div>

# The Problem

## What we're solving

---

{{problem_statement}}

{{#each problem_details}}
<div class="callout warning">
<div class="callout-title">{{title}}</div>
{{description}}
</div>
{{/each}}

---

<!-- _class: section -->
<div class="section-number">03</div>

# Our Solution

## How we solve it

---

{{solution_description}}

{{#if solution_highlights}}
<!-- _class: feature -->

### Key Capabilities

<div class="feature-cards">

{{#each solution_highlights}}
<div class="feature-card{{#if @first}} accent{{/if}}{{#if @last}} success{{/if}}">
<div class="feature-icon">{{#if icon}}{{icon}}{{else}}&#9733;{{/if}}</div>
<h3>{{title}}</h3>
<p>{{description}}</p>
</div>
{{/each}}

</div>
{{/if}}

{{#if core_components}}

### System Architecture

<div class="feature-cards">

{{#each core_components}}
<div class="feature-card info">
<h3>{{name}}</h3>
<p>{{description}}</p>
</div>
{{/each}}

</div>
{{/if}}

---

<!-- _class: section -->
<div class="section-number">04</div>

# Market Opportunity

## Sizing the opportunity

---

<!-- _class: table-slide -->

| | Global | {{#if geography_national}}National ({{geography_national}}){{/if}} |
|---|---|---|
| **TAM** | {{tam_global}} | {{tam_national}} |
| **Growth Rate** | {{global_growth_rate}} | {{national_growth_rate}} |
| **Trends** | {{global_trends}} | |
| **SAM** | {{sam}} | |
| **SOM** | {{som}} | |

---

{{#if market_trends}}

### Why Now

{{#each market_trends}}
<div class="callout info">
<div class="callout-title">{{title}} <span style="font-weight:400;color:var(--text-muted)">&middot; {{timeline}}</span></div>
{{description}}
</div>
{{/each}}
{{/if}}

---

<!-- _class: section -->
<div class="section-number">05</div>

# Technology & Traction

## Stack, metrics, milestones

---

### Technology Stack

<div class="feature-cards" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">

{{#each technology_stack}}
<div class="feature-card success">
<h3>{{category}}</h3>
<p>{{description}}</p>
</div>
{{/each}}

</div>

---

{{#if current_traction}}

### Traction & Milestones

{{#each current_traction}}
<div class="callout success">
<div class="callout-title">&#10003; Milestone</div>
{{this}}
</div>
{{/each}}
{{/if}}

---

<!-- _class: metrics -->

<div class="metric-card primary">
<div class="metric-value">{{key_metrics.arr}}</div>
<div class="metric-label">ARR</div>
</div>

<div class="metric-card success">
<div class="metric-value">{{key_metrics.growth_rate}}</div>
<div class="metric-label">Growth</div>
</div>

<div class="metric-card accent">
<div class="metric-value">{{key_metrics.gross_margin}}</div>
<div class="metric-label">Gross Margin</div>
</div>

<div class="metric-card warning">
<div class="metric-value">{{key_metrics.cac}}</div>
<div class="metric-label">CAC</div>
</div>

---

<!-- _class: metrics -->

<div class="metric-card success">
<div class="metric-value">{{key_metrics.ltv}}</div>
<div class="metric-label">LTV</div>
</div>

<div class="metric-card primary">
<div class="metric-value">{{key_metrics.mrr}}</div>
<div class="metric-label">MRR</div>
</div>

<div class="metric-card warning">
<div class="metric-value">{{key_metrics.churn}}</div>
<div class="metric-label">Churn</div>
</div>

<div class="metric-card accent">
<div class="metric-value">{{key_metrics.payback_period}}</div>
<div class="metric-label">Payback Period</div>
</div>

---

<!-- _class: section -->
<div class="section-number">06</div>

# Business Model

## Revenue, pricing, unit economics

---

### Revenue Streams

{{#each revenue_streams}}
<div class="callout success">
<div class="callout-title">{{channel}}</div>
{{description}}
</div>
{{/each}}

**Pricing**: {{pricing_model}}

---

<!-- _class: section -->
<div class="section-number">07</div>

# Competition

## Landscape & moats

---

<!-- _class: table-slide -->

| | {{project_name}} | Competitor A | Competitor B | Competitor C |
|---|---|---|---|---|
{{#each competitive_matrix}}
| {{feature}} | {{us}} | {{them_a}} | {{them_b}} | {{them_c}} |
{{/each}}

---

### Competitive Moats

<div class="feature-cards">

{{#each competitive_advantages}}
<div class="feature-card accent">
<h3>{{@key}}</h3>
<p>{{this}}</p>
</div>
{{/each}}

</div>

---

<!-- _class: section -->
<div class="section-number">08</div>

# Team & Financials

## Who we are & the numbers

---

<!-- _class: table-slide -->

### Team

| Name | Role | Background |
|------|------|------------|
{{#each team_members}}
| {{name}} | {{role}} | {{bio}} |
{{/each}}

---

<!-- _class: table-slide -->

### Financial Projections

| Metric | Current | Year 1 | Year 2 | Year 3 |
|--------|---------|--------|--------|--------|
| ARR | {{key_metrics.arr}} | [Proj] | [Proj] | [Proj] |
| Revenue | [Current] | [Proj] | [Proj] | [Proj] |
| EBITDA | [Current] | [Proj] | [Proj] | [Proj] |
| Customers | [Current] | [Proj] | [Proj] | [Proj] |

{{#if revenue_projections}}
| Year | Revenue | Growth |
|------|---------|--------|
{{#each revenue_projections}}
| {{year}} | {{revenue}} | {{growth}} |
{{/each}}
{{/if}}

<br>

### Unit Economics

| Metric | Current | Target |
|--------|---------|--------|
| ARPU | [Amt] | [Amt] |
| LTV/CAC | [Ratio] | [Ratio] |
| Gross Margin | [%] | [%] |

---

<!-- _class: section -->
<div class="section-number">09</div>

# The Ask

## Investment & use of funds

---

<div class="emphasis">{{funding_ask}} at {{valuation}} valuation</div>

### Use of Funds

<!-- _class: table-slide -->

| Category | % | Description |
|----------|---|-------------|
{{#each use_of_funds}}
| {{category}} | {{percentage}}% | {{description}} |
{{/each}}

---

<!-- _class: section -->
<div class="section-number">10</div>

# Roadmap

## Where we're going

---

{{#if roadmap_short_term}}

### Short-Term (0-12 months)

{{#each roadmap_short_term}}
<div class="callout info">
<div class="callout-title">{{item}}</div>
{{description}}
</div>
{{/each}}
{{/if}}

{{#if roadmap_medium_term}}

### Medium-Term (12-24 months)

{{#each roadmap_medium_term}}
<div class="callout success">
<div class="callout-title">{{item}}</div>
{{description}}
</div>
{{/each}}
{{/if}}

{{#if roadmap_long_term}}

### Long-Term (24+ months)

{{#each roadmap_long_term}}
<div class="callout warning">
<div class="callout-title">{{item}}</div>
{{description}}
</div>
{{/each}}
{{/if}}

---

## Vision

<div class="emphasis">[Long-term vision for {{project_name}} &mdash; where will the company be in 5-10 years?]</div>

---

<!-- _class: contact -->

<div class="accent-line"></div>

# Let's Build the Future

<div class="contact-line"><strong>[Company Contact Name]</strong></div>
<div class="contact-line">[Email Address]</div>
<div class="contact-line">[Website]</div>

<div style="margin-top:40px;color:var(--text-muted);font-size:0.7em;">
{{project_name}} &middot; v{{document_version}} &middot; {{current_date}}
</div>
