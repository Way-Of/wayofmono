# WOW-007 Per-User Channel Linking & WhatsApp Time Tracking

## Problem Statement

All communication channels (Telegram, WhatsApp, Webhook, Email) currently operate as single-tenant, single-user — no connection to individual Way of Work user accounts. When a worker sends a message via Telegram or WhatsApp, the Claw has no idea which user it came from, so it cannot:
- Run the turn in that user's context (their projects, tasks, time entries)
- Log time against the correct user
- Send targeted notifications about assigned kanban cards

Additionally, there's no WhatsApp-based time logging — workers can't message "worked 4h on project X" and have it appear as a time entry.

## Desired Outcome

1. **Per-user channel linking**: Users can pair their Telegram/WhatsApp identity to their Way of Work account. Incoming messages route to that user's context.
2. **WhatsApp Time Workbot**: Workers can send time logs via WhatsApp (e.g. "4h on roof repair") that create time entries in their name, synced with the time tracking system.
3. **Kanban notifications**: Card assignments and updates trigger WhatsApp notifications to the assigned worker.

## Context & Background

### Current State

- **Channels are tenant-wide**: Telegram token, WhatsApp API key, and webhook secrets are workspace-level. No user identity.
- **Claw automation (`executeClawAutomation`)** passes zero user context — no `tenantId` or `userId` in the payload. Runs as anonymous.
- **Kanban cards** (`tasks` table) have `assigned_to` but no notification mechanism when assigned/updated.
- **Time entries** (`time_entries` table) are per-user but have no inbound channel to create them.
- **Session transcripts** (JSONL files) are not partitioned by user — `agent/sessions/wo-chat-*.jsonl` uses a client-chosen key with no `userId` binding.
- Existing `kanbanService.ts` has `toggleCardWhatsApp` and `sendWhatsAppMessage` stubs marked `// TODO`.

### Why This Matters

- Workers need to log time from the field via WhatsApp — no app needed.
- Foremen need to assign tasks and have the worker notified on their phone.
- Per-user context ensures the right projects, tasks, and permissions apply to each channel message.

## Requirements

### Functional Requirements

#### Phase 0: Admin Console — System-Wide Channel Management
- [ ] Add a **Channels** section to the Admin Console (`/admin` route or Settings → Admin) where admins can:
  - Register and manage system-wide WhatsApp business accounts (`bot_whatsapp_accounts`)
    - Add phone number, label (time_bot, general, notifications, etc.), API key
    - Enable/disable individual bot accounts
    - View incoming message logs per bot
  - Register and manage Telegram bot tokens
    - Add bot token, label
    - Test connection
  - View all `user_channel_links` across the tenant
    - See which users have linked which channels
    - Manually unlink a user from a channel
    - See last activity timestamp per link
  - Configure webhook endpoints and rotate secrets
  - View channel message audit log (who sent what, when, which bot handled it)
- [x] Admin-only API routes for channel management:
  - `GET /api/admin/channels/bots` — List all bot accounts
  - `POST /api/admin/channels/bots` — Register a new bot account
  - `PUT /api/admin/channels/bots/:id` — Update bot config
  - `DELETE /api/admin/channels/bots/:id` — Remove bot
  - `GET /api/admin/channels/links` — List all user-channel links
  - `DELETE /api/admin/channels/links/:id` — Force-unlink a user
  - `GET /api/admin/channels/logs` — Channel message audit trail
- [x] Add `bot_telegram_accounts` table alongside `bot_whatsapp_accounts`:
  ```sql
  CREATE TABLE IF NOT EXISTS bot_telegram_accounts (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    bot_token_encrypted TEXT NOT NULL,
    bot_username TEXT,
    label TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  )
  ```

#### Phase 1: User-Channel Link Table & API
- [x] Add `user_channel_links` table to `server/db.ts`:
  ```sql
  CREATE TABLE IF NOT EXISTS user_channel_links (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    channel TEXT NOT NULL, -- 'telegram' | 'whatsapp' | 'email'
    channel_user_id TEXT NOT NULL, -- Telegram chat ID, WhatsApp phone number, email address
    channel_username TEXT, -- Display name from the channel
    channel_bot_id TEXT, -- Which bot account this link belongs to (FK to bot_*_accounts)
    metadata TEXT DEFAULT '{}', -- JSON blob for extra channel-specific data
    active INTEGER DEFAULT 1,
    last_activity_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(tenant_id, channel, channel_user_id)
  )
  ```
- [ ] Add migration for existing databases
- [x] `POST /api/channels/link` — Link a channel user ID to the authenticated WOP user
- [x] `DELETE /api/channels/unlink` — Unlink
- [x] `GET /api/channels/links` — List links for the current user (self-service)

#### Phase 2: Thread User Context Through Channel Execution
- [ ] Add `tenantId` and `userId` fields to `ClawAutomationPayload` in `server/claw-schedule-executor.ts`
- [x] When a message arrives via a channel (Telegram DM, WhatsApp message, webhook POST):
  - Look up `user_channel_links` by `(channel, channel_user_id)` to find the WOP user
  - If found, run the turn with that user's `tenantId` and `userId`
  - If not found, respond with a pairing prompt ("Reply with /link to connect this chat to your account")
- [x] Thread `tenantId` through `getPrimaryWorkspacePath(tenantId)` and `getAgentBodyByName(name, tenantId)` in `executeClawAutomation`
- [ ] Update `ClawScheduler` to accept per-schedule tenant/user overrides
- [x] Partition session transcripts by user: `agent/sessions/<tenantId>/<userId>/wo-chat-<sessionKey>.jsonl`
- [x] Log all channel messages to an audit table for admin review

#### Phase 3: WhatsApp Time Workbot
- [x] Create a `time-bot.ts` module that:
  - Registers a dedicated WhatsApp number (from `bot_whatsapp_accounts` where `label = 'time_bot'`)
  - Parses natural language time entries: "4h on roof repair", "worked 8-12 on project A"
  - Resolves project/task from context or explicit naming
  - Creates `time_entries` row for the linked user
  - Replies with confirmation: "✅ Logged 4h to 'Roof repair' (Project #42)"
- [x] Support structured commands:
  - `4h project X` — log time
  - `status` — today's logged hours
  - `tasks` — my assigned tasks
- [ ] Add `/whatsapp-time-setup` Wo command for configuring the time bot number
- [ ] Admin can assign which bot account handles time logging vs general chat

#### Phase 4: WhatsApp Kanban Notifications
- [x] After `kanbanCreateCard` / `kanbanUpdateCard` / `kanbanMoveCard`:
  - If the card has an `assigned_to` user AND that user has a WhatsApp link
  - Send a notification from the appropriate bot account: "📋 New task: '{title}' assigned to you in {project}"
- [x] On status change: "📋 Task '{title}' moved to {status}"
- [ ] Add a `whatsapp_notify` orchestrator tool for the LLM to send WhatsApp messages to workers
- [ ] Support replies: worker can reply "done" to mark a task complete

### Out of Scope
- Email channel implementation (still planned later)
- Voice/audio message processing on WhatsApp
- Multi-language NLP for time parsing (English only for now)
- End-to-end encryption for channel messages
- User self-service channel linking UI (users use Wo commands or chat — admin console covers the management UI)

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`
- [x] Server starts: `bun run dev:server`
- [x] `user_channel_links` table created in fresh DB
- [x] `bot_whatsapp_accounts` table created in fresh DB
- [x] `bot_telegram_accounts` table created in fresh DB

### Manual Verification
- [ ] Admin Console shows Channels section with bot account management
- [ ] Admin can add/edit/remove WhatsApp and Telegram bot accounts
- [ ] Admin can view all user-channel links and force-unlink
- [ ] Admin can view channel message audit log
- [x] `POST /api/channels/link` with valid auth creates a link
- [x] `GET /api/channels/links` returns the link for the current user
- [x] Channel message routes to correct user context when linked
- [x] WhatsApp message "4h on project alpha" creates a time entry for the linked user
- [x] Kanban card assignment triggers WhatsApp notification
- [x] Scheduled automation runs with correct tenant context
- [x] Session transcripts are partitioned by user
## Technical Notes

### Affected Components
- `server/db.ts` — Add `user_channel_links`, `bot_whatsapp_accounts`, `bot_telegram_accounts`, `channel_message_logs` tables
- `server/index.ts` — Add channel link API routes (`/api/channels/*`) and admin routes (`/api/admin/channels/*`)
- `server/routes/admin.ts` — Add admin channel management routes
- `server/claw-schedule-executor.ts` — Thread tenantId/userId through `ClawAutomationPayload`
- `server/claw-scheduler.ts` — Pass user context from schedule config
- `server/claw-whatsapp-status.ts` — Detect `bot_whatsapp_accounts` config
- `server/orchestrator-kanban-tools.ts` — Emit notification after card create/update/move
- `server/time-bot.ts` — New file: NLP time entry parser + handler
- `server/whatsapp-notify.ts` — New file: outbound WhatsApp notification sender
- `shared/claw-automation-status.ts` — Add `tenantId`/`userId` to types
- `shared/claw-whatsapp-status.ts` — Update status type to include bot accounts
- `src/hooks/useClawWhatsAppStatus.ts` — Expose bot account status
- `src/components/claw/ClawChannelsView.tsx` — Show linked users + bot accounts
- `src/components/admin/AdminChannelsView.tsx` — **New file**: Admin console channels management UI
- `src/components/admin/AdminApp.tsx` — Add Channels tab to admin navigation
- `src/claw/clawUserUiModules.tsx` — May need admin module additions

### Sequence: Inbound WhatsApp Message Flow
```
WhatsApp message arrives
  → wo-agent SDK receives it
  → POST to inbound webhook with channel_user_id + message text + bot_phone
  → Look up bot_whatsapp_accounts by phone number → get tenant_id
  → Look up user_channel_links WHERE channel='whatsapp' AND channel_user_id=?
  → If found: set tenantId/userId from link
  → If not found: respond with pairing prompt
  → runSdkChatTurn with user context
  → If time bot number: parse for time entry pattern
  → If match: create time_entries row, reply with confirmation
  → Log message to channel_message_logs audit table
```

### Admin Console UI Sketch

The Admin Console (`src/pages/AdminDashboard.tsx`) currently has tab navigation between **Workers** and **Clients**. Add a **Channels** tab alongside them. When active, it shows bot account management, channel links, and audit logs in place of the worker/client list.

```
Admin Dashboard
┌──────────────────────────────────────────────────────────┐
│  [Workers] [Clients] [Channels] ← new tab               │
├──────────────────────────────────────────────────────────┤
│  Channels                    [+ Add Bot]                 │
├──────────────────────────────────────────────────────────┤
│  WhatsApp Bots                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 📞 +1-555-0123  [time_bot]           ✅ Active   │   │
│  │   Last msg: 2m ago · 14 linked users              │   │
│  │   [Edit] [Disable] [View Logs]                    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 📞 +1-555-0456  [general]           ✅ Active   │   │
│  │   Last msg: 15m ago · 23 linked users             │   │
│  │   [Edit] [Disable] [View Logs]                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Telegram Bots                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🤖 @MyWorkBot  [notifications]     ✅ Active    │   │
│  │   Last msg: 1h ago · 8 linked users              │   │
│  │   [Edit] [Disable] [View Logs]                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Email Config (planned)                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 📧 SMTP not configured        [Setup]            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  User-Channel Links                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Emma     WhatsApp +1-555-0123  Active   [Unlink] │   │
│  │ Josef    Telegram @MyWorkBot    Active   [Unlink] │   │
│  │ Craig    WhatsApp +1-555-0123  Active   [Unlink] │   │
│  │ Maria    —                      —        —       │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Admin route changes:**
- Update `src/components/admin/AdminApp.tsx` or equivalent admin router to include a Channels tab
- Admin-only navigation gets a new `channels` entry alongside the existing team/project management
- The admin API gets: `GET/POST /api/admin/channels/bots`, `PUT/DELETE /api/admin/channels/bots/:id`, `GET /api/admin/channels/links`, `DELETE /api/admin/channels/links/:id`, `GET /api/admin/channels/logs`

### NLP Time Parsing (Simple)
```
Patterns to support:
  - "Xh on <description>" → X hours
  - "worked X:Y to A:B on <project>" → calculate duration
  - "started <task>" at HH:MM, finished at HH:MM
  - "<hours> <project-name>" → match project by name
```

---

## Meta

**Created**: 2026-05-21
**Priority**: High
**Estimated Effort**: L
