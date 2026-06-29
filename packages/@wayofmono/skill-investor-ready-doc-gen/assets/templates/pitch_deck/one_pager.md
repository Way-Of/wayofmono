---
type: one_pager
version: "2.0"
required_vars:
  - project_name
  - project_tagline
  - problem_statement
  - solution_description
  - tam
  - key_metrics
  - funding_ask
  - current_date
  - document_version
  - competitive_advantages
  - team_members
---

<!-- _class: cover -->

# {{project_name}}

<div class="accent-line"></div>

## {{project_tagline}}

<p>{{current_date}} &middot; One-Pager</p>

---

<div class="emphasis">{{problem_statement}}</div>

---

<div class="callout success">
<div class="callout-title">Solution</div>
{{solution_description}}
</div>

---

<!-- _class: metrics -->

<div class="metric-card primary">
<div class="metric-value">{{tam}}</div>
<div class="metric-label">TAM</div>
</div>

<div class="metric-card success">
<div class="metric-value">{{key_metrics.arr}}</div>
<div class="metric-label">ARR</div>
</div>

<div class="metric-card accent">
<div class="metric-value">{{funding_ask}}</div>
<div class="metric-label">Ask</div>
</div>

---

### Why Us

{{#each competitive_advantages}}
<div class="callout accent">
<div class="callout-title">&#10003; {{this}}</div>
</div>
{{/each}}

---

### Team

{{#each team_members}}
<div class="callout info">
<div class="callout-title">{{name}}</div>
{{role}}
</div>
{{/each}}

---

<!-- _class: contact -->

<div class="accent-line"></div>

# {{project_name}}

<div class="contact-line"><strong>[Contact]</strong> &middot; [Email] &middot; [Website]</div>
