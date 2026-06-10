# Ticket: [WOW-021] Kanban Board and Card Refinement

## Objective
Address critical UI/UX and functional issues in the Kanban board and card system, ensuring it meets the reference standards and production requirements.

## Problem Statement
The Kanban system is currently incomplete and suffers from several usability issues, including:
- Modal height exceeds screen view.
- Missing card functionality: picture/file upload for card covers.
- Missing card functionality: gradient and custom color options for card covers.
- Incorrect data binding: assignee picker uses mock users instead of real system users.
- Missing functionality: time logs per card are not displayed, which is critical for tracking worker tasks.

## Requirements
### UI/UX Improvements
- [x] Fix modal height issues (e.g., settings modal) to ensure they fit within the viewport and are scrollable.
- [x] Implement card cover image upload functionality.
- [x] Restore gradient and advanced color options for card covers.

### Functional Enhancements
- [x] Connect the card assignee picker to the real database of system users.
- [x] Display logged time per card in the card view.
- [x] Ensure tasks assigned to specific workers are correctly reflected in their workboards.

## Acceptance Criteria
- [x] Modal interfaces are fully responsive and scrollable.
- [x] Card covers support image uploads, gradients, and custom colors.
- [x] Assignee picker shows and correctly assigns real users from the system database.
- [x] Logged time is accurately displayed on Kanban cards.
- [x] Workers see their assigned tasks correctly in their workboards.
## Meta
**Created**: 2026-05-24
**Priority**: High
**Estimated Effort**: L
