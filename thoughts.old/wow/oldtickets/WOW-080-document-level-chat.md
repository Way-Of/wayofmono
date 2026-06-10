# WOW-080-document-level-chat

## Problem Statement

Collaboration on specific project documents currently occurs outside of the Way of Work platform (e.g., email, external messaging), leading to fragmented communication, loss of context, and delayed feedback. Users need a way to discuss specific documents *within* the context where they are viewed and edited, ensuring that feedback is attached to the source of truth.

## Desired Outcome

The Docs view includes a context-aware chat sidebar attached to each individual document. This allows users to hold threaded discussions about specific sections, propose changes, or ask clarification questions, with all messages persistent and linked to the `document_id`. This chat must be fully integrated with the system's notification framework to ensure stakeholders are informed of relevant discussions.

## Requirements

### Functional Requirements
- [ ] **Document-Contextual Chat Sidebar:** Implement a chat panel in the Docs view that is scoped to the currently opened document.
- [ ] **Persistent Chat Sessions:** Each document must maintain a persistent chat history, uniquely identified by `document_id` and tenant, utilizing WebSocket isolation (similar to other surfaces).
- [ ] **Notification Integration:** New messages in a document chat must trigger notifications for all relevant stakeholders (e.g., project manager, document author, assigned collaborators) via the existing notification system.
- [ ] **Context Awareness:** Chat messages should be contextually aware, possibly allowing users to reference specific lines or sections of the document.
- [ ] **Human-in-the-Loop (HITL) Policy:** Any decisions made in document chat that require system data changes (e.g., renaming the file based on the chat, updating meta-data) must follow the established HITL workflow (`POST /api/pending-changes`).

### Technical Notes
- **WebSocket Isolation:** Utilize the existing WebSocket chat architecture but adapt it to scope sessions by `document_id` instead of (or in addition to) the general surface ID.
- **Notification Triggering:** Ensure the notification service correctly monitors the new document-level chat channels.
- **Affected Components:**
    - `src/components/docs/DocumentChatPanel.tsx` (New component).
    - `server/ws-handler.ts` (Update to handle `document_id` scoping).
    - `server/notifications.ts` (Integrate document-chat message events).
    - `CHANGELOG.md` - Will be updated.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: L
