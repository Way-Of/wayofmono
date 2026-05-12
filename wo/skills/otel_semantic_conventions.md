---
name: otel-semantic-conventions
description: Standardizing attribute names and namespaces.
trigger: manual
---

# OTel Semantic Conventions

This skill ensures that all telemetry data follows industry-standard naming conventions (OTel SemConv).

## Standards
- **General:** \`service.name\`, \`deployment.environment\`.
- **HTTP:** \`http.request.method\`, \`http.response.status_code\`.
- **Database:** \`db.system\`, \`db.statement\`.
- **Custom:** Use the \`wayofmono.*\` namespace for project-specific attributes.
