---
name: wom-lens-toggle
description: Enable or disable specific Wom-Lens features (Pipeline, LSP, Formatters).
---
# /wom-lens-toggle [feature]

Enable or disable specific analysis features in the WayOfMono environment. Use this if a feature is blocking your workflow or causing performance issues.

## Usage
- \`/wom-lens-toggle pipeline\`: Toggle the entire integrity pipeline.
- \`/wom-lens-toggle lsp\`: Toggle real-time language server diagnostics.
- \`/wom-lens-toggle format\`: Toggle automated code formatting.
- \`/wom-lens-toggle read-guard\`: Toggle the "Read-Before-Edit" safety check.

## Status
If no feature is specified, this command will display the current status of all toggles.
