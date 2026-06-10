# Ticket: [WOW-029] Refactor AdminDashboard.tsx into Smaller Components

## Objective
Break down the large `AdminDashboard.tsx` component into smaller, more focused, and reusable components to improve maintainability, readability, and development efficiency.

## Problem Statement
`AdminDashboard.tsx` has grown significantly in size and complexity, making it difficult to navigate, understand, and modify. This monolithic structure hinders future development and introduces a higher risk of bugs.

## Desired Outcome
The `AdminDashboard.tsx` file is refactored into a clear, modular structure where each logical section (e.g., Stats Cards, various tabs like Users, Projects, Price Lists, LLM Providers, Bug Reports) is managed by its own dedicated component. The main `AdminDashboard.tsx` will then primarily act as an orchestrator, assembling these smaller components.

## Requirements
### Code Structure
- [x] **Component Extraction:** Extract logical sections of `AdminDashboard.tsx` into new, dedicated React components:
    - [x] `ChatViewerModal.tsx`
    - [x] `LlmProvidersTab.tsx`
    - [x] `PriceListsTab.tsx`
    - [x] `ApprovalQueueTab.tsx`
    - [x] `OffersInvoicesTab.tsx`
    - [x] `DiffTable.tsx`
    - [ ] `AdminStatsCards.tsx` (remaining)
    - [ ] `AdminUsersTab.tsx` (remaining)
    - [ ] `AdminProjectsTab.tsx` (remaining)
    - [ ] `AdminChannelsTab.tsx` (remaining)
- [ ] **Prop Drilling Minimization:** Design new components to receive only the necessary props, minimizing prop drilling where possible. Consider using React Context or state management solutions if prop drilling becomes excessive.
- [ ] **File Organization:** Organize new components logically within `src/components/admin/` or similar subdirectories.

### Functionality
- [ ] **Maintain Existing Functionality:** Ensure all existing features and interactions within the Admin Dashboard remain fully functional after refactoring.
- [ ] **Performance (Non-Regression):** Verify that the refactoring does not introduce performance regressions.

### Code Quality
- [ ] **Readability:** Improve the overall readability of the Admin Dashboard codebase.
- [ ] **Maintainability:** Enhance the ease of maintaining and extending specific sections of the dashboard.
- [ ] **Type Safety:** Maintain or improve TypeScript type safety across all new and modified components.

## Acceptance Criteria
- `AdminDashboard.tsx` is significantly reduced in line count and complexity.
- All extracted components are clearly named and logically grouped.
- The Admin Dashboard functions identically to its pre-refactoring state.
- Code quality is improved, adhering to project conventions.

## Meta
**Created**: 2026-05-23
**Priority**: Medium
**Estimated Effort**: M