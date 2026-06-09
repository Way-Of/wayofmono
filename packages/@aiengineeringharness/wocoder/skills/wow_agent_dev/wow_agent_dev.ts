// Auto-generated from canonical skill: wow_agent_dev
// Platform: WoCoder (Node/Deno)
// Description: Comprehensive guide for creating, routing, and managing AI agents, skills, and chat workflows within the Way of Work platform. Use when modifying or creating agents in .wo/agents or their skills.

export const skill = {
  name: "wow_agent_dev",
  description: "Comprehensive guide for creating, routing, and managing AI agents, skills, and chat workflows within the Way of Work platform. Use when modifying or creating agents in .wo/agents or their skills.",
  tools: [""],
  prompt: `> **Platform**: Wo Coder | **Skill**: wow_agent_dev | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# wow_agent_dev

## 1. Multi-Agent Architecture (WOW-016 Phase 7)
Way of Work employs a decentralized, specialized agent architecture.

### The Orchestrator
- **File:** \`.wo/agents/orchestrator.md\`
- **Role:** The primary entry point for inbound requests (UI or Channels).
- **Behavior:** It **never** executes tasks directly. It uses the \`dispatch-agent\` skill to analyze intent and route the request to a sub-agent.

### Specialized Agents
- Defined in \`.wo/agents/*.md\` using YAML frontmatter:
  \`\`\`yaml
  ---
  name: fakturering
  description: Swedish offer and invoice expert
  skills: document-generation, client-communication, project-pricing
  ---
  \`\`\`
- **Current Roster:** \`claw\` (general), \`docs\`, \`kanban\`, \`fakturering\` (finance), \`forskare\` (research), \`projektledare\` (heavy PM), \`schemaplanerare\` (schedules), \`ata\` (change orders).

## 2. Skills Definition
- Stored in \`.wo/skills/<skill-name>/SKILL.md\`.
- Skills inject specific rules, instructions, or expected data formats into the agent's context.
- **Example:** A skill might instruct the agent to output a specific JSON payload when creating an invoice or dictate the tone for \`client-communication\`.

## 3. Human-in-the-Loop Constraint (WOW-010)
**CRITICAL SECURITY RULE:** Agents MUST NEVER execute writes to production data tables (e.g., \`price_lists\`, \`tasks\`, \`projects\`, \`offers\`).
- Agents are strictly instructed to create proposals using the \`POST /api/pending-changes\` endpoint.
- **Payload:** \`{ change_type: "update", target_table: "tasks", target_id: "task_123", proposed_data: {...}, summary: "..." }\`
- The user must review and approve this proposal in the Admin Console "Godkännandekö" before the backend applies the change.

## 4. Communication & Session Persistence (WOW-012, WOW-015)
- **Inbound Router:** All external messages (Telegram, WhatsApp) hit \`server/channel-router.ts\`. This module resolves the user ID, scopes the tenant, and handles authorization.
- **Bot Bridge:** The router passes the message to \`server/claw-bot-bridge.ts\`.
- **Session Persistence:** The bridge automatically maintains chat history in JSONL format using \`server/wo-session-jsonl.ts\`. 
  - Sessions are isolated per channel/user (e.g., \`agent/sessions/channel/telegram/<userId>.jsonl\`).
  - The bridge automatically trims history (e.g., last 20 messages) to manage token context.
- **Outbound Tools:** Agents can proactively contact users via \`telegram_send\` or \`whatsapp_send\` tools defined in \`server/orchestrator-channel-tools.ts\`. (Used in WOW-016 Phase 8 Daily Planning workflows).

## 5. Tool Registration
If an agent needs a new capability (e.g., searching a specific DB table), the tool must be:
1. Implemented in a dedicated file (e.g., \`server/orchestrator-ta-tools.ts\`).
2. Exported as an OpenAI-compatible function definition schema.
3. Registered in the execution switch statement within \`server/orchestrator-tools-exec.ts\`.
`,
};
