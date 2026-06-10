# WOW-079-honcho-agent-memory-personalization

## Problem Statement

Way of Work agents are currently too generic and lack persistent, company-specific memory. Each chat session starts with a blank slate, forcing users to repeatedly provide context about their company, ongoing projects, and established workflows. This significantly degrades productivity and prevents agents from acting as truly intelligent, system-aware collaborators that understand the "big picture" of what a company is doing.

## Desired Outcome

Every company (tenant) and user has a private "Honcho" (a dedicated instance/memory hub). Agents across all UI surfaces (Claw, Docs, Kanban, etc.) can securely access this persistent memory, allowing them to:
- Automatically understand company-specific context, active projects, and preferred workflows.
- Provide continuous, intelligent support that builds over time.
- Collaborate across surfaces using shared knowledge.

## Context & Background

### Current State
Agents are stateless or session-bound, leading to a fragmented experience where users must repeat information. There is no infrastructure for secure, persistent "corporate memory" that agents can leverage to understand the company's current status, ongoing projects, or compliance history.

### Why This Matters
Persistent, context-aware memory is **SUPER CRITICAL** for agents to move from being simple chat bots to truly useful project assistants. Without it:
- Agents cannot offer personalized advice based on company performance.
- Users waste time context-loading agents on common company knowledge.
- Agents miss inter-project dependencies, leading to inefficient resource utilization.
- The platform fails to provide a cohesive, long-term memory for business operations.

## Requirements

### Functional Requirements
- [ ] **Memory Hub Infrastructure:** Implement a secure, persistent memory store per tenant (company) and user, enabling agents to save, index, and retrieve relevant contextual information.
- [ ] **Secure Context Injection:** Develop mechanisms for agents to securely inject this persistent memory into their system prompts/context windows without exposing sensitive data inappropriately.
- [ ] **Cross-Surface Persistence:** Memory must be accessible across all UI surfaces (Claw, Kanban, Docs, etc.) to ensure a unified user experience.
- [ ] **Privacy & Compliance:** Ensure that persistent memory is strictly isolated per tenant, compliant with GDPR and other data privacy regulations, and that sensitive information can be masked or protected within the memory hub.
- [ ] **Proactive Learning:** Enhance agents to *proactively* save relevant project outcomes, decisions, or new business rules to the memory hub after user confirmation (via HITL).

### Non-Functional Requirements
- [ ] **Performance:** Retrieval of contextual memory must be extremely fast to maintain low latency during agent interaction.
- [ ] **Scalability:** The system must scale efficiently as the amount of saved corporate memory grows across projects and tenants.

### Out of Scope
- Implementing a full-blown LLM training/fine-tuning pipeline. This is strictly focused on RAG (Retrieval Augmented Generation) and structured context injection.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully: `bun run build`.
- [ ] Tests confirm that memory retrieval is tenant-isolated and secure.

### Manual Verification
- [ ] A test project (e.g., "SKURUP") has information saved to its Honcho memory by an agent.
- [ ] In a new chat session, an agent correctly retrieves and references that specific project information without needing context re-entry.
- [ ] Memory persists across UI surface switches (e.g., from Docs to Kanban).

## Technical Notes

### Affected Components
- `server/ws-handler.ts` - Integration for retrieving and injecting context.
- `server/memory/` - (New) module for managing agent memory (storage, indexing, retrieval).
- `server/db/` - New table for persistent memory (e.g., `agent_memory`).
- `CHANGELOG.md` - Will be updated to reflect this feature implementation.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: XL
