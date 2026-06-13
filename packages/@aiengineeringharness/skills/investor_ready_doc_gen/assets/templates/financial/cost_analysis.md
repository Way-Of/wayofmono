---
type: cost_analysis
version: "1.0"
required_vars:
  - project_name
  - project_tagline
  - cost_categories
  - key_metrics
  - revenue_projections
  - funding_ask
  - use_of_funds
  - team_members
  - hiring_plan
  - current_date
  - document_version
---

# {{project_name}} — Cost Analysis

**Document**: Cost Analysis — High-Level Summary
**Version**: {{document_version}}
**Last Updated**: {{current_date}}
**Status**: Template — Requires Project-Specific Data

---

## Cost Analysis Overview

This document provides a high-level cost analysis summary for {{project_name}}. For detailed breakdowns, refer to the comprehensive cost documents in this folder.

**Total Year 1 Costs**: **${{total_year1_costs}}**

---

## Cost Structure Summary

### Development Costs

**Team Salaries**: ${{total_salaries}}/year ({{salaries_percentage}}% of total costs)
- **Details**: See detailed cost breakdown
- **Breakdown**: {{#each cost_categories}}{{#if category_people}}{{category}}: ${{monthly}}/month ({{percentage}}){{/if}}{{/each}}

**Development Tools**: ${{development_tools_cost}}/year ({{development_tools_percentage}}% of total costs)
- **Details**: Tooling, AI subscriptions, software licenses
- **Breakdown**: ${{development_tools_monthly}}/month

**Infrastructure (Dev)**: ${{infrastructure_cost}}/year ({{infrastructure_percentage}}% of total costs)
- **Details**: Complete infrastructure breakdown
- **Components**: Equipment (${{equipment_cost}}), servers (${{server_cost}}), cloud (${{cloud_cost}}/year)

### Marketing & Sales Costs

**Sales Team**: ${{sales_team_cost}}/year ({{sales_team_percentage}}% of personnel costs, {{sales_team_total_percentage}}% of total)
- **Details**: Salary breakdown by role
- **Breakdown**: {{sales_headcount}} sales/sales-related roles

**Customer Acquisition, Advertising, Marketing Materials**:
- **Details**: Seed investment allocation plan
- **Allocation**: ${{marketing_allocation}} ({{marketing_allocation_percentage}}% of ${{funding_ask}} round)

### Operational Costs

**Infrastructure & Hosting**: ${{infrastructure_hosting_cost}}/year ({{infrastructure_hosting_percentage}}% of total)
- **Details**: Hardware and cloud infrastructure
- **Breakdown**:
  - One-time infrastructure: ${{infrastructure_one_time}}
  - Monthly recurring: ${{infrastructure_monthly}}/month (${{infrastructure_monthly_annual}}/year)

**Cloud Services**:
- **Details**: Complete cloud cost breakdown
- **Breakdown**: Developer servers (${{cloud_dev_servers}}/month), production servers (${{cloud_prod_servers}}/month), on-demand infrastructure (${{cloud_on_demand}}/month)

**AI/API Costs** (Operational Expense):
- **Details**: AI tools subscriptions and API costs
- **Pricing**: Input ${{ai_input_cost}}/1M tokens, output ${{ai_output_cost}}/1M tokens
- **Cost margin**: {{ai_margin}}% after API costs
- **Variable cost**: Based on customer usage volume

### Administrative Costs

**Legal**: ${{legal_total}}/year (one-time ${{legal_one_time}} + annual retainer ${{legal_retainer}})
- **Details**: Complete legal cost breakdown
- **Breakdown**: Company setup ${{legal_setup}}, VC-prep ${{legal_vc_prep}} one-time, retainer ${{legal_retainer_monthly}}/month

**Accounting**: ${{accounting_cost}}/year
- **Details**: Accounting services breakdown
- **Breakdown**: ${{accounting_monthly}}/month

**General Overhead**:
- **Details**: Complete team tooling breakdown
- **Includes**: Office & productivity tools, developer tools, general company costs

---

## Cost Breakdown by Category

### Total Annual Costs: ${{total_year1_costs}}

| Category | Annual Cost | % of Total | Reference Document |
|----------|-------------|------------|-------------------|
{{#each cost_categories}}
| **{{category}}** | ${{annual}} | {{percentage}} | {{source}} |
{{/each}}
| **Total** | **${{total_year1_costs}}** | **100.00%** | - |

---

## Cost Projections

### Year 1 Costs: ${{total_year1_costs}}

**Breakdown**:
- One-Time Infrastructure: ${{infrastructure_one_time}}
- Personnel: ${{total_salaries}}
- Infrastructure (Monthly Recurring): ${{infrastructure_monthly_annual}}
- Software & Tools: ${{development_tools_cost}}

### Year 2 Costs: ~${{total_year2_costs}} (estimated)

**Projections**:
- Personnel: ~${{year2_salaries}} (team scaling to ~{{year2_headcount}} people)
- Infrastructure: ~${{year2_infrastructure}}
- Software & Tools: ~${{year2_tools}}
- Marketing & Sales: ~${{year2_marketing}}

### Year 3 Costs: ~${{total_year3_costs}} (estimated)

**Projections**:
- Personnel: ~${{year3_salaries}} (team scaling to ~{{year3_headcount}} people)
- Infrastructure: ~${{year3_infrastructure}}
- Software & Tools: ~${{year3_tools}}
- Marketing & Sales: ~${{year3_marketing}}

---

## Cost Optimization Strategies

### Infrastructure Cost Optimization

**Infrastructure Partner Credits**:
- **Potential Savings**: {{infrastructure_credits_savings}} reduction
- **Strategies**: Partner credits via cloud provider programs

**Cloud Cost Optimization**:
- **Strategies**: Reserved Instances ({{reserved_instance_savings}} savings), Spot Instances ({{spot_instance_savings}} savings), VPC Endpoints, right-sizing
- **Potential Savings**: ~${{cloud_savings_monthly}}/month ({{cloud_savings_percentage}} reduction)
- **Methods**: Commit to reserved pricing, use spot for batch workloads, optimize data transfer

### Personnel Cost Optimization

**Board Compensation Optimization**:
- **Equity Offset Strategy**: Replace cash compensation with equity ({{board_equity_range}} per member)
- **Potential Savings**: Up to ${{board_savings}}/year

**Team Cost Optimization**:
- **Geography Arbitrage**: {{geography_savings_percentage}} savings vs. US rates
- **Remote-First**: Reduced office overhead

### Legal & Setup Cost Optimization

**Legal Cost Optimization**:
- **Strategies**: Start with basic legal, defer complex IP, use templates, negotiate retainers
- **Potential Savings**: {{legal_savings_percentage}} reduction = ${{legal_savings_amount}} savings

---

## Cost Alignment with Financial Model

**From Master Financial Model**:

**Year 1**:
- **Revenue**: {{#revenue_projections.0}}{{revenue}}{{/revenue_projections.0}}
- **Costs**: ${{total_year1_costs}}
- **Gap**: -${{year1_gap}} (requires funding to cover)
- **As % of Revenue**: {{year1_cost_revenue_percentage}}% (typical for early-stage startup)

**Key Insight**: Year 1 typically operates at a loss while building product and customer base. Funding requirements: ${{funding_ask}}+ round.

---

## Cost Efficiency Metrics

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Cost per Employee | ${{y1_cost_per_employee}} | ${{y2_cost_per_employee}} | ${{y3_cost_per_employee}} |
| Cost as % of Revenue | {{y1_cost_revenue_percentage}}% | {{y2_cost_revenue_percentage}}% | {{y3_cost_revenue_percentage}}% |
| Revenue per Employee | ${{y1_revenue_per_employee}} | ${{y2_revenue_per_employee}} | ${{y3_revenue_per_employee}} |

**Improvement**: Costs decrease as % of revenue as company scales and revenue grows.

---

## Notes for VC Preparation

### Board Compensation

**Standard Practice**:
- Board compensation: ${{board_comp_range}}/month per board member
- Includes: {{board_meetings}} board meetings/year + strategic advisory input
- **Equity Offset**: Many startups offset part of board compensation with equity ({{board_equity_practice}}) to conserve cash

### Admin/Operations Role

**Critical for VC Preparation**:
- Documentation and record-keeping
- Scheduling and coordination
- VC due diligence support
- Corporate governance compliance
- **Cost**: ${{admin_cost}}/month

### Legal Advisor

**Scope of Responsibilities**:
- IP protection and management
- Contract review and negotiation
- Corporate structure setup
- Regulatory compliance
- Investor relations and due diligence support
- **Cost**: ${{legal_advisor_cost}}/month (critical for IP protection and fundraising)

---

## Notes

- **Detailed Breakdowns**: Refer to specific cost documents for comprehensive breakdowns
- **Regular Updates**: Cost analysis should be updated regularly as costs change
- **Actual vs. Projected**: Track actual costs against projections
- **Optimization**: Document optimization opportunities as they arise
- **Alignment**: All costs should align with Master Financial Model and Investment Allocation

---

## Related Documentation

- **Master Financial Model**: `../03_Financial_Model/Master_Financial_Model.md` — Revenue projections and financial model
- **Seed Investment Allocation**: `../03_Financial_Model/Seed_Investment_Allocation_Plan.md` — Funding allocation plan
- **Cap Table**: `../03_Financial_Model/Cap_Table.md` — Equity structure and ownership
- **Venture Studio Strategy**: `../17_Venture_Studio_Strategy/Venture_Studio_Strategy.md` — Strategic cost allocation

---

**Document Owner**: Finance & Operations Team
**Last Review**: {{current_date}}
**Next Review**: {{next_review_date}}
**Update Frequency**: Quarterly or as costs change
