---
type: cost_analysis_index
version: "1.0"
required_vars:
  - project_name
  - total_year1_costs
  - cost_categories
  - current_date
  - document_version
---

# {{project_name}} — Cost Analysis

**Purpose**: Top-level index for all cost analysis and breakdown documentation for {{project_name}}.

**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Template — Requires Project-Specific Data

---

## Overview

This folder contains detailed cost analysis and breakdown documentation for {{project_name}}. It includes comprehensive information on infrastructure costs, team tooling and software, company setup and legal expenditures, and cloud costs, along with high-level cost analysis summaries. This documentation is crucial for financial planning, investor relations, and strategic resource allocation.

## Documents

### cost_analysis.md
High-level cost analysis document covering development, marketing & sales, operational, and administrative costs for {{project_name}}, including:
- **Cost Structure Summary**: High-level breakdown by category
- **Cost Projections**: Year 1-3 scaling estimates
- **Cost Optimization Strategies**: Infrastructure, personnel, legal optimization
- **Cost Alignment with Financial Model**: Consistency with master model
- **Cost Efficiency Metrics**: Cost per employee, cost as % of revenue
- **VC Preparation Notes**: Board compensation, admin role, legal advisor

### detailed_cost_breakdown.md
Comprehensive detailed cost breakdown including:
- **Infrastructure Costs**: One-time equipment costs, monthly recurring costs
- **Salary Costs**: Detailed breakdown by role, department, and team size
- **Cost by Category**: Analysis as percentages of total cost
- **Year 1-3 Projections**: Cost scaling projections
- **Cost Optimization**: Strategies through infrastructure credits, equity offset
- **VC Preparation Notes**: Board compensation, administrative roles

### infrastructure_costs.md
Detailed hardware and infrastructure cost breakdown including:
- **Developer Equipment**: Complete component specifications and costs
- **Tool Subscriptions**: Per-developer subscriptions
- **Server Hardware**: Internal and cloud server costs
- **Cloud Infrastructure**: Production, storage, databases, AI model hosting
- **Cost Optimization**: Partner credits, discounts, phased deployment
- **Scaling Projections**: Year 1-3 infrastructure cost projections

### company_setup_legal_costs.md
Company setup and legal costs breakdown including:
- **Company Incorporation & Setup**: Incorporation, licenses, banking, accounting
- **Legal Services (VC-Ready)**: Term sheets, founder agreements, IP protection
- **Total Year 1 Costs**: Projected total initial costs
- **Cost Optimization**: Strategies to reduce setup and legal expenditures
- **Cost Timing & Phasing**: Pre-fundraising, fundraising, post-fundraising phases

### cloud_costs.md
Cloud infrastructure cost estimates including:
- **Developer Servers**: Cloud-based development environments
- **Production Servers**: Production, storage, AI model hosting
- **Cost Optimization**: Reserved Instances, Spot Instances, VPC Endpoints
- **Optimized Costs**: Projections for reduced costs through optimization

### team_tooling_costs.md
Team tooling and software costs including:
- **Office & Productivity Tools**
- **Developer Tools**: Standard and advanced development stacks
- **General Company Costs**: Web hosting, cloud infrastructure
- **Self-Hosted vs. Cloud-Hosted**: Cost comparison
- **Cost Optimization**: Tool consolidation, subscription discounts

---

## Key Metrics

**Total Year 1 Costs**: ${{total_year1_costs}}

| Category | Annual Cost | % of Total |
|----------|-------------|------------|
{{#each cost_categories}}
| **{{category}}** | ${{annual}} | {{percentage}} |
{{/each}}

---

**Document Owner**: Finance & Operations Team
**Last Review**: {{current_date}}
**Next Review**: {{next_review_date}}
