# WOW-011 [Time Verification & Scheduling Agent] Time verification, scheduling and morning dispatch via Telegram

## Problem Statement

Time reports from workers must be verified against the kanban board plan. Today there is no automatic check — the leader must manually compare reported time with planned hours. There is also no automatic morning schedule for workers. Workers should get a Telegram message every morning with their daily tasks based on their kanban cards.

## Desired Outcome

An agent that daily:
1. Reviews all time reports from yesterday against the kanban plan
2. Sends a summary to admin/project leader with variances and suggestions
3. Creates a proposal for today's schedule based on kanban card status
4. Sends Telegram to each worker at 06:30 with their personal to-do list

All proposals go through **human-in-the-loop** (WOW-010) — the agent sends suggestions, admin approves, only then are messages or schedules sent out.

## Context & Background

### Current State
- Time entries via `kanban_log_time` saved as `pending` for leader approval
- Kanban cards have `assigned_to`, `estimated_hours`, deadline
- Telegram bot exists but only used for incoming messages (no outbound scheduling)
- No automatic morning dispatch

### Why This Matters
- The project leader spends hours per day on manual time compilation
- Workers need to know what to do when they arrive at the worksite
- Time variances are often detected too late → budget overruns
- Telegram is already established as a channel

## Requirements

### Functional Requirements
- [x] Agent reads time reports: `GET /api/portal/time` or `kanban_card_time_logs`
- [x] Agent reads kanban plan: `kanban_list_cards` with assignee and estimated_hours
- [x] Agent compares reported time vs planned time per card
- [x] Agent creates variance report: "Card X: planned 8 h, reported 10 h (+2 h)"
- [x] Agent proposes tomorrow's schedule: distributes cards per worker based on deadline/status
- [x] Schedule proposal goes through approval queue (WOW-010) — admin clicks Approve
- [x] On approval: Telegram sent to each worker at 06:30 with daily tasks
- [x] Telegram message contains: card name, project, priority, planned hours

### Out of Scope
- Real-time schedule changes during the day — future
- GPS verification of attendance — future
- Automatic reassignment on sick leave — future
- Salary basis — future

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`

### Manual Verification
- [x] Agent can list time reports for all workers
- [x] Agent can list kanban cards per worker with estimated_hours
- [x] Agent identifies variances >20% between planned and reported
- [x] Agent creates schedule proposal as pending_change
- [x] Admin approves → Telegram sent to workers
- [x] Message contains correct tasks per person
## Technical Notes

### Agent: `schemaplanerare` (Schedule Planner)

```
name: schemaplanerare
description: Construction scheduler — verifies time, plans daily work, sends Telegram
skills: kanban-time, workers, client-communication, research
```

### Workflow

```
06:00 — Agent runs daily routine:
  1. Fetch all time reports from yesterday
  2. Fetch all kanban cards with assignees
  3. Compare: planned vs reported per card
  4. Create variance report → pending_change

  5. Fetch all active cards sorted by deadline
  6. Distribute cards per worker for today
  7. Create schedule proposal → pending_change

08:00 — Admin approves (or adjusts and approves):

  8. Telegram sent to each worker:
     "Good morning! Your tasks today:
      🟢 Project X — Window assembly (planned 6h)
      🟡 Project Y — Bathroom waterproofing (planned 4h)"
```

### Scheduled Execution

Use existing `ClawScheduleExecutor` (`server/claw-schedule-executor.ts`):
- Schedule: daily 06:00
- Action: run the `schemaplanerare` agent
- Output: pending_changes for admin

### Telegram Sending

Reuse `sendTelegramMessage` from `server/telegram-bot.ts`:
- Look up worker's Telegram link in `user_channel_links WHERE channel='telegram'`
- Send message with daily tasks
- Log in `channel_message_logs`

### API Endpoints Needed

| Method | Path | Description |
|---|---|---|
| GET | `/api/schedule/daily-proposal` | Generate daily schedule proposal |
| POST | `/api/schedule/daily-proposal/approve` | Approve and send Telegram |
| GET | `/api/time/verification-report` | Get time verification report |
| POST | `/api/time/verification-report/submit` | Submit report as pending_change |

### DB Schema (if needed)

```sql
-- Scheduled messages log
CREATE TABLE IF NOT EXISTS scheduled_messages (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    message_text TEXT NOT NULL,
    scheduled_for TEXT NOT NULL,
    sent_at TEXT,
    status TEXT DEFAULT 'pending',  -- pending, sent, failed
    created_at TEXT DEFAULT (datetime('now'))
)
```

### Message Template (Telegram)

```
Good morning, [name]! 🌅

Your tasks for [date]:

🏗️ [Project]
  ▢ [Card name] — [planned time]h (priority: [high/medium])
  ▢ [Card name] — [planned time]h

⏱️ Total planned time: [X]h
📋 Reply to this message with questions
```

### Affected Components
- `.wo/agents/schemaplanerare.md` — new agent
- `.wo/skills/scheduling/SKILL.md` — new skill for scheduling methodology
- `server/claw-schedule-executor.ts` — daily 06:00 trigger
- `server/telegram-bot.ts` — outbound scheduled messages
- `server/db.ts` — scheduled_messages table
- `server/pending-changes-api.ts` or equivalent (WOW-010)
- AdminDashboard — time verification UI

---

## Meta

**Created**: 2026-05-22
**Priority**: High
**Estimated Effort**: XL
**Status**: Planned — depends on WOW-010 (human-in-the-loop)
