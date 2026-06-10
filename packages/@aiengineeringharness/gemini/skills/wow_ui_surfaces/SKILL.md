---
name: wow_ui_surfaces
description: "Frontend architecture, isolated chat sessions, and multi-surface routing based on WOW-012. Use when adding new UI views or debugging chat session isolation."
allowed-tools: [""]
---

> **Platform**: Gemini CLI | **Skill**: wow_ui_surfaces | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# wow_ui_surfaces

## Surface Architecture
The UI is divided into distinct "surfaces". The primary application container is `src/App.tsx`, which routes to components like `SimplePage`, `KanbanPage`, `DocsPage`, etc.

## Isolated Chat Sessions (WOW-012)
**CRITICAL UX RULE:** Chat context must never leak between different UI surfaces.
1. **WebSockets:** The frontend connects to the WebSocket server at `/ws?surface=name`.
2. **Session Storage:** `server/wo-session-jsonl.ts` stores transcripts as `wo-chat-<surface>-<sessionKey>.jsonl`.
3. **Auto-Select Agent:** The backend `server/index.ts` (in the `websocket.open` handler) automatically applies the correct internal agent based on the `surface` parameter:
   - `surface=claw` -> `agentName: "claw"`
   - `surface=docs` -> `agentName: "docs"`
   - `surface=kanban` -> `agentName: "kanban"`
   - `surface=taplanner` -> `agentName: "taplanner"`

## Frontend Best Practices
- **Double-Bubble Prevention:** When streaming an AI response, do not render an empty assistant message row simultaneously with the "thinking" indicator (managed in `src/components/ChatPanel.tsx`).
- **i18n (WOW-014):** Always use `useTranslation()` for text. Avoid hardcoding strings. Update `src/i18n/sv.json` and `src/i18n/en.json` synchronously.
