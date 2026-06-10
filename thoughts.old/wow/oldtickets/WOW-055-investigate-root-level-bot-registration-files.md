# [WOW-055] Investigate Root-Level Bot Registration Files

## Problem Statement

Two TypeScript files, `register-bot.ts` and `register-worker-bot.ts`, are present in the project's root directory. Their purpose and usage are unclear, and their placement deviates from the established architectural patterns for bot registration and agent management (e.g., using `.wo/agents/` or `server/agents.ts`). This suggests they might be unused, deprecated, or incorrectly located, potentially causing confusion or being remnants of older implementation approaches.

## Desired Outcome

Clarify the purpose and usage of `register-bot.ts` and `register-worker-bot.ts`. Based on the investigation:
1. If the files are actively used and necessary, move them to an appropriate location within the `server/` or `.wo/` directories, aligning with current architectural patterns.
2. If the files are unused or deprecated, delete them to reduce repository clutter and potential confusion.
3. Update any relevant documentation or code that might reference these files.

## Context & Background

### Current State
- `register-bot.ts` located at `/home/zerwiz/CodeP/wayofwork/register-bot.ts`
- `register-worker-bot.ts` located at `/home/zerwiz/CodeP/wayofwork/register-worker-bot.ts`
- Bot and agent definitions are typically managed in `.wo/agents/` and registration/runtime logic in `server/agents.ts` or `server/channel-router.ts`. The root directory is generally reserved for project configuration, scripts, or top-level entry points.

### Why This Matters
Misplaced or unused files contribute to technical debt, increase cognitive load for developers, and can lead to confusion about the correct way to register or manage bots in the system. Identifying and resolving the status of these files improves codebase hygiene and maintainability.

## Requirements

### Functional Requirements
- [x] Conduct a thorough codebase search — no imports found (only references in CHANGELOG.md and this ticket)
- [x] Analyze content: one-off DB insertion scripts with hardcoded Telegram bot tokens
- [x] Moved both files to `scripts/` directory
- [x] Stripped hardcoded tokens — now read from `TELEGRAM_BOT_TOKEN` / `TELEGRAM_WORKER_BOT_TOKEN` env vars
- [x] Deleted root-level originals
- [x] Verified `package.json` has no references to them
- [x] Updated this ticket status

### Out of Scope
- Implementing new bot registration mechanisms. This ticket focuses solely on addressing the status of the two specified files.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully after changes (`bun run build` or `npm run build`).
- [ ] No broken imports or references resulting from file moves/deletions.

### Manual Verification
- [ ] Confirm `register-bot.ts` and `register-worker-bot.ts` are either in a correct, logical location or have been deleted.
- [ ] Verify that bot registration/management functionality (if these files were related to it) still operates as expected after changes.

## Technical Notes

### Affected Components
- `/home/zerwiz/CodeP/wayofwork/register-bot.ts`
- `/home/zerwiz/CodeP/wayofwork/register-worker-bot.ts`
- Potentially `server/`, `.wo/agents/`, `package.json` (for scripts), or other files that might reference them.
- `CHANGELOG.md`
- `thoughts/shared/tickets/TODO.md`

---

## Meta

**Created**: 2026-06-05
**Priority**: Medium
**Estimated Effort**: M