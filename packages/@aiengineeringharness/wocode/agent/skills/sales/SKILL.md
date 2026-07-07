# Sales Knowledge & Playbooks

Store, retrieve, and apply sales knowledge across projects. Integrates with investor-ready-doc-gen for market data, competitive analysis, and revenue projections.

## What This Skill Does

1. **Store** — Capture sales playbooks, talk tracks, competitive intel, customer research
2. **Fetch** — Retrieve sales knowledge for investor docs, pitches, and go-to-market plans
3. **Search** — Full-text search across sales knowledge entries
4. **Apply** — Feed sales data into investor-ready-doc-gen templates

## Sales Knowledge Structure

```
thoughts/global/sales/
├── playbooks/           # Vertical-specific sales strategies
├── scripts/             # Talk tracks, elevator pitches, objection handling
├── research/            # Market research, competitive analysis, buyer personas
├── templates/           # Sales document templates
└── index.json           # Registry of all sales entries
```

## Commands

### Store Sales Knowledge

```bash
# Store a playbook
python3 skills/sales/scripts/sales.py store playbook "HVAC Sales Playbook" \
  --tags "hvac,simulation,opticat" \
  --content "## Target Buyer\nFacilities managers at commercial buildings..."

# Store a talk track
python3 skills/sales/scripts/sales.py store script "Elevator Pitch v2" \
  --tags "pitch,elevator,investor" \
  --content "30-second pitch for OptiCat HVAC optimization..."

# Store competitive intel
python3 skills/sales/scripts/sales.py store research "Competitor Analysis - HVAC" \
  --tags "competitors,hvac,market" \
  --content "## Key Competitors\n1. Carrier - Market share 35%..."

# Store customer research
python3 skills/sales/scripts/sales.py store research "Buyer Persona - Facilities Manager" \
  --tags "persona,facilities,buyer" \
  --content "## Demographics\n- Role: Facilities Manager..."
```

### Fetch Sales Knowledge

```bash
# Fetch specific entry
python3 skills/sales/scripts/sales.py fetch playbook-001

# Fetch all in a category
python3 skills/sales/scripts/sales.py fetch --category playbook
```

### Search Sales Knowledge

```bash
# Full-text search
python3 skills/sales/scripts/sales.py search "HVAC optimization"

# Tag-based search
python3 skills/sales/scripts/sales.py search --tag hvac

# Category filter
python3 skills/sales/scripts/sales.py search --category research
```

### List & Stats

```bash
# List all entries
python3 skills/sales/scripts/sales.py list

# Show statistics
python3 skills/sales/scripts/sales.py stats
```

## Integration with investor-ready-doc-gen

When generating investor documents, the sales skill provides:

- **Market sizing data** from competitive analysis entries
- **Customer pain points** from buyer persona research
- **Revenue projections** from pipeline patterns
- **Go-to-market strategies** from playbooks
- **Competitive positioning** from competitor analysis

### Auto-Feed Flow

```
Agent generating investor doc:
  → Reads template requirements (market, competitors, revenue)
  → Searches sales knowledge for matching entries
  → Injects data into investor-ready-doc-gen templates
  → Generated doc includes real sales intelligence
```

## Entry Format

```yaml
---
id: playbook-001
title: "HVAC Sales Playbook"
category: "playbook"  # playbook | script | research | template
tags: ["hvac", "simulation", "opticat"]
source: "manual"       # manual | session | research
date: "2026-07-07"
confidence: "high"
related: []
deprecated: false
---

# HVAC Sales Playbook

## Target Buyer
<Who buys this product>

## Value Proposition
<Why they should buy>

## Sales Process
<Step-by-step sales motion>

## Objections & Responses
<Common objections and how to handle them>
```

## Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `playbook` | Vertical-specific sales strategies | HVAC Playbook, Construction Playbook |
| `script` | Talk tracks and pitches | Elevator Pitch, Demo Script, Objection Handling |
| `research` | Market intelligence | Competitor Analysis, Buyer Persona, Market Sizing |
| `template` | Sales document templates | Proposal Template, Quote Template |

## Rules

- Entries are append-only — never delete, only deprecate
- Each entry has a unique ID: `<category>-<NNN>`
- Categories are auto-created on first entry
- Search works across title, tags, and content body
- Sales data feeds into investor-ready-doc-gen automatically
