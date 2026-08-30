---
name: wow_human_in_the_loop
description: Rules for implementing the WOW-010 Human-in-the-Loop constraint for AI-generated data changes. Use when writing agent prompts or backend tools that modify production data.
docs-url: 
---

# wow_human_in_the_loop

## The Golden Rule of AI Writes
**Internal AI agents MUST NEVER execute writes directly to production data tables** (e.g., `price_lists`, `tasks`, `projects`, `offers`).

## The `pending_changes` Workflow
Whenever an internal AI agent needs to modify data, it must submit a proposal to the approval queue.

1. **Submission:** The agent uses the `POST /api/pending-changes` endpoint.
2. **Payload Structure:**
   ```json
   {
     "change_type": "update", // or "create", "delete"
     "target_table": "tasks",
     "target_id": "task_123", // null if creating
     "proposed_data": { "status": "complete" },
     "current_data": { "status": "in_progress" },
     "summary": "Agent suggests marking task complete based on user message."
   }
   ```
3. **Approval:** An Administrator reviews the diff in the UI and clicks "Approve".
4. **Execution:** The backend (`server/pending-changes-api.ts`) applies the `proposed_data` to the `target_table`.

## Your Responsibility
When modifying backend routes or internal agent prompts, you must ensure this architecture is respected. Do not build bypasses for agents to write directly to the database unless explicitly requested by the developer for a specific, safe edge case.
