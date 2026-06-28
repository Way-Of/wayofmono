---
type: executive_summary
version: "2.0"
required_vars:
  - project_name
  - project_tagline
  - project_description
  - problem_statement
  - solution_description
  - solution_highlights
  - target_market
  - tam_global
  - tam_national
  - tam
  - sam
  - som
  - market_growth_rate
  - technology_stack
  - revenue_streams
  - pricing_model
  - competitive_advantages
  - core_components
  - team_members
  - key_metrics
  - funding_ask
  - use_of_funds
  - current_traction
  - risks
  - incorporation_date
  - jurisdiction
  - current_date
  - document_version
---

<!-- _class: cover -->

# {{project_name}}

<div class="accent-line"></div>

## Executive Summary

<p>{{current_date}} &middot; v{{document_version}}</p>

---

{{#if project_tagline}}<div class="emphasis">{{project_tagline}}</div>{{/if}}

{{project_name}} is redefining {{target_market}}. We address the critical challenge of {{problem_statement}} through {{solution_description}}.

Our platform leverages a modern technology stack ({{#each technology_stack}}{{category}}{{#unless @last}}, {{/unless}}{{/each}}) to deliver a comprehensive, integrated solution. Unlike fragmented tool stacks or generic AI, {{project_name}} provides a unified environment where {{#if solution_highlights}}{{#each solution_highlights}}{{title}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}} work together seamlessly.

With a {{tam_global}} global market opportunity ({{tam_national}} in {{geography_national}} alone), growing at {{market_growth_rate}}, {{project_name}} is positioned to capture a leading share of the {{target_market}} market.

---

<!-- _class: section -->
<div class="section-number">01</div>

# Problem & Solution

## What we solve & how

---

<div class="callout danger">
<div class="callout-title">The Problem</div>
{{problem_statement}}
</div>

<div class="callout success">
<div class="callout-title">Our Solution</div>
{{solution_description}}
</div>

{{#if competitive_advantages}}
### Why {{project_name}}

{{#each competitive_advantages}}
<div class="callout accent">
<div class="callout-title">&#10003; Advantage</div>
{{this}}
</div>
{{/each}}
{{/if}}

---

<!-- _class: section -->
<div class="section-number">02</div>

# Key Features

## What makes us different

---

{{#if core_components}}
<div class="feature-cards" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
{{#each core_components}}
<div class="feature-card">
<h3>{{name}}</h3>
<p>{{description}}</p>
</div>
{{/each}}
</div>
{{/if}}

---

<!-- _class: section -->
<div class="section-number">03</div>

# Market Opportunity

## Sizing the market

---

<!-- _class: table-slide -->

| Scope | Metric | Value |
|-------|--------|-------|
| **Global** | TAM | {{tam_global}} ({{global_growth_rate}}) |
| **National** ({{geography_national}}) | TAM | {{tam_national}} ({{national_growth_rate}}) |
| | SAM | {{sam}} |
| | SOM | {{som}} |
| | Growth | {{market_growth_rate}} |

<br>
<span class="emphasis">{{global_trends}}</span>

---

<!-- _class: section -->
<div class="section-number">04</div>

# Competitive Advantage

## Our moats

---

{{#each competitive_advantages}}
<div class="callout success">
<div class="callout-title">&#10003; Moat</div>
{{this}}
</div>
{{/each}}

<br>

<div class="callout info">
<div class="callout-title">Deployment Options</div>
Cloud SaaS / Enterprise Cloud / Hybrid / On-Premises
</div>

<div class="callout info">
<div class="callout-title">Compliance</div>
GDPR / SOC 2 / Industry-specific standards
</div>

<div class="callout warning">
<div class="callout-title">AI Governance</div>
Human-in-the-Loop for all data mutations
</div>

---

<!-- _class: section -->
<div class="section-number">05</div>

# Business Model

## Revenue, pricing, metrics

---

### Revenue

{{#each revenue_streams}}
<div class="callout success">
<div class="callout-title">{{channel}}</div>
{{description}}
</div>
{{/each}}

<br>

**Pricing**: {{pricing_model}}

---

<!-- _class: metrics -->

<div class="metric-card primary">
<div class="metric-value">{{key_metrics.arr}}</div>
<div class="metric-label">ARR</div>
</div>

<div class="metric-card success">
<div class="metric-value">{{key_metrics.mrr}}</div>
<div class="metric-label">MRR</div>
</div>

<div class="metric-card accent">
<div class="metric-value">{{key_metrics.growth_rate}}</div>
<div class="metric-label">Growth</div>
</div>

<div class="metric-card warning">
<div class="metric-value">{{key_metrics.gross_margin}}</div>
<div class="metric-label">Gross Margin</div>
</div>

---

<!-- _class: metrics -->

<div class="metric-card primary">
<div class="metric-value">{{key_metrics.cac}}</div>
<div class="metric-label">CAC</div>
</div>

<div class="metric-card success">
<div class="metric-value">{{key_metrics.ltv}}</div>
<div class="metric-label">LTV</div>
</div>

---

<!-- _class: section -->
<div class="section-number">06</div>

# Traction

## What we've achieved

---

{{#each current_traction}}
<div class="callout success">
<div class="callout-title">&#10003; Milestone</div>
{{this}}
</div>
{{/each}}

---

<!-- _class: section -->
<div class="section-number">07</div>

# Team

## Who we are

---

{{#each team_members}}
<div class="callout info">
<div class="callout-title">{{name}} &mdash; {{role}}</div>
{{#if bio}}{{bio}}{{/if}}
</div>
{{/each}}

---

<!-- _class: section -->
<div class="section-number">08</div>

# Financial Highlights

## Key numbers

---

<!-- _class: metrics -->

<div class="metric-card primary">
<div class="metric-value">{{key_metrics.arr}}</div>
<div class="metric-label">ARR</div>
</div>

<div class="metric-card success">
<div class="metric-value">{{key_metrics.mrr}}</div>
<div class="metric-label">MRR</div>
</div>

<div class="metric-card accent">
<div class="metric-value">{{key_metrics.growth_rate}}</div>
<div class="metric-label">Growth Rate</div>
</div>

<div class="metric-card primary">
<div class="metric-value">{{key_metrics.gross_margin}}</div>
<div class="metric-label">Gross Margin</div>
</div>

---

<!-- _class: metrics -->

<div class="metric-card warning">
<div class="metric-value">{{key_metrics.cac}}</div>
<div class="metric-label">CAC</div>
</div>

<div class="metric-card success">
<div class="metric-value">{{key_metrics.ltv}}</div>
<div class="metric-label">LTV</div>
</div>

---

<!-- _class: section -->
<div class="section-number">09</div>

# Call to Action

## Join us

---

<div class="emphasis">{{project_name}} is seeking {{funding_ask}} to transform {{target_market}}.</div>

### Next Steps

<div class="callout info">
<div class="callout-title">1</div>
Review the accompanying pitch deck and financial model
</div>

<div class="callout info">
<div class="callout-title">2</div>
Schedule a product demonstration
</div>

<div class="callout info">
<div class="callout-title">3</div>
Join our next investor call
</div>

---

<!-- _class: section -->
<div class="section-number">10</div>

# Risk Factors

## What we've considered

---

{{#each risks}}
<div class="callout {{#if (eq probability 'High')}}danger{{else if (eq probability 'Medium')}}warning{{else}}info{{/if}}">
<div class="callout-title">{{risk}} ({{probability}}, {{impact}} impact)</div>
{{mitigation}}
</div>
{{/each}}

---

<!-- _class: contact -->

<div class="accent-line"></div>

# Thank You

<div class="contact-line"><strong>[Company Contact Name]</strong></div>
<div class="contact-line">[Email Address]</div>

<div style="margin-top:40px;color:var(--text-muted);font-size:0.7em;">
{{project_name}} &middot; v{{document_version}} &middot; {{current_date}}
</div>
