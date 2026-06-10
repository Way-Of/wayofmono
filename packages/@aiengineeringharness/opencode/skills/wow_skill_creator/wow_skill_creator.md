---
name: wow-skill-creator
description: "Facilitates the creation of new Gemini CLI skills specifically for the Way of Work platform, ensuring adherence to WoW architectural mandates and best practices. Use this skill when generating new WoW-specific skills, defining their structure, or incorporating WoW's unique requirements like multi-tenancy, access control, and HITL."
---

> **Platform**: OpenCode | **Skill**: wow-skill-creator | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# Way of Work Skill Creator

## Overview

This skill guides the creation of new Gemini CLI skills tailored for the Way of Work (WoW) platform. It provides specialized knowledge, templates, and best practices to ensure that newly developed skills align with WoW's architectural mandates, such as multi-tenancy, access control, and Human-in-the-Loop (HITL) requirements.

<h2>Core Capabilities</h2>

<h3>1. WoW-Specific Skill Templates</h3>
Provides pre-configured `SKILL.md` templates that include necessary WoW architectural mandates, required sections, and best practices for documentation.
- **Asset**: `assets/skill-template.md` (a customized `SKILL.md` template for WoW).

<h3>2. Architectural Mandate Guidance</h3>
Offers detailed guidance on incorporating WoW's critical architectural mandates into new skills:
- **Multi-Tenancy**: How to ensure tenant isolation and data partitioning.
- **Access Control**: Integrating with WoW's role-based access control (RBAC) and Economics Shield.
- **Human-in-the-Loop (HITL)**: Implementing `pending_changes` for data modifications by agents.
- **Communication Channels**: Best practices for integrating with Telegram, WhatsApp, and Email.
- **Reference**: `references/wow-mandates-guide.md` for in-depth explanations and examples.

<h3>3. Resource Generation Examples</h3>
Provides examples and placeholder files for `scripts/`, `references/`, and `assets/` that are relevant to WoW development:
- Basic React component templates (`assets/ui-templates/`).
- Backend API call examples (`scripts/backend-api-example.js`).
- Database schema snippets (`references/db-schema-snippets.md`).

<h3>4. Validation and Compliance Checklists</h3>
Includes checklists or automated steps to ensure new skills comply with WoW's critical mandates and coding standards.

<h3>5. Skill Packaging and Installation Workflow</h3>
Instructions on how to correctly package and install new WoW skills within the Gemini CLI environment, ensuring they are discoverable and usable by the agent.

<h2>Resources</h2>

This skill includes the following resource directories:

<h3>scripts/</h3>
- `scripts/backend-api-example.js`: Example Node.js script for making authenticated backend API calls within WoW.

<h3>references/</h3>
- `references/wow-mandates-guide.md`: Detailed guide on Way of Work's architectural mandates, including multi-tenancy, access control, and HITL.
- `references/db-schema-snippets.md`: Common database schema snippets and best practices for WoW.

<h3>assets/</h3>
- `assets/skill-template.md`: A customized `SKILL.md` template specifically for creating WoW skills.
- `assets/ui-templates/`: Directory containing basic UI component templates (e.g., React components) aligned with WoW's frontend.
