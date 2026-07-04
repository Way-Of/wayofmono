---
name: investor-ready-doc-gen
description: Generate complete investor-ready documentation for ANY project with a production-quality, project-branded design system. Auto-fires when the user asks to generate investor docs, funding materials, pitch decks, or white papers. Uses 28+ mustache-style templates bundled as assets in the skill folder. Features auto brand color detection from codebase, 12+ professional slide layouts with gradients/metrics/callouts, chart.js data visualization via chartjs2img, and exports all docs as investor-grade PDFs via Marp CLI. Project-agnostic — works for OptiCat, Way of Work, or any new project.
allowed-tools: read, write, bash, edit, grep, glob, webfetch, websearch, question, fetch
---

# Investor-Ready Document Generator

Generates a full investor-ready documentation package for any project. All templates live in `assets/templates/` and use `{{variable}}` placeholders for project-specific content.

## Required Input

The skill needs a project config. Either:
- **Interactive**: The skill asks the user questions and builds the config
- **Config file**: User provides `investor_config.yaml` (see `assets/examples/`)
- **Hybrid**: Start from config file, override interactively

## Brand Color Detection

The PDF theme automatically adapts to each project's brand identity. The skill detects brand colors during Step 1 codebase investigation and stores them in `investor_research/<project_name>/design.yaml` (separate from the project config — no mock data).

The `design.yaml` follows the schema at `assets/pdf/design-template.yaml`:

```yaml
brand_colors:
  primary: ""          # Main brand color — detected from project CSS
  secondary: ""        # Accent/secondary color
  accent: ""           # Highlight / CTA color
  # ... see assets/pdf/design-template.yaml for full schema
```

All values are auto-detected — never hardcode. If only `primary` and `secondary` are found, fill those and leave the rest empty — the base theme fills missing values with professional defaults. If NO brand colors are detected, the skill falls back to a professional default palette (navy/teal/amber). The `accent` and `secondary` are the most impactful — focus on getting those right.

## Design Best Practices (2026 Research)

The following principles are synthesized from 6 authoritative sources (OGSCapital, Infographics Agency partner interviews, Founder Pin, VC Beast, Muzli) and MUST guide all investor document generation:

### Core Principles
1. **Purpose-driven design**: A pitch deck is a decision document, not a showcase. Every design choice must accelerate investor understanding of: market size, urgency, traction, business logic, founder credibility. If it distracts from these signals, cut it.
2. **One idea per slide**: Each slide proves exactly one thing (problem, market logic, traction). Never combine product detail, market context, and strategy on one slide.
3. **Scan-first layout**: Investors scan before reading. write headlines as conclusions, not labels. Disciplined subheads, clear spacing, visible difference between primary/secondary information.
4. **15-slide consensus**: 15 slides for the visual pitch is the norm in 2026. 25+ loses attention. Longer content goes in a separate due-diligence document.
5. **Stage-appropriate narrative**: Pre-seed → lead with founder + problem. Series A → lead with traction. Series B+ → lead with scale and defensibility.

### Design System Requirements
6. **Typography discipline**: Exactly 2 typefaces max (geometric sans-serif for headers, same or complementary for body). 3 font sizes, 2 weights, 1 family. Minimum 24-30pt body copy.
7. **Color restraint**: 3-4 colors maximum across the deck. In charts: 2-3 colors max. Brand color for all data, neutral gray for comparison.
8. **Grid alignment**: Professional slides follow an underlying grid. 60-80px margins (16:9 standard). Rule of thirds for key content placement.
9. **Whitespace as hierarchy**: 1.2-1.5x leading for body text. Generous whitespace between elements. Confident use of space signals discipline.
10. **Data clarity over impressiveness**: Charts must be readable at a glance. Always label axes. Show assumptions inline. Bottom-up market sizing > top-down.

### 2026-Specific Trends
11. **"Agentic readiness"**: For AI startups, solution slides must address autonomy level, governance/trust, operational resilience.
12. **"The Ugly Slide"**: Include a Risk & Mitigation slide proactively. Naming bottlenecks signals a sober operator.
13. **Radical transparency**: Hockey-stick projections without assumptions = instant credibility hit. If no real data, say so.
14. **Bento Box layouts**: Grid-based layouts for grouping related data (team bios, feature sets).
15. **Gradients & Depth**: Subtle 3D elements and gradient backgrounds are "in" — but only if they don't distract from data.

### Quality Benchmarks
- "When an investor reads a pitch deck for the first time, they aren't reading the words yet. They're looking at the deck the way you'd look at a stranger's home — picking up signals." — Infographics Agency
- "A consistent layout suggests the team knows how to prioritize and present information cleanly." — OGSCapital
- "The best decks make the product, numbers, risks, and next step easy to evaluate." — Muzli
- "Slides with 5 words plus a strong visual signal a founder who can compress." — Infographics Agency

## Variable Reference

| Variable | Type | Description | Required |
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
| Construction Software / ConTech | `assets/verticals/construction_software/` | Verified Swedish ConTech market data, competitors, regulations, funding landscape |

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

### Mermaid Chart Generation

The skill generates Mermaid diagrams (`gantt`, `pie`, `graph LR/TD`, `quadrantChart`) for investor docs using one of two pipelines:

1. **Templates with inline `mermaid` code blocks** — rendered by Marp (Step 8). Chart data is pre-populated from config variables.
2. **External `.mmd` files** — generated by `scripts/generate-charts.sh` (if present) for complex, data-heavy diagrams.

When generating charts:
- Always use `%%{init: {'themeVariables': {'PrimaryColor': '{{chart_primary_color}}', 'PrimaryBorderColor': '{{chart_secondary_color}}'}}}%%` for themed charts
- Validate the diagram renders without syntax errors
- Never embed data that belongs in a table — use tables for data, charts for trends/distribution

### QA Criteria Reference

These criteria are applied during Step 8f validation. See the full checklist there.

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
8. **Detect brand colors** — every project has its own brand. Find the project's visual identity to generate branded PDFs:
   - Look for CSS custom properties: `--primary`, `--color-primary`, `--brand-primary`, `--accent`
   - Check `tailwind.config.js` / `tailwind.config.ts` for custom color palettes
   - Scan `theme.json`, `colors.css`, `variables.css`, or similar theme files
   - read the app's main CSS for dominant hex colors (most frequently used non-gray colors)
   - Check for brand asset files: `logo.svg`, `brand-assets/`, `favicon` colors
   - If the project has a website, fetch it and extract brand colors from the rendered CSS
   - If no colors found, ASK the user: "What are your brand's primary/accent colors?" — provide a color picker reference
   - write findings to `investor_research/<project_name>/design.yaml` (copy format from `assets/pdf/design-template.yaml`)

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

write findings to `investor_research/<project_name>/MARKET_RESEARCH.md` and `COMPETITOR_RESEARCH.md`.

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
1. read the `market_category` from config
2. Find matching folder in `assets/verticals/` (e.g., `hvac_optimization` for HVAC projects)
3. Load `market_reference.yaml` for that vertical
4. Cross-reference vertical data with your codebase investigation and web verification
5. If no match found, create a new vertical from `VERTICAL_TEMPLATE.yaml` using your research
6. Merge vertical reference data with user config (user values override vertical defaults)

### Step 6: Generate All Documents — Work Through TODO.md

For each item in your TODO.md:
1. read the template file from `assets/templates/<category>/<template>.md`
2. Replace all `{{variable}}` placeholders with merged config values
3. Enrich market sections with verified web research data (competitor names, stats, source URLs)
4. Enrich technical sections with actual codebase analysis findings
5. Handle conditionals (`{{#if}}`) and iterators (`{{#each}}`)
6. write the rendered output to the project's docs directory
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
├── PDF/                       ← Generated by Step 8
│   ├── 01_PitchDeck/
│   │   ├── Master_Deck.pdf
│   │   ├── One_Pager.pdf
│   │   └── Send_Ahead_Deck.pdf
│   ├── 02_Executive_Summary/
│   ├── 03_Financial_Model/
│   ├── ...
│   └── White_Paper.pdf
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

### Step 8: Branded PDF Conversion (via Marp CLI)

All generated markdown documents are exported to professionally designed, **project-branded PDFs** using Marp CLI — a zero-install Markdown-to-PDF converter (MIT license, 30K+ GitHub stars, maintained by marp-team). Marp works via `npx`, auto-caches after first run, and supports custom CSS themes.

#### 8a: Ensure Marp CLI Is Available

Before conversion, verify Marp CLI is installed and working. If not, install per platform:

```bash
# Test if Marp is available
npx @marp-team/marp-cli@latest --version 2>/dev/null || {
  echo "Marp CLI not found — installing..."
  case "$(uname -s)" in
    Linux*)
      # Check Chromium dependency
      if ! dpkg -s libwebkit2gtk-4.1-dev 2>/dev/null | grep -q "Status.*installed"; then
        echo "Missing libwebkit2gtk-4.1-dev — installing..."
        sudo apt update && sudo apt install -y libwebkit2gtk-4.1-dev
      fi
      npx @marp-team/marp-cli@latest --version
      ;;
    Darwin*)
      # Check for Chromium (Puppeteer can use system Chrome)
      if ! command -v chromium &>/dev/null && ! command -v google-chrome &>/dev/null; then
        echo "Chromium not found — install via: brew install --cask chromium"
        echo "Or let npx download it automatically (~75MB on first run)"
      fi
      npx @marp-team/marp-cli@latest --version
      ;;
    CYGWIN*|MINGW*|MSYS*)
      # Windows: npx handles all deps automatically
      npx.cmd @marp-team/marp-cli@latest --version
      ;;
  esac
}
```

Platform notes:
- **Linux**: Requires `libwebkit2gtk-4.1-dev` for headless Chromium. Check with `dpkg -s`. Install with `sudo apt install libwebkit2gtk-4.1-dev`. Other distros: `dnf install webkit2gtk3-devel` (Fedora), `pacman -S webkit2gtk` (Arch).
- **macOS**: npx auto-downloads Chromium. Optionally use system Chrome via `PUPPETEER_CHROMIUM_REVISION=0` or install via `brew install --cask chromium`.
- **Windows**: npx handles everything automatically. No extra deps needed.

First run downloads Chromium (~75MB, ~8s). Subsequent runs are ~1.5s per document.

#### 8b: Generate Project-Specific Theme

Before conversion, check if `investor_research/<project_name>/design.yaml` exists with detected brand colors. If it does, generate a project-branded CSS theme:

```bash
# Read design.yaml and generate project-branded CSS
if [ -f "investor_research/$PROJECT_NAME/design.yaml" ]; then
  # Parse brand colors from design.yaml
  BRAND_PRIMARY=$(grep 'primary:' "investor_research/$PROJECT_NAME/design.yaml" | head -1 | sed 's/.*: "\(.*\)"/\1/')
  BRAND_SECONDARY=$(grep 'secondary:' "investor_research/$PROJECT_NAME/design.yaml" | head -1 | sed 's/.*: "\(.*\)"/\1/')

  # Write project-branded CSS by combining brand colors with the design system
  cat > "$OUTPUT_DIR/project-theme.css" << CSS_HEAD
/* @theme investor-project */
@import 'default';
:root {
  --primary: $BRAND_PRIMARY;
  --secondary: $BRAND_SECONDARY;
}
CSS_HEAD

  # Append the full design system
  cat assets/pdf/investor-theme.css >> "$OUTPUT_DIR/project-theme.css"
  THEME="$OUTPUT_DIR/project-theme.css"
else
  THEME="assets/pdf/investor-theme.css"
fi
```

This produces a single `project-theme.css` with the project's brand colors baked into the full design system. Only the colors that were actually detected are set — the base theme fills all missing values with professional defaults. If no `design.yaml` exists, use `assets/pdf/investor-theme.css` directly.

#### 8c: Design System — Slide Classes

The theme supports 12 slide types via Marp's `<!-- _class: -->` annotation. Templates already use these — the skill should also apply them intelligently during conversion:

| Class | Visual | When to Apply |
|-------|--------|---------------|
| `cover` | Full gradient bg, centered title, accent underline, subtitle | First slide of any document |
| `section` | Full-bleed gradient banner, large section number + title | Before major document sections (use `.section-number` div) |
| `metrics` | Grid of colored metric cards with large values | KPI/metric summary slides |
| `two-columns` | Side-by-side `.column` layout with divider | Comparison or paired content |
| `quote` | Large centered quote with decorative marks, attribution | Testimonials, vision statements |
| `table-slide` | Full-width table with gradient header, striped rows | Data tables, comparison matrices |
| `feature` | Card grid with colored left border per card | Feature highlights, capability lists |
| `timeline` | Horizontal timeline with years and descriptions | Roadmap, milestones |
| `contact` | Gradient bg, centered contact info, accent line | Final/thank you slide |
| `toc` | Numbered items with accent dots and subtitles | Table of contents |
| `thin` | Compact spacing, smaller headings | Dense content slides |

Apply classes inline in the markdown:

```markdown
<!-- _class: cover -->
# Title

<!-- _class: section -->
<div class="section-number">01</div>
# Section Title

<!-- _class: metrics -->
<div class="metric-card primary">
<div class="metric-value">$10M</div>
<div class="metric-label">ARR</div>
</div>

<!-- _class: table-slide -->
| Header | Data |
|--------|------|
```

#### 8d: Conversion Logic

| Category | Markdown | Conversion | Output |
|----------|----------|-----------|--------|
| Pitch Deck (`pitch_deck/*.md`) | `<!-- _class: -->` + `---` slide breaks | Direct — templates already have all annotations | Rich multi-slide PDF |
| Documents (all other) | continuous text with `<!-- _class: -->` | Insert `---` before each `##` heading, preserve `<!-- _class: -->` annotations | Paginated sections with styled slides |

For **pitch decks**, templates already contain `---` slide separators and `<!-- _class: -->` annotations. Marp renders one styled slide per separator.

For **documents**, auto-insert `---` before each `##` heading during PDF conversion (preserving original markdown). This creates natural page breaks at each section, and `<!-- _class: -->` annotations apply to the appropriate slides:

```bash
# Insert slide breaks before ## headings, preserving existing annotations
sed 's/^## /---\n\n## /' document.md > document_for_marp.md
npx @marp-team/marp-cli@latest document_for_marp.md --pdf \
  --output document.pdf \
  --theme project-theme.css \
  --allow-local-files
```

#### 8e: Automation Script

For batch conversion across all generated docs:

```bash
# From the output root:
OUTPUT_DIR="docs/Product docs/Investor Ready"
PDF_DIR="$OUTPUT_DIR/PDF"
RESEARCH_DIR="investor_research/$PROJECT_NAME"

# 1. Generate project-branded theme from design.yaml (if exists)
if [ -f "$RESEARCH_DIR/design.yaml" ]; then
  BRAND_PRIMARY=$(grep 'primary:' "$RESEARCH_DIR/design.yaml" | head -1 | sed 's/.*: "\(.*\)"/\1/')
  BRAND_SECONDARY=$(grep 'secondary:' "$RESEARCH_DIR/design.yaml" | head -1 | sed 's/.*: "\(.*\)"/\1/')

  if [ -n "$BRAND_PRIMARY" ] || [ -n "$BRAND_SECONDARY" ]; then
    cat > "$OUTPUT_DIR/project-theme.css" << CSS_HEAD
/* @theme investor-project */
@import 'default';
:root {
  --primary: $BRAND_PRIMARY;
  --secondary: $BRAND_SECONDARY;
  --gradient-start: $BRAND_PRIMARY;
  --gradient-end: $BRAND_SECONDARY;
}
CSS_HEAD
    cat assets/pdf/investor-theme.css >> "$OUTPUT_DIR/project-theme.css"
    THEME="$OUTPUT_DIR/project-theme.css"
  else
    THEME="assets/pdf/investor-theme.css"
  fi
else
  THEME="assets/pdf/investor-theme.css"
fi

# 2. Convert all markdown to branded PDFs
find "$OUTPUT_DIR" -name "*.md" \
  -not -path "*/PDF/*" \
  -not -name "README.md" \
  -not -name "CHANGELOG.md" \
  -not -name "TODO.md" \
  | while read md; do
    rel="${md#$OUTPUT_DIR/}"
    outdir="$PDF_DIR/$(dirname "$rel")"
    mkdir -p "$outdir"

    case "$md" in
      *PitchDeck*)
        npx @marp-team/marp-cli@latest "$md" \
          --pdf \
          --output "$outdir/$(basename "${md%.md}.pdf")" \
          --theme "$THEME" \
          --allow-local-files
        ;;
      *)
        tmp=$(mktemp)
        sed 's/^## /---\n\n## /' "$md" > "$tmp"
        npx @marp-team/marp-cli@latest "$tmp" \
          --pdf \
          --output "$outdir/$(basename "${md%.md}.pdf")" \
          --theme "$THEME" \
          --allow-local-files
        rm "$tmp"
        ;;
    esac
  done
```

This converts every generated markdown file to a **project-branded PDF**, skipping README/CHANGELOG/TODO. Each PDF uses the project's own brand colors while maintaining the full professional design system.

#### 8f: Validation

After conversion:
1. Verify each PDF opens and renders correctly
2. Check cover slide has gradient background with project colors
3. Verify metric cards, callout boxes, and section dividers use project brand colors
4. Verify custom theme applied (gradients, fonts, card layouts)
5. Check file sizes — suspiciously small PDFs may indicate conversion failure
6. **Anti-overflow check**: Verify no text overflows slide boundaries — check `marp --preview` warnings
7. **Readability check**: ensure minimum font sizes (titles ≥36pt, body ≥18pt, footnotes ≥12pt)
8. **Chart check**: verify all charts rendered as proper Mermaid diagrams, not broken text blocks
9. **Asset check**: confirm all referenced images exist at their specified paths
10. **Page check**: verify page count is reasonable (not 1-page PDFs from 10-page docs, and not 100-page PDFs from 5-page docs)
11. Spot-check a pitch deck slide: should have cover → toc → section dividers → content → contact

### Step 9: Present Results
Show the user:
- Summary of generated documents (count + categories)
- Location of output files
- Which vertical knowledge base was used
- Key findings from codebase investigation
- Verification summary (what was checked online)
- Any warnings about missing data or placeholder sections
- Next steps and review process

### Step 10: Generate Final TODO.md for User
write `investor_research/<project_name>/TODO.md` to the output folder documenting:
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

## Example Invocations

```
User: "Generate investor-ready docs for my project"
Agent: [triggers investor_ready_doc_gen skill]
       [prompts user for project details]
       [generates full documentation package]
```

```
User: "Create pitch deck for OptiCat using investor_config.yaml"
Agent: [reads assets/examples/opticat_config.yaml]
       [detects market_category matches hvac_optimization vertical]
       [loads assets/verticals/hvac_optimization/market_reference.yaml]
       [merges vertical competitor data, market stats, regulations into config]
       [renders pitch deck templates with enriched data]
       [writes output to docs/Product docs/Investor Ready/]
```

```
User: "Draft white paper for our new ants farm startup"
Agent: [triggers investor_ready_doc_gen]
       [asks user: "What market vertical does this belong to?"]
       [user: "ants farming — no vertical match in assets/verticals/"]
       [warns: "No reference data for this vertical — docs will use only your input"]
       [suggests: "Create assets/verticals/ants_farming/market_reference.yaml? (copy VERTICAL_TEMPLATE.yaml)"]
       [generates white_paper.md from template using only user-provided data]
```
