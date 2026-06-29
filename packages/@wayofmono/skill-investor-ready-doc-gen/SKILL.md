---
name: skill-investor-ready-doc-gen
description: Generate complete investor-ready documentation for ANY project with a production-quality, project-branded design system. Uses 40+ mustache-style templates bundled as assets. Features auto brand color detection from codebase, 12+ professional slide layouts with gradients/metrics/callouts, chart.js data visualization, and exports all docs as investor-grade PDFs via Marp CLI. Project-agnostic — works for any project.
---

# Investor-Ready Document Generator

Generates a full investor-ready documentation package for any project. All templates live in `assets/templates/` and use `{{variable}}` placeholders for project-specific content.

## Package Overview

This npm package provides:
- **40+ mustache-style templates** in `assets/templates/` (pitch decks, executive summaries, financial models, legal contracts, market research, etc.)
- **PDF design system** in `assets/pdf/` (CSS theme, design template schema)
- **Vertical knowledge bases** in `assets/verticals/` (industry-specific market data, competitors, regulations)
- **Config schemas** in `assets/schema/` (YAML schema for project config validation)
- **Example configs** in `assets/examples/` (reference implementations)

## Required Input

The skill needs a project config. Either:
- **Interactive**: Collect information from the user and build the config
- **Config file**: Provide `investor_config.yaml` (see `assets/examples/`)
- **Hybrid**: Start from config file, override with additional data

## Brand Color Detection

The PDF theme automatically adapts to each project's brand identity. Detect brand colors during codebase investigation and store them in a `design.yaml` file (see `assets/pdf/design-template.yaml` for schema).

All values should be auto-detected from the project's CSS/theme files. If no brand colors are detected, fall back to a professional default palette (navy/teal/amber).

## Variable Reference

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `{{project_name}}` | string | Project/brand name | yes |
| `{{project_tagline}}` | string | One-line value proposition | yes |
| `{{project_description}}` | string | 2-3 paragraph overview | yes |
| `{{problem_statement}}` | string | Market problem description | yes |
| `{{problem_details}}` | list | Specific problem points | no |
| `{{solution_description}}` | string | How solution solves problem | yes |
| `{{solution_highlights}}` | list | Key solution features | no |
| `{{target_market}}` | string | Market definition | yes |
| `{{market_category}}` | string | Industry/category | no |
| `{{tam}}` | string | Total addressable market | yes |
| `{{sam}}` | string | Serviceable addressable market | yes |
| `{{som}}` | string | Serviceable obtainable market | yes |
| `{{market_growth_rate}}` | string | Market growth CAGR | no |
| `{{market_trends}}` | list | Market trend descriptions | no |
| `{{customer_profiles}}` | list | Target customer descriptions | no |
| `{{revenue_streams}}` | list | Revenue source descriptions | yes |
| `{{pricing_model}}` | string | Pricing description | yes |
| `{{pricing_tiers}}` | list | Pricing tier descriptions | no |
| `{{pricing_history}}` | list | Past pricing changes | no |
| `{{key_metrics}}` | object | ARR, MRR, growth, churn, LTV, CAC | yes |
| `{{unit_economics}}` | object | ARPU, gross margin, payback period | no |
| `{{technology_stack}}` | list | Technologies used | yes |
| `{{architecture_description}}` | string | Architecture overview | no |
| `{{core_components}}` | list | System components | no |
| `{{api_endpoints}}` | list | API endpoint descriptions | no |
| `{{security_features}}` | list | Security capabilities | no |
| `{{competitors}}` | list | Competitor descriptions | yes |
| `{{competitive_advantages}}` | list | Differentiators | yes |
| `{{competitive_matrix}}` | table | Competitor comparison | no |
| `{{team_members}}` | list | Name/role/bio objects | yes |
| `{{advisors}}` | list | Advisor descriptions | no |
| `{{organizational_structure}}` | string | Team structure | no |
| `{{hiring_plan}}` | list | Open roles | no |
| `{{funding_ask}}` | string | Investment amount | yes |
| `{{investment_type}}` | string | Equity/SAFE/convertible | yes |
| `{{valuation}}` | string | Pre/post-money valuation | yes |
| `{{use_of_funds}}` | list | Fund allocation descriptions | yes |
| `{{current_traction}}` | list | Milestone descriptions | yes |
| `{{roadmap_short_term}}` | list | Near-term items | no |
| `{{roadmap_medium_term}}` | list | Mid-term items | no |
| `{{roadmap_long_term}}` | list | Long-term items | no |
| `{{risks}}` | list | Risk descriptions | yes |
| `{{total_historical_spend}}` | string | Total spend to date | no |
| `{{monthly_burn}}` | string | Monthly operating expenses | no |
| `{{cost_categories}}` | list | Cost breakdown descriptions | no |
| `{{revenue_projections}}` | table | Revenue forecast data | no |
| `{{cost_projections}}` | table | Cost forecast data | no |
| `{{legal_structure}}` | string | Corp/LLC/etc | no |
| `{{incorporation_date}}` | string | Founding date | no |
| `{{jurisdiction}}` | string | Incorporation location | no |
| `{{registration_numbers}}` | object | Business registration info | no |
| `{{ip_portfolio}}` | list | IP descriptions | no |
| `{{current_date}}` | string | Auto-generated | yes |
| `{{document_version}}` | string | Version number | yes |

List-type variables support `{{#each variable}}...{{/each}}` iteration.
Optional variables support `{{#if variable}}...{{/if}}` conditionals.

## Template Reference

### Executive Templates
| Template | File | Use Case |
|----------|------|----------|
| Executive Summary | `assets/templates/executive/executive_summary.md` | 2-4 page investor overview |
| Investment Thesis | `assets/templates/executive/investment_thesis.md` | Due diligence deep-dive |
| White Paper | `assets/templates/executive/white_paper.md` | Definitive investor document (10-20 pages) |

### Pitch Deck Templates
| Template | File | Use Case |
|----------|------|----------|
| Master Deck | `assets/templates/pitch_deck/master_deck.md` | Full investor presentation |
| One-Pager | `assets/templates/pitch_deck/one_pager.md` | Single-page summary |
| Send-Ahead Deck | `assets/templates/pitch_deck/send_ahead_deck.md` | Pre-meeting document |

### Technical Templates
| Template | File | Use Case |
|----------|------|----------|
| Technical Overview | `assets/templates/technical/technical_overview.md` | System architecture documentation |
| Product Functionality | `assets/templates/technical/product_functionality.md` | Detailed feature documentation |
| Demo Script | `assets/templates/technical/demo_script.md` | Live demonstration script |

### Financial Templates
| Template | File | Use Case |
|----------|------|----------|
| Master Financial Model | `assets/templates/financial/master_financial_model.md` | P&L, balance sheet, cash flow |
| Historical Financials | `assets/templates/financial/historical_financials.md` | Past performance |
| Cap Table | `assets/templates/financial/cap_table.md` | Shareholder structure |
| Seed Allocation Plan | `assets/templates/financial/seed_allocation_plan.md` | Use of funds breakdown |

### Cost Templates
| Template | File | Use Case |
|----------|------|----------|
| Cost Analysis | `assets/templates/costs/cost_analysis.md` | Overall cost structure |
| Cloud Costs | `assets/templates/costs/cloud_costs.md` | Infrastructure costs |
| Setup & Legal Costs | `assets/templates/costs/setup_legal_costs.md` | Legal and setup expenses |
| Team Tooling Costs | `assets/templates/costs/team_tooling_costs.md` | Software and tool costs |
| Hardware Costs | `assets/templates/costs/hardware_costs.md` | Hardware expenses |
| Detailed Breakdown | `assets/templates/costs/detailed_breakdown.md` | Consolidated cost breakdown |
| Alignment Summary | `assets/templates/costs/alignment_summary.md` | Cost strategy summary |

### Market & Strategy Templates
| Template | File | Use Case |
|----------|------|----------|
| Market Research | `assets/templates/market/market_research.md` | Market sizing and analysis |
| GTM Strategy | `assets/templates/market/go_to_market_strategy.md` | Go-to-market plan |
| Competitive Analysis | `assets/templates/market/competitive_analysis.md` | Competitor mapping |
| Partnership Strategy | `assets/templates/market/partnership_strategy.md` | Partnership opportunities |
| Product Roadmap | `assets/templates/market/product_roadmap.md` | Development roadmap |

### Company & Team Templates
| Template | File | Use Case |
|----------|------|----------|
| Company Overview | `assets/templates/company/company_overview.md` | Corporate information |
| Team Bios | `assets/templates/company/team_bios.md` | Team profiles |

### Operations Templates
| Template | File | Use Case |
|----------|------|----------|
| Client Overview | `assets/templates/operations/client_overview.md` | Client-facing materials |
| KPI Dashboard | `assets/templates/operations/kpi_dashboard.md` | Key metrics |
| Venture Studio Strategy | `assets/templates/operations/venture_studio_strategy.md` | Venture studio model |

### Legal Templates
| Template | File | Use Case |
|----------|------|----------|
| VC Investor Contract | `assets/templates/legal/vc_investor_contract.md` | VC investment agreement |
| Angel Investor Contract | `assets/templates/legal/angel_investor_contract.md` | Angel investment agreement |
| Advisor Board Contract | `assets/templates/legal/advisor_board_contract.md` | Advisor agreement |
| Shareholder Agreement | `assets/templates/legal/shareholder_agreement.md` | Shareholder rights |
| IP Statements | `assets/templates/legal/intellectual_property.md` | IP documentation |

## Vertical Knowledge Bases

The skill uses `assets/verticals/<vertical>/` to store industry-specific reference data. This keeps templates project-agnostic while providing accurate, pre-verified data per vertical.

### Available Verticals

| Vertical | Folder | Market Reference |
|----------|--------|-----------------|
| HVAC Optimization / PropTech | `assets/verticals/hvac_optimization/` | Verified market data, competitors, regulations |
| Construction Software / ConTech | `assets/verticals/construction_software/` | Verified Swedish ConTech market data |

### Creating a New Vertical

1. Create `assets/verticals/<your_vertical>/`
2. Copy `assets/verticals/VERTICAL_TEMPLATE.yaml` as `market_reference.yaml`
3. Research the vertical via web search (industry reports, competitor sites, government sources)
4. Fill in market sizing, competitors, regulations, and trends with sourced data
5. Annotate every claim with its source URL

## Workflow

### Step 1: Comprehensive Codebase Investigation

Before generating ANY investor docs, thoroughly investigate the application's actual codebase:

1. Explore the full repository structure — README, package.json, directory tree, config files
2. Identify the technology stack — languages, frameworks, databases, infrastructure, APIs
3. Analyze the architecture — components, modules, data flow, integrations, deployments
4. Extract actual metrics — real code stats (lines of code, number of services, API endpoints)
5. Document the team structure — from code OWNERS files, commit history, project configs
6. Find the problem domain — what does the application ACTUALLY do?
7. Capture real traction — commit frequency, release history, user counts if available
8. Detect brand colors — find the project's visual identity for branded PDFs

Create a structured research folder for all findings.

### Step 2: Web Verification

For every claim that will go into investor docs, verify it via web search:

1. Market sizing — cross-reference TAM/SAM/SOM from 3+ sources
2. Competitors — verify each competitor is ACTIVE
3. Growth rates — Verify CAGR claims against official sources
4. Regulations — Check official government sources
5. Technology claims — Verify performance benchmarks
6. Research BOTH globally AND nationally — mandatory dual-scope
7. Save all source URLs — every claim must have a verifiable source

### Step 3: Create Self-Managed TODO

Create a comprehensive TODO listing every document, section, variable, and claim that needs to be generated, filled, and verified.

### Step 4: Gather Project Config

Build the project config with fields for project info, market data, financials, team, technology, legal, and metrics. Pre-fill as much as possible from codebase investigation.

### Step 5: Load Vertical Knowledge Base

1. Read the `market_category` from config
2. Find matching folder in `assets/verticals/`
3. Load `market_reference.yaml` for that vertical
4. Cross-reference with codebase investigation and web verification
5. If no match, create a new vertical from `VERTICAL_TEMPLATE.yaml`

### Step 6: Generate All Documents

For each TODO item:
1. Read the template from `assets/templates/<category>/<template>.md`
2. Replace all `{{variable}}` placeholders with merged config values
3. Enrich market sections with verified web research data
4. Enrich technical sections with actual codebase analysis findings
5. Handle conditionals (`{{#if}}`) and iterators (`{{#each}}`)
6. Self-check: verify all placeholders filled, all claims sourced

### Step 7: Validate Output

1. Every TODO item completed?
2. No remaining unclosed placeholders?
3. Every market claim has a source URL?
4. All codebase claims match the actual codebase?
5. Document count matches expected categories?

### Step 8: Branded PDF Conversion (via Marp CLI)

Export all generated markdown documents to professionally designed, project-branded PDFs using Marp CLI.

1. Ensure Marp CLI is available: `npx @marp-team/marp-cli@latest --version`
2. Generate project-branded CSS theme from detected colors
3. Apply slide classes (cover, section, metrics, two-columns, quote, etc.)
4. Convert pitch deck templates directly (they have `---` slide separators)
5. Auto-insert `---` before `##` headings for document templates
6. Validate PDF output (cover, colors, file sizes, page count)

### Step 9: Present Results

Show the user a summary of generated documents, output locations, key findings, verification summary, and next steps.

## PDF Design System

The theme supports 12 slide types via Marp's `<!-- _class: -->` annotation:

| Class | Visual | When to Apply |
|-------|--------|---------------|
| `cover` | Full gradient bg, centered title, accent underline | First slide |
| `section` | Full-bleed gradient banner, section number + title | Before major sections |
| `metrics` | Grid of colored metric cards with large values | KPI/metric summary slides |
| `two-columns` | Side-by-side layout with divider | Comparison or paired content |
| `quote` | Large centered quote with decorative marks | Testimonials, vision statements |
| `table-slide` | Full-width table with gradient header, striped rows | Data tables, comparison matrices |
| `feature` | Card grid with colored left border per card | Feature highlights, capability lists |
| `timeline` | Horizontal timeline with years and descriptions | Roadmap, milestones |
| `contact` | Gradient bg, centered contact info | Final/thank you slide |
| `toc` | Numbered items with accent dots | Table of contents |
| `thin` | Compact spacing, smaller headings | Dense content slides |

## Template Writing Conventions

1. Every template starts with a YAML frontmatter block
2. All project-specific content uses `{{variable}}` placeholders
3. Optional sections use `{{#if variable}}...{{/if}}`
4. Repeatable elements use `{{#each variable}}...{{/each}}`
5. Tables use `{{table variable}}` for structured data
6. Every template documents its required variables at the top
7. Output directory structure mirrors the template directory structure

## Design Best Practices

The following principles should guide all investor document generation:

1. **Purpose-driven design**: A pitch deck is a decision document. Every design choice must accelerate investor understanding of market size, urgency, traction, business logic, and founder credibility.
2. **One idea per slide**: Each slide proves exactly one thing. Never combine product detail, market context, and strategy on one slide.
3. **Scan-first layout**: Investors scan before reading. Write headlines as conclusions, not labels.
4. **15-slide consensus**: 15 slides for the visual pitch is the norm. 25+ loses attention.
5. **Stage-appropriate narrative**: Pre-seed → lead with founder + problem. Series A → lead with traction. Series B+ → lead with scale and defensibility.
6. **Typography discipline**: Exactly 2 typefaces max. 3 font sizes, 2 weights, 1 family.
7. **Color restraint**: 3-4 colors maximum across the deck. In charts: 2-3 colors max.
8. **Whitespace as hierarchy**: Confident use of space signals discipline.
9. **Data clarity over impressiveness**: Charts must be readable at a glance. Always label axes.
10. **Radical transparency**: Hockey-stick projections without assumptions = instant credibility hit.

## Assets Structure

```
assets/
├── examples/
│   ├── opticat_config.yaml
│   └── wow_config.yaml
├── pdf/
│   ├── design-template.yaml    # Brand color schema
│   └── investor-theme.css      # Full CSS design system
├── schema/
│   └── investor_config.schema.yaml
├── templates/                  # 40+ mustache templates
│   ├── index.md
│   ├── company/                # Company overview, team bios, business plan
│   ├── costs/                  # Cost analysis, cloud/hardware/legal costs
│   ├── executive/              # Executive summary, investment thesis, white paper
│   ├── financial/              # Financial model, cap table, revenue model
│   ├── legal/                  # Contracts, shareholder agreement, IP
│   ├── market/                 # Market research, competitive analysis, GTM
│   ├── operations/             # Client overview, KPI dashboard
│   ├── pitch_deck/             # Master deck, one-pager, send-ahead deck
│   ├── technical/              # Technical overview, demo script
│   └── venture_studio/         # Venture studio strategy
└── verticals/
    ├── VERTICAL_TEMPLATE.yaml
    ├── construction_software/  # ConTech market reference
    └── hvac_optimization/      # HVAC market reference
```
