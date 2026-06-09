// Auto-generated from canonical skill: opticat_ui_builder
// Platform: WoCoder (Node/Deno)
// Description: "Facilitates the generation and enhancement of OptiCat-related UI components and dashboards. Use this skill when building new OptiCat data visualizations, extending existing dashboards with more detailed information from OptiCat APIs, or creating interactive UI elements based on HVAC project data."

export const skill = {
  name: "opticat_ui_builder",
  description: ""Facilitates the generation and enhancement of OptiCat-related UI components and dashboards. Use this skill when building new OptiCat data visualizations, extending existing dashboards with more detailed information from OptiCat APIs, or creating interactive UI elements based on HVAC project data."",
  tools: [""],
  prompt: `> **Platform**: Wo Coder | **Skill**: opticat-ui-builder | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# OptiCat UI Builder

## Overview

This skill enables the creation and modification of user interface components for displaying OptiCat data. It provides guidance and resources for leveraging OptiCat APIs to build rich, interactive dashboards and visualizations for HVAC projects, AHUs, service reports, and other related metrics.

## Core Capabilities

### 1. OptiCat API Integration
Guides on how to access and utilize the OptiCat REST APIs (e.g., \`/api/opticat/summary\`, \`/api/opticat/projects\`, \`/api/opticat/aggregat\`, \`/api/opticat/service-reports\`, \`/api/opticat/sync-log\`) to fetch data for UI components.
- **Reference**: See \`references/opticat-api-docs.md\` for API endpoint details and examples.

### 2. Dashboard Component Generation
Provides patterns and examples for creating React components to display various OptiCat data points, such as:
- Project lists with detailed status, last sync, number of buildings, and associated AHUs.
- AHU (Aggregat) overviews with status and key metrics.
- Summaries of pending, completed, or overdue service reports.
- Visualizations for sync status and warnings.
- **Asset**: Basic React component templates for common dashboard elements can be found in \`assets/ui-templates/\`.

### 3. Interactive UI Elements
Instructions and code snippets for adding interactive features like filtering, sorting, and drill-down capabilities to OptiCat data displays.
- **Example**: Generating buttons to view project-specific details or trigger data refreshes.

### 4. Styling and Theming
Guidance on applying the Way of Work (WoW) dark theme and Tailwind CSS best practices to new OptiCat UI components to ensure visual consistency.

## Resources

This skill includes the following resource directories:

### scripts/
(Currently empty - add scripts for automating UI tasks, data processing, or API calls if needed.)

### references/
- \`references/opticat-api-docs.md\`: Detailed documentation for OptiCat REST API endpoints, expected request/response formats, and authentication.
- \`references/ui-patterns.md\`: Common UI patterns and best practices for presenting complex data in the WoW environment.

### assets/
- \`assets/ui-templates/dashboard-card.tsx\`: A basic React component template for displaying summary cards.
- \`assets/ui-templates/data-table.tsx\`: A basic React component template for rendering tabular data with common features like sorting.

---

**Any unneeded directories can be deleted.** Not every skill requires all three types of resources.
`,
};
