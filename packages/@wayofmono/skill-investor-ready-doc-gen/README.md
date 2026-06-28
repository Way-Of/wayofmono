# @wayofmono/skill-investor-ready-doc-gen

Asset package for the `investor-ready-doc-gen` skill. Contains mustache templates, PDF themes, JSON schemas, vertical knowledge bases, and example configs for generating investor-ready documentation.

## Usage

```js
import { assetsDir, getAssetPath } from "@wayofmono/skill-investor-ready-doc-gen";

// Get the assets root directory
console.log(assetsDir);
// => /path/to/node_modules/@wayofmono/skill-investor-ready-doc-gen/assets/

// Get a specific asset path
const templatesDir = getAssetPath("templates");
const pdfTheme = getAssetPath("pdf", "investor-theme.css");
```

## Directory Structure

```
assets/
├── templates/          # 40+ mustache templates (17 categories)
│   ├── market/         # Market research, GTM, competitive analysis
│   ├── executive/      # Executive summary, white paper, investment thesis
│   ├── financial/      # Financial models, cap table, revenue model
│   ├── legal/          # Contracts, IP, shareholder agreements
│   ├── pitch_deck/     # One-pager, master deck, pitch script
│   ├── company/        # Company overview, team bios, org chart
│   ├── technical/      # Technical overview, demo scripts
│   ├── operations/     # KPI dashboard, client overview
│   ├── costs/          # Cost analysis, cloud/hardware/team costs
│   └── venture_studio/ # Venture studio strategy
├── pdf/                # PDF themes (design-template.yaml, investor-theme.css)
├── schema/             # JSON schemas (investor_config.schema.yaml)
├── verticals/          # Industry knowledge bases (construction, HVAC)
└── examples/           # Example configs (opticat, wow)
```

## Related

- `@wayofmono/skill-document-generation` — Document generation assets
- `investor-ready-doc-gen` skill in the AI Engineering Harness
