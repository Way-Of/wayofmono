---
name: investor_ready_doc_gen
description: Generate complete investor-ready documentation for ANY project. Auto-fires when the user asks to generate investor docs, funding materials, pitch decks, or white papers. Uses 40+ mustache-style templates bundled as assets. Includes Marp CLI + Pandoc for PDF/HTML/DOCX export. Project-agnostic — works for OptiCat, Way of Work, or any new project.
allowed-tools: read, write, bash, edit, grep, glob, webfetch, websearch, question
---

# Investor-Ready Document Generator

Generates a full investor-ready documentation package for any project. All templates live in `assets/templates/` and use `{{variable}}` placeholders for project-specific content.

## Required Input

The skill needs a project config. Either:
- **Interactive**: The skill asks the user questions and builds the config
- **Config file**: User provides `investor_config.yaml` (see `assets/examples/`)
- **Hybrid**: Start from config file, override interactively

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
| Construction Software / ConTech | `assets/verticals/construction_software/` | Swedish construction market data |

### Structure

Each vertical folder contains:
- `market_reference.yaml` — Sourced market data, competitors, regulations, trends

### How It Works

1. Identify the project's vertical from the config (`market_category` field)
2. Load the matching `market_reference.yaml` from `assets/verticals/<vertical>/`
3. Use the reference data to enrich generated documents:
   - Add real competitor names and threat assessments
   - Cite verified market statistics with source URLs
   - Reference relevant regulations and compliance mandates
   - Validate project claims against known industry benchmarks
4. Always re-verify data via web search — vertical assets are snapshots, not live

### Creating a New Vertical

```
1. mkdir assets/verticals/<your_vertical>/
2. Copy assets/verticals/VERTICAL_TEMPLATE.yaml as market_reference.yaml
3. Research the vertical via web search (industry reports, competitor sites, government sources)
4. Fill in market sizing, competitors, regulations, and trends with sourced data
5. Annotate every claim with its source URL
```

The template at `assets/verticals/VERTICAL_TEMPLATE.yaml` provides a complete skeleton.

## Workflow

### Step 1: Comprehensive Codebase Investigation ⚠️ CRITICAL MANDATORY

Before generating ANY investor docs, you MUST thoroughly investigate the application's actual codebase. This is not optional.

1. **Explore the full repository structure** — read README, package.json, directory tree, configuration files
2. **Identify the technology stack** — languages, frameworks, databases, infrastructure, APIs
3. **Analyze the architecture** — components, modules, data flow, integrations, deployments
4. **Extract actual metrics** — real code stats (lines of code, number of services, API endpoints)
5. **Document the team structure** — from code OWNERS files, commit history, project configs
6. **Find the problem domain** — what does the application ACTUALLY do? What problems does it solve?
7. **Capture real traction** — commit frequency, release history, issue tracker stats, user counts if available

Create a structured research folder for all findings:

```
investor_research/<project_name>/
├── CODEBASE_ANALYSIS.md       # Full codebase investigation results
├── ARCHITECTURE.md            # System architecture, components, data flow
├── TECHNOLOGY_STACK.md        # Languages, frameworks, infrastructure
├── METRICS.md                 # Actual metrics gathered from code/analytics
├── TEAM_ANALYSIS.md           # Team structure from commit history/configs
├── COMPETITOR_RESEARCH.md     # Competitor analysis
├── MARKET_RESEARCH.md         # Market data from web research
└── TODO.md                    # Self-generated task list for this doc run (see Step 4)
```

### Step 2: Web Verification — Verify EVERYTHING Online

For every claim that will go into investor docs, verify it via web search:

1. **Market sizing** — Search for industry reports; cross-reference TAM/SAM/SOM from 3+ sources
2. **Competitors** — Verify each competitor is ACTIVE; check crunchbase.com, company websites
3. **Growth rates** — Verify CAGR claims against iea.org, statista.com, marketsandmarkets.com
4. **Regulations** — Check official government sources (energy.ec.europa.eu, energy.gov, etc.)
5. **Technology claims** — Verify performance benchmarks, accuracy claims against published research
6. **Pricing** — Check competitor pricing pages for realistic ranges
7. **Electricity/energy costs** — Use official statistics (eurostat.eu, eia.gov, iea.org)
8. **Research BOTH globally AND nationally** — mandatory dual-scope:
   - **Global**: Total addressable market worldwide (TAM), global trends, international competitors, cross-border regulations
   - **National**: Country-specific market size, local competitors, domestic regulations, regional pricing, local adoption rates
   - **Compare**: How does the national market compare to global? (e.g., "Sweden represents 2% of the global HVAC optimization market but is growing at 22% CAGR due to strict EU regulations")
9. **Save all source URLs** — every claim must have a verifiable source

Write findings to `investor_research/<project_name>/MARKET_RESEARCH.md` and `COMPETITOR_RESEARCH.md`.

### Step 3: Create Self-Managed TODO.md ⚠️ MANDATORY

Before generating any documents, create a comprehensive TODO.md at:
```
investor_research/<project_name>/TODO.md
```

This TODO must list:
- Every document that will be generated (all 40+ templates)
- Every section required per document
- Every variable that needs to be filled
- Every claim that needs verification
- Missing data that needs user input
- Order of document generation (dependencies)
- Self-checks per document

The AI must work through this TODO systematically, ticking off items as completed.

### Step 4: Gather Project Config

Now that you have thorough codebase understanding, build the project config:
```yaml
# Ask the user for details OR read from existing config file
# Use your codebase investigation to pre-fill as much as possible
# Required fields:
project_name: ""
project_tagline: ""
project_description: ""  # Pre-fill from codebase readme
problem_statement: ""     # Pre-fill from actual app domain
solution_description: ""  # Pre-fill from actual app features
target_market: ""
market_category: ""       # Used to select vertical knowledge base
geography_national: ""    # Primary national market (e.g., "Sweden", "US", "Germany")
tam_global: ""            # Global TAM — MANDATORY dual-scope
tam_national: ""          # National TAM — MANDATORY dual-scope
tam: ""                   # Combined or primary TAM
sam: ""
som: ""
global_growth_rate: ""    # Global CAGR
national_growth_rate: ""  # National CAGR
market_growth_rate: ""
global_trends: ""
revenue_streams: []
pricing_model: ""
key_metrics: {}           # Pre-fill from actual app metrics
technology_stack: []      # Pre-fill from codebase analysis
competitors: []           # Pre-fill from competitor research
competitive_advantages: []
team_members: []          # Pre-fill from code OWNERS/configs
advisors: []
funding_ask: ""
valuation: ""
use_of_funds: []
current_traction: []      # Pre-fill from actual codebase traction
risks: []
legal_structure: ""
incorporation_date: ""
jurisdiction: ""
```

### Step 5: Load Vertical Knowledge Base
1. Read the `market_category` from config
2. Find matching folder in `assets/verticals/` (e.g., `hvac_optimization` for HVAC projects)
3. Load `market_reference.yaml` for that vertical
4. Cross-reference vertical data with your codebase investigation and web verification
5. If no match found, create a new vertical from `VERTICAL_TEMPLATE.yaml` using your research
6. Merge vertical reference data with user config (user values override vertical defaults)

### Step 6: Generate All Documents — Work Through TODO.md

For each item in your TODO.md:
1. Read the template file from `assets/templates/<category>/<template>.md`
2. Replace all `{{variable}}` placeholders with merged config values
3. Enrich market sections with verified web research data (competitor names, stats, source URLs)
4. Enrich technical sections with actual codebase analysis findings
5. Handle conditionals (`{{#if}}`) and iterators (`{{#each}}`)
6. Write the rendered output to the project's docs directory
7. Tick off the item in TODO.md
8. Self-check: verify all placeholders filled, all claims sourced

Output structure mirrors template directory:
```
docs/Product docs/Investor Ready/
├── 01_PitchDeck/
├── 02_Executive_Summary/
├── 03_Financial_Model/
├── 04_Product_Demo/
├── 05_Technical_Overview/
├── 06_GoToMarket_Plan/
├── 07_Team_Bios/
├── 08_Company_Docs/
├── 09_Client_Material/
├── 10_KPI_Snapshot/
├── 11_Costs/
├── 12_Revenue_Model/
├── 13_Partnership/
├── 14_Product_Roadmap/
├── 15_Deep_Research/
├── 16_Legal_Contracts/
├── 17_Venture_Studio_Strategy/
├── White_Paper.md
├── Product_Functionality.md
├── CHANGELOG.md
├── TODO.md
└── README.md
```

### Step 7: Validate Output
1. Re-read your TODO.md — every item ticked?
2. Check for **any remaining unclosed placeholders** — these indicate missing config values
3. Check for **forbidden terms** based on project context
4. Verify **every market claim has a source URL**
5. Verify **all codebase claims match the actual codebase**
6. Confirm **document count matches 17 categories + root files**
7. Re-check competitor status via quick web search

### Step 8: Present Results
Show the user:
- Summary of generated documents (count + categories)
- Location of output files
- Which vertical knowledge base was used
- Key findings from codebase investigation
- Verification summary (what was checked online)
- Any warnings about missing data or placeholder sections
- Next steps and review process

### Step 9: Generate Final TODO.md for User
Write `investor_research/<project_name>/TODO.md` to the output folder documenting:
- What was generated
- What needs human review
- What data is still missing
- Recommended next steps

## Template Writing Conventions

1. Every template starts with a YAML frontmatter block
2. All project-specific content uses `{{variable}}` placeholders
3. Optional sections use `{{#if variable}}...{{/if}}`
4. Repeatable elements use `{{#each variable}}...{{/each}}`
5. Tables use `{{table variable}}` for structured data
6. NEVER hardcode project names, markets, or personal names
7. Every template documents its required variables at the top
8. Output directory structure mirrors the template directory structure

## PDF Export: Marp + Pandoc

### Marp CLI (Presentation to PDF)
The skill bundles Marp CLI for converting pitch deck markdown to professional PDF presentations.

**Location**: `assets/marp/` (downloaded on first use)
**Usage**:
```bash
# Convert master deck to PDF
npx @marp-team/marp-cli@latest assets/templates/pitch_deck/master_deck.md --pdf --allow-local-files

# Convert with custom theme
npx @marp-team/marp-cli@latest assets/templates/pitch_deck/master_deck.md --pdf --theme assets/pdf/investor-theme.css
```

### Pandoc (Universal Document Conversion)
The skill uses Pandoc for converting any markdown template to PDF, HTML, DOCX, or other formats.

**Location**: System-installed (pandoc must be available in PATH)
**Usage**:
```bash
# Markdown to PDF (with custom template)
pandoc assets/templates/executive/executive_summary.md -o output/executive_summary.pdf --pdf-engine=weasyprint --css assets/pdf/investor-theme.css

# Markdown to HTML
pandoc assets/templates/executive/white_paper.md -o output/white_paper.html --standalone --css assets/pdf/investor-theme.css

# Markdown to DOCX
pandoc assets/templates/financial/master_financial_model.md -o output/financial_model.docx

# Batch convert all templates
for f in assets/templates/**/*.md; do
  pandoc "$f" -o "output/$(basename "$f" .md).pdf" --pdf-engine=weasyprint --css assets/pdf/investor-theme.css
done
```

### Automated PDF Generation Workflow
After generating all markdown documents (Step 6), the skill can optionally run:

1. **Marp** for pitch decks (master_deck, one_pager, send_ahead_deck, pitch_script, supporting_slides)
2. **Pandoc** for all other documents (executive, technical, financial, legal, market, company, operations)

Output structure:
```
docs/Product docs/Investor Ready/
├── PDF/
│   ├── 01_PitchDeck/
│   │   ├── master_deck.pdf
│   │   ├── one_pager.pdf
│   │   ├── send_ahead_deck.pdf
│   │   ├── pitch_script.pdf
│   │   └── supporting_slides.pdf
│   ├── 02_Executive_Summary/
│   │   ├── executive_summary.pdf
│   │   ├── investment_thesis.pdf
│   │   └── white_paper.pdf
│   └── ... (all 17 categories)
├── HTML/
├── DOCX/
└── MARKDOWN/ (original generated files)
```

### Installation Requirements
- **Marp CLI**: `npm install -g @marp-team/marp-cli` (or use npx)
- **Pandoc**: System package manager (apt: `pandoc`, brew: `pandoc`, choco: `pandoc`)
- **WeasyPrint** (for PDF via Pandoc): `pip install weasyprint` or use wkhtmltopdf

## Example Invocations

```
User: "Generate investor-ready docs for my project"
Agent: [triggers investor_ready_doc_gen skill]
       [prompts user for project details]
       [generates full documentation package]
       [optionally exports to PDF/HTML/DOCX via Marp + Pandoc]
```

```
User: "Create pitch deck for OptiCat using investor_config.yaml"
Agent: [reads assets/examples/opticat_config.yaml]
       [detects market_category matches hvac_optimization vertical]
       [loads assets/verticals/hvac_optimization/market_reference.yaml]
       [merges vertical competitor data, market stats, regulations into config]
       [renders pitch deck templates with enriched data]
       [writes output to docs/Product docs/Investor Ready/]
       [runs Marp CLI to generate pitch deck PDFs]
```

```
User: "Draft white paper for our new ants farm startup"
Agent: [triggers investor_ready_doc_gen]
       [asks user: "What market vertical does this belong to?"]
       [user: "ants farming — no vertical match in assets/verticals/"]
       [warns: "No reference data for this vertical — docs will use only your input"]
       [suggests: "Create assets/verticals/ants_farming/market_reference.yaml? (copy VERTICAL_TEMPLATE.yaml)"]
       [generates white_paper.md from template using only user-provided data]
       [runs Pandoc to export white_paper.pdf]
```
