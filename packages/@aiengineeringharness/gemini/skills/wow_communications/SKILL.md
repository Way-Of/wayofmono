---
name: wow_communications
description: "Architecture for the inbound/outbound communication channels (Telegram, WhatsApp) defined in WOW-015. Use when working on channel routers, bots, or external messaging."
allowed-tools: [""]
---

> **Platform**: Gemini CLI | **Skill**: wow_communications | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# wow_communications

## Inbound Routing (`server/channel-router.ts`)
All messages from external platforms (e.g., Telegram bots) hit the unified inbound router first.
1. **User Resolution:** The router looks up the `channel_user_id` (e.g., phone number or Telegram ID) in the `user_channel_links` table to find the Way of Work `user_id` and `tenant_id`.
2. **Dispatch:** If linked, it calls `processBotMessage` in `server/claw-bot-bridge.ts`.

## Bot Bridge & Session Persistence (`server/claw-bot-bridge.ts`)
- The bridge runs the AI chat turn using the `@wayofmono/wo-agent` SDK.
- It automatically manages persistent conversation history in JSONL format via `server/wo-session-jsonl.ts`.
- **Session Keys:** Formatted as `channel-<channelName>-<channelUserId>` (e.g., `channel-telegram-123456`).
- **Privacy (WOW-016 Phase 5):** The system prompt injected by the bridge enforces strict privacy, ensuring the AI only discusses data belonging to the authenticated user.

## Outbound Tools (`server/orchestrator-channel-tools.ts`)
Internal agents (like `schemaplanerare` or `fakturering`) can initiate outbound messages.
- They use the `telegram_send` or `whatsapp_send` OpenAI function tools.
- These tools require the recipient's internal `user_id`. The tools automatically look up the correct channel linkage in the database before dispatching the HTTP request to the respective provider's API.
