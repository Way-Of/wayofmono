# WOW-033 [Way of Mono] Own Telegram SDK Package

## Problem Statement

Telegram integration currently depends on two separate, unowned codebases:

1. **Server-side** (`server/telegram-bot.ts`) — hand-rolled webhook/polling, multi-tenant message routing, media handling. Built in-house, maintained ad-hoc.
2. **Wo extension** (`pi-telegram` from `github.com/badlogic/pi-telegram`) — external, unmaintained, not owned by Way of Mono. Provides `/telegram-setup`, `/telegram-connect` slash commands and token file management at `~/.wo/agent/telegram.json`.

The external `pi-telegram` extension is:
- Owned by a third party (`badlogic`), not by `@wayofmono`
- Still named `pi-telegram` despite the rebrand
- Required for the token setup UX flow (Claw UI shows a 6-step guide that references it)
- A source of confusion — the extension handles polling while the server handles webhooks, creating two parallel Telegram paths

## Desired Outcome

`@wayofmono/wo-agent` SDK ships a first-party Telegram package that:

1. **Replaces the external `pi-telegram` extension** — no more `wo install git:github.com/badlogic/pi-telegram`
2. **Owns the full Telegram lifecycle** — setup, connect, disconnect, status — as SDK tools or a built-in module
3. **Integrates cleanly with the server** — the server's `server/telegram-bot.ts` and `claw-telegram-status.ts` should work with or without the package, but the package should be the canonical path
4. **Removes the dual-path confusion** — one clear way to set up and run Telegram

## Context & Background

### Current Architecture

```
Telegram message → server/telegram-bot.ts (webhook or polling)
  → channel-router.ts
    → claw-bot-bridge.ts → Orchestrator → AI response
  → sendTelegramMessage() (outbound)

Telegram setup → wo-telegram extension (external, pi-telegram)
  → /telegram-setup → writes ~/.wo/agent/telegram.json
  → /telegram-connect → starts long-polling
  → Claw UI detects via claw-telegram-status.ts scanning .wo/settings.json
```

### What We Use From `pi install git:github.com/badlogic/pi-telegram`

The external extension provides these capabilities that must be reproduced in `@wayofmono/telegram`:

| Capability | How It's Used | Where Referenced |
|---|---|---|
| `/telegram-setup` — prompts user for bot token, writes `~/.wo/agent/telegram.json` | User-facing slash command in Wo session | `ClawChannelsView.tsx:337`, `ClawHelpModal.tsx:608`, `clawTelegramSetupPrompt.ts:9`, `clawWorkspaceTemplates.ts:195` |
| `/telegram-connect` — starts long-polling against Telegram API | User-facing slash command | `ClawChannelsView.tsx:270,359`, `ClawHelpModal.tsx:621`, `clawTelegramSetupPrompt.ts:9`, `clawWorkspaceTemplates.ts:200` |
| `/telegram-disconnect` — stops polling | User-facing slash command | `clawTelegramSetupPrompt.ts:9`, `clawWorkspaceTemplates.ts:201` |
| `/telegram-status` — shows pairing status and bot info | User-facing slash command | `ClawChannelsView.tsx:359`, `ClawHelpModal.tsx:621`, `clawTelegramSetupPrompt.ts:9`, `clawWorkspaceTemplates.ts:202` |
| Token file at `~/.wo/agent/telegram.json` | Scanned by `server/claw-telegram-status.ts` to detect setup | `server/claw-telegram-status.ts:30-44` |
| Extension registration in `.wo/settings.json` `extensions[]` | Scanned by `claw-telegram-status.ts` to confirm extension is wired | `server/claw-telegram-status.ts:39` |
| Polling loop (separate from server fallback polling) | Runs inside Wo session after `/telegram-connect` | Server-side fallback at `server/telegram-bot.ts:97-103` |
| Setup checklist shown to users in Claw UI | References the extension instructions in a 5-step checklist | `src/utils/clawTelegramSetupPrompt.ts:1-13` |
| 6-step setup guide in Telegram channel card | Renders instructions in the Claw UI Channels View | `src/components/claw/ClawChannelsView.tsx:320-365` |
| Help modal documentation | Detailed help explaining the extension flow | `src/components/claw/ClawHelpModal.tsx:550-631` |
| Workspace template files | Default `.claw/workspace/HEARTBEAT.md` and `TOOLS.md` templates reference it | `src/utils/clawWorkspaceTemplates.ts:173,190-208` |

**Summary**: The extension is used for token setup UX (4 slash commands), token file persistence (scanned by server), and polling lifecycle. The server-side `telegram-bot.ts` handles the actual message routing independently. The package must replace the slash commands, unify token storage to the DB, and eliminate filesystem scanning.

### Key Gaps

| Gap | Impact |
|---|---|
| Critical dependency on unowned `github.com/badlogic/pi-telegram` | Extension may break, not updated, Pi→Wo rebrand not applied |
| Two parallel polling paths | Server fallback polling (3s) + extension polling (session-local) — race conditions possible |
| Token setup UX is fragile | User must install extension, run commands, then server picks up from filesystem — no unified flow |
| No npm package owned by @wayofmono | Ecosystem gap — WhatsApp should follow same pattern later |

### Key Files

| File | Relevance |
|---|---|
| `server/telegram-bot.ts` | Server-side Telegram message handling — would consume the package |
| `server/claw-telegram-status.ts` | Filesystem scanner for extension presence — would use package API instead |
| `server/claw-bot-bridge.ts` | Orchestrator bridge — unchanged |
| `server/orchestrator-channel-tools.ts` | telegram_send tool — unchanged |
| `.claw/workspace/TOOLS.md` | Documents the external install — must be updated |
| `src/components/claw/ClawChannelsView.tsx` | Setup guide UI — references pi-telegram |
| `src/components/claw/ClawHelpModal.tsx` | Help text — references pi-telegram |
| `src/utils/clawTelegramSetupPrompt.ts` | Setup checklist text |

## Requirements

### Phase 1: Package Scaffold

- [ ] Create `@wayofmono/telegram` package in the wo-agent monorepo
- [ ] Package provides:
  - `setupTelegramBot(token)` — validate and store token
  - `startPolling(token, onMessage)` — long-poll with configurable interval
  - `setWebhook(token, url)` — register webhook endpoint
  - `sendMessage(token, chatId, text)` — send with Markdown support
  - `getMe(token)` — validate bot + get bot info
  - `getFile(token, fileId)` — download media
- [ ] Package exports TypeScript types for all Telegram API shapes used

### Phase 2: Server Integration

- [ ] `server/telegram-bot.ts` imports from `@wayofmono/telegram` instead of raw `fetch()` calls
- [ ] `server/claw-telegram-status.ts` uses package API to detect configured bots instead of filesystem scanning
- [ ] Token storage unified — `bot_telegram_accounts` DB table is the single source of truth
- [ ] Remove fallback polling from server (package handles it)

### Phase 3: Extension Replacement

- [ ] New `/telegram-setup` command provided via the package (not external extension)
- [ ] New `/telegram-connect` / `/telegram-disconnect` / `/telegram-status` commands
- [ ] Remove the external `pi-telegram` extension deprecation
- [ ] Update Claw UI setup guide to use the new built-in commands
- [ ] Update `.claw/workspace/TOOLS.md` and all docs

### Phase 4: Cleanup

- [ ] Remove all `pi-telegram` references from codebase
- [ ] Remove filesystem scan fallback from `claw-telegram-status.ts`
- [ ] `WOP_TELEGRAM_BOT_TOKEN` env var becomes optional (package manages tokens)

## Acceptance Criteria

- [ ] `bun run build` passes
- [ ] Telegram setup via `/telegram-setup <token>` works without external install
- [ ] Telegram messages received and routed through Orchestrator
- [ ] Telegram messages sent outbound
- [ ] Multi-bot support works (multiple `bot_telegram_accounts`)
- [ ] No dependency on `github.com/badlogic/pi-telegram`
- [ ] Claw UI shows Telegram as "connected" without filesystem scanning

## Out of Scope
- WhatsApp package (follow-up)
- Email package (follow-up)
- Breaking changes to existing server message routing

## Technical Notes

### Package API Sketch

```typescript
// @wayofmono/telegram
export class TelegramBot {
  constructor(token: string);
  async getMe(): Promise<BotInfo>;
  async setWebhook(url: string): Promise<boolean>;
  async deleteWebhook(): Promise<boolean>;
  async startPolling(handler: (update: Update) => Promise<void>, intervalMs?: number): Promise<void>;
  async stopPolling(): Promise<void>;
  async sendMessage(chatId: string, text: string, opts?: SendMessageOpts): Promise<Message>;
  async getFile(fileId: string): Promise<File>;
  async downloadFile(filePath: string, dest: string): Promise<void>;
}
```

---

## Meta

**Created**: 2026-06-02
**Priority**: Medium
**Estimated Effort**: M
**Depends on**: WOW-015 (communication architecture), WOW-027 (Pi→Wo rebrand)
