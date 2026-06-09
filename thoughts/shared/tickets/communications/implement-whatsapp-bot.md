# Ticket: Implement WhatsApp Bot Package

**Problem:**
The WayOfMono ecosystem currently lacks a first-party solution for integrating with WhatsApp. Similar to the Telegram integration, relying on external, unowned codebases for WhatsApp can lead to maintenance issues, rebranding inconsistencies, and dual-path confusion.

**Desired Outcome:**
A new `@wayofmono/whatsapp` package that provides a first-party SDK for WhatsApp integration, covering the full lifecycle (setup, connect, disconnect, status) and supporting message routing.

**Requirements (Initial Sketch):**

-   **Package Scaffold**: Create `@wayofmono/whatsapp` package in the wo-agent monorepo.
-   **Core Functionality**:
    -   `setupWhatsAppBot(token)`: Validate and store token.
    -   `sendMessage(chatId, text)`: Send messages.
    -   `onMessage(handler)`: Receive incoming messages/updates.
    -   Potentially webhook or polling based integration depending on WhatsApp API.
-   **Server Integration**: Integrate with the WayOfMono server for message routing and status.
-   **Extension Replacement**: Provide built-in commands/functionality to replace any existing or potential external WhatsApp extensions.
-   **Token Storage**: Unify token storage into the `bot_whatsapp_accounts` DB table (or similar).
-   **Documentation**: Update relevant documentation and UI to reflect the new package and its usage.

**Acceptance Criteria (Initial Sketch):**

-   `bun run build` passes for the new package.
-   WhatsApp setup works.
-   WhatsApp messages received and routed through Orchestrator.
-   WhatsApp messages sent outbound.
-   No dependency on unowned external WhatsApp integration solutions.

**Notes:**
This task should follow a similar pattern to the `WOW-033 [Way of Mono] Own Telegram SDK Package` for consistency and to leverage learned best practices.
