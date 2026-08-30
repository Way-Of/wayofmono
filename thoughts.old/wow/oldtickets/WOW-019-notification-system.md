# 👠 **WOW-019** — Notification System & User Engagement Enhancement

**Status**: **ACTIVE / ENHANCEMENT**  
**Priority**: **HIGH**  
**Date**: 2026-06-06  
**Author**: AI Assistant

---

## 📋 Description
Implement an intelligent, highly actionable in-app notification system that users actually rely on. Move beyond simple alerts to a system that integrates deeply with Way of Work workflows—specifically document-level chat, human-in-the-loop (HITL) approvals, and high-priority project tasks.

### Core Objectives
1. **Actionable Alerts**: Ensure notifications provide immediate context and an easy way to act (e.g., "Approve Change," "Reply to Document Chat").
2. **Contextual Integration**: Deeply integrate notifications with new platform features like document-level chat (`WOW-080`).
3. **Relevance over Volume**: Reduce "notification noise" by filtering for high-priority/actionable events, making the system trustworthy and valuable for daily project management.
4. **Improved Visibility**: Place the notification indicator/inbox prominently in the UI to encourage usage.

---

## 🎯 Objectives
- Increase user engagement with notifications by making them essential, not intrusive.
- Seamlessly connect notifications to context (e.g., clicking a document-chat notification takes the user directly to the relevant document section).
- Improve the overall UX of the notification system to ensure it becomes a core part of the user's daily workflow.

---

## 🔧 Technical Design Updates (Integrating Context-Awareness)

### New Notification Categories (Priority Focus)
1. **Document-Chat Interaction (`WOW-080`)**: Notify users when they are @-mentioned in a document-level chat or when a colleague replies to their thread.
2. **Actionable HITL Alerts (`WOW-010`)**: High-priority notifications for pending project/financial changes requiring immediate approval.
3. **Proactive Project Alerts**: Updates on critical document movements, project phase changes, or urgent safety incidents.

### API & Workflow Enhancements
- **Link Contextualization**: Notification objects *must* include deep links to the specific context (e.g., `link: "/docs/proj_123/doc_456?scroll_to=section_7"`).
- **Notification Aggregation**: Allow grouping of notifications for the same event type to prevent flooding (e.g., "5 new messages in Document Chat").

---

## 🧪 Implementation Plan

### Phase 1: Enhancement of Existing System (Immediate)
- [ ] **Re-evaluate Notification Priority**: Audit existing triggers and disable/reduce frequency of low-action items.
- [ ] **UI/UX Polish**: Enhance the visibility of the notification badge and the "unread" inbox design.
- [ ] **Document-Chat Integration (`WOW-080`)**: Build the necessary triggers for notifying users of mentions/replies within the new document-level chat.
- [ ] **Actionable Toast Notifications**: Ensure all toasts have a clear, direct "Go to" button.

### Phase 2: Actionable Workflows
- [ ] **Approve/Reply In-Place**: Explore enabling "Reply" to document chat notifications directly from the notification panel (without opening the document).
- [ ] **Context-Aware Aggregation**: Group notifications by project or document to allow users to tackle feedback in batches.

---

## 🧩 Integration Points

### Document Chat Integration
When a user is mentioned in a document chat, the `NotificationService` triggers:

```typescript
// Proposed structure for Document Chat Notification
{
  userId: "target_user",
  type: "document_chat",
  title: "Ny kommentar i: Dokumentnamn",
  message: "John Doe nämnde dig i sektion 4.",
  severity: "info",
  link: `/docs/${docId}?comment_id=${commentId}`, // Contextual deep link
  actions: [
    { label: "Visa", handler: "navigate", link: `/docs/${docId}?comment_id=${commentId}` }
  ]
}
```

---

## 💅 UI/UX Considerations (User Engagement Focus)

- **Notification Badge**: Must be highly visible, not hidden.
- **In-Inbox Actions**: Every notification item in the inbox must have at least one clear "Action" button (e.g., "Approve", "Go to Document").
- **Smart Filtering**: Default view should show "Actionable Items" (Approvals, Mentions) rather than just "All".

---

## 🆙 Version History

| Version | Date | Description | Author |
|---------|------|-------------------------|--------|
| 1.0 | 2026-01-16 | Initial spec | Developer |
| 1.1 | 2026-06-06 | Focus on actionable engagement | AI Assistant |

---

**Status**: ACTIVE — Focused on Actionability & Integration  
**Priority**: HIGH
