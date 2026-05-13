---
title: "[PROJ-006] Implement @wayofmono/wo-web-ui — Web UI Components"
type: "Feature"
priority: "Medium"
status: "In Progress"
assignee: "@zerwiz"
created: "2024-05-09"
---

## Context
The `@wayofmono/wo-web-ui` package provides web-based UI components for the Wo agent ecosystem, used when the agent runs in a browser environment. Reference: `@earendil-works/pi-web-ui` (separate repo, not in ref/pi).

## Current Status
Package structure exists. No detailed gap analysis against pi-web-ui has been done.

## Remaining Work

### Chat Interface
- [ ] **Markdown rendering** — Render bold, italic, code, links, lists in assistant messages
- [ ] **Code block syntax highlighting** — Language-aware code blocks with copy-to-clipboard button

### Real-Time Communication
- [ ] **WebSocket/SSE client** — Connect to agent backend for live streaming responses
- [ ] **Event stream parsing** — Parse tool calls, diagnostics, and other events from the stream

### UX Features
- [ ] **Slash-command autocomplete** — Suggest commands as user types `/` in the input field
- [ ] **File attachment / drag-and-drop** — Upload files to agent context

### Session Management
- [ ] **Session branch visualization** — Show branch tree in session sidebar
- [ ] **Wom-Lens diagnostic display** — Inline file links with severity badges

### Responsive Design
- [ ] **Responsive mobile layout** — Collapse sidebar on small screens, touch-friendly inputs

## Verification
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
- [ ] Chat interface renders and streams responses
- [ ] Markdown rendering works with code blocks
- [ ] WebSocket/SSE connects to agent backend
- [ ] Light/dark theme toggle works
