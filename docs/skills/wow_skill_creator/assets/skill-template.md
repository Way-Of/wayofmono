---
name: your-new-wow-skill
description: "A concise and informative explanation of what this WoW skill does and when to use it, emphasizing its adherence to WoW mandates."
---

# Your New Way of Work Skill

## Overview

[Provide a brief overview of what this skill enables, focusing on its role within the Way of Work platform.]

## Core Capabilities

### 1. [Capability 1 Name]
[Describe the first core capability. How does it leverage WoW's backend, frontend, or agent ecosystem? Which WoW mandates does it interact with?]
- **WoW Mandate Interaction**: [e.g., Multi-Tenancy (tenant_id filtering), Access Control (role-based checks), HITL (pending_changes), Communications (notifyUser)]
- **References**: [Link to relevant internal WoW docs or external resources]

### 2. [Capability 2 Name]
[Describe the second core capability.]
- **WoW Mandate Interaction**: [e.g., Multi-Tenancy (tenant_id filtering), Access Control (role-based checks), HITL (pending_changes), Communications (notifyUser)]
- **References**: [Link to relevant internal WoW docs or external resources]

[Add more capabilities as needed]

## Resources

This skill includes the following resource directories:

### scripts/
[List any scripts here, with a brief description.]
- `scripts/example-script.js`: [Description of script's function.]

### references/
[List any reference documents here, with a brief description.]
- `references/your-reference-doc.md`: [Description of content, e.g., "API details for X," "WoW internal guidelines for Y."]

### assets/
[List any assets here, with a brief description.]
- `assets/ui-templates/your-component.tsx`: [Description of asset's purpose.]

---

**WoW Mandates Checklist for New Skills:**
- [ ] **Multi-Tenancy**: All data operations are tenant-scoped (`tenant_id`).
- [ ] **Access Control**: Role-based access checks implemented where necessary.
- [ ] **Human-in-the-Loop**: Production data modifications go through `pending_changes` or direct user confirmation.
- [ ] **WoW Conventions**: Adheres to WoW's technology stack (React, Bun, SQLite, Tailwind) and coding standards.
